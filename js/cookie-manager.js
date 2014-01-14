
CookieManager = (function() {
    
    function cookieValue(cookie){
        return cookie.name+"="+cookie.value
    }

    function getCookiesFor(cookieList, domainName){
        return cookieList.filter(function(d){return d.domain == domainName}).map(cookieValue).join("; ");
    }
    
    function domain(string){
        var matches = string.match(/^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i);
        return matches && matches[1];
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
    
    function setCookie(cookie) {
        var url = cookie.secure ? "https://" : "http://";
        url += cookie.domain + cookie.path;


        var newCookie = {
            url: url,
            name: cookie.name,
            value: cookie.value,
            expirationDate: cookie.expirationDate,
            domain: cookie.domain,
            path: cookie.path,
            secure: cookie.secure,
            storeId: cookie.storeId,
            httpOnly: cookie.httpOnly
        };
        
        if (newCookie.domain == "localhost") newCookie.domain = "";
        console.log(newCookie);
        chrome.cookies.set(newCookie);
    };

    function deleteCookie(cookie) {
        var url = cookie.secure ? "https://" : "http://";
        url += cookie.domain + cookie.path;
        chrome.cookies.remove({url: url, name: cookie.name});
    };
    
    function loadCookies(){
        fetchChromeCookies.call(this);
    }

    function CookieManager(tab, domainOnly, restoreOnReload) {
        this.tab = tab;
        this.domainOnly = domainOnly || false;
        this.restoreOnReload = restoreOnReload || false;
        loadCookies.call(this);
    };

    CookieManager.prototype.restoreCookies = function restoreCookies() {
        this.cookies.filter(this.getRequestFilter({url:this.tab.url})).map(setCookie);
    }
    CookieManager.prototype.saveCookies = function saveCookies(cookies){
        this.cookies = duplicate(cookies);
    }
    CookieManager.prototype.watchTab = function watchTab(tab){
        var manager = this;
        
        if (manager.restoreOnReload) {
            chrome.tabs.onUpdated.addListener(function callback(tabID,changeInfo){
                if (tabID == manager.tab.id && changeInfo.status == "loading"){
                    console.log(changeInfo);
                    manager.restoreCookies();
                }
            })
        }
        chrome.webRequest.onBeforeSendHeaders.addListener(
            function(details) {
                if (!manager.matches(details)) return;
                for (var i = 0; i < details.requestHeaders.length; ++i) {
                    if (details.requestHeaders[i].name == "Cookie"){
                        var old = details.requestHeaders[i].value
                        details.requestHeaders[i].value = getCookiesFor(manager.cookies, domain(details.url));
                        console.log ("Cookie Changed");
                        break;
                    }
                }
                return {requestHeaders: details.requestHeaders};
            },
            {urls: ["<all_urls>"], tabId:tab.id},
            ["blocking", "requestHeaders"]
        );
        alert("Now watching the tab.\nCookies will be overridden in the 'Cookie' header. A copy of these cookies will be reloaded on page change.");
    }
    CookieManager.prototype.getRequestFilter = function(details){
        var manager = this;
        if (manager.domainOnly){
            return function filterOnURL(cookie){
                return (cookie.domain == domain(details.url))
            }
        } else {
            return function(){ return true;};
        }
    }
    
    CookieManager.prototype.matches = function(requestDetail){
        return this.getRequestFilter(requestDetail);
    }

    function fetchChromeCookies(){
        var manager = this
        chrome.cookies.getAll({},callback);
        function callback(cookies){
             manager.saveCookies(cookies);
             manager.watchTab(manager.tab);
        }
    }

    function clearCookies(callback) {
        chrome.cookies.getAll({url: this.url}, function(cookies) {
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i];
                deleteCookie(cookie);
            }
            callback && callback();
        });
    }

    return CookieManager;
})();
