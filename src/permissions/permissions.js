window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('upgrade').addEventListener('click', () => {
        function callback(granted) {
            if (granted) {
                window.close();
            }
        }
        browser.permissions.request({ origins: ['<all_urls>']}, callback);
    });
});

