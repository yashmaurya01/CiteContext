// CiteContext - Content Script
// This script identifies and processes citations in research papers

// Citation patterns to match (can be expanded based on common formats)
const CITATION_PATTERNS = [
    /\[([\d,-]+)\]/g,                       // [1] or [1,2] or [1-3]
    /\(([A-Za-z\s]+(?:et al\.)?(?:,\s\d{4})?(?:;[A-Za-z\s]+(?:et al\.)?(?:,\s\d{4})?)*)\)/g, // (Author et al., 2020) or (Author, 2020)
];

// Extension state
const STATE = {
    enabled: true,
    citationsProcessed: 0
};

// Main function to initialize citation processing
function initCiteContext() {
    console.log("CiteContext: Initializing...");

    // Check if extension is enabled
    chrome.storage.sync.get({ enabled: true }, function (items) {
        STATE.enabled = items.enabled;

        if (STATE.enabled) {
            // Process the page to identify potential citations
            identifyCitations();

            // Watch for dynamic content changes
            observeDynamicContent();
        }
    });

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action === 'setEnabled') {
            STATE.enabled = request.enabled;

            if (STATE.enabled) {
                identifyCitations();
                observeDynamicContent();
            }

            sendResponse({ success: true });
        } else if (request.action === 'getStatus') {
            sendResponse({ active: STATE.enabled });
        }
    });
}

// Find and process citations in the document
function identifyCitations() {
    if (!STATE.enabled) return;

    // Get all text nodes in the document
    const textNodes = getAllTextNodes(document.body);

    // Process each text node to find citations
    textNodes.forEach(node => {
        CITATION_PATTERNS.forEach(pattern => {
            const nodeText = node.nodeValue;
            let match;

            // Reset the regex for each text node
            pattern.lastIndex = 0;

            // Find all matches in this text node
            while ((match = pattern.exec(nodeText)) !== null) {
                wrapCitation(node, match.index, match[0].length, match[1]);
            }
        });
    });
}

// Get all text nodes in a given element
function getAllTextNodes(element) {
    const textNodes = [];
    const walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);

    let node;
    while (node = walk.nextNode()) {
        if (node.nodeValue.trim() !== '') {
            textNodes.push(node);
        }
    }

    return textNodes;
}

// Wrap a citation with interactive elements
function wrapCitation(textNode, startOffset, length, citationKey) {
    // Check if the node is already wrapped or processed
    if (textNode.parentNode && textNode.parentNode.classList &&
        textNode.parentNode.classList.contains('cite-context-citation')) {
        return;
    }

    try {
        // Split the text node and wrap the citation part
        const range = document.createRange();
        range.setStart(textNode, startOffset);
        range.setEnd(textNode, startOffset + length);

        const citationSpan = document.createElement('span');
        citationSpan.classList.add('cite-context-citation');
        citationSpan.dataset.citation = citationKey;
        citationSpan.style.cursor = 'pointer';
        citationSpan.style.color = '#0066cc';
        citationSpan.style.textDecoration = 'underline dotted';

        range.surroundContents(citationSpan);

        // Add event listeners
        citationSpan.addEventListener('click', handleCitationClick);
        citationSpan.addEventListener('mouseenter', handleCitationHover);
        citationSpan.addEventListener('mouseleave', hideTooltip);
    } catch (error) {
        console.error("Error wrapping citation:", error);
    }
}

// Handle citation click event
function handleCitationClick(event) {
    if (!STATE.enabled) return;

    const citation = event.currentTarget.dataset.citation;
    const context = getContextualContent(event.currentTarget);

    // Show loading indicator
    showLoadingIndicator(event.currentTarget);

    // Send message to the background script to process this citation
    chrome.runtime.sendMessage({
        action: 'processCitation',
        citation: citation,
        context: context,
        url: window.location.href
    }, response => {
        hideLoadingIndicator();

        if (response && !response.error) {
            // Increment citations processed count
            STATE.citationsProcessed++;
            updateCitationsProcessedCount();

            // Display citation info
            displayCitationInfo(response, event.currentTarget);
        } else {
            // Show error in the modal
            displayCitationError(response || { message: "Failed to process citation" }, event.currentTarget);
        }
    });
}

