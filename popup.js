// CiteContext - Popup Script

document.addEventListener('DOMContentLoaded', function () {
    // Initialize UI state
    loadSettings();
    updateStats();
    checkCurrentPageStatus();

    // Setup event listeners
    document.getElementById('activation-toggle').addEventListener('change', toggleActivation);
    document.getElementById('save-settings').addEventListener('click', saveSettings);

    // Setup API key visibility toggle
    const toggleVisibilityBtn = document.getElementById('toggle-key-visibility');
    const apiKeyInput = document.getElementById('api-key');

    toggleVisibilityBtn.addEventListener('click', function () {
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            toggleVisibilityBtn.textContent = 'Hide';
        } else {
            apiKeyInput.type = 'password';
            toggleVisibilityBtn.textContent = 'Show';
        }
    });
});

// Load settings from storage
function loadSettings() {
    chrome.storage.sync.get({
        // Default settings
        enabled: true,
        apiKey: '',
        model: 'gpt-3.5-turbo'
    }, function (items) {
        // Set UI state to match stored settings
        document.getElementById('activation-toggle').checked = items.enabled;
        document.getElementById('api-key').value = items.apiKey;
        document.getElementById('model-selection').value = items.model;

        // Update status display
        updateStatusDisplay(items.enabled);
    });
}

// Toggle extension activation
function toggleActivation(event) {
    const enabled = event.target.checked;

    // Save setting
    chrome.storage.sync.set({ enabled: enabled });

    // Update status display
    updateStatusDisplay(enabled);

    // Tell content script to enable/disable functionality
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'setEnabled',
                enabled: enabled
            });
        }
    });
}

// Save settings
function saveSettings() {
    const apiKey = document.getElementById('api-key').value;
    const model = document.getElementById('model-selection').value;

    // Basic validation for API key
    if (!apiKey || apiKey.trim() === '') {
        showApiKeyError(true);
        return;
    } else {
        showApiKeyError(false);
    }

    // Save to storage
    chrome.storage.sync.set({
        apiKey: apiKey,
        model: model
    }, function () {
        // Show a saved notification
        const saveButton = document.getElementById('save-settings');
        const originalText = saveButton.textContent;
        saveButton.textContent = 'Saved!';
        saveButton.disabled = true;

        setTimeout(function () {
            saveButton.textContent = originalText;
            saveButton.disabled = false;
        }, 1500);

        // Tell background script to update settings
        chrome.runtime.sendMessage({
            action: 'updateSettings',
            apiKey: apiKey,
            model: model
        });
    });
}

// Show or hide API key error
function showApiKeyError(show) {
    const errorElement = document.getElementById('api-key-error');
    errorElement.style.display = show ? 'block' : 'none';
}

// Update stats display
function updateStats() {
    chrome.storage.local.get(null, function (items) {
        // Count citation cache entries
        let citeCount = 0;

        for (const key in items) {
            if (key.startsWith('cite_')) {
                citeCount++;
            }
        }

        // Update UI
        document.getElementById('cache-size').textContent = citeCount;

        // Get processed count from storage
        chrome.storage.sync.get({ citationsProcessed: 0 }, function (data) {
            document.getElementById('citations-count').textContent = data.citationsProcessed;
        });
    });
}

// Check if extension is active on current page
function checkCurrentPageStatus() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0]) {
            // Ask content script for status
            chrome.tabs.sendMessage(tabs[0].id, { action: 'getStatus' }, function (response) {
                // If we got a response, update UI accordingly
                if (response && typeof response.active !== 'undefined') {
                    updateStatusDisplay(response.active);
                } else {
                    // No response means content script isn't running on this page
                    updateStatusDisplay(false, true);
                }
            });
        }
    });
}

// Update status display
function updateStatusDisplay(isActive, notApplicable = false) {
    const statusElement = document.getElementById('status');

    statusElement.classList.remove('active', 'inactive');

    if (notApplicable) {
        statusElement.textContent = 'CiteContext is not applicable on this page';
        statusElement.classList.add('inactive');
    } else if (isActive) {
        statusElement.textContent = 'CiteContext is active on this page';
        statusElement.classList.add('active');
    } else {
        statusElement.textContent = 'CiteContext is disabled on this page';
        statusElement.classList.add('inactive');
    }
} 