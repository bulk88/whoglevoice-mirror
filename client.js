/* triggerElement, UI element that user interacted with to trigger the
   copy, it will be replaced with a text box if browser doesn't support
   programmatic copy */
function wvCopyToClipboard(text, triggerElem) {
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
} catch(e) {
    alert("Copy Failed: "+e);
    r = document.createElement("textarea");
    r.value = text;
    r = document.createElement("label").appendChild(r).parentNode;
    r.insertBefore(document.createTextNode("Auto Copy failed. Copy this manually:"),r.firstChild);
    triggerElem.parentNode.insertBefore(r, triggerElem.nextSibling);
    triggerElem.parentNode.removeChild(triggerElem);
    r.lastChild.select();
}
document.body.removeChild(input);
}

function wvWipeAuthToken () {
    localStorage.removeItem('gvauthobj');
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
    var email = lazySignedInEmail();
    if (email.length) {
        divLoginBar.appendChild(document.createTextNode("Signed in: "+email));
        var buttonNode = divLoginBar.appendChild(document.createElement('button'));
        buttonNode.innerText = "Logout";
        buttonNode.addEventListener('click', function (){
            wvWipeAuthToken()
            drawLoginBar()
        });
    } else {
        divLoginBar.appendChild(document.createTextNode("Logged out"));
        var buttonNode = divLoginBar.appendChild(document.createElement('button'));
        buttonNode.innerText = "Login";
        buttonNode.addEventListener('click', function (){
            getAuthToken(function(){drawLoginBar()});
        });
    }
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

function getAuthToken (callbackFunc) {
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
        var oldBodyNode = document.documentElement.removeChild(document.documentElement.getElementsByTagName('body')[0]);
        var newBodyNode = document.documentElement.appendChild(document.createElement('body'));
        var buttonNode = newBodyNode.appendChild(document.createElement('button'));
        buttonNode.innerText = "Copy to Clipboard Bookmarklet to run on GV";
        buttonNode.addEventListener('click', function (evt){
        //http!!!! because Android 4.1.2 SSL too old to talk to github pages SSL
           wvCopyToClipboard('javascript:var x=new XMLHttpRequest;x.onreadystatechange=function(){4==x.readyState&&200==x.status&&eval(x.responseText)},x.open("GET","http://wvoice.us.to/getCredFull.js",!0),x.overrideMimeType("application/javascript"),x.send();',evt.target);
        });
        newBodyNode.appendChild(document.createElement('br'));
        //monitor the click and close the tab if opened from this window?????
        var GVLinkNode = newBodyNode.appendChild(document.createElement('a'));
        GVLinkNode.setAttribute('href', 'https://voice.google.com/about');
        GVLinkNode.setAttribute('target', '_blank');
        newBodyNode.appendChild(document.createElement('br'));
        GVLinkNode.innerText = "Open Google Voice Site";
        var textareaNode = newBodyNode.appendChild(document.createElement('textarea'));
        textareaNode.placeholder = "Paste GV Auth Token here";
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
            document.documentElement.replaceChild(oldBodyNode, newBodyNode);
            if (GVAuthObj) {
                localStorage.setItem('gvauthobj',pasteStr);
                callbackFunc(GVAuthObj.access_token);
            } else {
                callbackFunc("USER_PASTED_UNKNOWN_AUTH_INFO"); //dont make events silently disappear
            }
         };
         textareaNode.addEventListener('input', gotAuthPasteCB);
         textareaNode.addEventListener('paste', gotAuthPasteCB);
         newBodyNode.appendChild(document.createElement('br'));
         var buttonNode = newBodyNode.appendChild(document.createElement('button'));
         buttonNode.innerText = "Cancel/Return";
         buttonNode.addEventListener('click', function (){
            document.documentElement.replaceChild(oldBodyNode, newBodyNode);
            callbackFunc("USER_CLICKED_CANCEL"); //dont make events silently disappear
         });
    }
}

