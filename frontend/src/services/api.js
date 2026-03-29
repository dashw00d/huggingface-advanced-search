import axios from 'axios';

// Define the base URL for your backend API
// It's good practice to use environment variables for this,
// especially if it might change between development and production.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
// For Vite, use import.meta.env.VITE_API_BASE_URL
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';


/**
 * Searches for models on the backend.
 * @param {object} params - The search parameters.
 * @param {string} [params.query] - The search query string.
 * @param {string} [params.sortBy='downloads'] - Field to sort by.
 * @param {number} [params.limit=20] - Number of results to return.
 * @param {string} [params.pipelineTag] - Filter by pipeline tag.
 * @param {string} [params.library] - Filter by library.
 * @returns {Promise<object>} A promise that resolves to the search response data.
 *                            Typically { query, sortBy, limit, results: [HFModelSearchResultItem], total_results_approx }
 * @throws {Error} If the API request fails.
 */
export const searchModels = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();
        if (params.query) queryParams.append('query', params.query);
        if (params.sortBy) queryParams.append('sort_by', params.sortBy);
        if (params.page) queryParams.append('page', params.page);
        if (params.pageSize) queryParams.append('page_size', params.pageSize);
        if (params.pipelineTag) queryParams.append('pipeline_tag', params.pipelineTag);
        if (params.library) queryParams.append('library', params.library);
        if (params.author) queryParams.append('author', params.author);
        if (params.filterTags) queryParams.append('filter_tags', params.filterTags);
        if (params.gated !== undefined && params.gated !== null && params.gated !== '') queryParams.append('gated', params.gated);
        if (params.numParametersMin) queryParams.append('num_parameters_min', params.numParametersMin);
        if (params.numParametersMax) queryParams.append('num_parameters_max', params.numParametersMax);
        if (params.createdAfter) queryParams.append('created_after', params.createdAfter);

        const requestUrl = `${API_BASE_URL}/search/models`;
        const response = await axios.get(requestUrl, { params: queryParams });
        return response.data;
    } catch (error) {
        console.error("[api.js] Error searching models:", error.response ? error.response.data : error.message);
        throw error;
    }
};

// Placeholder for fetching model details - we'll implement this later
export const getModelDetails = async (modelId) => {
    try {
        // IMPORTANT: modelId might contain '/', which needs to be part of the path, not URL encoded as a whole.
        // Axios handles path parameter encoding correctly by default if the URL template is right.
        // Our backend route is /api/models/{author}/{name}
        const parts = modelId.split('/');
        if (parts.length < 2) {
            console.error("Invalid modelId format for detail fetch:", modelId);
            throw new Error("Invalid model ID format. Expected 'author/name'.");
        }
        // Assuming first part is author, rest is model name (could be multiple segments for name if repo structure allows)
        const author = parts[0];
        const name = parts.slice(1).join('/'); // Handle names like 'model-subpart'
        
        const url = `${API_BASE_URL}/models/${encodeURIComponent(author)}/${encodeURIComponent(name)}`;
        // If your backend route was /api/models/{model_repo_id:path} you'd do:
        // const url = `${API_BASE_URL}/models/${encodeURIComponent(modelId)}`; // But be careful with double encoding of slashes

        console.log(`Fetching model details from: ${url}`);
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching details for model ${modelId}:`, error.response ? error.response.data : error.message);
        throw error; // Re-throw to be caught by the component
    }
};


// Placeholder for autocomplete - we'll implement this later
export const getAutocompleteSuggestions = async (query) => {
    try {
        // const response = await axios.get(`${API_BASE_URL}/search/autocomplete`, { params: { q: query } });
        // return response.data;
        console.warn(`getAutocompleteSuggestions for ${query} is not yet fully implemented.`);
        return Promise.resolve([{id: "suggestion/one"}, {id: "suggestion/two"}]); // Placeholder
    } catch (error) {
        console.error(`Error fetching autocomplete suggestions for ${query}:`, error.response ? error.response.data : error.message);
        throw error;
    }
};