import { DEFAULT_COLORS } from '../constants.js';

function getColorOptions() {
    return new Promise((resolve, _reject) => {
        browser.storage.local.get({
            colors: DEFAULT_COLORS, // Default value
        }, ({ colors }) => resolve(colors));
    });
}

export default getColorOptions;
