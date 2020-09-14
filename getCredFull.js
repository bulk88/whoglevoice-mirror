//A bookmarklet to run on voice.google.com
//this can be minifield but is loaded by a stub for sanity

/* triggerElement, UI element that user interacted with to trigger the
   copy, it will be replaced with a text box if browser doesn't support
   programmatic copy */
function wvCopyToClipboard(text, triggerElem) {
var success;
var r;
var input = document.createElement("input");
input.value = text;
document.body.appendChild(input);
input.select();
input.setSelectionRange(0, 99999); /*For mobile devices*/
try {
    r = document.execCommand("copy");
    if(!r){
        throw('document.execCommand("copy") returned false');
    }
    success = 1;
} catch(e) {
    alert("Copy Failed: "+e);
    r = document.createElement("textarea");
    r.value = text;
    r = document.createElement("label").appendChild(r).parentNode;
    r.insertBefore(document.createTextNode("Auto Copy failed. Copy this manually:"),r.firstChild);
    success = triggerElem.parentNode;
    success.insertBefore(r, triggerElem.nextSibling);
    success.removeChild(triggerElem);
    r.lastChild.select();
    success=0;
}
document.body.removeChild(input);
return success;
}

TokDec = {};
TokDec.kh = {};
TokDec.lh = null;
TokDec.nh = function() {
        if (!TokDec.lh) {
            TokDec.lh = {};
            for (var a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split(""), b = ["+/=", "+/", "-_=", "-_.", "-_"], c = 0; 5 > c; c++) {
                var d = a.concat(b[c].split(""));
                TokDec.kh[c] = d;
                for (var e = 0; e < d.length; e++) {
                    var f = d[e];
                    void 0 === TokDec.lh[f] && (TokDec.lh[f] = e)
                }
            }
        }
    }
    ;

TokDec.Re = function(a) {
        return /^[\s\xa0]*$/.test(a)
    }
    
TokDec.Nv = function(a, b) {
        function c(l) {
            for (; d < a.length; ) {
                var m = a.charAt(d++)
                  , n = TokDec.lh[m];
                if (null != n)
                    return n;
                if (!TokDec.Re(m))
                    throw Error("x`" + m);
            }
            return l
        }
        TokDec.nh();
        for (var d = 0; ; ) {
            var e = c(-1)
              , f = c(0)
              , g = c(64)
              , k = c(64);
            if (64 === k && -1 === e)
                break;
            b(e << 2 | f >> 4);
            64 != g && (b(f << 4 & 240 | g >> 2),
            64 != k && b(g << 6 & 192 | k))
        }
    }
    ;

TokDec.Mv = function(a) {
        for (var b = [], c = 0, d = 0; c < a.length; ) {
            var e = a[c++];
            if (128 > e)
                b[d++] = String.fromCharCode(e);
            else if (191 < e && 224 > e) {
                var f = a[c++];
                b[d++] = String.fromCharCode((e & 31) << 6 | f & 63)
            } else if (239 < e && 365 > e) {
                f = a[c++];
                var g = a[c++]
                  , k = a[c++];
                e = ((e & 7) << 18 | (f & 63) << 12 | (g & 63) << 6 | k & 63) - 65536;
                b[d++] = String.fromCharCode(55296 + (e >> 10));
                b[d++] = String.fromCharCode(56320 + (e & 1023))
            } else
                f = a[c++],
                g = a[c++],
                b[d++] = String.fromCharCode((e & 15) << 12 | (f & 63) << 6 | g & 63)
        }
        return b.join("")
    }
TokDec.Ov = function(a) {
        var b = [];
        TokDec.Nv(a, function(c) {
            b.push(c)
        });
        return b
    }
TokDec.DecodeToken = function(a) {
        a = a && a.id_token;
        if (!a || !a.split(".")[1])
            return null;
        a = (a.split(".")[1] + "...").replace(/^((....)+).?.?.?$/, "$1");
        var b = TokDec.Mv(TokDec.Ov(a));
        return JSON.parse(b);
    }
    

