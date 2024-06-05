function changeColor(colorTitle, textColor = '#000000') {
    if (!colorTitle) return;

    browser.storage.sync.set({ color: colorTitle });

    // Also update the context menu
    browser.contextMenus.update(colorTitle, { checked: true });
}

export default changeColor;
