function domain(string){
    var matches = string.match(/^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i);
    return matches && matches[1];
}

function cookieValue(cookie){
    return cookie.name+"="+cookie.value
}

function getCookiesFor(cookieList, domainName){
    return cookieList.filter(function(d){return d.domain == domainName}).map(cookieValue).join("; ");
}

function duplicate(d){
    if (typeof d == "object"){
        if (d.concat){
            return d.map(function(i){return duplicate(i)});
        } else {
            var obj = {}
            Object.keys(d).map(function(k){
                obj[k] =  duplicate(d[k])
            })
            return obj;
        }
    } else {
        return d;
    }
}

chrome.browserAction.onClicked.addListener(function(tab) {
    var cookies ;
    /*chrome.cookies.getAll({},function(browserCookies){
        var personalCookies = duplicate(browserCookies);
        chrome.webRequest.onBeforeSendHeaders.addListener(
            function(details) {
                for (var i = 0; i < details.requestHeaders.length; ++i) {
                    if (details.requestHeaders[i].name == "Cookie"){
                        var old = details.requestHeaders[i].value
                        details.requestHeaders[i].value = getCookiesFor(personalCookies, domain(details.url));
                        console.log ("Cookie Changed",old, details.requestHeaders[i].value);
                        break;
                    }
                }
                return {requestHeaders: details.requestHeaders};
            },
            {urls: ["<all_urls>"], tabId:tab.id},
            ["blocking", "requestHeaders"]
        );
        chrome.webRequest.onHeadersReceived.addListener(
            function(details) {
                for (var i = 0; i < details.responseHeaders.length; ++i) {
                    //console.log(details.responseHeaders[i]);
                }
            },
            {urls: ["<all_urls>"], tabId:tab.id},
            ["blocking","responseHeaders"]
        );
    })*/
    
    chrome.tabs.onUpdated.addListener(function callback(tabID,changeInfo){
        console.log(tabID, manager.tab, changeInfo)
        if (tabID == manager.tab.id){
            console.log(changeInfo);
        }
    
    })

});
