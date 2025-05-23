// --- Configuration & Constants ---
const API_BASE_URL = "https://www.speedrun.com/api/v1";
const MAX_RUNS_PER_REQUEST = 100; // Default for initial request, API pagination links will dictate subsequent 'max'
const REQUEST_DELAY_MS = 1500; // Delay between paginated requests (slightly over 1 second to be safe with 60-100 req/min limits)

// --- Helper Functions ---

/**
 * A simple utility to pause execution for a specified duration.
 * @param {number} ms - The duration to sleep in milliseconds.
 * @returns {Promise<void>}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetches data from the Speedrun.com API.
 * Can handle either an API endpoint + params, or a full URL (for pagination).
 * @param {string} targetUrlOrEndpoint - The API endpoint (e.g., "/games") or a full URL.
 * @param {object} [paramsIfEndpoint={}] - Query parameters, only used if targetUrlOrEndpoint is an endpoint.
 * @returns {Promise<object|null>} The JSON response data, or null if an error occurs.
 */
async function fetchFromApi(targetUrlOrEndpoint, paramsIfEndpoint = {}) {
    let urlToFetch;

    try {
        // Check if targetUrlOrEndpoint is a full URL (likely from pagination)
        if (targetUrlOrEndpoint.startsWith("http://") || targetUrlOrEndpoint.startsWith("https://")) {
            urlToFetch = new URL(targetUrlOrEndpoint);
        } else {
            // Otherwise, construct it as an endpoint relative to API_BASE_URL
            urlToFetch = new URL(`${API_BASE_URL}${targetUrlOrEndpoint}`);
            Object.keys(paramsIfEndpoint).forEach(key => {
                // Ensure value is not null or undefined before appending
                if (paramsIfEndpoint[key] !== null && paramsIfEndpoint[key] !== undefined) {
                    urlToFetch.searchParams.append(key, paramsIfEndpoint[key]);
                }
            });
        }
    } catch (error) {
        console.error("Error constructing URL:", error, "Target:", targetUrlOrEndpoint, "Params:", paramsIfEndpoint);
        return null;
    }

    console.log(`Fetching: ${urlToFetch.toString()}`); // Log the URL for debugging

    try {
        const response = await fetch(urlToFetch.toString());
        if (!response.ok) {
            console.error(`API Error: ${response.status} - ${response.statusText} for URL: ${urlToFetch.toString()}`);
            try {
                const errorBody = await response.json(); // Try to parse error as JSON
                console.error("Error Body (JSON):", errorBody);
            } catch (e) {
                const errorBodyText = await response.text(); // Fallback to text if JSON parsing fails
                console.error("Error Body (Text):", errorBodyText);
            }
            return null;
        }
        
        // Check for empty response body before attempting to parse JSON
        const responseText = await response.text();
        if (!responseText) {
            console.warn(`Empty response body for URL: ${urlToFetch.toString()}`);
            // Return a structure that won't break downstream code expecting .data and .pagination
            return { data: { runs: [], players: { data: [] }, pagination: { links: [] } } }; 
        }
        return JSON.parse(responseText);

    } catch (error) {
        console.error(`Network or other error fetching ${urlToFetch.toString()}:`, error);
        return null;
    }
}

/**
 * Gets the Speedrun.com game ID from its abbreviation.
 * @param {string} gameAbbreviation - The game's abbreviation (e.g., "sm64").
 * @returns {Promise<string|null>} The game ID, or null if not found or an error occurs.
 */
async function getGameId(gameAbbreviation) {
    if (!gameAbbreviation || typeof gameAbbreviation !== 'string' || gameAbbreviation.trim() === '') {
        console.error("Invalid game abbreviation provided.");
        return null;
    }
    // Ensure `max` is a string or number if your API requires a specific type, though `fetch` usually handles it.
    const data = await fetchFromApi("/games", { abbreviation: gameAbbreviation.trim(), max: "1" });
    if (data && data.data && data.data.length > 0) {
        return data.data[0].id;
    }
    console.error(`Game with abbreviation "${gameAbbreviation}" not found.`);
    return null;
}

// --- Main Functions ---

/**
 * Gets the default category ID and its default subcategory values for a given game.
 * @param {string} gameAbbreviation - The game's abbreviation.
 * @returns {Promise<object|null>} An object like { categoryId: "id", subcategoryQuery: "var-xxxx=yyyy&var-zzzz=aaaa" } or null.
 */
