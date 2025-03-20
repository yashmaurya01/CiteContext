// CiteContext - Background Script
// Handles API calls and citation processing

// Configuration
const CONFIG = {
    // API endpoints
    openaiApiEndpoint: "https://api.openai.com/v1/chat/completions",
    arxivApiEndpoint: "https://export.arxiv.org/api/query",

    // Models
    defaultModel: "gpt-3.5-turbo",
    highQualityModel: "gpt-4o",

    // Cache settings
    cacheExpiration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

// Initialize
chrome.runtime.onInstalled.addListener(() => {
    console.log("CiteContext extension installed");

    // Initialize cache clearing scheduler
    setupCacheCleaning();

    // Set default settings if not already set
    chrome.storage.sync.get({
        apiKey: '',
        model: CONFIG.defaultModel,
        enabled: true
    }, (items) => {
        chrome.storage.sync.set(items);
    });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "processCitation") {
        processCitation(request, sendResponse);
        return true; // Indicates we'll respond asynchronously
    } else if (request.action === "updateSettings") {
        updateSettings(request);
    } else if (request.action === "setProcessingMode") {
        // Not needed anymore as we're only using API mode
    }
});

// Process a citation request
async function processCitation(request, sendResponse) {
    const { citation, context, url } = request;

    // Generate a cache key based on citation and context
    const cacheKey = `cite_${citation}_${hashString(context)}`;

    // Check cache first
    try {
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
            console.log("Returning cached citation data");
            sendResponse(cachedData);
            return;
        }
    } catch (error) {
        console.error("Cache error:", error);
    }

    try {
        // Get settings
        const settings = await getSettings();

        if (!settings.apiKey) {
            sendResponse({
                error: true,
                message: "API key not configured. Please add an OpenAI API key in the extension settings.",
                citationKey: citation
            });
            return;
        }

        // Get paper information
        const paperInfo = await fetchPaperInfo(citation);

        // Generate relevance using LLM
        const relevance = await generateRelevance(paperInfo, context, settings.apiKey, settings.model);

        // Prepare citation data
        const citationData = {
            title: paperInfo.title,
            authors: paperInfo.authors,
            year: paperInfo.year,
            abstract: paperInfo.abstract || "Abstract not available",
            relevance: relevance,
            url: paperInfo.url || url,
            citationKey: citation
        };

        // Cache the result
        cacheCitationData(cacheKey, citationData);

        // Send response back to content script
        sendResponse(citationData);
    } catch (error) {
        console.error("Error processing citation:", error);
        sendResponse({
            error: true,
            message: "Failed to process citation: " + error.message,
            citationKey: citation
        });
    }
}

