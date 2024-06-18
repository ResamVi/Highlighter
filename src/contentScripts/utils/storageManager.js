import { addHighlightError } from './errorManager.js';

import { SERVER_URL } from '../highlight/highlight/constants.js';
import { highlight } from '../highlight/index.js';


const STORE_FORMAT_VERSION = browser.runtime.getManifest().version;

// TODO: Still needed?
const alternativeUrlIndexOffset = 0; // Number of elements stored in the alternativeUrl Key. Used to map highlight indices to correct key

async function store(selection, container, url, href, color, textColor) {
    console.log("store: get");
    const { highlights } = await browser.storage.local.get({ highlights: {} });

    const { uuid } = await browser.storage.sync.get("uuid");
    // const response = await fetch(`${SERVER_URL}/${uuid}`);
    // const highlights = await response.json();

    if (!highlights[url]) highlights[url] = [];

    const count = highlights[url].push({
        version: STORE_FORMAT_VERSION,
        string: selection.toString(),
        container: getQuery(container),
        anchorNode: getQuery(selection.anchorNode),
        anchorOffset: selection.anchorOffset,
        focusNode: getQuery(selection.focusNode),
        focusOffset: selection.focusOffset,
        color,
        textColor,
        href,
        uuid: crypto.randomUUID(),
        createdAt: Date.now(),
    });

    // browser.storage.local.set({ highlights });

    await fetch(`${SERVER_URL}/${uuid}`, {
        method: "POST",
        body: JSON.stringify(highlights),
        headers: {
            "Content-Type": "application/json",
        },
    });

    // Return the index of the new highlight:
    return count - 1 + alternativeUrlIndexOffset;
}

async function update(highlightIndex, url, alternativeUrl, newColor, newTextColor) {
    console.log("update: get");
    const { highlights } = await browser.storage.local.get({ highlights: {} });

    const { uuid } = await browser.storage.sync.get("uuid");
    // const response = await fetch(`${SERVER_URL}/${uuid}`);
    // const highlights = await response.json();

    let urlToUse = url;
    let indexToUse = highlightIndex - alternativeUrlIndexOffset;
    if (highlightIndex < alternativeUrlIndexOffset) {
        urlToUse = alternativeUrl;
        indexToUse = highlightIndex;
    }

    const highlightsInKey = highlights[urlToUse];
    if (highlightsInKey) {
        const highlightObject = highlightsInKey[indexToUse];
        if (highlightObject) {
            highlightObject.color = newColor;
            highlightObject.textColor = newTextColor;
            highlightObject.updatedAt = Date.now();
            // browser.storage.local.set({ highlights });

            await fetch(`${SERVER_URL}/${uuid}`, {
                method: "POST",
                body: JSON.stringify(highlights),
                headers: {
                    "Content-Type": "application/json",
                },
            });
        }
    }
}

async function getAll(url) {
    console.log("getAll: get");
    const result = await browser.storage.local.get({ highlights: {} });

    // const { uuid } = await browser.storage.sync.get("uuid");
    // const response = await fetch(`${SERVER_URL}/${uuid}`);
    // const result = await response.json();

    const highlights = result[url];

    if (!highlights) return;

    for (let i = 0; i < highlights.length; i++) {
        load(highlights[i], i);
    }
}

// noErrorTracking is optional
function load(highlightVal, highlightIndex, noErrorTracking) {
    const selection = {
        anchorNode: elementFromQuery(highlightVal.anchorNode),
        anchorOffset: highlightVal.anchorOffset,
        focusNode: elementFromQuery(highlightVal.focusNode),
        focusOffset: highlightVal.focusOffset,
    };

    const { color, string: selectionString, textColor, version } = highlightVal;
    const container = elementFromQuery(highlightVal.container);

    if (!selection.anchorNode || !selection.focusNode || !container) {
        if (!noErrorTracking) {
            addHighlightError(highlightVal, highlightIndex);
        }
        return false;
    }

    const success = highlight(selectionString, container, selection, color, textColor, highlightIndex, version);

    if (!noErrorTracking && !success) {
        addHighlightError(highlightVal, highlightIndex);
    }
    return success;
}

