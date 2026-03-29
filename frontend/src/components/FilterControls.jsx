import React from 'react';

const filterContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
};

const filterRowStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    alignItems: 'center',
};

const controlGroupStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
};

const labelStyle = {
    fontWeight: 'bold',
    fontSize: '0.85em',
    color: '#333',
    whiteSpace: 'nowrap',
};

const selectStyle = {
    padding: '7px 8px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    minWidth: '160px',
    backgroundColor: 'white',
    fontSize: '0.85em',
};

const inputStyle = {
    padding: '7px 8px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    width: '140px',
    backgroundColor: 'white',
    fontSize: '0.85em',
};

const checkboxLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontWeight: 'bold',
    fontSize: '0.85em',
    color: '#333',
    cursor: 'pointer',
};

const clearButtonStyle = {
    padding: '7px 16px',
    border: 'none',
    backgroundColor: '#dc3545',
    color: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.85em',
    transition: 'background-color 0.2s ease',
    marginLeft: 'auto',
};

const PIPELINE_TAGS = [
    { value: "", label: "Any Task" },
    { value: "text-generation", label: "Text Generation" },
    { value: "text-classification", label: "Text Classification" },
    { value: "token-classification", label: "Token Classification (NER)" },
    { value: "question-answering", label: "Question Answering" },
    { value: "summarization", label: "Summarization" },
    { value: "translation", label: "Translation" },
    { value: "fill-mask", label: "Fill-Mask" },
    { value: "text-ranking", label: "Text Ranking" },
    { value: "feature-extraction", label: "Feature Extraction" },
    { value: "sentence-similarity", label: "Sentence Similarity" },
    { value: "zero-shot-classification", label: "Zero-Shot Classification" },
    { value: "table-question-answering", label: "Table QA" },
    { value: "conversational", label: "Conversational" },
    { value: "image-text-to-text", label: "Image-Text-to-Text" },
    { value: "visual-question-answering", label: "Visual QA" },
    { value: "document-question-answering", label: "Document QA" },
    { value: "video-text-to-text", label: "Video-Text-to-Text" },
    { value: "any-to-any", label: "Any-to-Any" },
    { value: "text-to-image", label: "Text-to-Image" },
    { value: "image-to-text", label: "Image-to-Text" },
    { value: "image-classification", label: "Image Classification" },
    { value: "image-segmentation", label: "Image Segmentation" },
    { value: "image-to-image", label: "Image-to-Image" },
    { value: "image-to-video", label: "Image-to-Video" },
    { value: "text-to-video", label: "Text-to-Video" },
    { value: "video-classification", label: "Video Classification" },
    { value: "object-detection", label: "Object Detection" },
    { value: "zero-shot-object-detection", label: "Zero-Shot Object Detection" },
    { value: "zero-shot-image-classification", label: "Zero-Shot Image Classification" },
    { value: "depth-estimation", label: "Depth Estimation" },
    { value: "image-feature-extraction", label: "Image Feature Extraction" },
    { value: "keypoint-detection", label: "Keypoint Detection" },
    { value: "mask-generation", label: "Mask Generation" },
    { value: "unconditional-image-generation", label: "Unconditional Image Generation" },
    { value: "text-to-3d", label: "Text-to-3D" },
    { value: "image-to-3d", label: "Image-to-3D" },
    { value: "automatic-speech-recognition", label: "Speech Recognition (ASR)" },
    { value: "text-to-speech", label: "Text-to-Speech (TTS)" },
    { value: "audio-classification", label: "Audio Classification" },
    { value: "audio-to-audio", label: "Audio-to-Audio" },
    { value: "tabular-classification", label: "Tabular Classification" },
    { value: "tabular-regression", label: "Tabular Regression" },
    { value: "reinforcement-learning", label: "Reinforcement Learning" },
];

const LIBRARIES = [
    { value: "", label: "Any Library" },
    { value: "transformers", label: "Transformers" },
    { value: "diffusers", label: "Diffusers" },
    { value: "gguf", label: "GGUF" },
    { value: "safetensors", label: "Safetensors" },
    { value: "pytorch", label: "PyTorch" },
    { value: "tensorflow", label: "TensorFlow" },
    { value: "jax", label: "JAX" },
    { value: "onnx", label: "ONNX" },
    { value: "openvino", label: "OpenVINO" },
    { value: "core-ml", label: "Core ML" },
    { value: "keras", label: "Keras" },
    { value: "sentence-transformers", label: "Sentence Transformers" },
    { value: "timm", label: "TIMM" },
    { value: "peft", label: "PEFT" },
    { value: "mlx", label: "MLX" },
    { value: "transformers.js", label: "Transformers.js" },
    { value: "spacy", label: "spaCy" },
    { value: "fasttext", label: "fastText" },
    { value: "flair", label: "Flair" },
    { value: "adapters", label: "Adapters" },
    { value: "openclip", label: "OpenCLIP" },
    { value: "speechbrain", label: "SpeechBrain" },
    { value: "espnet", label: "ESPnet" },
    { value: "nemo", label: "NeMo" },
    { value: "stable-baselines3", label: "Stable Baselines3" },
    { value: "scikit-learn", label: "scikit-learn" },
    { value: "paddlepaddle", label: "PaddlePaddle" },
    { value: "fastai", label: "fastai" },
];

