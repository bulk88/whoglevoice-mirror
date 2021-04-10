/* triggerElement, UI element that user interacted with to trigger the
   copy, it will be replaced with a text box if browser doesn't support
   programmatic copy */
function wvCopyToClipboard(text, triggerElem, restoreOnBlurCB) {
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
    r = 1;
} catch(e) {
    r = document.createElement("textarea");
    r.value = text;
    if (restoreOnBlurCB) {
        r.onblur = function(e) {
            var lbl = e.target.parentNode;
            lbl.parentNode.replaceChild(triggerElem, lbl);
            restoreOnBlurCB();
        };
    } else {
        //alert triggers an ASYNC non-blocking blur event on the Textarea node
        //when alert dialog drops, so dont show the alert box if monitoring blur
        alert("Copy Failed: "+e);
    }
    r = document.createElement("label").appendChild(r).parentNode;
    r.insertBefore(document.createTextNode("Auto Copy failed. Copy this manually:"),r.firstChild);
    triggerElem.parentNode.replaceChild(r, triggerElem);
    r = r.lastChild;
    r.select();
    r.setSelectionRange(0, 99999); /*For mobile devices*/
    r= 0;
}
document.body.removeChild(input);
return r;
}

function wvWipeAuthToken (logout) {
    localStorage.setItem('wvCurAcnt',logout ? '' :lazySignedInEmail());
    localStorage.setItem('wvLastExpires', lazySignedInExpires());
    localStorage.removeItem('gvauthobj');
    localStorage.removeItem('wvThdList');
}