// Update the citations processed count in storage
function updateCitationsProcessedCount() {
    chrome.storage.sync.get({ citationsProcessed: 0 }, function (data) {
        const newCount = data.citationsProcessed + 1;
        chrome.storage.sync.set({ citationsProcessed: newCount });
    });
}

// Handle citation hover event
function handleCitationHover(event) {
    if (!STATE.enabled) return;

    const citation = event.currentTarget.dataset.citation;

    // Check if we have cached data
    chrome.storage.local.get([citation], result => {
        if (result[citation]) {
            // Show quick preview from cache
            showQuickTooltip(result[citation], event.currentTarget);
        } else {
            // Show basic tooltip with loading indicator
            showBasicTooltip(citation, event.currentTarget);
        }
    });
}

// Show loading indicator
function showLoadingIndicator(element) {
    // Create or use existing loading indicator
    let loader = document.getElementById('cite-context-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'cite-context-loader';
        loader.style.position = 'fixed';
        loader.style.top = '50%';
        loader.style.left = '50%';
        loader.style.transform = 'translate(-50%, -50%)';
        loader.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        loader.style.padding = '20px';
        loader.style.borderRadius = '8px';
        loader.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        loader.style.zIndex = '10002';
        loader.innerHTML = `
            <div style="text-align: center;">
                <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 30px; height: 30px; animation: spin 2s linear infinite; margin: 0 auto;"></div>
                <div style="margin-top: 10px;">Loading citation data...</div>
            </div>
            <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        `;
        document.body.appendChild(loader);
    }

    // Show loader
    loader.style.display = 'block';
}

// Hide loading indicator
function hideLoadingIndicator() {
    const loader = document.getElementById('cite-context-loader');
    if (loader) {
        loader.style.display = 'none';
    }
}

// Show basic tooltip with citation info
function showBasicTooltip(citation, element) {
    // Create or use existing tooltip
    let tooltip = document.getElementById('cite-context-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'cite-context-tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.zIndex = '10000';
        tooltip.style.backgroundColor = 'white';
        tooltip.style.border = '1px solid #ccc';
        tooltip.style.borderRadius = '4px';
        tooltip.style.padding = '8px';
        tooltip.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        tooltip.style.maxWidth = '400px';
        tooltip.style.fontSize = '14px';
        document.body.appendChild(tooltip);
    }

    // Position tooltip near the citation
    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left}px`;
    tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;

    // Display basic info
    tooltip.innerHTML = `
        <div><strong>Citation: ${citation}</strong></div>
        <div style="font-size: 12px; color: #666; margin-top: 4px">Click for more details</div>
    `;

    // Show tooltip
    tooltip.style.display = 'block';
}

// Get surrounding content for context
function getContextualContent(element) {
    // Get the paragraph or section containing this citation
    const container = element.closest('p, section, div');
    if (!container) return '';

    // Extract text content
    return container.textContent.trim();
}

// Show tooltip with citation info
function showQuickTooltip(data, element) {
    // Create or use existing tooltip
    let tooltip = document.getElementById('cite-context-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'cite-context-tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.zIndex = '10000';
        tooltip.style.backgroundColor = 'white';
        tooltip.style.border = '1px solid #ccc';
        tooltip.style.borderRadius = '4px';
        tooltip.style.padding = '8px';
        tooltip.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        tooltip.style.maxWidth = '400px';
        tooltip.style.fontSize = '14px';
        document.body.appendChild(tooltip);
    }

    // Position tooltip near the citation
    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left}px`;
    tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;

    // Display basic info
    tooltip.innerHTML = `
        <div><strong>${data.title || 'Loading...'}</strong></div>
        <div>${data.authors || ''}</div>
        <div style="font-size: 12px; color: #666; margin-top: 4px">Click for more details</div>
    `;

    // Show tooltip
    tooltip.style.display = 'block';
}

