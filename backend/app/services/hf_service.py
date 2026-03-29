import logging
from typing import List, Optional, Tuple
from huggingface_hub import list_models, HfApi
from huggingface_hub.hf_api import ModelInfo
from ..schemas.search_schemas import HFModelSearchResultItem # Corrected relative import
from huggingface_hub import hf_hub_download, model_info as hf_model_info # Alias to avoid conflict
from ..schemas.model_schemas import ModelDetailResponse, GGUFFileDetail, ModelCardData # Corrected relative import
import re # For regex-based keyword extraction

logger = logging.getLogger(__name__)

# Define known task keywords and their corresponding pipeline_tags
# This list can be expanded. Keys are lowercase.
TASK_KEYWORD_TO_PIPELINE_TAG = {
    "text generation": "text-generation",
    "summarization": "summarization",
    "translation": "translation",
    "question answering": "question-answering",
    "fill mask": "fill-mask",
    "fill-mask": "fill-mask",
    "text classification": "text-classification",
    "token classification": "token-classification",
    "image classification": "image-classification",
    "object detection": "object-detection",
    "image segmentation": "image-segmentation",
    "text to image": "text-to-image",
    "text-to-image": "text-to-image",
    "image to text": "image-to-text",
    "image-to-text": "image-to-text",
    "text to speech": "text-to-speech",
    "text-to-speech": "text-to-speech",
    "audio to audio": "audio-to-audio",
    "automatic speech recognition": "automatic-speech-recognition",
    "asr": "automatic-speech-recognition",
    "voice activity detection": "voice-activity-detection",
    "reinforcement learning": "reinforcement-learning",
    "robotics": "robotics",
    "tabular classification": "tabular-classification",
    "tabular regression": "tabular-regression",
    "table question answering": "table-question-answering",
    "visual question answering": "visual-question-answering",
    "vqa": "visual-question-answering",
    "document question answering": "document-question-answering",
    "zero shot classification": "zero-shot-classification",
    "zero-shot-classification": "zero-shot-classification",
    "zero shot image classification": "zero-shot-image-classification",
    "conversational": "conversational",
    "feature extraction": "feature-extraction",
    # Add more mappings as needed
}


def search_models_on_hub_paginated(
    query: Optional[str] = None,
    sort_by: str = "downloads",
    page: int = 1,          # New: current page number (1-indexed)
    page_size: int = 20,    # New: items per page
    pipeline_tag: Optional[str] = None,
    library: Optional[str] = None,
    author: Optional[str] = None,
    filter_tags: Optional[List[str]] = None,
    gated: Optional[bool] = None,
    num_parameters: Optional[str] = None,
    created_after: Optional[str] = None,  # ISO date string for client-side filtering
) -> Tuple[List[HFModelSearchResultItem], int, bool]: # Results, total_items_on_this_page_and_before, has_more
    
    processed_query = query
    derived_pipeline_tag = pipeline_tag 

    if query and not pipeline_tag: 
        query_lower = query.lower()
        sorted_task_keywords = sorted(TASK_KEYWORD_TO_PIPELINE_TAG.keys(), key=len, reverse=True)
        for task_keyword in sorted_task_keywords:
            pt_value = TASK_KEYWORD_TO_PIPELINE_TAG[task_keyword]
            if re.search(r'\b' + re.escape(task_keyword) + r'\b', query_lower):
                derived_pipeline_tag = pt_value
                logger.info(f"Derived pipeline_tag '{derived_pipeline_tag}' from query keyword '{task_keyword}'.")
                if processed_query:
                    processed_query = re.sub(r'\b' + re.escape(task_keyword) + r'\b', '', processed_query, flags=re.IGNORECASE).strip()
                if not processed_query: 
                    processed_query = None
                logger.info(f"Removed task keyword '{task_keyword}' from query. New processed_query for search: '{processed_query}'")
                break 
    
    try:
        logger.info(
            f"Searching Hub (paginated): query='{processed_query}', sort='{sort_by}', "
            f"page={page}, page_size={page_size}, pipeline_tag='{derived_pipeline_tag}', library='{library}'"
        )
        
        valid_sort_fields = ["downloads", "likes", "lastModified", "trending_score", "created_at"]
        if sort_by not in valid_sort_fields:
            sort_by = "downloads"

        # Calculate start and end indices for the current page
        start_index = (page - 1) * page_size
        end_index = start_index + page_size

        paged_results: List[HFModelSearchResultItem] = []
        models_iterator = list_models( # This returns a generator
            search=processed_query if processed_query else None,
            sort=sort_by,
            direction=-1,
            full=True, # Still need full info for each item
            pipeline_tag=derived_pipeline_tag,
            library=library,
            author=author,
            filter=filter_tags if filter_tags else None,
            gated=gated,
            num_parameters=num_parameters,
            # No 'limit' here, we iterate and stop
        )

        current_index = 0
        items_collected_for_page = 0
        has_more_items_after_this_page = False

        for model in models_iterator:
            # Client-side date filtering
            if created_after:
                from datetime import datetime
                cutoff = datetime.fromisoformat(created_after)
                model_date = model.created_at or model.lastModified
                if model_date and model_date.replace(tzinfo=None) < cutoff:
                    continue

            if current_index >= end_index:
                has_more_items_after_this_page = True
                break

            if current_index >= start_index:
                has_gguf_file = False
                if model.siblings:
                    for sibling in model.siblings:
                        if sibling.rfilename.lower().endswith(".gguf"):
                            has_gguf_file = True
                            break
                item_data = {
                    "id": model.id, "author": model.author, "last_modified": model.lastModified,
                    "likes": model.likes or 0, "private": model.private or False,
                    "downloads": model.downloads or 0, "tags": model.tags or [],
                    "pipeline_tag": model.pipeline_tag, "has_gguf": has_gguf_file,
                }
                paged_results.append(HFModelSearchResultItem.model_validate(item_data))
                items_collected_for_page += 1

            current_index += 1

        total_items_processed_up_to_this_page = current_index # if has_more, this is end_index + 1, else total models found
        if not has_more_items_after_this_page and current_index < end_index: # If iterator exhausted before filling the page or reaching end_index
             total_items_processed_up_to_this_page = current_index


        logger.info(f"Page {page}: collected {items_collected_for_page} models. Total processed for has_more check: {current_index}. Has more: {has_more_items_after_this_page}")
        # We can't easily get the *absolute total* number of models without iterating through everything.
        # For pagination, `has_more_items_after_this_page` is key.
        # `total_items_processed_up_to_this_page` is not the grand total, but how many we looked at.
        return paged_results, total_items_processed_up_to_this_page, has_more_items_after_this_page

    except Exception as e:
        logger.error(f"Error in paginated search on Hugging Face Hub: {e}", exc_info=True)
        raise