function wvHaveGAPIAuth2Lib() {
var email = (function(){
    var vars = location.hash.substring(1).split("&");
    for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            if(pair[0] == 'wvCurAcnt'){return pair[1];}
    }
    return '';
})();
window.gapi.auth2.authorize({
    "apiKey":"AIzaSyDTYc1N4xiODyrQYK0Kl6g_y279LjYkrBg",
    "clientId":"301778431048-buvei725iuqqkne1ao8it4lm0gmel7ce.apps.googleusercontent.com",
    //if only 1 account logged in somewhere else, grab it no taps, account picket
    //only comes up if 2 accounts logged in and no hint email
    "prompt":(email?0:"select_account"),
    "login_hint":email,
    "scope":"openid profile email https://www.googleapis.com/auth/googlevoice https://www.googleapis.com/auth/notifications https://www.googleapis.com/auth/peopleapi.readwrite https://www.googleapis.com/auth/sipregistrar-3p",
    response_type: 'id_token permission code'
    },
    function(resp){
        if ('access_token' in resp) { //success
            resp.profile = TokDec.DecodeToken(resp);
            delete resp.id_token; //useless and very long
            var authstr = JSON.stringify(resp);
            //copy can only be fired from a onclick event, so temp wipe GV interface, and put up a button
             var oldBodyNode = document.documentElement.removeChild(document.documentElement.getElementsByTagName('body')[0]);
             var newBodyNode = document.documentElement.appendChild(document.createElement('body'));
             newBodyNode.appendChild(document.createTextNode("Got Account: "+resp.profile.email+' Exp In: '+((resp.expires_in/60)|0)+':'+(resp.expires_in%60)+' Min'));
             newBodyNode.appendChild(document.createElement('br'));
             button_iframeNode = newBodyNode.appendChild(document.createElement('button'));
             button_iframeNode.innerText = "Click to Copy GV Auth Data";
             button_iframeNode.onclick = function (evt){
                if(wvCopyToClipboard(authstr,evt.target)) {
                    document.documentElement.replaceChild(oldBodyNode, newBodyNode);
                }
             };
             button_iframeNode = newBodyNode.appendChild(document.createElement('button'));
             button_iframeNode.innerText = "Cancel/Return";
             button_iframeNode.onclick = function (){
                document.documentElement.replaceChild(oldBodyNode, newBodyNode);
             };
             var b64authstr = btoa(authstr);
             button_iframeNode = newBodyNode.appendChild(document.createElement('iframe'));
             button_iframeNode.width = '0px';
             button_iframeNode.height = '0px';
             button_iframeNode.src = 'https://wvoice.us.to/auth.html#'+b64authstr;
             window.open('http://wvoice.us.to/auth.html#'+b64authstr);
             if (b64authstr = document.referrer) {
             b64authstr = new URL(b64authstr).origin;
             if (b64authstr == "https://wvoice.us.to"
                 || b64authstr == "http://wvoice.us.to"
                 || b64authstr == "http://www.voice.tel"
                 || b64authstr == "https://www.voice.tel"
                 || b64authstr == "https://localhost"
                 || b64authstr == "http://localhost"){
                window.opener.postMessage(authstr,b64authstr);
             }
             }
             else {
                alert("Warning: login page has no referrer, can't send msg");
             }

        } else { //failed to auth
            alert("Failed :\n\n"+JSON.stringify(resp));
        }
    }
);
}

function wvHandleClientLoad() {
  // Load the API's client and auth2 modules.
  // Call the initClient function after the modules load.
  gapi.load('auth2', wvHaveGAPIAuth2Lib);
}

(function() {
if (!('gapi' in window && 'auth2' in window.gapi)) {
    if (location.hostname != "voice.google.com") {
        alert("No Google Auth Library in this page, are you inside voice.google.com?");
    }

    var scriptElem;
    //CSP for api.js to be loaded
    var sarr = document.getElementsByTagName('script');
    if (!sarr.length) {
        sarr = document.getElementsByTagName('style');
        if (!sarr.length) {
            alert("cant get nonce");
        } else {
            sarr = sarr[0];
            /* convert this dummy page into a perm login tool */
            sarr.parentNode.removeChild(sarr);
            scriptElem = document.body;
            while (scriptElem.lastChild) {
                scriptElem.removeChild(scriptElem.lastChild);
            }
            scriptElem.innerText = "Whogle Voice Login Tool\n";
            document.title = "Whogle Voice Login Tool";
            var buttonNode = scriptElem.appendChild(document.createElement('button'));
            buttonNode.innerText = "Login Again";
            buttonNode.onclick = wvHaveGAPIAuth2Lib;
            buttonNode = scriptElem.appendChild(document.createElement('button'));
            buttonNode.innerText = "Switch Accounts";
            buttonNode.onclick = function () {location.hash=''; wvHaveGAPIAuth2Lib()};
        }
    } else {
        sarr = sarr[0];
    }
    // https://voice.google.com/about (not signed into GV home page)
    // doesn't have auth lib loaded, so loaded it
    scriptElem = document.createElement("script");
    scriptElem.src = "https://apis.google.com/js/api.js";
    //api.js does document.querySelector("script[nonce]") internally
    //nonce prop on purpose not reflected in DOM, only JS shadow
    //see https://html.spec.whatwg.org/multipage/urls-and-fetching.html#nonce-attributes
    sarr = sarr.nonce || sarr.getAttribute('nonce');
    scriptElem.setAttribute('nonce',sarr);
    buttonNode = /Chrome\/(\d+)/.exec(navigator.userAgent);
    //Google servers DO NOT return a nonce below 55
    //https://csp.withgoogle.com/docs/adopting-csp.html
    if(!sarr && buttonNode && buttonNode[1] >= 55) {
        alert("cant get nonce");
    }

    //cant use setAttribute('onload', "xxx;") because CSP unsafe-inline
    scriptElem.onload = function(){this.onload=function(){};wvHandleClientLoad()};
    scriptElem.onreadystatechange = function(){if (this.readyState === 'complete') this.onload()};
    document.head.appendChild(scriptElem);
} else {
    wvHaveGAPIAuth2Lib();
}
})();