async function getDefaultCategory(gameAbbreviation) {
    const gameId = await getGameId(gameAbbreviation);
    if (!gameId) {
        return null;
    }

    const gameData = await fetchFromApi(`/games/${gameId}`, { embed: "categories.variables" });

    if (!gameData || !gameData.data || !gameData.data.categories || !gameData.data.categories.data) {
        console.error(`Could not fetch categories or category data missing for game ID "${gameId}". Response:`, gameData);
        return null;
    }

    const categories = gameData.data.categories.data;
    if (categories.length === 0) {
        console.error(`No categories found for game ID "${gameId}".`);
        return null;
    }

    let defaultCategory = categories.find(cat => cat.type === "per-game" && cat.miscellaneous === false);
    if (!defaultCategory && categories.length > 0) { // Ensure there's at least one category
        defaultCategory = categories[0]; // Fallback to the first category
    }

    if (!defaultCategory) {
        console.error(`Could not determine a default category for game ID "${gameId}".`);
        return null;
    }

    const categoryId = defaultCategory.id;
    let subcategoryQueryParts = [];

    if (defaultCategory.variables && defaultCategory.variables.data) {
        defaultCategory.variables.data.forEach(variable => {
            if (variable['is-subcategory']) {
                const defaultValueKey = variable.values.default; // This is the KEY of the default value
                // The API expects the key of the value for 'var-' parameters.
                if (defaultValueKey) { 
                    subcategoryQueryParts.push(`var-${variable.id}=${defaultValueKey}`);
                }
            }
        });
    }

    return {
        categoryId: categoryId,
        subcategoryQuery: subcategoryQueryParts.join('&')
    };
}


/**
 * Filters leaderboard runs for a specific game, category, and country,
 * calling a callback for each found run incrementally.
 * @param {string} gameAbbreviation - The game's abbreviation (e.g., "sm64").
 * @param {string|null} categoryId - The category ID. If null, uses the game's default category.
 * @param {string|null} subcategoryQuery - A query string for subcategories (e.g., "var-xxxx=yyyy").
 * @param {string} countryCode - The 2-letter country code to filter by (e.g., "br", "us").
 * @param {function} [onRunFoundCallback=null] - Optional callback function executed for each matching run.
 * Receives the run object as an argument.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of all filtered run objects.
 */
async function filterCountry(gameAbbreviation, categoryId, subcategoryQuery, countryCode, onRunFoundCallback) {
    if (!countryCode || typeof countryCode !== 'string' || countryCode.trim().length !== 2) {
        console.error("Invalid or missing country code. Please provide a 2-letter code (e.g., 'us', 'br').");
        return []; // Return empty array on error
    }
    countryCode = countryCode.toLowerCase().trim();

    const gameId = await getGameId(gameAbbreviation);
    if (!gameId) {
        console.error(`Could not proceed: Game ID for "${gameAbbreviation}" not found.`);
        return [];
    }

    let targetCategoryId = categoryId;
    let targetSubcategoryQuery = subcategoryQuery === null ? null : (subcategoryQuery || ""); // Distinguish null from empty string

    if (!targetCategoryId) {
        console.log(`Category ID not provided, attempting to fetch default category for "${gameAbbreviation}"...`);
        const defaultCategoryInfo = await getDefaultCategory(gameAbbreviation);
        if (defaultCategoryInfo) {
            targetCategoryId = defaultCategoryInfo.categoryId;
            if (subcategoryQuery === null) { 
                 targetSubcategoryQuery = defaultCategoryInfo.subcategoryQuery;
            }
            console.log(`Using default category ID: ${targetCategoryId} with subcategories: "${targetSubcategoryQuery || 'None'}"`);
        } else {
            console.error(`Could not fetch default category for "${gameAbbreviation}". Please specify a category ID.`);
            return [];
        }
    }

    if (!targetCategoryId) {
        console.error("No category ID available to fetch leaderboard.");
        return [];
    }

    console.log(`Fetching runs for Game: ${gameAbbreviation} (ID: ${gameId}), Category ID: ${targetCategoryId}, Subcategories: "${targetSubcategoryQuery || 'None'}", Country: ${countryCode.toUpperCase()}`);

    let allFilteredRuns = [];
    let nextUrl = null; 
    let isInitialRequest = true;

    while (isInitialRequest || nextUrl) {
        let currentResponseData;
        if (isInitialRequest) {
            const endpoint = `/leaderboards/${targetCategoryId}`;
            const initialParams = {
                embed: "players", 
                max: String(MAX_RUNS_PER_REQUEST) // Ensure max is a string if API expects it
            };

            if (targetSubcategoryQuery && targetSubcategoryQuery.trim() !== '') {
                targetSubcategoryQuery.split('&').forEach(part => {
                    const [key, value] = part.split('=');
                    if (key && value && key.trim() !== '' && value.trim() !== '') {
                        initialParams[key.trim()] = value.trim();
                    }
                });
            }
            currentResponseData = await fetchFromApi(endpoint, initialParams);
            isInitialRequest = false; 
        } else {
            currentResponseData = await fetchFromApi(nextUrl); 
        }

        if (!currentResponseData || !currentResponseData.data) {
            console.error("Failed to fetch leaderboard data or data object is missing in response.");
            displayInfoOnTable(getFakePlayer("error"));
            break; 
        }
        
        const runs = currentResponseData.data.runs || []; 
        const playersData = currentResponseData.data.players ? currentResponseData.data.players.data : [];
        
        console.log(`Fetched ${runs.length} runs in this batch. Processing for country: ${countryCode.toUpperCase()}...`);

        for (const runEntry of runs) {
            const run = runEntry.run;
            if (!run || !run.players || run.players.length === 0) {
                continue; 
            }

            const playerInfo = run.players[0]; 
            let userId = null;

            if (playerInfo.rel === "user") {
                userId = playerInfo.id;
            } else if (playerInfo.rel === "guest") {
                continue; 
            }

            if (userId) {
                const playerData = playersData.find(p => p.id === userId);
                if (playerData && playerData.location && playerData.location.country &&
                    playerData.location.country.code && playerData.location.country.code.toLowerCase() === countryCode) {

                    const runDetails = {
                        index: runEntry.place,
                        runId: run.id,
                        player: getDisplayName(playerData),
                        timeSeconds: run.times.primary_t, 
                        timeFormatted: run.times.primary, 
                        date: run.date,
                        weblink: run.weblink,
                        country: playerData.location.country.code.toUpperCase(),
                        game: gameAbbreviation,
                        category: targetCategoryId, 
                        comment: run.comment

                    };
                    allFilteredRuns.push(runDetails);

                    // Call the callback function for incremental updates
                    if (typeof onRunFoundCallback === 'function') {
                        try {
                            onRunFoundCallback(runDetails);
                        } catch (cbError) {
                            console.error("Error in onRunFoundCallback:", cbError);
                        }
                    }
                }
            }
        }

        const pagination = currentResponseData.data.pagination;
        const nextLinkObject = pagination && pagination.links ? pagination.links.find(link => link.rel === 'next') : null;

        if (nextLinkObject && nextLinkObject.uri) {
            nextUrl = nextLinkObject.uri; 
            console.log(`Preparing to fetch next page: ${nextUrl}`);
            await sleep(REQUEST_DELAY_MS); 
        } else {
            nextUrl = null; 
            console.log("No 'next' link found. Reached end of leaderboard or an issue with pagination data.");
        }
    } 

    if (allFilteredRuns.length > 0) {
        console.log(`--- Total Filtered Runs (at the end) for ${gameAbbreviation} / ${countryCode.toUpperCase()} ---`);
        // This final log can be removed if incremental updates are sufficient
        // allFilteredRuns.forEach(run => console.log(`Player: ${run.player}, Time: ${run.timeFormatted}, Date: ${run.date}, Link: ${run.weblink}`));
        console.log(`Found ${allFilteredRuns.length} runs matching the criteria.`);
    } else {
        console.log(`No runs found for game "${gameAbbreviation}", category "${targetCategoryId}", subcategories "${targetSubcategoryQuery || 'None'}", and country "${countryCode.toUpperCase()}".`);
        displayInfoOnTable(getFakePlayer("noPlayer"));
    }
    
    return allFilteredRuns; 
}

