async function handleRequest(e){let t=new URL(e.url).searchParams.get("apiurl");var n=e.headers.get("Origin");e=new Request(t,e),t=new URL(t);let o=e.headers;o.set("Origin",t.origin),o.set("Referer",t.origin),o.set("Host",t.host),o.delete("X-Forwarded-Proto"),o.delete("Cdn-Loop"),o.delete("Cf-Connecting-Ip"),o.delete("Cf-Ew-Via"),o.delete("Cf-Request-Id"),o.delete("Cf-Visitor"),o.delete("Cf-Worker"),o.delete("X-Forwarded-For");let s=await fetch(e);return s=new Response(s.body,s),o=s.headers,"application/json+protobuf; charset=UTF-8"==o.get("Content-Type")&&o.set("Content-Type","application/json; charset=UTF-8"),o.delete("Content-Security-Policy"),o.delete("X-Content-Type-Options"),o.delete("X-Frame-Options"),o.delete("X-XSS-Protection"),o.delete("Pragma"),o.set("Access-Control-Allow-Origin",n),o.set("Access-Control-Allow-Credentials","true"),o.append("Vary","Origin"),"POST"==e.method&&(o.delete("Cache-Control"),o.delete("Expires"),o.delete("Vary")),s}function handleOptions(t){if(null!==(t=t.headers).get("Origin")&&null!==t.get("Access-Control-Request-Method")&&null!==t.get("Access-Control-Request-Headers")){var n=e;return n["Access-Control-Allow-Origin"]=t.get("Origin"),new Response(null,{headers:n})}return new Response(null,{headers:{Allow:"GET, HEAD, POST, OPTIONS"}})}async function HandleStatic(e,t){e.hostname="wvoice.us.to";let n=await fetch(e.toString(),t);return n=new Response(n.body,n),n.headers.set("Cache-Control","public, max-age=3600"),n}addEventListener("fetch",async e=>{const n=e.request,o=new URL(n.url);o.pathname.startsWith(t)?"OPTIONS"===n.method?e.respondWith(handleOptions(n)):"GET"===n.method||"HEAD"===n.method||"POST"===n.method?e.respondWith(handleRequest(n)):e.respondWith(async()=>new Response(null,{status:405,statusText:"Method Not Allowed"})):e.respondWith(HandleStatic(o,n))});const e={"Access-Control-Allow-Methods":"GET,HEAD,POST,OPTIONS","Access-Control-Allow-Headers":"authorization,content-type","Access-Control-Allow-Credentials":"true","Access-Control-Max-Age":3600,Vary:"Origin"},t="/corsproxy/";