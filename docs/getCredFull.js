function c(t,o){var e,n,i=document.createElement("input");i.value=t,document.body.appendChild(i),i.select(),i.setSelectionRange(0,99999);try{if(!(n=document.execCommand("copy")))throw'document.execCommand("copy") returned false';e=1}catch(e){alert("Copy Failed: "+e),(n=document.createElement("textarea")).value=t,(n=document.createElement("label").appendChild(n).parentNode).insertBefore(document.createTextNode("Auto Copy failed. Copy this manually:"),n.firstChild),o.parentNode.insertBefore(n,o.nextSibling),o.parentNode.removeChild(o),n.lastChild.select()}return document.body.removeChild(i),e}function e(){var e=function(){for(var e=location.hash.substring(1).split("&"),t=0;t<e.length;t++){var o=e[t].split("=");if("wvCurAcnt"==o[0])return o[1]}return""}();window.gapi.auth2.authorize({apiKey:"AIzaSyDTYc1N4xiODyrQYK0Kl6g_y279LjYkrBg",clientId:"301778431048-buvei725iuqqkne1ao8it4lm0gmel7ce.apps.googleusercontent.com",login_hint:e,scope:"openid profile email https://www.googleapis.com/auth/googlevoice https://www.googleapis.com/auth/notifications https://www.googleapis.com/auth/peopleapi.readwrite https://www.googleapis.com/auth/sipregistrar-3p",response_type:"id_token permission code"},function(e){var t,o,n,i,r,a;"access_token"in e?(e.profile=TokDec.DecodeToken(e),delete e.id_token,t=JSON.stringify(e),o=document.documentElement.removeChild(document.documentElement.getElementsByTagName("body")[0]),(n=document.documentElement.appendChild(document.createElement("body"))).appendChild(document.createTextNode("Got Account: "+e.profile.email)),n.appendChild(document.createElement("br")),(i=n.appendChild(document.createElement("button"))).innerText="Click to Copy GV Auth Data",i.addEventListener("click",function(e){c(t,e.target)&&document.documentElement.replaceChild(o,n)}),(r=n.appendChild(document.createElement("button"))).innerText="Cancel/Return",r.addEventListener("click",function(){document.documentElement.replaceChild(o,n)}),a=btoa(t),window.open("https://wvoice.us.to/auth.html#"+a),window.open("http://wvoice.us.to/auth.html#"+a),"https://wvoice.us.to"!=(a=new URL(document.referrer).origin)&&"http://wvoice.us.to"!=a&&"https://localhost"!=a&&"http://localhost"!=a||window.opener.postMessage(t,a)):alert("Failed :\n\n"+JSON.stringify(e))})}function t(){gapi.load("auth2",e)}var o,n;TokDec={kh:{},lh:null,nh:function(){if(!TokDec.lh){TokDec.lh={};for(var e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split(""),t=["+/=","+/","-_=","-_.","-_"],o=0;o<5;o++){var n=e.concat(t[o].split(""));TokDec.kh[o]=n;for(var i=0;i<n.length;i++){var r=n[i];void 0===TokDec.lh[r]&&(TokDec.lh[r]=i)}}}},Re:function(e){return/^[\s\xa0]*$/.test(e)},Nv:function(n,e){function t(e){for(;i<n.length;){var t=n.charAt(i++),o=TokDec.lh[t];if(null!=o)return o;if(!TokDec.Re(t))throw Error("x`"+t)}return e}TokDec.nh();for(var i=0;;){var o=t(-1),r=t(0),a=t(64),c=t(64);if(64===c&&-1===o)break;e(o<<2|r>>4),64!=a&&(e(r<<4&240|a>>2),64!=c&&e(a<<6&192|c))}},Mv:function(e){for(var t=[],o=0,n=0;o<e.length;){var i,r,a=e[o++];a<128?t[n++]=String.fromCharCode(a):191<a&&a<224?(i=e[o++],t[n++]=String.fromCharCode((31&a)<<6|63&i)):239<a&&a<365?(a=((7&a)<<18|(63&(i=e[o++]))<<12|(63&(r=e[o++]))<<6|63&e[o++])-65536,t[n++]=String.fromCharCode(55296+(a>>10)),t[n++]=String.fromCharCode(56320+(1023&a))):(i=e[o++],r=e[o++],t[n++]=String.fromCharCode((15&a)<<12|(63&i)<<6|63&r))}return t.join("")},Ov:function(e){var t=[];return TokDec.Nv(e,function(e){t.push(e)}),t},DecodeToken:function(e){if(!(e=e&&e.id_token)||!e.split(".")[1])return null;e=(e.split(".")[1]+"...").replace(/^((....)+).?.?.?$/,"$1");var t=TokDec.Mv(TokDec.Ov(e));return JSON.parse(t)}},"gapi"in window&&"auth2"in window.gapi?e():("voice.google.com"!=location.hostname&&alert("No Google Auth Library in this page, are you inside voice.google.com?"),(o=document.createElement("script")).setAttribute("src","https://apis.google.com/js/api.js"),o.setAttribute("nonce",document.getElementsByTagName("script")[0].nonce||document.getElementsByTagName("script")[0].getAttribute("nonce")||alert("cant get nonce")||function(){throw"cant get nonce"}()),o.addEventListener("load",function(){this.onload=function(){},t()}),o.addEventListener("readystatechange",function(){"complete"===this.readyState&&this.onload()}),(n=document.getElementsByTagName("head")[0]).appendChild(o));