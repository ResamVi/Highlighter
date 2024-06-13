function changeColor(colorTitle) {
    if (!colorTitle) return;

    browser.storage.local.set({ color: colorTitle });

    // Also update the context menu
    browser.contextMenus.update(colorTitle, { checked: true });
}

export default changeColor;