// Fetch paper information from arXiv
async function fetchPaperInfo(citation) {
    try {
        // Try to parse the citation text
        const parsedCitation = parseCitation(citation);

        // Parse the citation to build a search query
        let searchQuery = '';

        // If we have an arXiv ID directly
        if (parsedCitation.arxivId) {
            searchQuery = `id_list=${parsedCitation.arxivId}`;
        }
        // If we have author info, use that
        else if (parsedCitation.authors) {
            const authorQuery = parsedCitation.authors.replace(' et al.', '').trim();
            searchQuery = `search_query=au:"${authorQuery}"`;

            // Add year if available
            if (parsedCitation.year) {
                searchQuery += `+AND+submittedDate:[${parsedCitation.year}0101+TO+${parsedCitation.year}1231]`;
            }
        }
        // If we have a title, search by title
        else if (parsedCitation.title) {
            searchQuery = `search_query=ti:"${parsedCitation.title}"`;
        }
        // If numeric citation, we can't do much with arXiv
        else if (/^\d+$/.test(citation)) {
            // Return basic info for numeric citations
            return {
                title: `Paper #${citation}`,
                authors: "Unknown",
                year: "Unknown",
                abstract: "Abstract not available for this citation."
            };
        }
        // Use citation as a general search term
        else {
            searchQuery = `search_query=all:"${citation}"&max_results=1`;
        }

        // Call arXiv API
        const response = await fetch(`${CONFIG.arxivApiEndpoint}?${searchQuery}`);

        if (!response.ok) {
            throw new Error(`arXiv API Error: ${response.status} ${response.statusText}`);
        }

        // Parse XML response
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");

        // Check if we have entries
        const entries = xmlDoc.getElementsByTagName("entry");

        if (entries.length === 0) {
            // No results, fall back to parsed info
            return fallbackToParsedInfo(citation, parsedCitation);
        }

        // Get first entry
        const entry = entries[0];

        // Extract paper information
        const title = getXmlElementText(entry, "title");
        const abstract = getXmlElementText(entry, "summary");
        const published = getXmlElementText(entry, "published");
        const authors = Array.from(entry.getElementsByTagName("author"))
            .map(author => getXmlElementText(author, "name"))
            .join(", ");

        // Get URL
        const links = entry.getElementsByTagName("link");
        let url = "";
        for (let i = 0; i < links.length; i++) {
            const link = links[i];
            const rel = link.getAttribute("rel");
            if (rel === "alternate" || rel === "related") {
                url = link.getAttribute("href");
                break;
            }
        }

        // Get arXiv ID
        const id = getXmlElementText(entry, "id");
        const arxivId = id.split("/").pop();

        // Extract year from published date
        const year = published ? published.substring(0, 4) : "";

        return {
            title: title || "Unknown Title",
            authors: authors || "Unknown Authors",
            year: year || "Unknown Year",
            abstract: abstract || "Abstract not available",
            url: url || `https://arxiv.org/abs/${arxivId}`,
            arxivId: arxivId
        };
    } catch (error) {
        console.error("Error fetching paper info from arXiv:", error);

        // Return basic info extracted from the citation text
        const parsedCitation = parseCitation(citation);
        return fallbackToParsedInfo(citation, parsedCitation);
    }
}

// Helper function to get text content of an XML element
function getXmlElementText(parent, tagName) {
    const elements = parent.getElementsByTagName(tagName);
    return elements.length > 0 ? elements[0].textContent.trim() : "";
}

// Fallback to parsed citation information
function fallbackToParsedInfo(citation, parsedCitation) {
    // Return basic info extracted from the citation text
    const basicInfo = extractBasicInfoFromCitation(citation);
    return {
        title: parsedCitation.title || basicInfo.title || `Paper referenced by citation ${citation}`,
        authors: parsedCitation.authors || basicInfo.authors || "Unknown",
        year: parsedCitation.year || basicInfo.year || "Unknown",
        abstract: "Abstract not available for this citation."
    };
}

// Extract basic information from citation text
function extractBasicInfoFromCitation(citation) {
    // Simple regex-based extraction for common citation formats

    // For numeric citations like [1], we can't extract much
    if (/^\d+$/.test(citation)) {
        return {
            title: `Paper #${citation}`,
            authors: "Unknown",
            year: "Unknown"
        };
    }

    // For author-year citations like (Smith et al., 2020)
    const authorYearMatch = citation.match(/([A-Za-z\s]+(?:et al\.)?),?\s(\d{4})/);
    if (authorYearMatch) {
        return {
            title: `Research by ${authorYearMatch[1]}`,
            authors: authorYearMatch[1],
            year: authorYearMatch[2]
        };
    }

    // For more complex citations, we'll have mocked data
    // This would be improved in a production version
    const mockPapers = {
        "vaswani": {
            title: "Attention Is All You Need",
            authors: "Vaswani et al.",
            year: "2017"
        },
        "devlin": {
            title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
            authors: "Devlin et al.",
            year: "2019"
        }
    };

    // Check if citation contains any known author names
    for (const [author, paper] of Object.entries(mockPapers)) {
        if (citation.toLowerCase().includes(author)) {
            return paper;
        }
    }

    // Default case
    return {
        title: `Paper referenced as ${citation}`,
        authors: "Unknown",
        year: "Unknown"
    };
}

