//A bookmarklet to run on voice.google.com
//this can be minifield but is loaded by a stub for sanity

function wvCopyToClipboard(text) {
var input = document.createElement("input");
input.setAttribute("value", typeof text == 'string' ? text : "test data "+String(new Date()));
input.setAttribute("id", "mycopyfield");
document.body.appendChild(input);
input.select();
input.setSelectionRange(0, 99999); /*For mobile devices*/
try {
var r = document.execCommand("copy");
if(!r){throw('document.execCommand("copy") returned false');}
} catch(e) {
alert("Copy Failed: "+e);
}
document.body.removeChild(input);
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
    
if (!('gapi' in window && 'auth2' in window.gapi)) {
    alert("No Google Auth Library in this page, are you inside voice.google.com?");
}
window.gapi.auth2.authorize({
    "apiKey":"AIzaSyDTYc1N4xiODyrQYK0Kl6g_y279LjYkrBg",
    "clientId":"301778431048-buvei725iuqqkne1ao8it4lm0gmel7ce.apps.googleusercontent.com",
    "prompt":"select_account",
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
             newBodyNode.appendChild(document.createTextNode("Got Account: "+resp.profile.email));
             newBodyNode.appendChild(document.createElement('br'));
             var buttonNode = newBodyNode.appendChild(document.createElement('button'));
             buttonNode.innerText = "Click to Copy GV Auth Data";
             buttonNode.addEventListener('click', function (){
                wvCopyToClipboard(authstr);
                document.documentElement.replaceChild(oldBodyNode, newBodyNode);
             });
             var buttonCancelNode = newBodyNode.appendChild(document.createElement('button'));
             buttonCancelNode.innerText = "Cancel/Return";
             buttonCancelNode.addEventListener('click', function (){
                document.documentElement.replaceChild(oldBodyNode, newBodyNode);
             });
        } else { //failed to auth
            alert("Failed :\n\n"+JSON.stringify(resp));
        }
    }
);
