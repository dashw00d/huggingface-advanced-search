// frontend/src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';

// Import Page Components & Regular Components
import ModelDetailPage from './pages/ModelDetailPage'; 
import ModelComparisonPage from './pages/ModelComparisonPage'; // Import the comparison page
import SearchBar from './components/SearchBar';
import FilterControls from './components/FilterControls';
import ModelList from './components/ModelList';
import PaginationControls from './components/PaginationControls';
import { searchModels } from './services/api';
import './App.css'; 

// --- Styles (can be moved to CSS files) ---
const appContainerStyle = {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    backgroundColor: '#f4f7f6',
    minHeight: '100vh',
};

const simpleNavStyle = {
    backgroundColor: 'rgba(44, 62, 80, 0.9)',
    padding: '15px 0',
    marginBottom: '30px',
    borderRadius: '0 0 8px 8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
};

const navTitleStyle = {
    textAlign: 'center',
    color: 'yellow', 
    fontSize: '1.8em',
    margin: 0,
    fontWeight: '600',
    textShadow: '1px 1px 2px white',
};

const centeredMessageStyle = {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#555',
    marginBottom: '20px',
    padding: '20px 0',
};

const errorStyle = {
    ...centeredMessageStyle,
    color: 'red',
    fontWeight: 'bold',
};
// --- End Styles ---

const PAGE_SIZE = 20;
const SESSION_STORAGE_KEY = 'hfSearchHomePageState';

// Default filter values
const DEFAULT_QUERY = '';
const DEFAULT_SORT_BY = 'downloads';
const DEFAULT_PIPELINE_TAG = '';
const DEFAULT_LIBRARY = '';
const DEFAULT_AUTHOR = '';
const DEFAULT_NUM_PARAMS_MIN = '';
const DEFAULT_NUM_PARAMS_MAX = '';
const DEFAULT_GGUF_ONLY = false;
const DEFAULT_GATED = '';
const DEFAULT_CREATED_WITHIN = '';

