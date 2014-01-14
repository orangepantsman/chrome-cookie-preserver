chrome.browserAction.onClicked.addListener(function(tab) {
    new CookieManager(tab, true, true);
})
