(function(){
/* triggerElement, UI element that user interacted with to trigger the
   copy, it will be replaced with a text box if browser doesn't support
   programmatic copy */
/*public*/
window.wvCopyToClipboard = function (text, triggerElem, restoreOnBlurCB) {
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

/*public*/
window.wvWipeAuthToken = function (logout) {
    var email_isSignedIn = lazySignedInEmail();
    delete window.wvLinkFmt;
    if(email_isSignedIn) {
        localStorage.removeItem('linkfmt/id/'+lazySignedGoogId());
        localStorage.setItem('wvLastExpires', lazySignedInExpires());
    }
    localStorage.setItem('wvCurAcnt',logout ? '' :email_isSignedIn); //todo var logout obsolete
    localStorage.removeItem('gvauthobj');
    localStorage.removeItem('wvThdListA');
    localStorage.removeItem('wvThdListM');
    localStorage.removeItem('wvArchView');
}

/*public*/
window.drawLoginBar = function ()
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
    var email_label = lazySignedInEmail()
      , email_node;
    buttonNode = document.createElement('button');
    if (email_label.length) {
        divLoginBar.appendChild(document.createTextNode("Signed in: "));
        email_node = document.createElement('a');
        email_node.href = "#";
        email_node.textContent = email_node.x_eml = email_label;
        email_node.x_num = lazySignedInPrimaryDid();
        email_node.onclick = function() {
          this.textContent = this.textContent == this.x_eml ? this.x_num : this.x_eml;
          return false;
        };
        buttonNode.textContent = "Logout";
        buttonNode.onclick = function (){
            wvWipeAuthToken(1)
            drawLoginBar()
        };
    } else {
        email_node = document.createTextNode("Logged out");
        buttonNode.textContent = "Login";
        buttonNode.onclick = function (){
            //func from html page or undef
            getAuthToken(refreshNoUI);
        };
    }
    divLoginBar.appendChild(email_node);
    divLoginBar.appendChild(buttonNode);
}

var TokDec = {};
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

function loadAuthFromJSON(authStr) {
    var l_GVAuthObj;
    GVAuthObj = undefined;//default
    g_GVAuthStr = authStr; //always set even if syn err in str
    if(authStr && authStr.length) {
        try {
            l_GVAuthObj = JSON.parse(authStr);
            //null is type obj but false
            if(l_GVAuthObj && typeof l_GVAuthObj === "object") {
                GVAuthObj = l_GVAuthObj;
            }
        } catch (e) {
        }
    }
}

function lazyGenericGet () {
    var fieldIdx = this|0; //|0 to try to mk sure the switch() optimized by any JS VM
    var l_GVAuthStr = localStorage.getItem('gvauthobj');
    if(g_GVAuthStr !== l_GVAuthStr) {
        loadAuthFromJSON(l_GVAuthStr);
    }//abv fn mods private globals
    if (GVAuthObj) {
        switch(fieldIdx) {
            case 0:
                return GVAuthObj.profile.email;
            case 1:
                return GVAuthObj.primaryDid;
            case 2:
                return GVAuthObj.profile.sub;
            case 3:
                return GVAuthObj.session_state.extraQueryParams.authuser;
            case 4:
                return GVAuthObj.expires_at;
            default:
                alert("unk field in lazy auth getter");
                return '';
        }
    } else {
        if(fieldIdx) {
            throw "Not logged in."
        } else { //email field is 0
            return '';
        }
    }
}
window.lazySignedInEmail = lazyGenericGet.bind(0);

window.lazySignedInUserIndex = lazyGenericGet.bind(3);

var lazySignedInPrimaryDid = lazyGenericGet.bind(1);

var lazySignedGoogId = lazyGenericGet.bind(2);

var lazySignedInExpires = lazyGenericGet.bind(4);

var g_GVAuthStr;

var GVAuthObj;

function lazyGetLinkFormatter() {
  //GogID() throws if signed out, email() is sentinal
  var g = (lazySignedInEmail() && lazySignedGoogId()), ret = [,g], GVAuthObj;
  if(g) { //signed out
    GVAuthObj= localStorage.getItem('linkfmt/id/'+g);
    if (GVAuthObj) {
      ret[0] = GVAuthObj;
    }
  }
  return ret;
}
/*public*/
window.initLnkFmt = function (finish) {
  //skip eval if already in process
  if(window.wvLinkFmt || ! /^(?:wvoice\.us\.to|www\.voice\.tel|localhost|cp\.wvoice\.workers\.dev)$/.test(location.hostname)){
    finish && finish();
    return;
  }
  var g/*oogId*/, s = lazyGetLinkFormatter();
  if(s[0]) { //from localStorage
    Function(s[0])();
    finish && finish();
  } else { //from network
    if (g = s[1]) {
      s=new XMLHttpRequest;
      s.open("GET",(new URL('//carrier.natasha.cat/linkfmt/id/' + g, document.baseURI)).href,1);
      //s.open("GET", '/linkfmt.js',1);
      s.onreadystatechange=function(){
        var a/*authobj*/;
        if(s.readyState==4){
          if(s.status != 200) {
            alert("status: "+s.status+"\nresp:"+s.response);
          }
          else {
            localStorage.setItem('linkfmt/id/'+g, s.response);
            Function(s.response)();
            finish && finish();
          }
        }
      };
      s.send();
    }
  }
}

var wvProxyPrefix = 'https:';

function wvGetBase64 (file) {
  const reader = new FileReader()
  return new Promise(resolve => {
    reader.onload = ev => {
      resolve(ev.target.result.replace('data:application/octet-stream;base64,', 'data:image/jpeg;base64,'))
    }
    reader.readAsDataURL(file)
  })
}

var gPCacheStr;
var gPCache;
var gPCacheImgEl;

function profImgLoadCB(e) {
  //maybe fk evt and fk el, doesnt matter
  e = e.target;
  //save mem
  e.onload = undefined;
  //save mem
  e = e.src;
  fetch(e, {
    referrerPolicy: "no-referrer"
  }).then(function (r) {
    var pret = r.blob().then(function (r) {
      return wvGetBase64(r).then(function (r) {
        var b64Ent = gPCache[e];
        //add b64 URL to LS global cache
        gPCache[e] = [r, expires];
        //avoid double JSON parse
        gPCacheStr = JSON.stringify(gPCache);
        localStorage.setItem('wvAcntPickerPCache', gPCacheStr);
        if (b64Ent && gPCacheImgEl[e] && b64Ent[0] !== r) {
            //force re-gen of img tag if changed
            delete gPCacheImgEl[e];
        }
        return;/*don't pass promise vals*/
      });
    });
    //do CPU on idle
    //now() faster than +new Date()
    //https://web.archive.org/web/20200215125344/https://jsperf.com/date-now-vs-new-date
    var curExp = Date.now() + 86400000 /*24h*/;
    //+new Date(null) is int 0, if expires header suddenly disappears
    //expires header advances on EVERY http GET my observation
    var expires = +new Date(r.headers.get('expires'));
    //Math.min(x,y)
    expires = curExp < expires ? curExp : expires;
    return pret;
  });
}

//the img tags still keep through .parentNode a large tree of dead elements from the now
//detached picker, so clean the img tags
function gcSavedProfImgEls() {
  if(gPCacheImgEl) {
    var a = Object.values(gPCacheImgEl), i = 0, el, pn;
    for(;i<a.length;i++) {
      el = a[i];
      if(pn=el.parentNode) {
        pn.removeChild(el);
        el.style = null;
      }
    }
  }
}
//we can't stop double jpg download if very new prof URL, chrome fetch() and image
//cache entries never match, but this fetch starts only after img tag native
//http URL has been downloaded and drawn on screen, so this fetch always is
//idle bandwidth

function pickerProfImgUrltoImgTagMaybeB64(imgurl) {
  //localStorage.removeItem('wvAcntPickerPCache');
  var imgTag;
  var pCacheStr_pN_b64Url = localStorage.getItem('wvAcntPickerPCache');
  if (pCacheStr_pN_b64Url) {
    //global update or new navigate with a logged in user
    if(gPCacheStr !== pCacheStr_pN_b64Url) { //avoid cpu
      gPCache = JSON.parse(gPCacheStr = pCacheStr_pN_b64Url);
    }
  } else { //new navigate, no logged in user
    gPCache = {};
  }
  //save img tags with jpeg urls in global, on first load, even tho slight
  //old/other user leak concerns, var gPCache and LS cache, are many milliseconds
  //away from being full on first load, so don't toss our jpeg url img tags when
  //b64 URLs are saved in a few ms later
  if(!gPCacheImgEl) {
    gPCacheImgEl = {};
  }
  //reuse img Els for perf/don't parse b64 url .src again
  //skip expire check, very likely a nav or discard happens SOON after expire
  if (imgTag = gPCacheImgEl[imgurl]) {
    if (pCacheStr_pN_b64Url = imgTag.parentNode) {
      pCacheStr_pN_b64Url.removeChild(imgTag);
      imgTag.style = null; //wipe old height/widths/borders if any
    }
  } else {
    imgTag = gPCacheImgEl[imgurl] = document.createElement('img');
    //inflate img el from string (from LS)
    if(pCacheStr_pN_b64Url = gPCache[imgurl]) {
      imgTag.src = pCacheStr_pN_b64Url[0];
      //show for 1x expired b64 url img, oh well, save I/O for jpeg+fetch double load
      if(Date.now() > pCacheStr_pN_b64Url[1]) {
        profImgLoadCB({target:{src:imgurl}});
      }
    //download and draw jpeg from network
    } else {
    //use network jpeg img El, until next navigate/tab discard, no point parsing B64 url
    //the jpeg is guarenteed in UA cache for all redraws
    imgTag.onload = profImgLoadCB;
    imgTag.referrerPolicy = "no-referrer";
    imgTag.src = imgurl;
    }
  }
  return imgTag;
}

function wvDrawUserList(d) { //jsonText
  var p = document.getElementById('picker');
  var frag = document.createDocumentFragment();
  try {
    d = JSON.parse(d);
    d = d[1];
    for (var e = 0; e < d.length; e++) {
      var u = d[e]; //user
      var n = frag.appendChild(document.createElement('a'));
      n.href = wvProxyPrefix + '//proxya6d0.us.to/o/oauth2/auth?response_type=permission%20id_token%20token&scope=openid%20profile%20email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgooglevoice%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fnotifications%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fpeopleapi.readwrite%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fsipregistrar-3p&redirect_uri=storagerelay%3A%2F%2Fhttps%2Fvoice.google.com%3Fid%3D' + ("auth" + Math.floor(1E6 * Math.random() + 1)) + '&client_id=301778431048-buvei725iuqqkne1ao8it4lm0gmel7ce.apps.googleusercontent.com&authuser='+e+'&login_hint=' + encodeURIComponent(u[3]);
      wvPickerTokenRefresh(n);
      n.target = "_blank";
      n.rel = "opener";
      var i = n.appendChild(pickerProfImgUrltoImgTagMaybeB64(u[4]));
      i.style.height = 48;
      i.style.width = 48;
      n.appendChild(document.createElement('div')).textContent = u[2];
      n.appendChild(document.createElement('div')).textContent = u[3];
    }//end for loop
  } catch (e) {
    frag.textContent = e;
  }
  while (p.lastChild) {
    p.removeChild(p.lastChild);
  }
  p.appendChild(frag);
}

function wvPickerTokenRefresh(buttonElement) {
  var myRequest_divarr = new XMLHttpRequest();
  /* login_hint for /iframerpc?action=issueToken must be a fake-JWT
  not a integer sub: google ID serial number, and can't be an email addr and
  /ListAccounts doesn't include id_token needed, and
  /iframerpc?action=listSessions doesnt include profile photos
   */
  //https://accounts.google.com/o/oauth2/iframerpc?action=issueToken&response_type=token%20id_token&login_hint=AJDL-Al96OoAb-3hYtG3&client_id=301778431048-buvei725iuqqkne1ao8it4lm0gmel7ce.apps.googleusercontent.com&origin=https%3A%2F%2Fvoice.google.com&scope=openid%20profile%20email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgooglevoice%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fnotifications%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fpeopleapi.readwrite%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fsipregistrar-3p&ss_domain=https%3A%2F%2Fvoice.google.com
  myRequest_divarr.open('GET', buttonElement.href, !0);
  myRequest_divarr.responseType = 'json';
  myRequest_divarr.onreadystatechange = function () {
    if (4 == myRequest_divarr.readyState) {
      if (200 == myRequest_divarr.status) {
        try { //API changes in Google HTML protect
          var response;
          response = myRequest_divarr.response;
          //0 is json str
          //1 is 301 domain
          //2 is auth
          //add authuser index so images load faster through http vs base64
          var authResult_tok = response[0];
          authResult_tok = (authResult_tok.session_state = authResult_tok.session_state || {});
          (authResult_tok.extraQueryParams = authResult_tok.extraQueryParams || {}).authuser
            = new URL(buttonElement.href).searchParams.get('authuser');
          authResult_tok = response[0].access_token;
          response = {
            origin: "https://proxya6d0.us.to",
            data: JSON.stringify({
              params: {
                authResult: response[0],
                clientId: response[1],
                id: response[2],
                type: "authResult"
              }
            })
          };
          buttonElement.onclick = function () {
            //inject token as if we had a full popup into a message
            window.onmessage(response); /* msg event obj real */
            return false;
          }
          getActInfo_t(0, "Bearer "+authResult_tok, function(err, resp) {
				if(!err) {
              err = JSON.parse(response.data);
              err.params.authResult.linkedPhone = resp.phone_arr;
              err.params.authResult.primaryDid = resp.primaryDid;
              response.data = JSON.stringify(err);
            }
          });
        } catch (e) {
          console.log(e);
        }
      } else if (0 == myRequest_divarr.status && wvProxyPrefix == 'https:') {
        wvProxyPrefix = 'http:';
        wvPickerTokenRefresh(buttonElement);
      }
    }
  };
  myRequest_divarr.withCredentials = true;
  myRequest_divarr.send();
}

/*
function wvPickerTokenRefresh(buttonElement, user) {
  var myRequest = new XMLHttpRequest();
  debugger;
//https://accounts.google.com/o/oauth2/iframerpc?action=issueToken&response_type=token%20id_token&login_hint=AJDLj6KEP9MzDcsaSxXgEfSczj3V-Al96OoAboO9hrh7Jy9wgL5c-3hYtG3iPXgOzw2cJUgmFPCVzMxAN7bUwf5PLWlYn0Sz5A&client_id=301778431048-buvei725iuqqkne1ao8it4lm0gmel7ce.apps.googleusercontent.com&origin=https%3A%2F%2Fvoice.google.com&scope=openid%20profile%20email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgooglevoice%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fnotifications%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fpeopleapi.readwrite%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fsipregistrar-3p&ss_domain=https%3A%2F%2Fvoice.google.com
  myRequest.open('GET', wvProxyPrefix + '//proxya6d0.us.to/o/oauth2/iframerpc?action=issueToken&response_type=token%20id_token&client_id=301778431048-buvei725iuqqkne1ao8it4lm0gmel7ce.apps.googleusercontent.com&origin=https%3A%2F%2Fvoice.google.com&scope=openid%20profile%20email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgooglevoice%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fnotifications%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fpeopleapi.readwrite%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fsipregistrar-3p&ss_domain=https%3A%2F%2Fvoice.google.com&login_hint=' +user[10], !0);
  myRequest.onreadystatechange = function() {
      if (4 == myRequest.readyState) {
          if (200 == myRequest.status) {
              var d = myRequest.responseText; //403 responseXML is null
              debugger;
          } else if (0 == myRequest.status && wvProxyPrefix == 'https:') {
              wvProxyPrefix = 'http:';
              wvPickerTokenRefresh(buttonElement, user);
          }
      }
  };
  myRequest.withCredentials = true;
  myRequest.send();
}

*/

function wvDrawAccountPicker(suppressTokRefresh) {

    var oldPicker = localStorage.getItem('wvAcntPicker');
    if (oldPicker && !suppressTokRefresh) {
        wvDrawUserList(oldPicker);
    }
    var myRequest = new XMLHttpRequest();
    //mo=1 prop required for profile pics to be user specific vs generic
    myRequest.open('GET', wvProxyPrefix + '//proxya6d0.us.to/ListAccounts?mo=1', !0);
    myRequest.onreadystatechange = function() {
        var d;
        if (4 == myRequest.readyState) {
            if (200 == myRequest.status) {
                d = myRequest.getResponseHeader('content-type');
                if(d && d.indexOf('nocookie=1') != -1 && !localStorage.getItem('wvNo3P')) {
                    d = window.open(wvProxyPrefix+'//proxya6d0.us.to/chk3P');
                    if(!d) {
                        d = document.getElementById('picker');
                        d = d.parentNode.insertBefore(document.createElement('button'), d.nextSibling.nextSibling);
                        d.textContent = "Test 3P Login Proxy Cookies";
                        d.onclick = function (evt) {
                            window.open(wvProxyPrefix+'//proxya6d0.us.to/chk3P');
                            evt = evt.target;
                            evt.parentNode.removeChild(evt.nextSibling);
                            evt.parentNode.removeChild(evt);
                        };
                        d.parentNode.insertBefore(document.createElement('br'), d.nextSibling);
                    }
                }
                d = myRequest.responseText; //403 responseXML is null
                //don't draw HTML 2nd time, dont trigger token prefetch 2nd time
                if (d != oldPicker) {
                    wvDrawUserList(d);
                    localStorage.setItem('wvAcntPicker', d);
                }
            } else if (0 == myRequest.status && wvProxyPrefix == 'https:') {
                wvProxyPrefix = 'http:';
                wvDrawAccountPicker();
            }
        }
    };
    myRequest.withCredentials = true;
    myRequest.send();
}

/*public*/
window.getAuthToken = function (callbackFunc) {
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
    }
    //are we a nested token fetch? avoid 2 token fetches
    //thread fetch and contact name fetch for ex
    else if (window.onmessage) {
      var oldmessageCB = window.onmessage;
      window.onmessage = function (e) {
        window.onmessage = null;
        e = oldmessageCB(e);
        //todo could do a lazy token fetch but no func yet
        getAuthToken(callbackFunc);
        return e; /* ret */
      }
    }
    else { //get token from user page UI
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
        //2021 CSP nonce in header isn't inside body of 404 page
        GVLinkNode.href = 'https://voice.google.com/about'+(email?'#wvCurAcnt='+email:'');
        GVLinkNode.target = '_blank';
        /*https://github.com/whatwg/html/issues/4078*/
        GVLinkNode.rel = 'opener';
        GVLinkNode.textContent = "Open Google Voice Site";
        newBodyNode.appendChild(document.createElement('br'));
        var textareaNode_clipboard_clipboard = newBodyNode.appendChild(document.createElement('textarea'));
        textareaNode_clipboard_clipboard.placeholder = "Paste GV Auth Token here";
        var wvMsgEvtCB = function (e) {
            var data = e.data;
			tyof_data = typeof data;
            if(e.origin == "https://proxya6d0.us.to" || e.origin == "http://proxya6d0.us.to"){
                if(tyof_data === 'string') {
                    e = JSON.parse(data).params.authResult;
            /*this logic is in client origin GAPI JS framework typ, not over wire */
                    e.first_issued_at = (new Date).getTime();
                    e.expires_at = e.first_issued_at + 1E3 * e.expires_in;
                    e.profile = TokDec.DecodeToken(e);
                    delete e.id_token; //useless and very long
					e.access_token = "Bearer " +e.access_token;
                    gotAuthPasteCB({type: 'input', target: {value: JSON.stringify(e)}});
                } else if(tyof_data === 'object') {
					data = data.chk3P;
                    if(typeof data === 'string') { //empty string maybe
                        if(data.indexOf("3P=1") == -1) {
                            localStorage.setItem('wvNo3P', 1);
                        } else {
                            localStorage.removeItem('wvNo3P');
                        }
                    }
                }
            }
            if(e.origin == "https://voice.google.com") {
                gotAuthPasteCB({type: 'input', target: {value: data}});
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
            gcSavedProfImgEls();
            window.onmessage = null;
            if (GVAuthObj) {
                //maybe a new goog UID
                delete window.wvLinkFmt;
                if (lazySignedInEmail()) {
                    localStorage.removeItem('linkfmt/id/'+lazySignedGoogId());
                }
                localStorage.setItem('gvauthobj',pasteStr);
                //start req to get the per-goog UID link formatter, maybe a new goog ID
                initLnkFmt(function(){callbackFunc(GVAuthObj.access_token);});
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
            gcSavedProfImgEls();
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
            window.open(wvProxyPrefix+'//proxya6d0.us.to'+u);
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
        buttonNode.href = wvProxyPrefix+'//proxya6d0.us.to/AddSession?service=grandcentral&continue=https%3A%2F%2Fvoice.google.com%2Fu%2F0%2Fa%2Fi%2F4e01281e272a1ccb11ceff9704b131e5-1';
        buttonNode.target = '_blank';
        buttonNode.rel = 'opener';
        buttonNode.textContent = 'Add Account';
        buttonNode.onclick = function(e) {
            e = e.target;
            e.href.indexOf(wvProxyPrefix) &&
                (e.href = wvProxyPrefix+e.href.substr(e.href.indexOf('/')))
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
            //delete profile pic cache
            gPCacheImgEl = gPCache = gPCacheStr = /*undef*/ localStorage.removeItem('wvAcntPickerPCache');
            var x = new XMLHttpRequest();
            x.onreadystatechange = function() {
                if (4 == x.readyState) {
                    if (200 == x.status) {
                        evt.textContent = "\u3164Logout All Accounts\u2714\u3164";
                    } else {
                        evt.textContent = "\u3164Logout All Accounts\u2718\u3164";
                    }
//don't try to speculatively refresh tokens, guarenteed fail/4XX code b/c no cookies
//less I/O, less auth proxy reqs
                    wvDrawAccountPicker(1);
                }
            };
            x.withCredentials = true;
            x.open('GET', wvProxyPrefix+'//proxya6d0.us.to/delete_cookies', !0);
            x.send();
        };
        wvDrawAccountPicker();
    }
}

var joinArrayToInt = (function(){
var wvMap = Array.prototype.map ? function(a, b, c) {
    return Array.prototype.map.call(a, b, c);
}
: function(a, b, c) {
    for (var d = a.length, e = Array(d), g = "string" === typeof a ? a.split("") : a, h = 0; h < d; h++)
        h in g && (e[h] = b.call(c, g[h], h, a));
    return e
};
return function (a) {
            return wvMap(a, function(b) {
                b = b.toString(16);
                return 1 < b.length ? b : "0" + b
            }).join("");
}
})();
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

/*public*/
//img is http URL or bytes in a string or false (no img)
window.sendsms = function (num, body, img, finish){
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
x.setRequestHeader("Authorization",tok);
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

/*public*/
//finish(err, resp)
window.getThread = function (num,pagination_token,finish,items){
    getAuthToken(function(tok) {getThread_t(true, tok, num, pagination_token, finish, items)});
}
function getThread_t(canReAuth, tok, num, pagination_token, finish, items){
var x=new XMLHttpRequest;
x.open("POST","https://www.googleapis.com/voice/v1/voiceclient/api2thread/get?alt=json&prettyPrint=false",1);
x.setRequestHeader("Content-Type", "application/json+protobuf");
x.setRequestHeader("Authorization",tok);
x.onreadystatechange=function(){if(x.readyState==4){
    if(x.status == 503) { //temorary random failure, just retry
      getThread_t(canReAuth, tok, num, pagination_token, finish, items);
    }
    else if(canReAuth && x.status == 401 && resp401Unauth(x.response)){
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
x.send('["t.'+num+'",'+(items?items:100)+(pagination_token?',"'+pagination_token+'"]':']'));
}

/*public*/
window.mkContact = function (name,num,finish){
    getAuthToken(function(tok) {mkContact_t(true,tok,name,num,finish)});
}
/*not sure what app I got this link this link from, but google's CORS headers only
return true for CORS if Referer/Origin is voice.google.com */
function mkContact_t(canReAuth,tok,name,num,finish){
var x=new XMLHttpRequest;
x.open("POST", 'https://content-people-pa.googleapis.com/v2/people?get_people_request.extension_set.extension_names=hangouts_phone_data&get_people_request.request_mask.include_field.paths=person.metadata&get_people_request.request_mask.include_field.paths=person.name&get_people_request.request_mask.include_field.paths=person.phone&get_people_request.request_mask.include_field.paths=person.photo&get_people_request.request_mask.include_container=CONTACT&get_people_request.request_mask.include_container=PROFILE&get_people_request.request_mask.include_container=DOMAIN_CONTACT&get_people_request.request_mask.include_container=DOMAIN_PROFILE&get_people_request.request_mask.include_container=PLACE&get_people_request.context.migration_options.use_new_request_mask_behavior=true&alt=json&prettyPrint=false',1);
x.setRequestHeader("Content-Type", "application/json");
x.setRequestHeader("Authorization",tok);
x.onreadystatechange=function(){if(x.readyState==4){
    if(canReAuth && x.status == 401 && resp401Unauth(x.response)){
        wvWipeAuthToken();
        getAuthToken(function(tok) {mkContact_t(false,tok,name,num,finish)});
    }
    else if(x.status != 200) {alert("status: "+x.status+"\nresp:"+x.response);finish && finish(x.response||-1);}
    else {finish && finish(false, JSON.parse(x.response))};
}};
x.send('{"name":{"display_name":'+JSON.stringify(name)+'},"phone":{"value":"+1'+num+'","type":""}}');
}

/*
https://www.google.com/m8/feeds/contacts/default/full
        "reason": "ACCESS_TOKEN_SCOPE_INSUFFICIENT",
        "domain": "googleapis.com",
        "metadata": {
          "service": "contacts.googleapis.com",
          "method": "google.contacts.v7.LegacyContacts.ContactsList"
*/

/*public*/
window.upContact = function (pid,name,url,urltype,finish){
    getAuthToken(function(tok) {upContact_t(true,tok,pid,name,url,urltype,finish)});
}
/*
//FAILS unless I add new scopes to auth token,
// "reason": "ACCESS_TOKEN_SCOPE_INSUFFICIENT",
// "domain": "googleapis.com",
// "metadata": {
// "service": "people.googleapis.com",
// "method": "google.people.v1.PeopleService.UpdateContact"
x.open("PATCH", 'https://content-people.googleapis.com/v1/people/'+pid+':updateContact?updatePersonFields=names',1);
x.setRequestHeader("Content-Type", "application/json");
x.send('{"etag":"'+etag+'","names":[{"displayName":'+JSON.stringify(name)+'}]}');
*/

// SUCCESS ON PUT
// fetch("https://people-pa.clients6.google.com/v2/people/c7759412948663455309?container=CONTACT&person_id=c7759412948663455309&field_mask=person.phone&get_people_request.extension_set.extension_names=phone_canonicalization&get_people_request.merged_person_source_options.person_model_params.person_model=CONTACT_CENTRIC&get_people_request.request_mask.include_field.paths=person.metadata&get_people_request.request_mask.include_field.paths=person.name&get_people_request.request_mask.include_field.paths=person.phone&get_people_request.request_mask.include_field.paths=person.photo&get_people_request.request_mask.include_container=CONTACT&get_people_request.request_mask.include_container=PROFILE&get_people_request.request_mask.include_container=DOMAIN_CONTACT&get_people_request.request_mask.include_container=DOMAIN_PROFILE&get_people_request.request_mask.include_container=PLACE&get_people_request.context.migration_options.use_new_request_mask_behavior=true&alt=json&key=AIzaSyDTYc1N4xiODyrQYK0Kl6g_y279LjYkrBg", {
  // "headers": {
    // "accept": "*/*",
    // "accept-language": "en-US,en;q=0.9",
    // "authorization": "SAPISIDHASH 1695864556_e584675de6c5b859ccd8de6cd35b0fd41dd23cd6",
    // "cache-control": "no-cache",
    // "content-type": "application/json",
    // "pragma": "no-cache",
    // "sec-ch-ua": "\"(Not(A:Brand\";v=\"8\", \"Chromium\";v=\"98\"",
    // "sec-ch-ua-mobile": "?0",
    // "sec-ch-ua-platform": "\"Windows\"",
    // "sec-fetch-dest": "empty",
    // "sec-fetch-mode": "cors",
    // "sec-fetch-site": "same-origin",
    // "x-client-data": "CIqMywE=",
    // "x-clientdetails": "appVersion=5.0%20(Windows%20NT%206.1%3B%20Win64%3B%20x64)%20AppleWebKit%2F537.36%20(KHTML%2C%20like%20Gecko)%20Chrome%2F98.0.5000.0%20Iron%20Safari%2F537.36&platform=Win32&userAgent=Mozilla%2F5.0%20(Windows%20NT%206.1%3B%20Win64%3B%20x64)%20AppleWebKit%2F537.36%20(KHTML%2C%20like%20Gecko)%20Chrome%2F98.0.5000.0%20Iron%20Safari%2F537.36",
    // "x-goog-authuser": "0",
    // "x-goog-encode-response-if-executable": "base64",
    // "x-javascript-user-agent": "google-api-javascript-client/1.1.0",
    // "x-origin": "https://voice.google.com",
    // "x-referer": "https://voice.google.com",
    // "x-requested-with": "XMLHttpRequest"
  // },
  // "referrer": "https://people-pa.clients6.google.com/static/proxy.html?usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.gapi.en.Ox0HebTIzao.O%2Fd%3D1%2Frs%3DAHpOoo9JBE0z9__nE4FgyS-eLRbRwEP9Gw%2Fm%3D__features__",
  // "referrerPolicy": "strict-origin-when-cross-origin",
  // "body": "{\"person_id\":\"c7759412948663455309\",\"metadata\":{\"identityInfo\":{\"sourceIds\":[{\"container\":\"CONTACT\",\"id\":\"70f05471d8c4fafa\",\"lastUpdatedMicros\":\"1695861730121050\",\"sourceEtag\":\"#nxpMTgIg+zc=\",\"containerType\":\"CONTACT\",\"lastUpdated\":\"2023-09-28T00:42:10.121050Z\"}]},\"model\":\"CONTACT_CENTRIC\"},\"phone\":[{\"metadata\":{\"writeable\":true,\"container\":\"CONTACT\",\"primary\":true,\"containerId\":\"7759412948663455309\",\"encodedContainerId\":\"70f05471d8c4fafa\",\"containerType\":\"CONTACT\"},\"value\":\"+17185554444\",\"canonicalizedForm\":\"+17185554444\",\"extendedData\":{\"structuredPhone\":{\"phoneNumber\":{\"e164\":\"+17185554444\",\"i18nData\":{\"nationalNumber\":\"(718) 555-4444\",\"internationalNumber\":\"+1 718-555-4444\",\"countryCode\":1,\"regionCode\":\"US\",\"isValid\":true,\"validationResult\":\"IS_POSSIBLE\"}}}},\"uri\":\"tel:+1-718-555-4444\"},{\"metadata\":{\"container\":\"CONTACT\"},\"value\":\"+17185554444\",\"type\":\"a1\"}]}",
  // "method": "PUT",
  // "mode": "cors",
  // "credentials": "include"
// });
/*
fetch("https://people-pa.clients6.google.com/v2/people?extension_set.extension_names=PHONE_CANONICALIZATION&merged_person_source_options.person_model_params.person_model=CONTACT_CENTRIC&person_id=c7759412948663455309&request_mask.include_field.paths=person.metadata&request_mask.include_field.paths=person.name&request_mask.include_field.paths=person.phone&request_mask.include_field.paths=person.photo&request_mask.include_container=CONTACT&request_mask.include_container=PROFILE&request_mask.include_container=DOMAIN_CONTACT&request_mask.include_container=DOMAIN_PROFILE&request_mask.include_container=PLACE&context.migration_options.use_new_request_mask_behavior=true&alt=json&key=AIzaSyDTYc1N4xiODyrQYK0Kl6g_y279LjYkrBg", {
  "headers": {
    "authorization": "SAPISIDHASH 1695864556_e584675de6c5b859ccd8de6cd35b0fd41dd23cd6",
  },
  "body": null,
  "method": "GET",
  "credentials": "include"
}).then(function(r) {
  r.json().then(function(r) {
    var sourceEtag = r.personResponse[0].person.metadata.identityInfo.sourceIds[0].sourceEtag;
    var body =
    {
    "person_id": "c7759412948663455309",
    "metadata": {
        "identityInfo": {
            "sourceIds": [
                {
                    "container": "CONTACT",
                    "id": "70f05471d8c4fafa",
                    "lastUpdatedMicros": "1695867249147073",
                    "sourceEtag": "#IMwxEC9LVBI=",
                    "containerType": "CONTACT",
                    "lastUpdated": "2023-09-28T02:14:09.147073Z"
                }
            ]
        },
        "model": "CONTACT_CENTRIC"
    },
    "name": [
        {
            "metadata": {
                "writeable": true,
                "container": "CONTACT",
                "primary": true,
                "containerId": "7759412948663455309",
                "encodedContainerId": "70f05471d8c4fafa",
                "containerType": "CONTACT"
            },
            "displayName": "hm 9",
            "givenName": "hm2",
            "displayNameLastFirst": "hm2",
            "unstructuredName": "hm2"
        }
    ]
}
;
body.metadata.identityInfo.sourceIds[0].sourceEtag = sourceEtag;
fetch("https://people-pa.clients6.google.com/v2/people/c7759412948663455309?container=CONTACT&person_id=c7759412948663455309&field_mask=person.name&get_people_request.extension_set.extension_names=phone_canonicalization&get_people_request.merged_person_source_options.person_model_params.person_model=CONTACT_CENTRIC&get_people_request.request_mask.include_field.paths=person.metadata&get_people_request.request_mask.include_field.paths=person.name&get_people_request.request_mask.include_field.paths=person.phone&get_people_request.request_mask.include_field.paths=person.photo&get_people_request.request_mask.include_container=CONTACT&get_people_request.request_mask.include_container=PROFILE&get_people_request.request_mask.include_container=DOMAIN_CONTACT&get_people_request.request_mask.include_container=DOMAIN_PROFILE&get_people_request.request_mask.include_container=PLACE&get_people_request.context.migration_options.use_new_request_mask_behavior=true&alt=json&key=AIzaSyDTYc1N4xiODyrQYK0Kl6g_y279LjYkrBg", {
  "headers": {
    "authorization": "SAPISIDHASH 1695864556_e584675de6c5b859ccd8de6cd35b0fd41dd23cd6",
    "content-type": "application/json",
  },
  "body": JSON.stringify(body),
  "method": "PUT",
  "credentials": "include"
});
  })
})
*/

//PUT Req research notes b4 fully rev eng
//etag root invalid, but fingerprint ok
//names root invalid, but name ok
//person root invalid
//fieldMask root invalid
//fieldMask.includeField in URL invalid
// content-people vs content-people-pa v2 ppl are 404 HTML vs specific codes
//403 scope PATCH https://content-people.googleapis.com/v1/people/c1269916725576986825:updateContact?updatePersonFields=names
//404 HTML  PATCH https://content-people.googleapis.com/v2/people/c1269916725576986825:updateContact?updatePersonFields=names
//404 HTML  PUT   https://content-people.googleapis.com/v2/people/c1269916725576986825:updateContact?updatePersonFields=names
//404 html  PATCH https://content-people-pa.googleapis.com/v2/people/c1269916725576986825:updateContact?updatePersonFields=names
//400 PUT         https://content-people-pa.googleapis.com/v2/people/c1269916725576986825:updateContact?updatePersonFields=names
//people-pa.googleapis.com doesn't allow authorization: SAPISIDHASH 1695864556_e584675de6c5b859ccd8de6cd35b0fd41dd23cd6
//people-pa.clients6.google.com does, prob domain and cookies inclusion
function upContact_t(canReAuth,tok,pid,name,url,urltype,finish){
var x=new XMLHttpRequest;
/* from GV Web UI */
x.open("GET", 'https://content-people-pa.googleapis.com/v2/people?extension_set.extension_names=PHONE_CANONICALIZATION&merged_person_source_options.person_model_params.person_model=CONTACT_CENTRIC&person_id='+pid+'&request_mask.include_field.paths=person.metadata&request_mask.include_field.paths=person.name&request_mask.include_field.paths=person.website&request_mask.include_container=CONTACT&request_mask.include_container=PROFILE&request_mask.include_container=DOMAIN_CONTACT&request_mask.include_container=DOMAIN_PROFILE&request_mask.include_container=PLACE&context.migration_options.use_new_request_mask_behavior=true&prettyPrint=false&alt=json',1);
x.setRequestHeader("Authorization",tok);
x.onreadystatechange=function(){
  var obj;
  if(x.readyState==4){
    if(canReAuth && x.status == 401 && resp401Unauth(x.response)){
        wvWipeAuthToken();
        getAuthToken(function(tok) {upContact_t(false,tok,pid,name,url,urltype,finish)});
    }
    else if(x.status != 200) {alert("status: "+x.status+"\nresp:"+x.response);finish && finish(x.response||-1);}
    else {
      var body = JSON.parse(x.response).personResponse[0];
      if(body.status == "SUCCESS") {
        body = body.person;
        if(name != null) {
          body.name[0].displayName = name;
        }
        if(url != null || urltype != null) {
          obj = (body.website = body.website || []);
          obj = (obj[0] = obj[0] || {});
          if(url) {
            obj.value = url
          }
          if(urltype) {
            obj.type = urltype;
            if (typeof obj.value !== 'string') {
              //must be 1 space, empty string causes no cloud save
              //and still missing website field on echo
              obj.value = ' ';
            }
          }
          obj.metadata = obj.metadata || {"container": "CONTACT"}; // or err 400
        }
        x = new XMLHttpRequest;
        /* from GV Web UI */
        x.open("PUT", 'https://content-people-pa.googleapis.com/v2/people/'+pid+'?container=CONTACT&person_id='+pid+(name != null?'&field_mask=person.name':'')+(url != null || urltype != null ?'&field_mask=person.website':'')+'&get_people_request.extension_set.extension_names=phone_canonicalization&get_people_request.merged_person_source_options.person_model_params.person_model=CONTACT_CENTRIC&get_people_request.request_mask.include_field.paths=person.name&get_people_request.request_mask.include_field.paths=person.website&get_people_request.request_mask.include_container=CONTACT&get_people_request.request_mask.include_container=PROFILE&get_people_request.request_mask.include_container=DOMAIN_CONTACT&get_people_request.request_mask.include_container=DOMAIN_PROFILE&get_people_request.request_mask.include_container=PLACE&get_people_request.context.migration_options.use_new_request_mask_behavior=true&prettyPrint=false&alt=json',1);
        x.setRequestHeader("Content-Type", "application/json");
        x.setRequestHeader("Authorization",tok);
        x.onreadystatechange=function(){if(x.readyState==4){
            if(x.status != 200) {alert("status: "+x.status+"\nresp:"+x.response);finish && finish(x.response||-1);}
            else {finish && finish(false, JSON.parse(x.response))};
        }};
        x.send(JSON.stringify(body));
      } else { //contact was deleted in another window
        alert("status: "+x.status+"\nresp:"+x.response);finish && finish(x.response||-1);
      }
    };
}};
x.send('');
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
x.setRequestHeader("Authorization",tok);
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
x.open("POST","https://www.googleapis.com/voice/v1/voiceclient/account/get?alt=protojson",1);
x.setRequestHeader("Content-Type", "application/json+protobuf");
x.setRequestHeader("Authorization",tok);
x.responseType = 'json';
x.onreadystatechange=function(){if(x.readyState==4){
    if(canReAuth && x.status == 401 && resp401Unauth(x.response)){
        wvWipeAuthToken();
        getAuthToken(function(tok) {getActInfo_t(false, tok, finish)});
    }
    else if(x.status != 200) {alert("status: "+x.status+"\nresp:"+x.response);finish && finish(x.response||-1);}
    else {
      if(finish) {
        //preprocess data, fields lost in higher level, oh well, can be reworked later
        //dont pass null as phone_arr down the API if no linked numbers
        var phone_arr = x.response[0][2][1] || [],
        resp = { primaryDid: /^\+1(.+)$/.exec(x.response[0][0])[1],
                 phone_arr: phone_arr};
        for (var i = 0; i < phone_arr.length; i++) {
          phone_arr[i] = /^\+1(.+)$/.exec(phone_arr[i][0][1])[1];
        }
        //old full json field names
        //phone_arr = resp.account.phones.linkedPhone;
        //primaryDid = /^\+1(.+)$/.exec(resp.account.primaryDid)[1];
        finish(false, resp)
      }
    }
}};
//arg1: unknown, no effect if 1
//arg2: extended info, if arg2 null, then resp.account.primaryDid and version field only timestamps
//arg3: type error if not null
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
        node.textContent = phone_arr[i];
        node.onclick = function (e){
            e.preventDefault();
            wvDocumentElement.replaceChild(oldBodyNode, newBodyNode);
            gcSavedProfImgEls();
            finish(false, e.target.textContent, primaryDid);
        };
        newBodyNode.appendChild(document.createElement('br'));
    }
     node = newBodyNode.appendChild(document.createElement('button'));
     node.textContent = "Cancel/Return";
     node.onclick = function (){
        wvDocumentElement.replaceChild(oldBodyNode, newBodyNode);
        gcSavedProfImgEls();
        finish("USER_CLICKED_CANCEL");
    };
    }
    else if (phone_arr.length == 1) {
        finish(false, phone_arr[0], primaryDid);
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
        getActInfo(function(err,resp,i){
        if (err) {
            finish(err);
        } else {
            err = JSON.parse(localStorage.getItem('gvauthobj'));
            phone_arr = err.linkedPhone = resp.phone_arr;
            primaryDid = err.primaryDid = resp.primaryDid;
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
/*public*/
window.mkCall = function (elem, destNum, dir, finish){
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

/*public*/
window.resp401Unauth = function (jstr) {
    try {
        jstr = JSON.parse(jstr);
        //https://github.com/grpc/grpc/blob/master/doc/statuscodes.md
        //16=UNAUTHENTICATED, for protojson contact name
        if (Array.isArray(jstr) && jstr[0] == 16 &&
            !jstr[1].indexOf('Request had invalid authentication credentials. Expected OAuth 2 access token')) {
            return true;
        } else {
            jstr = jstr.error;
            if (jstr && jstr.code == 401 &&
                (jstr.status == "UNAUTHENTICATED" ||
                    jstr.message == "Invalid Credentials")) {
                return true;
            }
        }
    } catch (e) {}
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
//size number has no effect on audio type, test 0 thru 4
//mtype, 2 == audio, 1 == video, 0 vcard and img
//finish(err, no_prefix_b64str_resp)
/*public*/
window.attachIDtoB64 = function (id, size, mtype, finish){
    getAuthToken(function(tok) {attachIDtoB64_t(true, tok, id, size, mtype, finish)});
}
function attachIDtoB64_t(canReAuth, tok, id, size, mtype, finish){
var x=new XMLHttpRequest;
x.open("POST","https://www.googleapis.com/voice/v1/voiceclient/attachments/get?alt=json&prettyPrint=false",1);
x.setRequestHeader("Content-Type", "application/json+protobuf");
x.setRequestHeader("Authorization",tok);
x.onreadystatechange=function(){if(x.readyState==4){
    if(canReAuth && x.status == 401 && resp401Unauth(x.response)){
        wvWipeAuthToken();
        getAuthToken(function(tok) {attachIDtoB64_t(false, tok, id, size, mtype, finish)});
    }
    else if(x.status != 200) {alert("status: "+x.status+"\nresp:"+x.response);finish && finish(x.response||-1);}
    else {
        if(finish){
            x = JSON.parse(x.response); //freq sort
            finish(false,
              (x.imageContent || x.videoContent || x.audioContent || x.vcardContent).content
              //GAPI returns a "url safe b64" string that is not allowed in
              //data URLs, not reg b64, convert to reg b64
              .replace(/-/g, "+") // 62nd char of encoding
              .replace(/_/g, "/")); // 63rd char of encoding
        }
    }
}};
//rev eng from android app
x.send('["'+id+'",'+size+','+(mtype==2?'null,null,[1]]':mtype==1?'null,[1,[null,null,null,null,0,null,1]]]':'1]'));
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
x.setRequestHeader("Authorization",tok);
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
/*public*/
window.chkNewMsg = function (num, finish){
    getAuthToken(function(tok) {chkNewMsg_t(true, tok, num, finish)});
}
function chkNewMsg_t(canReAuth, tok, num, finish){
var x=new XMLHttpRequest;
x.open("POST","https://www.googleapis.com/voice/v1/voiceclient/api2thread/get",1);
x.setRequestHeader("Content-Type", "application/json+protobuf");
x.setRequestHeader("Authorization",tok);
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
x.send('["t.'+num+'",1]');
}

function getProxyNumWithSrc(sourceNum, destNum, finish){
    getAuthToken(function(tok) {getProxyNumWithSrc_t(true, tok, sourceNum, destNum, finish)});
}
function getProxyNumWithSrc_t(canReAuth, tok, sourceNum, destNum, finish){
var x=new XMLHttpRequest;
//x.open("POST","https://www.googleapis.com/voice/v1/voiceclient/api2thread/get",1);
x.open("POST","https://www.googleapis.com/voice/v1/proxynumbers/reserve?alt=json&prettyPrint=false",1);
x.setRequestHeader("Content-Type", "application/json+protobuf");
x.setRequestHeader("Authorization",tok);
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


//resp is array [name, peopleID]
/*public*/
window.getContactName = function (num, finish){
    getAuthToken(function(tok) {getContactName_t(true, tok, num, finish)});
}
function getContactName_t(canReAuth, tok, num, finish){
var x=new XMLHttpRequest;
//I dont have the scope, and gauth wont let me add it
//x.open("GET","https://content-people.googleapis.com/v1/people:searchContacts?query=1"+num+"&readMask=names&fields=results.person.names.displayName&prettyPrint=false",1);
x.open("GET","https://content-people-pa.googleapis.com/v2/people/lookup?extension_set.extension_names=HANGOUTS_PHONE_DATA&extension_set.extension_names=CALLER_ID_LOOKUPS&merged_person_source_options.person_model_params.person_model=CONTACT_CENTRIC&id=%2B1"+num+"&match_type=LENIENT&type=PHONE&quota_filter_type=PHONE&request_mask.include_field.paths=person.name&request_mask.include_field.paths=person.website"+""/*&prettyPrint=false*/+"&alt=protojson",1);
x.setRequestHeader("Authorization",tok);
x.onreadystatechange=function(){
    var obj;
    if(x.readyState==4){
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
            x = JSON.parse(x);
            obj = x[1][0][1];
            x = [ obj[2][0][1], //name
                  x[0][0][1][0], //pid
                  obj[6] && obj[6][0][1],// website URL
                  obj[6] && obj[6][0][2],// website type, [3] is formattedType
//website member has a same level as the link, metadata: {
//"writeable": true,"container": "CONTACT","primary": true
//,"containerId": "887544146487",
//"encodedContainerId": "89365765f6af453fd82c92a83c0d4f30","containerType": "CONTACT"}
//its not interesting to us
                ];
        }
        finish(false, x);
    }
}};
x.send();
}

//IIFE
})();
