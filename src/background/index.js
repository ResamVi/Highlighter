import {
    changeColor,
    editColor,
    getColorOptions,
    getCurrentColor,
    getHighlights,
    getLostHighlights,
    highlightText,
    loadPageHighlights,
    removeHighlight,
    removeHighlights,
    showHighlight,
    toggleHighlighterCursor,
} from './actions/index.js';
import { wrapResponse } from './utils.js';


function initialize() {
    initializeKey();
    initializeContextMenus();
    initializeContextMenuEventListeners();
    initializeTabEventListeners();
    initializeKeyboardShortcutEventListeners();
    initializeMessageEventListeners();
}

const CRYPTO_ALGORITHM = 'AES-GCM';

async function generateKey() {
    return await crypto.subtle.generateKey({ name: CRYPTO_ALGORITHM, length: 128 }, false, ['encrypt', 'decrypt']);
}

async function encrypt(key, message) {
    // Reuse IV because there is no damage in knowing that two ciphertexts came from the same plaintext.
    const buffer = await crypto.subtle.encrypt(
        { name: CRYPTO_ALGORITHM, iv: new Uint8Array(12) },
        key,
        new TextEncoder().encode(message),
    );

    return buffer;
}

async function decrypt(key, message) {
    // Reuse IV because there is no damage in knowing that two ciphertexts came from the same plaintext.
    const buffer = await crypto.subtle.decrypt(
        { name: CRYPTO_ALGORITHM, iv: new Uint8Array(12) },
        key,
        message,
    );

    return new TextDecoder().decode(buffer);
}

function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

function base64ToArrayBuffer(base64) {
    var binaryString = atob(base64);
    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function initializeKey() {
    browser.storage.local.get(["uuid", "key"]).then(async (items) => {
        if(items.uuid === undefined) {
            browser.storage.local.set({ uuid: crypto.randomUUID() });
        }

        if(items.key === undefined) {
            const key = await generateKey();
            browser.storage.local.set({ key: key });

            const ciphertext = await encrypt(key, "Hello World");

            const hin = _arrayBufferToBase64(ciphertext);
            const zurueck = base64ToArrayBuffer(hin);

            const plaintext = await decrypt(key, zurueck);

            console.log(plaintext);
        }
    });

        // browser.storage.local.get(["uuid","key"]).then(async (items) => {
        //     console.log("trying encryption");
        //     console.log(items);
        //     console.log(items.uuid);
        //     console.log(items.key);
        //
        // });

    // setTimeout(() => {
    // }, 1000);
}


function initializeContextMenus() {
    browser.runtime.onInstalled.addListener(async () => {
        // remove existing menu items
        browser.contextMenus.removeAll();

        // Add option when right-clicking
        browser.contextMenus.create({ title: 'Highlight', id: 'highlight', contexts: ['selection'] });
        browser.contextMenus.create({ title: 'Toggle Cursor', id: 'toggle-cursor' });
        browser.contextMenus.create({ title: 'Highlighter color', id: 'highlight-colors' });
        browser.contextMenus.create({ title: 'Yellow', id: 'yellow', parentId: 'highlight-colors', type: 'radio' });
        browser.contextMenus.create({ title: 'Blue', id: 'blue', parentId: 'highlight-colors', type: 'radio' });
        browser.contextMenus.create({ title: 'Green', id: 'green', parentId: 'highlight-colors', type: 'radio' });
        browser.contextMenus.create({ title: 'Pink', id: 'pink', parentId: 'highlight-colors', type: 'radio' });
        browser.contextMenus.create({ title: "Dark", id: "dark", parentId: "highlight-colors", type: "radio" });

        // Get the initial selected color value
        const { title: colorTitle } = await getCurrentColor();
        browser.contextMenus.update(colorTitle, { checked: true });
    });
}

function initializeContextMenuEventListeners() {
    browser.contextMenus.onClicked.addListener(({ menuItemId, parentMenuItemId }) => {
        if (parentMenuItemId === 'highlight-color') {
            changeColor(menuItemId);
            return;
        }

        switch (menuItemId) {
            case 'highlight':
                highlightText();
                break;
            case 'toggle-cursor':
                toggleHighlighterCursor();
                break;
        }
    });
}

function initializeTabEventListeners() {
    // If the URL changes, try again to highlight
    // This is done to support javascript Single-page applications
    // which often change the URL without reloading the page
    browser.tabs.onUpdated.addListener((tabId, changeInfo, _tab) => {
        if (changeInfo.status == "complete") {
            loadPageHighlights(tabId);
        }
    });
}

function initializeKeyboardShortcutEventListeners() {
    // Add Keyboard shortcuts
    browser.commands.onCommand.addListener((command) => {
        switch (command) {
            case 'execute-highlight':
                highlightText();
                break;
            case 'toggle-highlighter-cursor':
                toggleHighlighterCursor();
                break;
            case 'change-color-to-yellow':
                changeColor('yellow');
                break;
            case 'change-color-to-cyan':
                changeColor('cyan');
                break;
            case 'change-color-to-lime':
                changeColor('lime');
                break;
            case 'change-color-to-magenta':
                changeColor('magenta');
                break;
            case 'change-color-to-dark':
                changeColor('dark');
                break;
        }
    });
}

function initializeMessageEventListeners() {
    // Listen to messages from content scripts
    /* eslint-disable consistent-return */
    browser.runtime.onMessage.addListener((request, _sender, sendResponse) => {
        if (!request.action) return;

        switch (request.action) {
            case 'highlight':
                highlightText();
                return;
            case 'track-event':
                return;
            case 'remove-highlights':
                removeHighlights();
                return;
            case 'remove-highlight':
                removeHighlight(request.highlightId);
                return;
            case 'change-color':
                changeColor(request.color);
                return;
            case 'edit-color':
                editColor(request.colorTitle, request.color, request.textColor);
                return;
            case 'toggle-highlighter-cursor':
                toggleHighlighterCursor();
                return;
            case 'get-highlights':
                wrapResponse(getHighlights(), sendResponse);
                return true; // return asynchronously
            case 'get-lost-highlights':
                wrapResponse(getLostHighlights(), sendResponse);
                return true; // return asynchronously
            case 'show-highlight':
                return showHighlight(request.highlightId);
            case 'get-current-color':
                wrapResponse(getCurrentColor(), sendResponse);
                return true; // return asynchronously
            case 'get-color-options':
                wrapResponse(getColorOptions(), sendResponse);
                return true; // return asynchronously
        }
    });
    /* eslint-enable consistent-return */
}

export { initialize };
