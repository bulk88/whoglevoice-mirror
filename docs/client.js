function wvCopyToClipboard(t,n){var e,o=document.createElement("input");o.value=t,document.body.appendChild(o),o.select(),o.setSelectionRange(0,99999);try{if(r=document.execCommand("copy"),!r)throw'document.execCommand("copy") returned false';e=1}catch(e){alert("Copy Failed: "+e),r=document.createElement("textarea"),r.value=t,r=document.createElement("label").appendChild(r).parentNode,r.insertBefore(document.createTextNode("Auto Copy failed. Copy this manually:"),r.firstChild),n.parentNode.insertBefore(r,n.nextSibling),n.parentNode.removeChild(n),r.lastChild.select()}return document.body.removeChild(o),e}function wvWipeAuthToken(){localStorage.removeItem("gvauthobj")}function drawLoginBar(){var e=document.getElementById("sign-in-bar");if(e){for(;e.lastChild;)e.removeChild(e.lastChild);var t,n=lazySignedInEmail();n.length?(e.appendChild(document.createTextNode("Signed in: "+n)),(t=e.appendChild(document.createElement("button"))).innerText="Logout",t.addEventListener("click",function(){wvWipeAuthToken(),drawLoginBar()})):(e.appendChild(document.createTextNode("Logged out")),(t=e.appendChild(document.createElement("button"))).innerText="Login",t.addEventListener("click",function(){getAuthToken(function(){})}))}}function lazySignedInEmail(){var t=localStorage.getItem("gvauthobj");if(t)try{"access_token"in(t=JSON.parse(t))||(t=void 0)}catch(e){t=void 0}return t?t.profile.email:""}function lazySignedInUserIndex(){var t=localStorage.getItem("gvauthobj");if(t)try{"access_token"in(t=JSON.parse(t))||(t=void 0)}catch(e){t=void 0}if(t)return t.session_state.extraQueryParams.authuser;throw"Not logged in."}function getAuthToken(n){var o,a,e,t,r,s,i=localStorage.getItem("gvauthobj");if(i)try{"access_token"in(i=JSON.parse(i))||(i=void 0)}catch(e){i=void 0}i?n(i.access_token):(o=document.documentElement.removeChild(document.documentElement.getElementsByTagName("body")[0]),(s=(a=document.documentElement.appendChild(document.createElement("body"))).appendChild(document.createElement("button"))).innerText="Copy to Clipboard Bookmarklet to run on GV",s.addEventListener("click",function(e){wvCopyToClipboard('javascript:var e=new XMLHttpRequest;e.onreadystatechange=function(){4==e.readyState&&200==e.status&&eval(e.responseText)};e.open("GET","https://wvoice.us.to/getCredFull.js",!0);e.overrideMimeType("application/javascript");e.send();',e.target)}),a.appendChild(document.createElement("br")),(e=a.appendChild(document.createElement("a"))).setAttribute("href","https://voice.google.com/about"),e.setAttribute("target","_blank"),a.appendChild(document.createElement("br")),e.innerText="Open Google Voice Site",(t=a.appendChild(document.createElement("textarea"))).placeholder="Paste GV Auth Token here",r=function(e){var t="input"==e.type?e.target.value:(e.clipboardData||event&&event.clipboardData||window.clipboardData).getData("text");try{"access_token"in(i=JSON.parse(t))||(alert("No GV Auth data found in pasted string:\n\n"+t),i=void 0)}catch(e){alert("No GV Auth data found in pasted string:\n\n"+t),i=void 0}document.documentElement.replaceChild(o,a),i?(localStorage.setItem("gvauthobj",t),n(i.access_token)):n("USER_PASTED_UNKNOWN_AUTH_INFO"),drawLoginBar()},t.addEventListener("input",r),t.addEventListener("paste",r),a.appendChild(document.createElement("br")),(s=a.appendChild(document.createElement("button"))).innerText="Cancel/Return",s.addEventListener("click",function(){document.documentElement.replaceChild(o,a),n("USER_CLICKED_CANCEL"),drawLoginBar()}),navigator.clipboard&&((s=a.appendChild(document.createElement("button"))).innerText="Paste",s.addEventListener("click",function(e){navigator.clipboard.readText().then(function(e){r({type:"input",target:{value:e}})}).catch(function(){e.target.previousSibling.click()})})))}function joinArrayToInt(e){return e.map(function(e){return 1<(e=e.toString(16)).length?e:"0"+e}).join("")}function sendsms(t,n,o,a){getAuthToken(function(e){sendsms_t(!0,e,t,n,o,a)})}function sendsms_t(e,t,n,o,a,r){var s=new Uint8Array(6);crypto.getRandomValues(s),s=parseInt(joinArrayToInt(s),16).toString();var i=new XMLHttpRequest;i.open("POST","https://content.googleapis.com/voice/v1/voiceclient/api2thread/sendsms?alt=protojson",1),i.setRequestHeader("Content-Type","application/json+protobuf; charset=UTF-8"),i.setRequestHeader("Authorization","Bearer "+t),i.withCredentials=1;var u="";if(a)if(/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(a)){if(!/^https:\/\/lh3\.googleusercontent\.com/.test(a)){var c="This IMG URL isn't from lh3.googleusercontent.com, GV will not accept it. Bad URL is\n\n"+a;throw alert(c),c}u=',[1,null,null,"'+a+'"]'}else u=',[1,"'+a+'",null,null]';i.onreadystatechange=function(){4==i.readyState&&(e&&401==i.status&&resp401Unauth(i.response)&&(wvWipeAuthToken(),getAuthToken(function(e){sendsms_t(!1,e,n,o,a,r)})),200!=i.status?(alert("status: "+i.status+"\nresp:"+i.response),r&&r(i.response)):r&&r(!1))},i.send('[null,null,null,null,"'+o+'",null,["+1'+n+'"],null,['+s+"]"+u+"]")}function getThread(t,n,o,a){getAuthToken(function(e){getThread_t(!0,e,t,n,o,a)})}function getThread_t(e,t,n,o,a,r){var s=new XMLHttpRequest;s.open("POST","https://content.googleapis.com/voice/v1/voiceclient/api2thread/get?alt=json",1),s.setRequestHeader("Content-Type","application/json+protobuf"),s.setRequestHeader("Authorization","Bearer "+t),s.withCredentials=1,s.onreadystatechange=function(){4==s.readyState&&(e&&401==s.status&&resp401Unauth(s.response)&&(wvWipeAuthToken(),getAuthToken(function(e){getThread_t(!1,e,n,o,a,r)})),200!=s.status?(404==s.status||alert("status: "+s.status+"\nresp:"+s.response),a&&a(s.response)):a&&a(!1,JSON.parse(s.response)))},s.send('["t.+1'+n+'",'+(r||100)+","+(o?'"'+o+'"':"null")+"]")}function mkContact(t,n,o){getAuthToken(function(e){mkContact_t(!0,e,t,n,o)})}function mkContact_t(e,t,n,o,a){var r=new XMLHttpRequest;r.open("POST","https://cp.wvoice.workers.dev/corsproxy/?apiurl="+encodeURIComponent("https://content-people-pa.googleapis.com/v2/people?get_people_request.extension_set.extension_names=hangouts_phone_data&get_people_request.request_mask.include_field.paths=person.metadata&get_people_request.request_mask.include_field.paths=person.name&get_people_request.request_mask.include_field.paths=person.phone&get_people_request.request_mask.include_field.paths=person.photo&get_people_request.request_mask.include_container=CONTACT&get_people_request.request_mask.include_container=PROFILE&get_people_request.request_mask.include_container=DOMAIN_CONTACT&get_people_request.request_mask.include_container=DOMAIN_PROFILE&get_people_request.request_mask.include_container=PLACE&get_people_request.context.migration_options.use_new_request_mask_behavior=true&alt=json"),1),r.setRequestHeader("Content-Type","application/json"),r.setRequestHeader("Authorization","Bearer "+t),r.withCredentials=1,r.onreadystatechange=function(){4==r.readyState&&(e&&401==r.status&&resp401Unauth(r.response)&&(wvWipeAuthToken(),getAuthToken(function(e){mkContact_t(!1,e,n,o,a)})),200!=r.status?(alert("status: "+r.status+"\nresp:"+r.response),a&&a(r.response)):a&&a(!1))},r.send('{"name":{"display_name":"'+n+'"},"phone":{"value":"+1'+o+'","type":""}}')}function mkCallWithSrc(t,n,o){getAuthToken(function(e){mkCallWithSrc_t(!0,e,t,n,o)})}function mkCallWithSrc_t(e,t,n,o,a){var r=new XMLHttpRequest;r.open("POST","https://content.googleapis.com/voice/v1/voiceclient/communication/startclicktocall?alt=protojson",1),r.setRequestHeader("Content-Type","application/json+protobuf"),r.setRequestHeader("Authorization","Bearer "+t),r.withCredentials=1,r.onreadystatechange=function(){4==r.readyState&&(e&&401==r.status&&resp401Unauth(r.response)&&(wvWipeAuthToken(),getAuthToken(function(e){mkCallWithSrc_t(!1,e,n,o,a)})),204!=r.status?(alert("status: "+r.status+"\nresp:"+r.response),a&&a(r.response)):a&&a(!1))},r.send('[["phnnmbr","+1'+o+'"],["phnnmbr","+1'+n+'"]]')}function getActInfo(t){getAuthToken(function(e){getActInfo_t(!0,e,t)})}function getActInfo_t(e,t,n){var o=new XMLHttpRequest;o.open("POST","https://content.googleapis.com/voice/v1/voiceclient/account/get?alt=json",1),o.setRequestHeader("Content-Type","application/json+protobuf"),o.setRequestHeader("Authorization","Bearer "+t),o.withCredentials=1,o.onreadystatechange=function(){4==o.readyState&&(e&&401==o.status&&resp401Unauth(o.response)&&(wvWipeAuthToken(),getAuthToken(function(e){getActInfo_t(!1,e,n)})),200!=o.status?(alert("status: "+o.status+"\nresp:"+o.response),n&&n(o.response)):n&&n(!1,JSON.parse(o.response)))},o.send("[null,1]")}function getSourceNum(l){getActInfo(function(e,t){if(0==e){var n=t.account.phones.linked_phone;if(1<n.length){var o,a=document.documentElement.removeChild(document.documentElement.getElementsByTagName("body")[0]),r=document.documentElement.appendChild(document.createElement("body"));for(r.appendChild(document.createTextNode("Pick Outgoing Number:")),r.appendChild(document.createElement("br")),o=0;o<n.length;o++){var s=r.appendChild(document.createElement("a"));s.setAttribute("href","#");var i=n[o].phone_number.e164,u=/^\+1(.+)$/.exec(i);s.innerText=u[1],s.addEventListener("click",function(e){e.preventDefault(),document.documentElement.replaceChild(a,r),l(!1,e.target.innerText)}),r.appendChild(document.createElement("br"))}var c=r.appendChild(document.createElement("button"));c.innerText="Cancel/Return",c.addEventListener("click",function(){document.documentElement.replaceChild(a,r),l("USER_CLICKED_CANCEL")})}else{1==n.length?(i=n[0].phone_number.e164,u=/^\+1(.+)$/.exec(i),l(!1,u[1])):(alert("This account has no linked phone numbers for outgoing calls"),l("NO_LINKED_LINES_AVAILABLE"))}}else l(e)})}function mkCall(n,o){getSourceNum(function(e,t){0==e?mkCallWithSrc(t,n,o):o(e)})}function resp401Unauth(e){try{if((e=JSON.parse(e).error)&&401==e.code&&("UNAUTHENTICATED"==e.status||"Invalid Credentials"==e.message))return!0}catch(e){}return!1}function imgURLToB64Str(e,t){var n=new XMLHttpRequest;n.open("GET","https://api.allorigins.win/raw?url="+encodeURIComponent(e),1),n.overrideMimeType("text/plain; charset=x-user-defined"),n.responseType="arraybuffer",n.onreadystatechange=function(){4==n.readyState&&(200!=n.status?(alert("status: "+n.status+"\nresp:"+n.response),t&&t(n.response,!1)):t&&t(!1,btoa(String.fromCharCode.apply(null,new Uint8Array(n.response)))))},n.send()}function attachIDtoB64(t,n,o,a){getAuthToken(function(e){attachIDtoB64_t(!0,e,t,n,o,a)})}function attachIDtoB64_t(e,t,n,o,a,r){var s=new XMLHttpRequest;s.open("POST","https://content.googleapis.com/voice/v1/voiceclient/attachments/get?alt=json",1),s.setRequestHeader("Content-Type","application/json+protobuf"),s.setRequestHeader("Authorization","Bearer "+t),s.withCredentials=1,s.onreadystatechange=function(){4==s.readyState&&(e&&401==s.status&&resp401Unauth(s.response)&&(wvWipeAuthToken(),getAuthToken(function(e){attachIDtoB64_t(!1,e,n,o,a,r)})),200!=s.status?(alert("status: "+s.status+"\nresp:"+s.response),r&&r(s.response)):r&&(s=(s=(s=(s=JSON.parse(s.response)).video_content?s.video_content.content:s.image_content.content).replace(/-/g,"+")).replace(/_/g,"/"),r(!1,s)))},s.send('["'+n+'",'+o+","+(a?"null,[1,[null,null,null,null,0,null,1]]]":"1]"))}function chkNewMsg(t,n){getAuthToken(function(e){chkNewMsg_t(!0,e,t,n)})}function chkNewMsg_t(e,t,n,o){var a=new XMLHttpRequest;a.open("POST","https://content.googleapis.com/voice/v1/voiceclient/api2thread/get?alt=protojson",1),a.setRequestHeader("Content-Type","application/json+protobuf"),a.setRequestHeader("Authorization","Bearer "+t),a.withCredentials=1,a.onreadystatechange=function(){4==a.readyState&&(200!=a.status?(404==a.status||0==a.status||401==a.status||alert("status: "+a.status+"\nresp:"+a.response),o&&o(a.response)):o&&o(!1,a.response))},a.send('["t.+1'+n+'",1]')}Uint8Array.prototype.map||(Uint8Array.prototype.map=function(e){var t,n,o;if(null==this)throw new TypeError("this is null or not defined");var a,r,s=Object(this),i=s.length>>>0;if("function"!=typeof e)throw new TypeError(e+" is not a function");for(1<arguments.length&&(t=arguments[1]),n=new Array(i),o=0;o<i;){o in s&&(a=s[o],r=e.call(t,a,o,s),n[o]=r),o++}return n}),crypto=window.crypto||window.msCrypto||{getRandomValues:function(e){for(var t=0,n=e.length;t<n;t++)e[t]=Math.floor(256*Math.random());return e}};