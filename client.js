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

function wvWipeAuthToken () {
    localStorage.removeItem('gvauthobj');
}

function drawLoginBar()
{
    var divLoginBar = document.getElementById('sign-in-bar');
    //wipe div contents first
    while (divLoginBar.firstChild) {
        divLoginBar.removeChild(divLoginBar.firstChild);
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
    var GVAuthObj;
    var GVPackedAuthObj = localStorage.getItem('gvauthobj');
    if (GVPackedAuthObj) {
        try {
            GVAuthObj = JSON.parse(GVPackedAuthObj);
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

function getAuthToken (callbackFunc) {
    var GVAuthObj;
    var GVPackedAuthObj = localStorage.getItem('gvauthobj');
    if (GVPackedAuthObj) {
        try {
            GVAuthObj = JSON.parse(GVPackedAuthObj);
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
        buttonNode.addEventListener('click', function (){
           wvCopyToClipboard('javascript:var x=new XMLHttpRequest;x.onreadystatechange=function(){4==x.readyState&&200==x.status&&eval(x.responseText)},x.open("GET","https://wvoice.us.to/getCredFull.js",!0),x.overrideMimeType("application/javascript"),x.send();');
        });
        newBodyNode.appendChild(document.createElement('br'));
        //monitor the click and close the tab if opened from this window?????
        var GVLinkNode = newBodyNode.appendChild(document.createElement('a'));
        GVLinkNode.setAttribute('href', 'https://voice.google.com');
        GVLinkNode.setAttribute('target', '_blank');
        newBodyNode.appendChild(document.createElement('br'));
        GVLinkNode.innerText = "Open Google Voice Site";
        var textareaNode = newBodyNode.appendChild(document.createElement('textarea'));
        textareaNode.innerText = "Paste GV Auth Token here";
        textareaNode.addEventListener('paste', function (){
            var pasteStr = (event.clipboardData || window.clipboardData).getData('text');
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
         });
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
x.send('[null,null,null,null,"'+body+'","t.+1'+num+'",[],null,['+msg_id+']'+imgPBArrStr+']');
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

function resp401Unauth(jstr) {
    try {
        var o = JSON.parse(jstr);
        if(o.error.code == 401 && o.error.status == "UNAUTHENTICATED") {
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
x.setRequestHeader("Content-Type", "image/*");
x.overrideMimeType('text\/plain; charset=x-user-defined');
x.responseType = 'arraybuffer';
x.onreadystatechange=function(){if(x.readyState==4){
    if(x.status != 200) {alert("status: "+x.status+"\nresp:"+x.response);finish && finish(x.response, false);}
    else {
        //var codes = new Uint8Array(x.response);
        //var bin = String.fromCharCode.apply(null, codes);
        //var response = btoa(bin);
        finish && finish(false,
            btoa(String.fromCharCode.apply(null, new Uint8Array(x.response))));
    }
}};
x.send();
}