def get_model_details_from_hub(model_id: str) -> Optional[ModelDetailResponse]:
    """
    Fetches detailed information for a specific model, including README and GGUF files.
    """
    try:
        logger.info(f"Fetching details for model_id: {model_id}")
        info = hf_model_info(repo_id=model_id, files_metadata=True) # files_metadata=True gets siblings info

        readme_content = "README.md not found for this model."
        try:
            readme_path = hf_hub_download(repo_id=model_id, filename="README.md", repo_type="model")
            with open(readme_path, 'r', encoding='utf-8') as f:
                readme_content = f.read()
            logger.info(f"Successfully fetched README.md for {model_id}")
        except Exception as e_readme:
            logger.error(f"Error fetching README.md for {model_id}: {e_readme}", exc_info=True)
            readme_content = f"Error fetching README: {str(e_readme)}"

        gguf_files_details: List[GGUFFileDetail] = []
        raw_siblings_info = []

        if info.siblings:
            for file_info in info.siblings:
                raw_siblings_info.append({"name": file_info.rfilename, "size": file_info.size, "lfs": file_info.lfs is not None})
                if file_info.rfilename.lower().endswith(".gguf"):
                    # For direct download URL construction:
                    download_url = f"https://huggingface.co/{model_id}/resolve/main/{file_info.rfilename}"
                    # Basic GGUF name parsing (can be expanded)
                    quant = "Unknown"
                    match = re.search(r"[_-](Q\d(?:[_\wKSM]*)?)\.", file_info.rfilename, re.IGNORECASE)
                    if match:
                        quant = match.group(1).upper()
                    
                    gguf_files_details.append(GGUFFileDetail(
                        name=file_info.rfilename,
                        url=download_url,
                        size_bytes=file_info.size,
                        quantization=quant
                    ))
            logger.info(f"Found {len(gguf_files_details)} GGUF files for {model_id}.")

        # Process cardData
        parsed_card_data = None
        if info.cardData:
            try:
                # Map common fields, be careful with direct mapping if keys differ
                card_dict = info.cardData.to_dict() # Convert ModelCardData to dict
                parsed_card_data = ModelCardData(
                    license=card_dict.get('license'),
                    language=card_dict.get('language'), # Assuming it's already a list or None
                    tags=card_dict.get('tags'),         # Assuming it's already a list or None
                    model_index=card_dict.get('model-index') # Common key for eval results
                    # card_data_raw = card_dict # If you want to pass everything
                )
                logger.info(f"Processed model card data for {model_id}")
            except Exception as e_card:
                logger.error(f"Error processing cardData for {model_id}: {e_card}", exc_info=True)


        response_data = ModelDetailResponse(
            id=info.id,
            author=info.author,
            lastModified=info.lastModified,
            tags=info.tags,
            pipelineTag=info.pipeline_tag,
            downloads=info.downloads,
            likes=info.likes,
            readme_content=readme_content,
            gguf_files=gguf_files_details,
            card_data=parsed_card_data,
            siblings=raw_siblings_info
        )
        return response_data
    except Exception as e:
        logger.error(f"An unexpected error occurred fetching details for {model_id}: {e}", exc_info=True)
        # In a real app, you might want to raise an HTTPException that the router can catch
        raise # Re-raise for now, router will handle with 500 or specific mapping