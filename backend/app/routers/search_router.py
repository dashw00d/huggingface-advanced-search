import logging
from typing import Optional, List

from fastapi import APIRouter, Query, HTTPException, Depends
from fastapi.concurrency import run_in_threadpool # Moved import higher as it's used

from ..services import hf_service # Relative import to services package
from ..schemas.search_schemas import HFModelSearchResponsePaginated, AutocompleteSuggestion

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get(
    "/models",
    response_model=HFModelSearchResponsePaginated, # Use the new paginated response schema
    summary="Search Hugging Face Models (Paginated)",
    description="Performs a search on the Hugging Face Hub based on query, filters, and sorting.",
)
async def search_hf_models_paginated(
    query: Optional[str] = Query(None, description="Search query string."),
    sort_by: str = Query("downloads", description="Sort by ('downloads', 'likes', 'lastModified', 'trending_score', 'created_at')."),
    page: int = Query(1, ge=1, description="Page number (1-indexed)."),
    page_size: int = Query(20, ge=1, le=50, description="Items per page (min 1, max 50)."), # Limit page_size
    pipeline_tag: Optional[str] = Query(None, description="Filter by pipeline tag."),
    library: Optional[str] = Query(None, description="Filter by library."),
    author: Optional[str] = Query(None, description="Filter by author/organization."),
    filter_tags: Optional[str] = Query(None, description="Comma-separated filter tags (e.g., 'gguf' for GGUF-only)."),
    gated: Optional[bool] = Query(None, description="Filter by gated status (true/false)."),
    num_parameters_min: Optional[str] = Query(None, description="Min model parameters (e.g., '1B', '500M')."),
    num_parameters_max: Optional[str] = Query(None, description="Max model parameters (e.g., '40B', '70B')."),
    created_after: Optional[str] = Query(None, description="ISO date string. Only return models created after this date."),
):
    """
    Endpoint to search for models on the Hugging Face Hub.
    It allows filtering by various criteria and sorting the results.
    """
    try:
        logger.info(
            f"Received paginated search: query='{query}', sort='{sort_by}', page={page}, page_size={page_size}, "
            f"task='{pipeline_tag}', lib='{library}', author='{author}', filter_tags='{filter_tags}', "
            f"gated={gated}, num_parameters_min='{num_parameters_min}', num_parameters_max='{num_parameters_max}', "
            f"created_after='{created_after}'"
        )

        # Build num_parameters range string
        num_parameters = None
        if num_parameters_min or num_parameters_max:
            parts = []
            if num_parameters_min:
                parts.append(f"min:{num_parameters_min}")
            if num_parameters_max:
                parts.append(f"max:{num_parameters_max}")
            num_parameters = ",".join(parts)

        # Parse filter_tags from comma-separated string to list
        parsed_filter_tags = None
        if filter_tags:
            parsed_filter_tags = [t.strip() for t in filter_tags.split(",") if t.strip()]

        # hf_service.search_models_on_hub_paginated is synchronous due to the loop over the generator
        results, _, has_more = await run_in_threadpool( # _ for total_items_processed
            hf_service.search_models_on_hub_paginated,
            query=query,
            sort_by=sort_by,
            page=page,
            page_size=page_size,
            pipeline_tag=pipeline_tag,
            library=library,
            author=author,
            filter_tags=parsed_filter_tags,
            gated=gated,
            num_parameters=num_parameters,
            created_after=created_after,
        )
        # `list_models` can be blocking, so run it in a threadpool
        # to avoid blocking FastAPI's event loop for synchronous I/O bound tasks.
        # However, huggingface_hub's list_models itself might be doing async HTTP requests internally
        # if it uses something like httpx. If it's purely synchronous (like using `requests`),
        # then threadpool is good. For now, let's assume it could be blocking.
        # A simpler way if you are sure it's not overly blocking or if HF_HUB is async:
        # results, total_approx = hf_service.search_models_on_hub(
        #     query=query, sort_by=sort_by, limit=limit,
        #     pipeline_tag=pipeline_tag, library=library
        # )

        return HFModelSearchResponsePaginated(
            query=query,
            sort_by=sort_by,
            page=page,
            page_size=page_size,
            results=results,
            # total_items_processed_for_has_more=total_processed,
            has_more=has_more
        )
    except Exception as e:
        logger.error(f"Error in paginated search request: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error during paginated search.")


# --- Autocomplete Endpoint (Placeholder for now, can be expanded) ---
# @router.get("/autocomplete", response_model=List[AutocompleteSuggestion])
# async def get_autocomplete_suggestions(
#     q: str = Query(..., min_length=2, description="Partial query for autocomplete.")
# ):
#     # This would call a simplified version of search_models_on_hub or a dedicated autocomplete function
#     # For now, let's just return a placeholder
#     logger.info(f"Autocomplete request for query: '{q}'")
#     # Example:
#     # suggestions = await run_in_threadpool(hf_service.get_autocomplete_suggestions_from_hub, query=q, limit=5)
#     # return suggestions
#     return [{"id": "ExampleModel/suggestion1"}, {"id": "ExampleQuery/suggestion2"}]
