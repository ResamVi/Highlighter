async function getCurrentTab() {
    const queryOptions = { active: true, lastFocusedWindow: true };
    const [tab] = await browser.tabs.query(queryOptions);
    return tab;
}

async function executeInCurrentTab(opts) {
    const tab = await getCurrentTab();
    return executeInTab(tab.id, opts);
}

async function executeInTab(tabId, { file, func, args }) {
    const executions = await browser.scripting.executeScript({
        target: { tabId, allFrames: true },
        ...(file && { files: [file] }),
        func,
        args,
    }).catch((error) => {
        // If the user skipped granting the necessary permissions we'll ask again.
        //
        // The error is triggered on pages like "New Tab" and "firefox.com" where we will never
        // have permissions. That's why we query and check for permissions to figure out if
        // they are actually missing
        if(error.message == "Missing host permission for the tab or frames") {
            browser.permissions.contains({ origins: ["<all_urls>"] }).then((enabled) => {
                if (!enabled) {
                    browser.tabs.create({ url: "src/permissions/permissions.html" });
                }
            });
        }
    });

    if (executions.length == 1) {
        return executions[0].result;
    }

    // If there are many frames, concatenate the results
    return executions.flatMap((execution) => execution.result);
}

function wrapResponse(promise, sendResponse) {
    promise.then((response) => sendResponse({
        success: true,
        response,
    })).catch((error) => sendResponse({
        success: false,
        error: error.message,
    }));
}

export { executeInCurrentTab, executeInTab, wrapResponse };