const MODEL_SIZE_OPTIONS = [
    { value: "", label: "Any" },
    { value: "1M", label: "1M" },
    { value: "10M", label: "10M" },
    { value: "100M", label: "100M" },
    { value: "500M", label: "500M" },
    { value: "1B", label: "1B" },
    { value: "3B", label: "3B" },
    { value: "7B", label: "7B" },
    { value: "13B", label: "13B" },
    { value: "20B", label: "20B" },
    { value: "30B", label: "30B" },
    { value: "40B", label: "40B" },
    { value: "65B", label: "65B" },
    { value: "70B", label: "70B" },
    { value: "100B", label: "100B" },
    { value: "200B", label: "200B" },
];

const CREATED_WITHIN_OPTIONS = [
    { value: "", label: "Anytime" },
    { value: "24h", label: "Last 24 hours" },
    { value: "7d", label: "Last week" },
    { value: "30d", label: "Last month" },
    { value: "90d", label: "Last 3 months" },
    { value: "365d", label: "Last year" },
];

function FilterControls({
    currentSortBy, onSortByChange,
    currentPipelineTag, onPipelineTagChange,
    currentLibrary, onLibraryChange,
    currentAuthor, onAuthorChange,
    currentNumParamsMin, onNumParamsMinChange,
    currentNumParamsMax, onNumParamsMaxChange,
    currentGgufOnly, onGgufOnlyChange,
    currentGated, onGatedChange,
    currentCreatedWithin, onCreatedWithinChange,
    onClearFilters,
}) {
    return (
        <div style={filterContainerStyle}>
            <div style={filterRowStyle}>
                <div style={controlGroupStyle}>
                    <label htmlFor="pipeline-tag" style={labelStyle}>Task:</label>
                    <select id="pipeline-tag" value={currentPipelineTag} onChange={(e) => onPipelineTagChange(e.target.value)} style={selectStyle}>
                        {PIPELINE_TAGS.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}
                    </select>
                </div>
                <div style={controlGroupStyle}>
                    <label htmlFor="library" style={labelStyle}>Library:</label>
                    <select id="library" value={currentLibrary} onChange={(e) => onLibraryChange(e.target.value)} style={selectStyle}>
                        {LIBRARIES.map(lib => (<option key={lib.value} value={lib.value}>{lib.label}</option>))}
                    </select>
                </div>
                <div style={controlGroupStyle}>
                    <label htmlFor="sort-by" style={labelStyle}>Sort:</label>
                    <select id="sort-by" value={currentSortBy} onChange={(e) => onSortByChange(e.target.value)} style={selectStyle}>
                        <option value="downloads">Most Downloads</option>
                        <option value="likes">Most Likes</option>
                        <option value="trending_score">Trending</option>
                        <option value="lastModified">Recently Updated</option>
                        <option value="created_at">Newest</option>
                    </select>
                </div>
            </div>

            <div style={filterRowStyle}>
                <div style={controlGroupStyle}>
                    <label htmlFor="author" style={labelStyle}>Author:</label>
                    <input
                        id="author"
                        type="text"
                        value={currentAuthor}
                        onChange={(e) => onAuthorChange(e.target.value)}
                        placeholder="e.g. meta-llama"
                        style={inputStyle}
                    />
                </div>
                <div style={controlGroupStyle}>
                    <label style={labelStyle}>Size:</label>
                    <select value={currentNumParamsMin} onChange={(e) => onNumParamsMinChange(e.target.value)} style={{ ...selectStyle, minWidth: '80px' }}>
                        {MODEL_SIZE_OPTIONS.map(o => (<option key={o.value} value={o.value}>{o.value ? `≥ ${o.label}` : 'Min'}</option>))}
                    </select>
                    <span style={{ color: '#666' }}>–</span>
                    <select value={currentNumParamsMax} onChange={(e) => onNumParamsMaxChange(e.target.value)} style={{ ...selectStyle, minWidth: '80px' }}>
                        {MODEL_SIZE_OPTIONS.map(o => (<option key={o.value} value={o.value}>{o.value ? `≤ ${o.label}` : 'Max'}</option>))}
                    </select>
                </div>
                <label style={checkboxLabelStyle}>
                    <input
                        type="checkbox"
                        checked={currentGgufOnly}
                        onChange={(e) => onGgufOnlyChange(e.target.checked)}
                    />
                    GGUF only
                </label>
                <div style={controlGroupStyle}>
                    <label htmlFor="gated" style={labelStyle}>Access:</label>
                    <select id="gated" value={currentGated} onChange={(e) => onGatedChange(e.target.value)} style={{ ...selectStyle, minWidth: '120px' }}>
                        <option value="">Any</option>
                        <option value="false">Open only</option>
                        <option value="true">Gated only</option>
                    </select>
                </div>
                <div style={controlGroupStyle}>
                    <label htmlFor="created-within" style={labelStyle}>Created:</label>
                    <select id="created-within" value={currentCreatedWithin} onChange={(e) => onCreatedWithinChange(e.target.value)} style={{ ...selectStyle, minWidth: '130px' }}>
                        {CREATED_WITHIN_OPTIONS.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
                    </select>
                </div>
                <button
                    onClick={onClearFilters}
                    style={clearButtonStyle}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                >
                    Clear All
                </button>
            </div>
        </div>
    );
}
export default FilterControls;