function drawLoginBar()
{
    var divLoginBar = document.getElementById('sign-in-bar');
//if IPL getConvoUI throws up login prompt, there is temporarily no login bar
//bc html body swap, but answering the login prompt draws login bar again anyways
//so this return is safe
    if(!divLoginBar) return;
    //wipe div contents first
    //https://jsperf.com/innerhtml-vs-removechild/15
    while (divLoginBar.lastChild) {
        divLoginBar.removeChild(divLoginBar.lastChild);
    }
    var buttonNode = divLoginBar.appendChild(document.createElement('a'));
    if (window.location.protocol == 'http:') {
        buttonNode.textContent = ' ̵S̵ '
        buttonNode.style.backgroundColor = 'red';
        buttonNode.onclick = function () {
        // no ;, see https://bugzilla.mozilla.org/show_bug.cgi?id=726779
            window.location.protocol = 'https'
        };
    } else {
        buttonNode.textContent = 'S'
        buttonNode.style.backgroundColor = 'lime';
        buttonNode.onclick = function () {
            window.location.protocol = 'http'
        };
    }
    var email_label = lazySignedInEmail();
    buttonNode = document.createElement('button');
    if (email_label.length) {
        email_label = "Signed in: "+email_label;
        buttonNode.textContent = "Logout";
        buttonNode.onclick = function (){
            wvWipeAuthToken(1)
            drawLoginBar()
        };
    } else {
        email_label = "Logged out";
        buttonNode.textContent = "Login";
        buttonNode.onclick = function (){
            //func from html page or undef
            getAuthToken(refreshNoUI);
        };
    }
    divLoginBar.appendChild(document.createTextNode(email_label));
    divLoginBar.appendChild(buttonNode);
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

function lazySignedInEmail() {
    var GVAuthObj= localStorage.getItem('gvauthobj');
    if (GVAuthObj) {
        try {
            GVAuthObj = JSON.parse(GVAuthObj);
            if(! ('access_token' in GVAuthObj)) {
                GVAuthObj = undefined;
            }
        } catch (e) {
            GVAuthObj = undefined;
        }
    }
    if(GVAuthObj) return GVAuthObj.profile.email;
    else return '';
}


function lazySignedInUserIndex() {
    var GVAuthObj= localStorage.getItem('gvauthobj');
    if (GVAuthObj) {
        try {
            GVAuthObj = JSON.parse(GVAuthObj);
            if(! ('access_token' in GVAuthObj)) {
                GVAuthObj = undefined;
            }
        } catch (e) {
            GVAuthObj = undefined;
        }
    }
    if(GVAuthObj) return GVAuthObj.session_state.extraQueryParams.authuser;
    else throw "Not logged in.";
}

function lazySignedInExpires() {
    var GVAuthObj= localStorage.getItem('gvauthobj');
    if (GVAuthObj) {
        try {
            GVAuthObj = JSON.parse(GVAuthObj);
            if(! ('access_token' in GVAuthObj)) {
                GVAuthObj = undefined;
            }
        } catch (e) {
            GVAuthObj = undefined;
        }
    }
    if(GVAuthObj) return GVAuthObj.expires_at;
    else return 0;
}

function pickerProfHandler(e) {
    e.preventDefault();
    e = 'https://saproxy.us.to/o/oauth2/auth?response_type=permission%20id_token%20token&scope=openid%20profile%20email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgooglevoice%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fnotifications%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fpeopleapi.readwrite%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fsipregistrar-3p&redirect_uri=storagerelay%3A%2F%2Fhttps%2Fvoice.google.com%3Fid%3D' + ("auth" + Math.floor(1E6 * Math.random() + 1)) + '&client_id=301778431048-buvei725iuqqkne1ao8it4lm0gmel7ce.apps.googleusercontent.com&login_hint=' + encodeURIComponent(e.currentTarget.lastChild.lastChild.textContent);
    //get email addr from div^^^
    console.log(e);
    window.open(e);
}


function wvDrawAccountPicker() {
    var p = document.getElementById('picker');
    var oldPicker = localStorage.getItem('wvAcntPicker');
    if (oldPicker) {
        p.innerHTML = oldPicker;
    }
    var myRequest = new XMLHttpRequest();
    myRequest.responseType = 'document';
    myRequest.onreadystatechange = function() {
        if (4 == myRequest.readyState && (200 == myRequest.status || 403 == myRequest.status)) {
            var d = myRequest.responseXML; //403 responseXML is null
            d = d ? d.getElementsByTagName('div') : [];
            var e;
            for (var i = d.length - 1; e=null,i >= 0; i--) {
                e = d[i];
                if(e = e.childNodes[0]) {
                    if(e.nodeValue && e.nodeValue.match(/Default/)) {
                        i=5;
                        while(i>0){e = e.parentNode;i--}
                        d=e;
                        break;
                    }
                }
            }
            if (e) {
                Array.prototype.forEach.call(d.getElementsByTagName('a'), function(e) {
                    e.href = '';
                    e.setAttribute('onclick', 'pickerProfHandler(event)');
                    e.firstChild.src = e.firstChild.dataset.src;
                });
            } else {
                d = document.createElement('div');
            }
            e = d.outerHTML;
            if (e != oldPicker) {
                while (p.lastChild) {
                    p.removeChild(p.lastChild);
                }
                p.appendChild(d);
                localStorage.setItem('wvAcntPicker', e);
            }
        }
    };
    myRequest.withCredentials = true;
    myRequest.open('GET', 'https://saproxy.us.to/get_sessions', !0);
    myRequest.send();
}

function getAuthToken(callbackFunc) {
    var GVAuthObj = localStorage.getItem('gvauthobj');
    if (GVAuthObj) {
        try {
            GVAuthObj = JSON.parse(GVAuthObj);
            if(! ('access_token' in GVAuthObj)) {
                GVAuthObj = undefined;
            }
        } catch (e) {
            GVAuthObj = undefined;
        }
    }
    if (GVAuthObj) {
        callbackFunc(GVAuthObj.access_token);
    } else { //get token from user page
        var wvDocumentElement = document.documentElement;
        var oldBodyNode = document.body;
        oldBodyNode && wvDocumentElement.removeChild(oldBodyNode);
        var newBodyNode = wvDocumentElement.appendChild(document.createElement('body'));
        var buttonNode = newBodyNode.appendChild(document.createElement('button'));
        buttonNode.textContent = "Copy to Clipboard Bookmarklet to run on GV";
        buttonNode.onclick = function (evt){
        //http!!!! because Android 4.1.2 SSL too old to talk to github pages SSL
           wvCopyToClipboard('javascript:var e=new XMLHttpRequest;e.onreadystatechange=function(){4==e.readyState&&200==e.status&&eval(e.responseText)};e.open("GET","https://wvoice.us.to/getCredFull.js",!0);e.overrideMimeType("application/javascript");e.send();',evt.target);
        };
        newBodyNode.appendChild(document.createElement('br'));
        //monitor the click and close the tab if opened from this window?????
        var GVLinkNode = newBodyNode.appendChild(document.createElement('a'));
        var email = localStorage.getItem('wvCurAcnt');
        //previous dummy link was 'https://voice.google.com/about' which was
        //sort of light weight, but this random GUID link to an invalid pic is
        //an even lighter weight page even though its always 401 or 404
        GVLinkNode.href = 'https://voice.google.com/a/i/4e01281e272a1ccb11ceff9704b131e5-1'+(email?'#wvCurAcnt='+email:'');
        GVLinkNode.target = '_blank';
        /*https://github.com/whatwg/html/issues/4078*/
        GVLinkNode.rel = 'opener';
        GVLinkNode.textContent = "Open Google Voice Site";
        newBodyNode.appendChild(document.createElement('br'));
        var textareaNode_clipboard_clipboard = newBodyNode.appendChild(document.createElement('textarea'));
        textareaNode_clipboard_clipboard.placeholder = "Paste GV Auth Token here";
        var wvMsgEvtCB = function (e) {
            if(e.origin == "https://saproxy.us.to"){
                e = JSON.parse(e.data).params.authResult;
        /*this logic is in client origin GAPI JS framework typ, not over wire */
                e.first_issued_at = (new Date).getTime();
                e.expires_at = e.first_issued_at + 1E3 * e.expires_in;
                e.profile = TokDec.DecodeToken(e);
                delete e.id_token; //useless and very long
                gotAuthPasteCB({type: 'input', target: {value: JSON.stringify(e)}});
            }
            if(e.origin == "https://voice.google.com") {
                gotAuthPasteCB({type: 'input', target: {value: e.data}});
            }
        };
        var gotAuthPasteCB = function (e){
            var pasteStr =  e.type == 'input' ?
                e.target.value /*Android Stock Browser 4.1.2 has no paste event, only input */
                :((e.clipboardData /*newer browsers*/
                || (event && event.clipboardData) /*psuedo IE window.event prop*/
                || window.clipboardData).getData('text'));
            try {
                GVAuthObj = JSON.parse(pasteStr);
                if (!('access_token' in GVAuthObj)) {
                    alert("No GV Auth data found in pasted string:\n\n"+pasteStr);
                    GVAuthObj = undefined;
                }
            } catch (e) {
                alert("No GV Auth data found in pasted string:\n\n"+pasteStr);
                GVAuthObj = undefined;
            }
            //callbackFunc needs its body DOM back
            if (oldBodyNode) {
                document.documentElement.replaceChild(oldBodyNode, newBodyNode)
                if (document.querySelector('#picker')) {
                    //gotAuthPasteCB but with a different scope and finish CB
                    //there are multiple login screens layered, need to wipe all of them
                    //off the screen
                    oldBodyNode.getElementsByTagName('textarea')[0].onpaste(e);
                }
            } else {
                document.documentElement.removeChild(newBodyNode);
            }
            window.onmessage = null;
            if (GVAuthObj) {
                localStorage.setItem('gvauthobj',pasteStr);
                callbackFunc(GVAuthObj.access_token);
            } else {
                callbackFunc("USER_PASTED_UNKNOWN_AUTH_INFO"); //dont make events silently disappear
            }
            drawLoginBar();
         };
         textareaNode_clipboard_clipboard.oninput = gotAuthPasteCB;
         textareaNode_clipboard_clipboard.onpaste = gotAuthPasteCB;
         newBodyNode.appendChild(document.createElement('br'));
         var buttonNode = newBodyNode.appendChild(document.createElement('button'));
         buttonNode.textContent = "Cancel/Return";
         buttonNode.onclick = function (){
            oldBodyNode?wvDocumentElement.replaceChild(oldBodyNode, newBodyNode)
            :wvDocumentElement.removeChild(newBodyNode);
            window.onmessage = null;
            callbackFunc("USER_CLICKED_CANCEL"); //dont make events silently disappear
            drawLoginBar();
         };
         var buttonNode = newBodyNode.appendChild(document.createElement('button'));
         buttonNode.textContent = "Auth Proxy";
         buttonNode.onclick = function (){
            var u = '/o/oauth2/auth?response_type=permission%20id_token%20token&scope=openid%20profile%20email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgooglevoice%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fnotifications%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fpeopleapi.readwrite%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fsipregistrar-3p'+(email?'':'&prompt=select_account')+'&redirect_uri=storagerelay%3A%2F%2Fhttps%2Fvoice.google.com%3Fid%3D'+("auth" + Math.floor(1E6 * Math.random() + 1))+'&client_id=301778431048-buvei725iuqqkne1ao8it4lm0gmel7ce.apps.googleusercontent.com'+(email?'&login_hint='+encodeURIComponent(email):'');
//https://accounts.google.com/o/oauth2/auth?response_type=permission%20id_token&scope=openid%20profile%20email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgooglevoice%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fnotifications%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fpeopleapi.readwrite%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fsipregistrar-3p&openid.realm=&login_hint=bulk88%40hotmail.com&redirect_uri=storagerelay%3A%2F%2Fhttps%2Fvoice.google.com%3Fid%3Dauth973431&client_id=301778431048-buvei725iuqqkne1ao8it4lm0gmel7ce.apps.googleusercontent.com&ss_domain=https%3A%2F%2Fvoice.google.com&gsiwebsdk=2
            window.open('https://accounts.google.com'+u);
            window.open('https://saproxy.us.to'+u);
         };
         if((textareaNode_clipboard_clipboard = navigator.clipboard) && textareaNode_clipboard_clipboard.readText) { /* old browser or HTTPS failure */
            buttonNode = newBodyNode.appendChild(document.createElement('button'));
            buttonNode.textContent = "Paste";
            buttonNode.onclick = function (evt){
                textareaNode_clipboard_clipboard.readText()
                .then(function(text){/*fake DOM element*/
                    gotAuthPasteCB({type: 'input', target: {value: text}});
                })
                .catch(function(/*err*/){ /*cancel button, less bytes code rare path*/
                    evt.target.previousSibling.click();
                });
            };
        }
        var oldExp = Number(localStorage.getItem('wvLastExpires'));
        if (oldExp) {
            newBodyNode.appendChild(document.createElement('br'));
            newBodyNode.appendChild(document.createTextNode('Old Tok Exp: ' + new Date(oldExp).toLocaleTimeString()));
        }
        window.onmessage = wvMsgEvtCB;
        buttonNode = newBodyNode.appendChild(document.createElement('div'));
        buttonNode.id = 'picker';
        newBodyNode.appendChild(document.createElement('br'));
        buttonNode = newBodyNode.appendChild(document.createElement('a'));
        buttonNode.href = 'https://saproxy.us.to/AddSession?service=grandcentral&continue=https%3A%2F%2Fvoice.google.com%2Fu%2F0%2Fa%2Fi%2F4e01281e272a1ccb11ceff9704b131e5-1';
        buttonNode.target = '_blank';
        buttonNode.rel = 'opener';
        buttonNode.textContent = 'Add Account';
        buttonNode.onclick = function() {
            var postAddSessionCB = function() {
                window.removeEventListener('focus', postAddSessionCB);
                wvDrawAccountPicker();
            };
            window.addEventListener('focus', postAddSessionCB);
        };
        newBodyNode.appendChild(document.createElement('br'));
        newBodyNode.appendChild(document.createElement('br'));
        buttonNode = newBodyNode.appendChild(document.createElement('button'));
        buttonNode.innerHTML = "\u3164Logout All Accounts \u3164";
        buttonNode.onclick = function (evt){
            evt = evt.target;
            evt.textContent = "\u3164Logout All Accounts\u231B\u3164";
            var x = new XMLHttpRequest();
            x.onreadystatechange = function() {
                if (4 == x.readyState) {
                    if (200 == x.status) {
                        evt.textContent = "\u3164Logout All Accounts\u2714\u3164";
                    } else {
                        evt.textContent = "\u3164Logout All Accounts\u2718\u3164";
                    }
                    wvDrawAccountPicker();
                }
            };
            x.withCredentials = true;
            x.open('GET', 'https://saproxy.us.to/delete_cookies', !0);
            x.send();
        };
        wvDrawAccountPicker();
    }
}

var wvMap = Array.prototype.map ? function(a, b, c) {
    return Array.prototype.map.call(a, b, c);
}
: function(a, b, c) {
    for (var d = a.length, e = Array(d), g = "string" === typeof a ? a.split("") : a, h = 0; h < d; h++)
        h in g && (e[h] = b.call(c, g[h], h, a));
    return e
};
function joinArrayToInt (a) {
            return wvMap(a, function(b) {
                b = b.toString(16);
                return 1 < b.length ? b : "0" + b
            }).join("");
}
/* if you send too many BASE64 per time (???) to GV this happens
{
 "error": {
  "errors": [
   {
    "domain": "google_voice",
    "reason": "RESOURCE_EXHAUSTED",
    "message": "voice_error: {\"error_code\":\"RESOURCE_EXHAUSTED\",\"base64_format\":\"CAI=\",\"protojson_fava_format\":\"[2]\"}"
   }
  ],
  "code": 429,
  "message": "voice_error: {\"error_code\":\"RESOURCE_EXHAUSTED\",\"base64_format\":\"CAI=\",\"protojson_fava_format\":\"[2]\"}"
 }
}
*/


/*polyfill for Opera 12*/
crypto = window.crypto ||
  window.msCrypto || {
    getRandomValues: function(array) {
      for (var i = 0, l = array.length; i < l; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }
  };

//img is http URL or bytes in a string or false (no img)
function sendsms(num, body, img, finish){
    getAuthToken(function(tok) {sendsms_t(true, tok, num, body, img, finish)});
}
var sendsms_t = (function (){
/*anti replay/msg dedup if network errors, body was sent, but resp had CORS or timeout */
var lastNum, lastBody, lastImg, msg_id;
return function (canReAuth, tok, num, body, img, finish){
if (num != lastNum || body != lastBody || img != lastImg) {
    lastNum = num;
    lastBody = body;
    lastImg = img;
    msg_id = new Uint8Array(6);
    crypto.getRandomValues(msg_id);
    msg_id = parseInt(joinArrayToInt(msg_id), 16).toString();
}
var x=new XMLHttpRequest;
x.open("POST","https://www.googleapis.com/voice/v1/voiceclient/api2thread/sendsms?alt=protojson",1);
x.setRequestHeader("Content-Type", "application/json+protobuf; charset=UTF-8");
x.setRequestHeader("Authorization","Bearer "+tok);
var imgPBArrStr = '';
if (img) {
    if (/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(img)) {
        if(!/^https:\/\/lh3\.googleusercontent\.com/.test(img)) {
            var err = "This IMG URL isn't from lh3.googleusercontent.com, "
                +"GV will not accept it. Bad URL is\n\n"+img;
            alert(err);
            throw(err);
        }
//arg 4th of last array is a URL in GV web //"https://lh3.googleusercontent.com/-Satk2sZMdN8/XuRxp1iQ6HI/AAAAAAAAACJ/VVZfgqvXRd81qsLvHSeVH9_ZsKRQTY7awCLcBGApYHQ/s1820/disk%2Bfile.jpg"
//must be a lh3.googleusercontent.com coming from Google Drive or Picasa, GV Web has a resizer
//or anon Google Drive image feature that is used to POST upload images and generate
//lh3.googleusercontent.com links, arg 4 can not be a random image URL on public internet
//arg 2 in GV Android is a raw binary image uploaded in the POST, it is a BASE64 image in JSON Protobuf interface
        imgPBArrStr = ',[1,null,null,"'+img+'"]';
    } else {
        imgPBArrStr = ',[1,"'+img+'",null,null]';
    }
}
x.onreadystatechange=function(){if(x.readyState==4){
    if(canReAuth && x.status == 401 && resp401Unauth(x.response)){
        wvWipeAuthToken();
        getAuthToken(function(tok) {sendsms_t(false, tok, num, body, img, finish)});
    }
    else if(x.status != 200) {alert("status: "+x.status+"\nresp:"+x.response);finish && finish(x.response||-1);}
    else {finish && finish(false, JSON.parse(x.response))};
}};
//commented out encoding is GV Web typ, BUTTTT, it only works for old threads
//on virgin threads GAPI returns
//GV Web knows for virgin numbers to put tel num in array, tel num in array
//always works virgin or old thread
//x.send('[null,null,null,null,"'+body+'","t.+1'+num+'",[],null,['+msg_id+']'+imgPBArrStr+']');
x.send('[null,null,null,null,'+JSON.stringify(body)+',null,["+1'+num+'"],null,['+msg_id+']'+imgPBArrStr+']');
}})();

//finish(err, resp)
function getThread(num,pagination_token,finish,items){
    getAuthToken(function(tok) {getThread_t(true, tok, num, pagination_token, finish,items)});
}
function getThread_t(canReAuth, tok, num, pagination_token, finish, items){
var x=new XMLHttpRequest;
x.open("POST","https://www.googleapis.com/voice/v1/voiceclient/api2thread/get?alt=json&prettyPrint=false",1);
x.setRequestHeader("Content-Type", "application/json+protobuf");
x.setRequestHeader("Authorization","Bearer "+tok);
x.onreadystatechange=function(){if(x.readyState==4){
    if(canReAuth && x.status == 401 && resp401Unauth(x.response)){
        wvWipeAuthToken();
        getAuthToken(function(tok) {getThread_t(false, tok, num, pagination_token, finish,items)});
    }
    else if(x.status != 200) {x.status == 404 || alert("status: "+x.status+"\nresp:"+x.response);finish && finish(x.response||-1);}
    else {finish && finish(false, JSON.parse(x.response))};
}};
//100 is how many messages to get, after the 100 is pagenation token for loading next batch in chat log
//last array purpose UNK, "uninit true true" is a const
//          , dI = function() {
        //    var a = new bI;
        //    a = u(a, 2, !0);
        //    return u(a, 3, !0)
        //};
x.send('["t.+1'+num+'",'+(items?items:100)+(pagination_token?',"'+pagination_token+'"]':']'));
}

function mkContact(name,num,finish){
    getAuthToken(function(tok) {mkContact_t(true,tok,name,num,finish)});
}
/*not sure what app I got this link this link from, but google's CORS headers only
return true for CORS if Referer/Origin is voice.google.com */
function mkContact_t(canReAuth,tok,name,num,finish){
var x=new XMLHttpRequest;
x.open("POST", 'https://content-people-pa.googleapis.com/v2/people?get_people_request.extension_set.extension_names=hangouts_phone_data&get_people_request.request_mask.include_field.paths=person.metadata&get_people_request.request_mask.include_field.paths=person.name&get_people_request.request_mask.include_field.paths=person.phone&get_people_request.request_mask.include_field.paths=person.photo&get_people_request.request_mask.include_container=CONTACT&get_people_request.request_mask.include_container=PROFILE&get_people_request.request_mask.include_container=DOMAIN_CONTACT&get_people_request.request_mask.include_container=DOMAIN_PROFILE&get_people_request.request_mask.include_container=PLACE&get_people_request.context.migration_options.use_new_request_mask_behavior=true&alt=json&prettyPrint=false',1);
x.setRequestHeader("Content-Type", "application/json");
x.setRequestHeader("Authorization","Bearer "+tok);
x.onreadystatechange=function(){if(x.readyState==4){
    if(canReAuth && x.status == 401 && resp401Unauth(x.response)){
        wvWipeAuthToken();
        getAuthToken(function(tok) {mkContact_t(false,tok,name,num,finish)});
    }
    else if(x.status != 200) {alert("status: "+x.status+"\nresp:"+x.response);finish && finish(x.response||-1);}
    else {finish && finish(false)};
}};
x.send('{"name":{"display_name":'+JSON.stringify(name)+'},"phone":{"value":"+1'+num+'","type":""}}');
}

//sourceNum MUST be a verified linked num in GV, can't be random or else
//"code": 404,
//  "message": "voice_error: {\"error_code\":\"NOT_FOUND\"}"
function mkCallWithSrc(sourceNum, destNum, finish){
    getAuthToken(function(tok) {mkCallWithSrc_t(true, tok, sourceNum, destNum, finish)});
}
function mkCallWithSrc_t(canReAuth, tok, sourceNum, destNum, finish){
var x=new XMLHttpRequest;
x.open("POST","https://www.googleapis.com/voice/v1/voiceclient/communication/startclicktocall?alt=protojson",1);
x.setRequestHeader("Content-Type", "application/json+protobuf");
x.setRequestHeader("Authorization","Bearer "+tok);
x.onreadystatechange=function(){if(x.readyState==4){
    if(canReAuth && x.status == 401 && resp401Unauth(x.response)){
        wvWipeAuthToken();
        getAuthToken(function(tok) {mkCallWithSrc_t(false, tok, sourceNum, destNum, finish)});
    }
    //TODO add 404 means sourceNum is invalid/changed/not linked/not on server
    //anymore auto fetch from network source num list again and reissue the call
    else if(x.status != 200) {alert("status: "+x.status+"\nresp:"+x.response);finish && finish(x.response||-1);}
    else {finish && finish(false)};
}};
x.send('[["phnnmbr","+1'+destNum+'"],["phnnmbr","+1'+sourceNum+'"]]');
}

//finish(err, resp)
function getActInfo(finish){
    getAuthToken(function(tok) {getActInfo_t(true, tok, finish)});
}
function getActInfo_t(canReAuth, tok, finish){
var x=new XMLHttpRequest;
x.open("POST","https://www.googleapis.com/voice/v1/voiceclient/account/get?alt=json&prettyPrint=false",1);
x.setRequestHeader("Content-Type", "application/json+protobuf");
x.setRequestHeader("Authorization","Bearer "+tok);
x.onreadystatechange=function(){if(x.readyState==4){
    if(canReAuth && x.status == 401 && resp401Unauth(x.response)){
        wvWipeAuthToken();
        getAuthToken(function(tok) {getActInfo_t(false, tok, finish)});
    }
    else if(x.status != 200) {alert("status: "+x.status+"\nresp:"+x.response);finish && finish(x.response||-1);}
    else {finish && finish(false, JSON.parse(x.response))};
}};
x.send('[null,1]');
}

function getSourceNumUI(phone_arr, primaryDid, finish) {
    var wvDocumentElement = document.documentElement;
    if (phone_arr.length > 1) {
    var oldBodyNode = wvDocumentElement.removeChild(wvDocumentElement.getElementsByTagName('body')[0]);
    var newBodyNode = wvDocumentElement.appendChild(document.createElement('body'));
    newBodyNode.appendChild(document.createTextNode("Pick Outgoing Number:"));
    newBodyNode.appendChild(document.createElement('br'));
    var i;
    for (i = 0; i < phone_arr.length; i++) {
        var node = newBodyNode.appendChild(document.createElement('a'));
        node.setAttribute('href', '#');
        node.textContent = /^\+1(.+)$/.exec(phone_arr[i].phoneNumber.e164)[1];
        node.onclick = function (e){
            e.preventDefault();
            wvDocumentElement.replaceChild(oldBodyNode, newBodyNode);
            finish(false, e.target.textContent, primaryDid);
        };
        newBodyNode.appendChild(document.createElement('br'));
    }
     node = newBodyNode.appendChild(document.createElement('button'));
     node.textContent = "Cancel/Return";
     node.onclick = function (){
        wvDocumentElement.replaceChild(oldBodyNode, newBodyNode);
        finish("USER_CLICKED_CANCEL");
    };
    }
    else if (phone_arr.length == 1) {
        finish(false, /^\+1(.+)$/.exec(phone_arr[0].phoneNumber.e164)[1], primaryDid);
    }
    else {
        alert("This account has no linked phone numbers for outgoing calls");
        finish("NO_LINKED_LINES_AVAILABLE");
    }
}
//finish(err, sourceNum, acntNum)
//pickerUI(phone_arr, primaryDid, finish)
function getSourceNum(pickerUI, finish){
    var phone_arr;
    var primaryDid;
    try {
        phone_arr = JSON.parse(localStorage.getItem('gvauthobj'));
        primaryDid = phone_arr.primaryDid;
        phone_arr = phone_arr.linkedPhone;
    } catch (e) {
        phone_arr = undefined;
    }
    if(phone_arr) { /* warning cache doesn't deal with settings changes, changed
    once an hour by token relogin*/
        pickerUI(phone_arr, primaryDid, finish);
    }
    else {
        getActInfo(function(err,resp){
        if (err) {
            finish(err);
        } else {
            phone_arr = resp.account.phones.linkedPhone;
            primaryDid = /^\+1(.+)$/.exec(resp.account.primaryDid)[1];
            err = JSON.parse(localStorage.getItem('gvauthobj'));
            err.linkedPhone = phone_arr;
            err.primaryDid = primaryDid;
            localStorage.setItem('gvauthobj', JSON.stringify(err));
            pickerUI(phone_arr, primaryDid, finish);
        }
        });
    }
}

//finish(err)
//not called if no Source Num, will ask user with blocking UI if
//Account has multiple source numbers
//dir=direction, 0 incoming, 1 outwards online, 2 outwards offline (no data)
function mkCall(elem, destNum, dir, finish){
    dir == 1 ?
    //source number is ignored by GV server atleast for USA nums, same proxy num
    //for all linked phones AFAIK, dont ask user to pick a source line, source
    //num must be a valid area code/NPAA tho, no all 0s or empty string
    //(400 inval argument or 500)
    getProxyNumWithSrc('8004377950', destNum,
        function (err, r) {
            if (err) {
                finish(err);
            }
            else {
                location = 'tel:'+/^\+1(.+)$/.exec(r.proxyNumber.proxyNumber.e164)[1];
                finish(false);
            }
        }
    )
    : getSourceNum(
        //arg 1, pass a line picker UI, no-op if want acnt/GV num only
        dir == 2 ?
            function(phone_arr, primaryDid, finish) {
                finish(false, false, primaryDid)
            }
            : getSourceNumUI,
        //arg 2, finish
        function(err, sourceNum, acntNum) {
            err ?
            finish(err)
            : dir ? // == 2 offline, 0 is incoming
            mkOfflineCall(elem, acntNum, destNum, finish)
            : mkCallWithSrc(sourceNum, destNum, finish);
        }
    );
}

function openDialer() {location = 'tel:'}

function mkOfflineCall(elem, acntNum, destNum, finish) {
    if(wvCopyToClipboard(acntNum+',,2'+destNum+'#', elem,openDialer)){
        openDialer();
    }
    finish(false);
}

function resp401Unauth(jstr) {
    try {
        jstr = JSON.parse(jstr).error;
        if(jstr && jstr.code == 401
            && (jstr.status == "UNAUTHENTICATED"
                || jstr.message == "Invalid Credentials")) {
            return true;
        }
    } catch (e) {
    }
    return false;
}

//void function finish(err_obj_typ_JSON_str, response_str)
function imgURLToB64Str(url,finish){
var x=new XMLHttpRequest;
x.open("GET","https://api.allorigins.win/raw?url="+encodeURIComponent(url),1);
x.overrideMimeType('text\/plain; charset=x-user-defined');
x.responseType = 'arraybuffer';
x.onreadystatechange=function(){if(x.readyState==4){
    if(x.status != 200) {alert("status: "+x.status+"\nresp:"+x.response);finish && finish(x.response||-1);}
    else {
        finish && finish(false,
            btoa(String.fromCharCode.apply(null, new Uint8Array(x.response))));
    }
}};
x.send();
}

//size is a number between 1 and 4 typically,
//1 original size, 4 "biggest reduced(desktop-ish)", 2 smallest img (2G internet)
//finish(err, no_prefix_b64str_resp)
function attachIDtoB64(id, size, isvid, finish){
    getAuthToken(function(tok) {attachIDtoB64_t(true, tok, id, size, isvid, finish)});
}
function attachIDtoB64_t(canReAuth, tok, id, size, isvid, finish){
var x=new XMLHttpRequest;
x.open("POST","https://www.googleapis.com/voice/v1/voiceclient/attachments/get?alt=json&prettyPrint=false",1);
x.setRequestHeader("Content-Type", "application/json+protobuf");
x.setRequestHeader("Authorization","Bearer "+tok);
x.onreadystatechange=function(){if(x.readyState==4){
    if(canReAuth && x.status == 401 && resp401Unauth(x.response)){
        wvWipeAuthToken();
        getAuthToken(function(tok) {attachIDtoB64_t(false, tok, id, size, isvid, finish)});
    }
    else if(x.status != 200) {alert("status: "+x.status+"\nresp:"+x.response);finish && finish(x.response||-1);}
    else {
        if(finish){
            x = JSON.parse(x.response);
            x = x.videoContent?x.videoContent.content:x.vcardContent?x.vcardContent.content:x.imageContent.content;
            //GAPI returns a "url safe b64" string that is not allowed in
            //data URLs, not reg b64, convert to reg b64
            x = x.replace(/-/g, "+"); // 62nd char of encoding
            x = x.replace(/_/g, "/"); // 63rd char of encoding
            finish(false, x);
        }
    }
}};
x.send('["'+id+'",'+size+','+(isvid?'null,[1,[null,null,null,null,0,null,1]]]':'1]'));
}

/*reference, use protobuf for smaller wire size because is called on
 timers/polling
 [[[[1,535,5],[4,0,0],[2,155,5],[3,380,0],[6,78,0],[5,5,0]]]]

{
 "info": {
  "view_info": [
   {
    "view": "ALL_THREADS",
    "total_thread_count": 535,
    "unread_thread_count": 5
   },
   {
    "view": "VOICEMAIL_AND_RECORDING_THREADS",
    "total_thread_count": 0,
    "unread_thread_count": 0
   },
   {
    "view": "TEXT_THREADS",
    "total_thread_count": 155,
    "unread_thread_count": 5
   },
   {
    "view": "CALL_THREADS",
    "total_thread_count": 380,
    "unread_thread_count": 0
   },
   {
    "view": "ALL_ARCHIVED_THREADS",
    "total_thread_count": 78,
    "unread_thread_count": 0
   },
   {
    "view": "ALL_SPAM_THREADS",
    "total_thread_count": 5,
    "unread_thread_count": 0
   }
  ]
 }
}
*/

/* even tho the data struct ultra small, useless for getting per thread updates
   bc this only changes its numbers if a thread goes from read to unread
   I see multiple "race" problems if mark read isn't atomic
//finish(err, resp)
function getThdInfo(finish){
    getAuthToken(function(tok) {getThdInfo_t(true, tok, finish)});
}
function getThdInfo_t(canReAuth, tok, finish){
var x=new XMLHttpRequest;
x.open("POST","https://www.googleapis.com/voice/v1/voiceclient/threadinginfo/get?alt=protojson",1);
x.setRequestHeader("Content-Type", "application/json+protobuf");
x.setRequestHeader("Authorization","Bearer "+tok);
x.onreadystatechange=function(){if(x.readyState==4){
    if(canReAuth && x.status == 401 && resp401Unauth(x.response)){
        wvWipeAuthToken();
        getAuthToken(function(tok) {getThdInfo_t(false, tok, finish)});
    }
    else if(x.status != 200) {alert("status: "+x.status+"\nresp:"+x.response);finish && finish(x.response||-1);}
    else {finish && finish(false, JSON.parse(x.response))};
}};
x.send('[]');
}

//multiple new txts on 1 thread do not retrigger, uhhh, figure out how messages
//r marked read
var lastPollRes = [2,0,0];
function pollme () {
getThdInfo(function(e,r){
    r = r[0][0][2];
    if( lastPollRes && r[1] == lastPollRes[1] && r[2] == lastPollRes[2]) {
    return;
    }
    alert("got a message");
    lastPollRes = r;
});
}
*/

//finish(err, resp), resp is newest message ID on server, compare it to newest
//message ID on user's screen if to redraw/full refetch, uses protobuf for size
//reasons
function chkNewMsg(num, finish){
    getAuthToken(function(tok) {chkNewMsg_t(true, tok, num, finish)});
}
function chkNewMsg_t(canReAuth, tok, num, finish){
var x=new XMLHttpRequest;
x.open("POST","https://www.googleapis.com/voice/v1/voiceclient/api2thread/get",1);
x.setRequestHeader("Content-Type", "application/json+protobuf");
x.setRequestHeader("Authorization","Bearer "+tok);
x.onreadystatechange=function(){if(x.readyState==4){
    //404 thread doesnt exist, 0 is timeout/network failure
    //401 no credentials, dont reauth, too annoying popups
    if(x.status != 200) {
        x.status == 404 || x.status == 0 || x.status == 401
            || alert("status: "+x.status+"\nresp:"+x.response);
        finish && finish(x.response||-1);
    }
    else {finish && finish(false,x.response)};
}};
x.send('["t.+1'+num+'",1]');
}

function getProxyNumWithSrc(sourceNum, destNum, finish){
    getAuthToken(function(tok) {getProxyNumWithSrc_t(true, tok, sourceNum, destNum, finish)});
}
function getProxyNumWithSrc_t(canReAuth, tok, sourceNum, destNum, finish){
var x=new XMLHttpRequest;
//x.open("POST","https://www.googleapis.com/voice/v1/voiceclient/api2thread/get",1);
x.open("POST","https://www.googleapis.com/voice/v1/proxynumbers/reserve?alt=json&prettyPrint=false",1);
x.setRequestHeader("Content-Type", "application/json+protobuf");
x.setRequestHeader("Authorization","Bearer "+tok);
x.onreadystatechange=function(){if(x.readyState==4){
    if(canReAuth && x.status == 401 && resp401Unauth(x.response)){
        wvWipeAuthToken();
        getAuthToken(function(tok) {getProxyNumWithSrc_t(false, tok, sourceNum, destNum, finish)});
    }
    else if(x.status != 200) {alert("status: "+x.status+"\nresp:"+x.response);finish && finish(x.response||-1);}
    else {finish && finish(false,JSON.parse(x.response))};
}};
/*last field     "message": "Invalid value at 'request' (BOOL), Invalid value '2' for bool field. Allowed values are either 0 or 1.",
last field is cacheable flag, if 1 then proxy num can be called ONCE.
After that using it again make
makes a "could not complete your call" voice message, GV server in
experiments returns same number over and over for uncacheable 1 time use for a
particular destination number, but calling that proxy num without doing the web
request first to enable the num causes the verbal voice fail message

the one time use number is different from the cacheable number, each destination
num seems to get a very numerically close but different one time use number

cacheable proxy numbers are random zip codes

one time use JSON call takes 150-250 ms

cacheable proxy number JSON call takes 500-800 ms *EEK*
*/
x.send('[[["phnnmbr","+1'+destNum+'"]],null,["phnnmbr","+1'+sourceNum+'"],null,0]');
}


function getContactName(num, finish){
    getAuthToken(function(tok) {getContactName_t(true, tok, num, finish)});
}
function getContactName_t(canReAuth, tok, num, finish){
var x=new XMLHttpRequest;
//I dont have the scope, and gauth wont let me add it
//x.open("GET","https://content-people.googleapis.com/v1/people:searchContacts?query=1"+num+"&readMask=names&fields=results.person.names.displayName&prettyPrint=false",1);
x.open("GET","https://content-people-pa.googleapis.com/v2/people/lookup?extension_set.extension_names=HANGOUTS_PHONE_DATA&extension_set.extension_names=CALLER_ID_LOOKUPS&merged_person_source_options.person_model_params.person_model=CONTACT_CENTRIC&id=%2B1"+num+"&match_type=LENIENT&type=PHONE&quota_filter_type=PHONE&request_mask.include_field.paths=person.name&prettyPrint=false&alt=protojson",1);
x.setRequestHeader("Authorization","Bearer "+tok);
x.onreadystatechange=function(){if(x.readyState==4){
    if(canReAuth && x.status == 401 && resp401Unauth(x.response)){
        wvWipeAuthToken();
        getAuthToken(function(tok) {getContactName_t(false, tok, num, finish)});
    }
    else if(x.status != 200) {alert("status: "+x.status+"\nresp:"+x.response);finish && finish(x.response||-1);}
    else if(finish) {
        //undefined or "[]" on wire if no match
        if((x = x.response) == "[]") {
            x = undefined;
        } else {
            x = JSON.parse(x)[1][0][1][2][0][1];
        }
        finish(false, x);
    }
}};
x.send();
}