// --- HomePage Component ---
function HomePage() {
    const navigate = useNavigate(); 
    const [models, setModels] = useState(() => JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY))?.models || []);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(() => JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY))?.error || null);
    
    const [currentQuery, setCurrentQuery] = useState(() => JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY))?.currentQuery || DEFAULT_QUERY);
    const [currentSortBy, setCurrentSortBy] = useState(() => JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY))?.currentSortBy || DEFAULT_SORT_BY);
    const [currentPipelineTag, setCurrentPipelineTag] = useState(() => JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY))?.currentPipelineTag || DEFAULT_PIPELINE_TAG);
    const [currentLibrary, setCurrentLibrary] = useState(() => JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY))?.currentLibrary || DEFAULT_LIBRARY);
    const [currentAuthor, setCurrentAuthor] = useState(() => JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY))?.currentAuthor || DEFAULT_AUTHOR);
    const [currentNumParamsMin, setCurrentNumParamsMin] = useState(() => JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY))?.currentNumParamsMin || DEFAULT_NUM_PARAMS_MIN);
    const [currentNumParamsMax, setCurrentNumParamsMax] = useState(() => JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY))?.currentNumParamsMax || DEFAULT_NUM_PARAMS_MAX);
    const [currentGgufOnly, setCurrentGgufOnly] = useState(() => JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY))?.currentGgufOnly || DEFAULT_GGUF_ONLY);
    const [currentGated, setCurrentGated] = useState(() => JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY))?.currentGated || DEFAULT_GATED);
    const [currentCreatedWithin, setCurrentCreatedWithin] = useState(() => JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY))?.currentCreatedWithin || DEFAULT_CREATED_WITHIN);

    const [currentPage, setCurrentPage] = useState(() => JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY))?.currentPage || 1);
    const [hasNextPage, setHasNextPage] = useState(() => JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY))?.hasNextPage || false);

    const [displayQueryInfo, setDisplayQueryInfo] = useState(() => JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY))?.displayQueryInfo || '');
    const [hasSearchedAtLeastOnce, setHasSearchedAtLeastOnce] = useState(() => JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY))?.hasSearchedAtLeastOnce || false);

    const [selectedForComparison, setSelectedForComparison] = useState([]);

    const handleToggleCompare = useCallback((modelId) => {
        setSelectedForComparison(prevSelected => {
            if (prevSelected.includes(modelId)) {
                return prevSelected.filter(id => id !== modelId);
            } else {
                if (prevSelected.length < 3) { 
                    return [...prevSelected, modelId];
                }
                alert("You can select a maximum of 3 models for comparison.");
                return prevSelected;
            }
        });
    }, []);

    const getAllCurrentFilters = useCallback(() => ({
        query: currentQuery, sortBy: currentSortBy, pipelineTag: currentPipelineTag,
        library: currentLibrary, author: currentAuthor, numParamsMin: currentNumParamsMin,
        numParamsMax: currentNumParamsMax, ggufOnly: currentGgufOnly, gated: currentGated,
        createdWithin: currentCreatedWithin,
    }), [currentQuery, currentSortBy, currentPipelineTag, currentLibrary, currentAuthor, currentNumParamsMin, currentNumParamsMax, currentGgufOnly, currentGated, currentCreatedWithin]);

    const performSearch = useCallback(async (searchConfig, pageToFetch) => {
        setIsLoading(true);
        const effectiveSearchConfig = {
            query: searchConfig.query !== undefined ? searchConfig.query : currentQuery,
            sortBy: searchConfig.sortBy !== undefined ? searchConfig.sortBy : currentSortBy,
            pipelineTag: searchConfig.pipelineTag !== undefined ? searchConfig.pipelineTag : currentPipelineTag,
            library: searchConfig.library !== undefined ? searchConfig.library : currentLibrary,
            author: searchConfig.author !== undefined ? searchConfig.author : currentAuthor,
            numParamsMin: searchConfig.numParamsMin !== undefined ? searchConfig.numParamsMin : currentNumParamsMin,
            numParamsMax: searchConfig.numParamsMax !== undefined ? searchConfig.numParamsMax : currentNumParamsMax,
            ggufOnly: searchConfig.ggufOnly !== undefined ? searchConfig.ggufOnly : currentGgufOnly,
            gated: searchConfig.gated !== undefined ? searchConfig.gated : currentGated,
            createdWithin: searchConfig.createdWithin !== undefined ? searchConfig.createdWithin : currentCreatedWithin,
        };
        if (!hasSearchedAtLeastOnce) setHasSearchedAtLeastOnce(true);
        const paramsToSearch = { ...effectiveSearchConfig, page: pageToFetch, pageSize: PAGE_SIZE };
        let queryParts = [];
        if (paramsToSearch.query) queryParts.push(`"${paramsToSearch.query}"`); else queryParts.push("All Models");
        if (paramsToSearch.pipelineTag) queryParts.push(`Task: ${paramsToSearch.pipelineTag}`);
        if (paramsToSearch.library) queryParts.push(`Library: ${paramsToSearch.library}`);
        if (effectiveSearchConfig.author) queryParts.push(`Author: ${effectiveSearchConfig.author}`);
        if (effectiveSearchConfig.numParamsMin || effectiveSearchConfig.numParamsMax) {
            const sizeStr = [effectiveSearchConfig.numParamsMin && `≥${effectiveSearchConfig.numParamsMin}`, effectiveSearchConfig.numParamsMax && `≤${effectiveSearchConfig.numParamsMax}`].filter(Boolean).join(' ');
            queryParts.push(`Size: ${sizeStr}`);
        }
        if (effectiveSearchConfig.ggufOnly) queryParts.push('GGUF only');
        if (effectiveSearchConfig.gated === 'true') queryParts.push('Gated');
        if (effectiveSearchConfig.gated === 'false') queryParts.push('Open');
        if (effectiveSearchConfig.createdWithin) queryParts.push(`Created: ${effectiveSearchConfig.createdWithin}`);
        const newDisplayQueryInfo = queryParts.join(' | ');

        // Convert createdWithin to ISO date
        let createdAfter = undefined;
        if (effectiveSearchConfig.createdWithin) {
            const now = new Date();
            const map = { '24h': 1, '7d': 7, '30d': 30, '90d': 90, '365d': 365 };
            const days = map[effectiveSearchConfig.createdWithin];
            if (days) {
                const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
                createdAfter = cutoff.toISOString();
            }
        }

        // Build filterTags
        let filterTags = undefined;
        if (effectiveSearchConfig.ggufOnly) {
            filterTags = 'gguf';
        }

        try {
            setError(null);
            const apiParams = {
                query: paramsToSearch.query || undefined,
                sortBy: paramsToSearch.sortBy,
                page: paramsToSearch.page,
                pageSize: paramsToSearch.pageSize,
                pipelineTag: paramsToSearch.pipelineTag || undefined,
                library: paramsToSearch.library || undefined,
                author: effectiveSearchConfig.author || undefined,
                filterTags: filterTags,
                gated: effectiveSearchConfig.gated || undefined,
                numParametersMin: effectiveSearchConfig.numParamsMin || undefined,
                numParametersMax: effectiveSearchConfig.numParamsMax || undefined,
                createdAfter: createdAfter,
            };
            const data = await searchModels(apiParams);
            const newModels = data.results || [];
            const newHasNextPage = data.has_more || false;
            setModels(newModels); setHasNextPage(newHasNextPage);
            setCurrentPage(pageToFetch); setDisplayQueryInfo(newDisplayQueryInfo);
            setSelectedForComparison([]);
            // Sync all filter state so getAllCurrentFilters() returns correct values
            setCurrentQuery(effectiveSearchConfig.query);
            setCurrentSortBy(effectiveSearchConfig.sortBy);
            setCurrentPipelineTag(effectiveSearchConfig.pipelineTag);
            setCurrentLibrary(effectiveSearchConfig.library);
            setCurrentAuthor(effectiveSearchConfig.author);
            setCurrentNumParamsMin(effectiveSearchConfig.numParamsMin);
            setCurrentNumParamsMax(effectiveSearchConfig.numParamsMax);
            setCurrentGgufOnly(effectiveSearchConfig.ggufOnly);
            setCurrentGated(effectiveSearchConfig.gated);
            setCurrentCreatedWithin(effectiveSearchConfig.createdWithin);
            const stateToSave = {
                models: newModels, currentQuery: effectiveSearchConfig.query,
                currentSortBy: effectiveSearchConfig.sortBy, currentPipelineTag: effectiveSearchConfig.pipelineTag,
                currentLibrary: effectiveSearchConfig.library, currentPage: pageToFetch,
                hasNextPage: newHasNextPage, displayQueryInfo: newDisplayQueryInfo,
                hasSearchedAtLeastOnce: true, error: null,
                currentAuthor: effectiveSearchConfig.author,
                currentNumParamsMin: effectiveSearchConfig.numParamsMin,
                currentNumParamsMax: effectiveSearchConfig.numParamsMax,
                currentGgufOnly: effectiveSearchConfig.ggufOnly,
                currentGated: effectiveSearchConfig.gated,
                currentCreatedWithin: effectiveSearchConfig.createdWithin,
            };
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (err) {
            const errorMsg = err.message || 'Failed to fetch models.';
            setError(errorMsg); setModels([]); setHasNextPage(false);
            setDisplayQueryInfo(newDisplayQueryInfo); setCurrentPage(pageToFetch); 
            const stateToSaveOnError = {
                models: [], currentQuery: effectiveSearchConfig.query,
                currentSortBy: effectiveSearchConfig.sortBy, currentPipelineTag: effectiveSearchConfig.pipelineTag,
                currentLibrary: effectiveSearchConfig.library, currentPage: pageToFetch,
                hasNextPage: false, displayQueryInfo: newDisplayQueryInfo,
                hasSearchedAtLeastOnce: true, error: errorMsg,
                currentAuthor: effectiveSearchConfig.author,
                currentNumParamsMin: effectiveSearchConfig.numParamsMin,
                currentNumParamsMax: effectiveSearchConfig.numParamsMax,
                currentGgufOnly: effectiveSearchConfig.ggufOnly,
                currentGated: effectiveSearchConfig.gated,
                currentCreatedWithin: effectiveSearchConfig.createdWithin,
            };
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stateToSaveOnError));
        } finally { setIsLoading(false); }
    }, [currentQuery, currentSortBy, currentPipelineTag, currentLibrary, currentAuthor, currentNumParamsMin, currentNumParamsMax, currentGgufOnly, currentGated, currentCreatedWithin, hasSearchedAtLeastOnce]);

    const handleSearchSubmit = useCallback((searchData) => {
        performSearch({ ...getAllCurrentFilters(), query: searchData.query || '' }, 1);
    }, [getAllCurrentFilters, performSearch]);

    const handleSortByChange = useCallback((newSortBy) => {
        performSearch({ ...getAllCurrentFilters(), sortBy: newSortBy }, 1);
    }, [getAllCurrentFilters, performSearch]);

    const handlePipelineTagChange = useCallback((newPipelineTag) => {
        performSearch({ ...getAllCurrentFilters(), pipelineTag: newPipelineTag }, 1);
    }, [getAllCurrentFilters, performSearch]);

    const handleLibraryChange = useCallback((newLibrary) => {
        performSearch({ ...getAllCurrentFilters(), library: newLibrary }, 1);
    }, [getAllCurrentFilters, performSearch]);

    const handleAuthorChange = useCallback((newAuthor) => {
        setCurrentAuthor(newAuthor);
        // Don't auto-search on every keystroke - user will press Search to apply
    }, []);

    const handleNumParamsMinChange = useCallback((val) => {
        performSearch({ ...getAllCurrentFilters(), numParamsMin: val }, 1);
    }, [getAllCurrentFilters, performSearch]);

    const handleNumParamsMaxChange = useCallback((val) => {
        performSearch({ ...getAllCurrentFilters(), numParamsMax: val }, 1);
    }, [getAllCurrentFilters, performSearch]);

    const handleGgufOnlyChange = useCallback((checked) => {
        performSearch({ ...getAllCurrentFilters(), ggufOnly: checked }, 1);
    }, [getAllCurrentFilters, performSearch]);

    const handleGatedChange = useCallback((val) => {
        performSearch({ ...getAllCurrentFilters(), gated: val }, 1);
    }, [getAllCurrentFilters, performSearch]);

    const handleCreatedWithinChange = useCallback((val) => {
        performSearch({ ...getAllCurrentFilters(), createdWithin: val }, 1);
    }, [getAllCurrentFilters, performSearch]);
    
    const goToNextPage = useCallback(() => {
        if (hasNextPage && !isLoading) {
            performSearch(getAllCurrentFilters(), currentPage + 1);
        }
    }, [hasNextPage, isLoading, currentPage, getAllCurrentFilters, performSearch]);

    const goToPreviousPage = useCallback(() => {
        if (currentPage > 1 && !isLoading) {
            performSearch(getAllCurrentFilters(), currentPage - 1);
        }
    }, [isLoading, currentPage, getAllCurrentFilters, performSearch]);

    const handleClearFilters = useCallback(() => {
        setCurrentQuery(DEFAULT_QUERY); setCurrentSortBy(DEFAULT_SORT_BY);
        setCurrentPipelineTag(DEFAULT_PIPELINE_TAG); setCurrentLibrary(DEFAULT_LIBRARY);
        setCurrentAuthor(DEFAULT_AUTHOR); setCurrentNumParamsMin(DEFAULT_NUM_PARAMS_MIN);
        setCurrentNumParamsMax(DEFAULT_NUM_PARAMS_MAX); setCurrentGgufOnly(DEFAULT_GGUF_ONLY);
        setCurrentGated(DEFAULT_GATED); setCurrentCreatedWithin(DEFAULT_CREATED_WITHIN);
        setModels([]); setHasSearchedAtLeastOnce(false); setDisplayQueryInfo('');
        setCurrentPage(1); setHasNextPage(false); setError(null);
        setSelectedForComparison([]);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }, []);

    const handleNavigateToCompare = () => {
        if (selectedForComparison.length >= 2) {
            const modelIdsToCompare = selectedForComparison.map(id => encodeURIComponent(id)).join(',');
            navigate(`/compare/${modelIdsToCompare}`);
        } else {
            alert("Please select at least 2 models to compare.");
        }
    };

    useEffect(() => {
        const storedState = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY));
        if (storedState) {
            // States are already initialized via useState callbacks
        }
    }, []); 

    return (
        <>
            <SearchBar 
                onSearch={handleSearchSubmit} 
                isLoading={isLoading}
                initialQuery={currentQuery} 
            />
            <FilterControls
                currentSortBy={currentSortBy} onSortByChange={handleSortByChange}
                currentPipelineTag={currentPipelineTag} onPipelineTagChange={handlePipelineTagChange}
                currentLibrary={currentLibrary} onLibraryChange={handleLibraryChange}
                currentAuthor={currentAuthor} onAuthorChange={handleAuthorChange}
                currentNumParamsMin={currentNumParamsMin} onNumParamsMinChange={handleNumParamsMinChange}
                currentNumParamsMax={currentNumParamsMax} onNumParamsMaxChange={handleNumParamsMaxChange}
                currentGgufOnly={currentGgufOnly} onGgufOnlyChange={handleGgufOnlyChange}
                currentGated={currentGated} onGatedChange={handleGatedChange}
                currentCreatedWithin={currentCreatedWithin} onCreatedWithinChange={handleCreatedWithinChange}
                onClearFilters={handleClearFilters}
            />
            {selectedForComparison.length >= 2 && (
                <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '10px' }}>
                    <button 
                        onClick={handleNavigateToCompare}
                        style={{ padding: '10px 20px', fontSize: '1em', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Compare Selected ({selectedForComparison.length})
                    </button>
                </div>
            )}
            {isLoading && <p style={centeredMessageStyle}>Loading models...</p>}
            {!isLoading && error && <p style={errorStyle}>Error: {error}</p>}
            {!isLoading && !error && hasSearchedAtLeastOnce && (
                <>
                    {models.length > 0 ? (
                        <>
                            <p style={centeredMessageStyle}>
                                Showing results for: <strong>{displayQueryInfo}</strong> (Page {currentPage})
                            </p>
                            <ModelList 
                                models={models} 
                                selectedForComparison={selectedForComparison}
                                onToggleCompare={handleToggleCompare}    
                            />
                            <PaginationControls
                                currentPage={currentPage} hasNextPage={hasNextPage}
                                onNextPage={goToNextPage} onPreviousPage={goToPreviousPage}
                            />
                        </>
                    ) : (
                        <p style={centeredMessageStyle}>
                            No models found for "<strong>{displayQueryInfo}</strong>". Try a different search or adjust filters.
                        </p>
                    )}
                </>
            )}
            {!isLoading && !error && !hasSearchedAtLeastOnce && (
                <p style={centeredMessageStyle}>
                    Enter a query, select filters, and click Search to find Hugging Face models.
                </p>
            )}
        </>
    );
}
// --- End HomePage Component ---

// --- Main App Component (Handles Routing and Global Layout) ---
function App() { 
    return (
        <>
            <nav style={simpleNavStyle}>
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <h1 style={navTitleStyle}>HuggingFace Model Hub</h1>
                </Link>
            </nav>
            <div style={appContainerStyle}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/model/:modelIdAuthor/:modelIdName" element={<ModelDetailPage />} />
                    <Route path="/compare/:modelIds" element={<ModelComparisonPage />} /> {/* Route for comparison */}
                </Routes>
            </div>
        </>
    );
}
export default App;