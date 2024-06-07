import * as api from './api.js';
import { initializeHighlighterCursor } from './highlighterCursor/index.js';
import { initializeHoverTools } from './hoverTools/index.js';

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

var queue = [];

// If the DOM changes, this may affect text -> try again to highlight.
//
// Some Single-page applications change text without reloading or changing the URL.
// We should support this as well.
function detectChanges() {
    // DOM changes may occur a lot, so throttle to every 3s.
    setInterval(() => {
        if(queue.length > 0) {
            window.highlighterAPI.highlights.loadAll();
            queue = [];
        }
    }, 3000);

    // Start observing the whole DOM for changes and add to queue for the thread to process.
    const observer = new MutationObserver(() => {
        queue.push(Date.now());
    });
    observer.observe(document.body, { attributes: false, childList: true, subtree: true});
}

export { initialize };