/**
 * Example callback function to process each run as it's found.
 * @param {object} runDetails - The details of the found run.
 */
function handleFoundRunIncrementally(runDetails) {
    console.log(`INCREMENTAL: Player: ${runDetails.player}, Time: ${runDetails.timeFormatted}, Country: ${runDetails.country}, Link: ${runDetails.weblink}`);
    console.log("rundetail",runDetails);
    displayInfoOnTable(runDetails);
}


async function countryFilter(categoryId, subcategoryQuery, countryCode, onRunCallback) {
    clearTable();
    console.log("Executing countryFilter with country code:", countryCode);
    if (!countryCode || typeof countryCode !== 'string' || countryCode.trim().length !== 2) {
        console.error("Invalid or missing country code in countryFilter");
        return []; 
    }
    countryCode = countryCode.toLowerCase().trim();
    
    const gameAbbr = typeof getGameAbbr === 'function' ? getGameAbbr() : null; 
    if (!gameAbbr) {
        console.error("Could not get game abbreviation via getGameAbbr(). Please ensure it's available.");
        return [];
    }
    apiUrl = await categoryCheck(gameAbbr);
    // Pass the callback to filterCountry
    return await filterCountry(gameAbbr, apiUrl, subcategoryQuery, countryCode, handleFoundRunIncrementally);
}


async function categoryCheck(gameAbbrv) {
    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(url.search);

    const fullCategory = searchParams.get('x'); // Example: mkeyl926-r8rg67rn.21d4zvp1-wl33kewl.21go6e6q
    if (!fullCategory) return null;

    // Split category from variables
    const parts = fullCategory.split('-');
    const categoryId = parts[0]; // e.g., "mkeyl926"
    const variables = parts.slice(1); // e.g., ["r8rg67rn.21d4zvp1", "wl33kewl.21go6e6q"]

    // Turn into query string: var-r8rg67rn=21d4zvp1&var-wl33kewl=21go6e6q
    const variableParams = variables
        .map(v => {
            const [varId, valueId] = v.split('.');
            return `var-${varId}=${valueId}`;
        })
        .join('&');

    // Construct full API URL
    const apiUrl = `${gameAbbrv}/category/${categoryId}` +
                   (variableParams ? `?${variableParams}` : '');

    return apiUrl;
}