// Hide the tooltip
function hideTooltip() {
    const tooltip = document.getElementById('cite-context-tooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

// Display citation error in modal
function displayCitationError(error, element) {
    // Create or get modal
    let modal = createOrGetModal();
    const backdrop = document.getElementById('cite-context-backdrop');

    // Display error message
    modal.innerHTML = `
        <button style="position: absolute; right: 10px; top: 10px; background: transparent; border: none; font-size: 24px; cursor: pointer;">×</button>
        <h2>Error Processing Citation</h2>
        <div style="color: #c62828; margin: 20px 0;">
            ${error.message || "An unknown error occurred while processing this citation."}
        </div>
        <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee;">
            <h3>Troubleshooting:</h3>
            <ul style="padding-left: 20px;">
                <li>Check your API key in the extension settings</li>
                <li>Ensure you have sufficient credits on your OpenAI account</li>
                <li>Try again later if the service is experiencing high load</li>
            </ul>
        </div>
    `;

    // Close button functionality
    const closeBtn = modal.querySelector('button');
    closeBtn.onclick = () => {
        modal.style.display = 'none';
        backdrop.style.display = 'none';
    };

    // Show modal and backdrop
    modal.style.display = 'block';
    backdrop.style.display = 'block';
}

// Create or get the citation modal
function createOrGetModal() {
    let modal = document.getElementById('cite-context-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'cite-context-modal';
        modal.style.position = 'fixed';
        modal.style.zIndex = '10001';
        modal.style.left = '50%';
        modal.style.top = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.backgroundColor = 'white';
        modal.style.border = '1px solid #ccc';
        modal.style.borderRadius = '8px';
        modal.style.padding = '20px';
        modal.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
        modal.style.width = '600px';
        modal.style.maxWidth = '90vw';
        modal.style.maxHeight = '80vh';
        modal.style.overflow = 'auto';

        document.body.appendChild(modal);

        // Add backdrop
        const backdrop = document.createElement('div');
        backdrop.id = 'cite-context-backdrop';
        backdrop.style.position = 'fixed';
        backdrop.style.zIndex = '10000';
        backdrop.style.left = '0';
        backdrop.style.top = '0';
        backdrop.style.width = '100%';
        backdrop.style.height = '100%';
        backdrop.style.backgroundColor = 'rgba(0,0,0,0.5)';
        backdrop.onclick = () => {
            modal.style.display = 'none';
            backdrop.style.display = 'none';
        };

        document.body.appendChild(backdrop);
    }

    return modal;
}

// Display full citation information in a modal
function displayCitationInfo(data, element) {
    // Create or get modal
    let modal = createOrGetModal();
    const backdrop = document.getElementById('cite-context-backdrop');

    // Display citation details
    if (data && data.title) {
        modal.innerHTML = `
            <button style="position: absolute; right: 10px; top: 10px; background: transparent; border: none; font-size: 24px; cursor: pointer;">×</button>
            <h2>${data.title}</h2>
            <p><strong>Authors:</strong> ${data.authors || 'Unknown'}</p>
            <p><strong>Year:</strong> ${data.year || 'Unknown'}</p>
            <hr>
            <h3>Relevance to Current Context:</h3>
            <div>${data.relevance || 'Loading relevant context information...'}</div>
            <hr>
            <h3>Abstract:</h3>
            <div>${data.abstract || 'Abstract not available'}</div>
        `;

        // Close button functionality
        const closeBtn = modal.querySelector('button');
        closeBtn.onclick = () => {
            modal.style.display = 'none';
            backdrop.style.display = 'none';
        };
    } else {
        modal.innerHTML = `
            <button style="position: absolute; right: 10px; top: 10px; background: transparent; border: none; font-size: 24px; cursor: pointer;">×</button>
            <h2>Citation Information</h2>
            <p>Loading information for this citation...</p>
            <div class="loader" style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 20px; height: 20px; animation: spin 2s linear infinite; margin: 20px auto;"></div>
            <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        `;

        // Close button functionality
        const closeBtn = modal.querySelector('button');
        closeBtn.onclick = () => {
            modal.style.display = 'none';
            backdrop.style.display = 'none';
        };
    }

    // Show modal and backdrop
    modal.style.display = 'block';
    backdrop.style.display = 'block';

    // Cache the citation data
    if (data && data.title) {
        chrome.storage.local.set({ [data.citationKey]: data });
    }
}

// Observe dynamic content changes
function observeDynamicContent() {
    if (!STATE.enabled) return;

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                // New content was added, check for citations
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        identifyCitations();
                    }
                });
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Initialize on page load
window.addEventListener('load', initCiteContext);

// Initialize immediately for static content
initCiteContext(); 