function joinArrayToInt (a) {
            return a.map(function(b) {
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


//img is http URL or bytes in a string or false (no img)
function sendsms(num, body, img, finish){
    getAuthToken(function(tok) {sendsms_t(true, tok, num, body, img, finish)});
}
function sendsms_t(canReAuth, tok, num, body, img, finish){
var msg_id = new Uint8Array(6);
crypto.getRandomValues(msg_id);
msg_id = parseInt(joinArrayToInt(msg_id), 16).toString();
var x=new XMLHttpRequest;
x.open("POST","https://content.googleapis.com/voice/v1/voiceclient/api2thread/sendsms?alt=protojson",1);
x.setRequestHeader("Content-Type", "application/json+protobuf; charset=UTF-8");
x.setRequestHeader("Authorization","Bearer "+tok);
x.withCredentials=1;
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
    if(x.status != 200) {alert("status: "+x.status+"\nresp:"+x.response);finish && finish(x.response);}
    else {finish && finish(false)};
}};
//commented out encoding is GV Web typ, BUTTTT, it only works for old threads
//on virgin threads GAPI returns
//GV Web knows for virgin numbers to put tel num in array, tel num in array
//always works virgin or old thread
//x.send('[null,null,null,null,"'+body+'","t.+1'+num+'",[],null,['+msg_id+']'+imgPBArrStr+']');
x.send('[null,null,null,null,"'+body+'",null, ["+1'+num+'"], null,['+msg_id+']'+imgPBArrStr+']');
}

//finish(err, resp)
function getThread(num,finish){
    getAuthToken(function(tok) {getThread_t(true, tok, num, finish)});
}
function getThread_t(canReAuth, tok, num, finish){
var x=new XMLHttpRequest;
x.open("POST","https://content.googleapis.com/voice/v1/voiceclient/api2thread/get?alt=json",1);
x.setRequestHeader("Content-Type", "application/json+protobuf; charset=UTF-8");
x.setRequestHeader("Authorization","Bearer "+tok);
x.withCredentials=1;
x.onreadystatechange=function(){if(x.readyState==4){
    if(canReAuth && x.status == 401 && resp401Unauth(x.response)){
        wvWipeAuthToken();
        getAuthToken(function(tok) {getThread_t(false, tok, num, finish)});
    }
    if(x.status != 200) {x.status == 404 || alert("status: "+x.status+"\nresp:"+x.response);finish && finish(x.response);}
    else {finish && finish(false, JSON.parse(x.response))};
}};
//100 is how many messages to get, after the 100 is pagenation token for loading next batch in chat log
//last array purpose UNK, "uninit true true" is a const
//          , dI = function() {
        //    var a = new bI;
        //    a = u(a, 2, !0);
        //    return u(a, 3, !0)
        //};
x.send('["t.+1'+num+'", 100, null, [null, true, true]]');
}

function mkContact(name,num,finish){
    getAuthToken(function(tok) {mkContact_t(true,tok,name,num,finish)});
}
/*not sure what app I got this link this link from, but google's CORS headers only
return true for CORS if Referer/Origin is voice.google.com */
function mkContact_t(canReAuth,tok,name,num,finish){
var x=new XMLHttpRequest;
x.open("POST","https://cp.wvoice.workers.dev/corsproxy/?apiurl="+encodeURIComponent('https://content-people-pa.googleapis.com/v2/people?get_people_request.extension_set.extension_names=hangouts_phone_data&get_people_request.request_mask.include_field.paths=person.metadata&get_people_request.request_mask.include_field.paths=person.name&get_people_request.request_mask.include_field.paths=person.phone&get_people_request.request_mask.include_field.paths=person.photo&get_people_request.request_mask.include_container=CONTACT&get_people_request.request_mask.include_container=PROFILE&get_people_request.request_mask.include_container=DOMAIN_CONTACT&get_people_request.request_mask.include_container=DOMAIN_PROFILE&get_people_request.request_mask.include_container=PLACE&get_people_request.context.migration_options.use_new_request_mask_behavior=true&alt=json'),1);
x.setRequestHeader("Content-Type", "application/json");
x.setRequestHeader("Authorization","Bearer "+tok);
x.withCredentials=1;
x.onreadystatechange=function(){if(x.readyState==4){
    if(canReAuth && x.status == 401 && resp401Unauth(x.response)){
        wvWipeAuthToken();
        getAuthToken(function(tok) {mkContact_t(false,tok,name,num,finish)});
    }
    if(x.status != 200) {alert("status: "+x.status+"\nresp:"+x.response);finish && finish(x.response);}
    else {finish && finish(false)};
}};
x.send('{"name":{"display_name":"'+name+'"},"phone":{"value":"+1'+num+'","type":""}}');
}

//sourceNum MUST be a verified linked num in GV, can't be random or else
//"code": 404,
//  "message": "voice_error: {\"error_code\":\"NOT_FOUND\"}"
function mkCallWithSrc(sourceNum, destNum, finish){
    getAuthToken(function(tok) {mkCallWithSrc_t(true, tok, sourceNum, destNum, finish)});
}
function mkCallWithSrc_t(canReAuth, tok, sourceNum, destNum, finish){
var x=new XMLHttpRequest;
x.open("POST","https://content.googleapis.com/voice/v1/voiceclient/communication/startclicktocall?alt=protojson",1);
x.setRequestHeader("Content-Type", "application/json+protobuf; charset=UTF-8");
x.setRequestHeader("Authorization","Bearer "+tok);
x.withCredentials=1;
x.onreadystatechange=function(){if(x.readyState==4){
    if(canReAuth && x.status == 401 && resp401Unauth(x.response)){
        wvWipeAuthToken();
        getAuthToken(function(tok) {mkCallWithSrc_t(false, tok, sourceNum, destNum, finish)});
    }
    //204 NO RESPONSE, 0 bytes is correct
    if(x.status != 204) {alert("status: "+x.status+"\nresp:"+x.response);finish && finish(x.response);}
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
x.open("POST","https://content.googleapis.com/voice/v1/voiceclient/account/get?alt=json",1);
x.setRequestHeader("Content-Type", "application/json+protobuf; charset=UTF-8");
x.setRequestHeader("Authorization","Bearer "+tok);
x.withCredentials=1;
x.onreadystatechange=function(){if(x.readyState==4){
    if(canReAuth && x.status == 401 && resp401Unauth(x.response)){
        wvWipeAuthToken();
        getAuthToken(function(tok) {getActInfo_t(false, tok, finish)});
    }
    if(x.status != 200) {alert("status: "+x.status+"\nresp:"+x.response);finish && finish(x.response);}
    else {finish && finish(false, JSON.parse(x.response))};
}};
x.send('[null, 1]');
}

//finish(err, sourceNum)
function getSourceNum(finish){
    getActInfo(function(err,resp){
    if (err == false) {
        var phone_arr = resp.account.phones.linked_phone;
        if (phone_arr.length > 1) {
        var oldBodyNode = document.documentElement.removeChild(document.documentElement.getElementsByTagName('body')[0]);
        var newBodyNode = document.documentElement.appendChild(document.createElement('body'));
        newBodyNode.appendChild(document.createTextNode("Pick Outgoing Number:"));
        newBodyNode.appendChild(document.createElement('br'));
        var i;
        for (i = 0; i < phone_arr.length; i++) {
            var aNode = newBodyNode.appendChild(document.createElement('a'));
            aNode.setAttribute('href', '#');
            var num = phone_arr[i].phone_number.e164;
            var match = /^\+1(.+)$/.exec(num);
            aNode.innerText = match[1];
            aNode.addEventListener('click', function (e){
                e.preventDefault();
                document.documentElement.replaceChild(oldBodyNode, newBodyNode);
                finish(false, e.target.innerText);
            });
            newBodyNode.appendChild(document.createElement('br'));
        }
         var buttonNode = newBodyNode.appendChild(document.createElement('button'));
         buttonNode.innerText = "Cancel/Return";
         buttonNode.addEventListener('click', function (){
            document.documentElement.replaceChild(oldBodyNode, newBodyNode);
            finish("USER_CLICKED_CANCEL");
         });
        } else if (phone_arr.length == 1) {
            var num = phone_arr[0].phone_number.e164;
            var match = /^\+1(.+)$/.exec(num);
            finish(false, match[1]);
        }
        else {
            alert("This account has no linked phone numbers for outgoing calls");
            finish("NO_LINKED_LINES_AVAILABLE");
        }
    } else {
        finish(err);
    }
    });
}

//finish(err)
//not called if no Source Num, will ask user with blocking UI if
//Account has multiple source numbers, getting source number each time
//is about 180 ms delay, oh well
function mkCall(destNum, finish){
    getSourceNum(function(err, sourceNum) {
        if (err == false) {
            mkCallWithSrc(sourceNum, destNum, finish);
        } else {
            finish(err);
        }
    });
}

function resp401Unauth(jstr) {
    try {
        jstr = JSON.parse(jstr);
        if(jstr.error.code == 401 && jstr.error.status == "UNAUTHENTICATED") {
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
    if(x.status != 200) {alert("status: "+x.status+"\nresp:"+x.response);finish && finish(x.response, false);}
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
function attachIDtoB64(id, size, finish){
    getAuthToken(function(tok) {attachIDtoB64_t(true, tok, id, size, finish)});
}
function attachIDtoB64_t(canReAuth, tok, id, size, finish){
var x=new XMLHttpRequest;
x.open("POST","https://content.googleapis.com/voice/v1/voiceclient/attachments/get?alt=json",1);
x.setRequestHeader("Content-Type", "application/json+protobuf; charset=UTF-8");
x.setRequestHeader("Authorization","Bearer "+tok);
x.withCredentials=1;
x.onreadystatechange=function(){if(x.readyState==4){
    if(canReAuth && x.status == 401 && resp401Unauth(x.response)){
        wvWipeAuthToken();
        getAuthToken(function(tok) {attachIDtoB64_t(false, tok, id, size, finish)});
    }
    if(x.status != 200) {alert("status: "+x.status+"\nresp:"+x.response);finish && finish(x.response);}
    else {
        if(finish){
            var b64 = JSON.parse(x.response).image_content.content;
            //GAPI returns a "url safe b64" string that is not allowed in
            //data URLs, not reg b64, convert to reg b64
            b64 = b64.replace(/-/g, "+"); // 62nd char of encoding
            b64 = b64.replace(/_/g, "/"); // 63rd char of encoding
            finish(false, b64);
        }
    }
}};
x.send('["'+id+'",'+size+',1]');
}