async function removeHighlight(highlightIndex, url, alternativeUrl) {
    console.log("removeHighlight: get");
    const { highlights } = await browser.storage.local.get({ highlights: {} });

    const { uuid } = await browser.storage.sync.get("uuid");
    // const response = await fetch(`${SERVER_URL}/${uuid}`);
    // const highlights = await response.json();

    if (highlightIndex < alternativeUrlIndexOffset) {
        highlights[alternativeUrl].splice(highlightIndex, 1);
    } else {
        highlights[url].splice(highlightIndex - alternativeUrlIndexOffset, 1);
    }

    // browser.storage.local.set({ highlights });

    await fetch(`${SERVER_URL}/${uuid}`, {
        method: "POST",
        body: JSON.stringify(highlights),
        headers: {
            "Content-Type": "application/json",
        },
    });
}

// alternativeUrl is optional
async function clearPage(url, alternativeUrl) {
    // const { highlights } = await browser.storage.local.get({ highlights: {} });

    const { uuid } = await browser.storage.sync.get("uuid");
    const response = await fetch(`${SERVER_URL}/${uuid}`);
    const highlights = await response.json();

    delete highlights[url];
    if (alternativeUrl) {
        // See 'loadAll()' for an explaination of why this is necessary
        delete highlights[alternativeUrl];
    }

    // browser.storage.local.set({ highlights });

    await fetch(`${SERVER_URL}/${uuid}`, {
        method: "POST",
        body: JSON.stringify(highlights),
        headers: {
            "Content-Type": "application/json",
        },
    });

}

function elementFromQuery(storedQuery) {
    const re = />textNode:nth-of-type\(([0-9]+)\)$/ui;
    const result = re.exec(storedQuery);

    if (result) { // For text nodes, nth-of-type needs to be handled differently (not a valid CSS selector)
        const textNodeIndex = parseInt(result[1], 10);
        storedQuery = storedQuery.replace(re, "");
        const parent = robustQuerySelector(storedQuery);

        if (!parent) return undefined;

        return parent.childNodes[textNodeIndex];
    }

    return robustQuerySelector(storedQuery);
}

function robustQuerySelector(query) {
    try {
        return document.querySelector(query);
    } catch (error) {
        // It is possible that this query fails because of an invalid CSS selector that actually exists in the DOM.
        // This was happening for example here: https://lawphil.net/judjuris/juri2013/sep2013/gr_179987_2013.html
        // where there is a tag <p"> that is invalid in HTML5 but was still rendered by the browser
        // In this case, manually find the element:
        let element = document;
        for (const queryPart of query.split(">")) {
            if (!element) return null;

            const re = /^(.*):nth-of-type\(([0-9]+)\)$/ui;
            const result = re.exec(queryPart);
            const [, tagName, index] = result || [undefined, queryPart, 1];
            element = Array.from(element.childNodes).filter((child) => child.localName === tagName)[index - 1];
        }
        return element;
    }
}

// From an DOM element, get a query to that DOM element
function getQuery(element) {
    if (element.id) return `#${escapeCSSString(element.id)}`;
    if (element.localName === 'html') return 'html';

    const parent = element.parentNode;

    const parentSelector = getQuery(parent);
    // The element is a text node
    if (!element.localName) {
        // Find the index of the text node:
        const index = Array.prototype.indexOf.call(parent.childNodes, element);
        return `${parentSelector}>textNode:nth-of-type(${index})`;
    } else {
        const index = Array.from(parent.childNodes).filter((child) => child.localName === element.localName).indexOf(element) + 1;
        return `${parentSelector}>${element.localName}:nth-of-type(${index})`;
    }
}

// Colons and spaces are accepted in IDs in HTML but not in CSS syntax
// Similar (but much more simplified) to the CSS.escape() working draft
function escapeCSSString(cssString) {
    return cssString.replace(/(:)/ug, "\\$1");
}

export {
    store,
    update,
    getAll,
    load,
    removeHighlight,
    clearPage,
};
