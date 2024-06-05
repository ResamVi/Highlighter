import * as api from './api.js';
import { initializeHighlighterCursor } from './highlighterCursor/index.js';
import { initializeHoverTools } from './hoverTools/index.js';

const UPDATE_INTERVAL = 3 * 1000; // 3 seconds

// Don't react to all changes by taking a 3 second break from the last reaction.
let last = Date.now();

function initialize() {
    initializeHoverTools();
    initializeHighlighterCursor();
    exposeAPI();
    detectChanges();
}

// Expose globals needed for scripts injected from the background service worker
function exposeAPI() {
    window.highlighterAPI = api;
}


// If the HTML has DOM changes that may change the text, try again to highlight.
//
// Some Single-page applications change text without the reloading/URL changing.
// We should support this as well.
function detectChanges() {
    const observer = new MutationObserver(() => {
        if(Date.now() - last >= UPDATE_INTERVAL) {
            window.highlighterAPI.highlights.loadAll();
            last = Date.now();
        }
    });

    // Start observing the target node for configured mutations
    observer.observe(document.body, { attributes: false, childList: true, subtree: true});
}

export { initialize };
