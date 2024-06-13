import getColorOptions from './getColorOptions.js';

async function editColor(colorTitle, color, textColor) {
    const colorOptions = await getColorOptions();
    const colorOption = colorOptions.find((option) => option.title === colorTitle);
    colorOption.color = color;
    colorOption.textColor = textColor;

    if (!textColor) {
        delete colorOption.textColor;
    }

    browser.storage.local.set({ colors: colorOptions });
}

export default editColor;