// Parse citation to extract identifiers like DOI or arXiv
function parseCitation(citation) {
    const result = {
        title: null,
        authors: null,
        year: null,
        doi: null,
        arxivId: null
    };

    // Extract DOI if present
    const doiMatch = citation.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
    if (doiMatch) {
        result.doi = doiMatch[0];
    }

    // Extract arXiv ID if present - support old and new format
    // New format: YYMM.NNNNN
    const arxivNewMatch = citation.match(/\d{4}\.\d{4,5}/);
    if (arxivNewMatch) {
        result.arxivId = arxivNewMatch[0];
    }
    // Old format: arxiv:SUBJ/YYMMNNN or SUBJ/YYMMNNN
    else {
        const arxivOldMatch = citation.match(/(?:arxiv:)?([a-z\-]+\/\d{7})/i);
        if (arxivOldMatch) {
            result.arxivId = arxivOldMatch[1];
        }
    }

    // Extract year if present
    const yearMatch = citation.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
        result.year = yearMatch[0];
    }

    // Extract authors (simplified)
    const etAlMatch = citation.match(/([A-Za-z\s]+)(?:et al\.)/);
    if (etAlMatch) {
        result.authors = `${etAlMatch[1].trim()} et al.`;
    }

    return result;
}

// Generate relevance explanation using LLM
async function generateRelevance(paperInfo, context, apiKey, model) {
    try {
        // Prepare prompt for the LLM
        const prompt = `
            I'm reading a research paper that contains the following paragraph:
            
            "${context}"
            
            In this paragraph, the paper cites another paper with the following information:
            Title: ${paperInfo.title}
            Authors: ${paperInfo.authors}
            Year: ${paperInfo.year}
            
            Please explain in 2-3 sentences how the cited paper is relevant to the specific context in which it's mentioned.
            Focus on the specific contribution, finding, or methodology from the cited paper that relates to this paragraph.
        `;

        // Call OpenAI API
        const response = await fetch(CONFIG.openaiApiEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model || CONFIG.defaultModel,
                messages: [
                    { "role": "system", "content": "You are a helpful assistant specialized in academic research." },
                    { "role": "user", "content": prompt }
                ],
                temperature: 0.3,
                max_tokens: 150
            })
        });

        const result = await response.json();

        if (response.ok) {
            return result.choices[0].message.content.trim();
        } else {
            console.error("API error:", result);
            return `Unable to determine relevance: ${result.error?.message || "Unknown error"}`;
        }
    } catch (error) {
        console.error("Error generating relevance:", error);
        return "Unable to determine relevance at this time.";
    }
}

// Update extension settings
function updateSettings(request) {
    const settings = {};

    if (request.apiKey !== undefined) {
        settings.apiKey = request.apiKey;
    }

    if (request.model !== undefined) {
        settings.model = request.model;
    }

    if (request.apiEndpoint !== undefined) {
        settings.apiEndpoint = request.apiEndpoint;
    }

    chrome.storage.sync.set(settings);
}

// Get current settings
async function getSettings() {
    return new Promise((resolve) => {
        chrome.storage.sync.get({
            apiKey: '',
            model: CONFIG.defaultModel,
            enabled: true
        }, resolve);
    });
}

// Cache citation data
function cacheCitationData(key, data) {
    const cacheItem = {
        data,
        timestamp: Date.now()
    };

    chrome.storage.local.set({ [key]: cacheItem });
}

// Get cached data if available and not expired
async function getCachedData(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], result => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
                return;
            }

            const cacheItem = result[key];
            if (!cacheItem) {
                resolve(null);
                return;
            }

            const now = Date.now();
            if (now - cacheItem.timestamp > CONFIG.cacheExpiration) {
                // Cache expired, remove it
                chrome.storage.local.remove([key]);
                resolve(null);
                return;
            }

            resolve(cacheItem.data);
        });
    });
}

// Setup periodic cache cleaning
function setupCacheCleaning() {
    // Clean cache every day
    setInterval(cleanCache, 24 * 60 * 60 * 1000);

    // Clean on startup
    cleanCache();
}

// Clean expired items from cache
function cleanCache() {
    chrome.storage.local.get(null, items => {
        const now = Date.now();
        const keysToRemove = [];

        for (const [key, value] of Object.entries(items)) {
            if (key.startsWith('cite_') && value.timestamp &&
                now - value.timestamp > CONFIG.cacheExpiration) {
                keysToRemove.push(key);
            }
        }

        if (keysToRemove.length > 0) {
            chrome.storage.local.remove(keysToRemove);
            console.log(`Cleaned ${keysToRemove.length} expired cache items`);
        }
    });
}

// Utility to hash a string (for cache keys)
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
} 