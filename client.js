function wipeAuthToken () {
    localStorage.removeItem('gvauthobj');
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
         var oldBodyNode = document.documentElement.removeChild(document.documentElement.childNodes[1]);
         var newBodyNode = document.documentElement.appendChild(document.createElement('body'));
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
                if(!('access_token' in GVAuthObj)) {
                    alert("No GV Auth data found in pasted string:\n\n"+pasteStr);
                    GVAuthObj = undefined;
                }
            } catch (e) {
                alert("No GV Auth data found in pasted string:\n\n"+pasteStr);
                GVAuthObj = undefined;
            }
            if (GVAuthObj) {
                localStorage.setItem('gvauthobj',pasteStr);
                callbackFunc(GVAuthObj.access_token);
            } else {
                callbackFunc("USER_PASTED_UNKNOWN_AUTH_INFO"); //dont make events silently disappear
            }
            document.documentElement.replaceChild(oldBodyNode, newBodyNode);
         });
         newBodyNode.appendChild(document.createElement('br'));
         var buttonNode = newBodyNode.appendChild(document.createElement('button'));
         buttonNode.innerText = "Cancel/Return";
         buttonNode.addEventListener('click', function (){
            callbackFunc("USER_CLICKED_CANCEL"); //dont make events silently disappear
            document.documentElement.replaceChild(oldBodyNode, newBodyNode);
         });
    }
}

function joinArrayToInt (a) {
            return a.map(function(b) {
                b = b.toString(16);
                return 1 < b.length ? b : "0" + b
            }).join("");
}

function sendsms(num, body){
    getAuthToken(function(tok) {sendsms_t(tok, num, body)});
}
function sendsms_t(tok, num, body){
var msg_id = new Uint8Array(6);
crypto.getRandomValues(msg_id);
msg_id = parseInt(joinArrayToInt(msg_id), 16).toString();
var x=new XMLHttpRequest;
x.open("POST","https://content.googleapis.com/voice/v1/voiceclient/api2thread/sendsms?alt=protojson",1);
x.setRequestHeader("Content-Type", "application/json+protobuf; charset=UTF-8");
x.setRequestHeader("Authorization","Bearer "+tok);
x.withCredentials=1;
x.onreadystatechange=function(){if(x.readyState==4){
if(x.status != 200) {alert("status: "+x.status+"\nresp:"+x.response)}}};
x.send('[null,null,null,null,"'+body+'","t.+1'+num+'",[],null,['+msg_id+']]');
}
