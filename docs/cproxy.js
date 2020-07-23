async function handleRequest(e){let n=new URL(e.url).searchParams.get("apiurl");var t=e.headers.get("Origin");e=new Request(n,e),n=new URL(n);let o=e.headers;o.set("Origin",n.origin),o.set("Referer",n.origin),o.set("Host",n.host);let s=await fetch(e);return s=new Response(s.body,s),o=s.headers,"application/json+protobuf; charset=UTF-8"==o.get("Content-Type")&&o.set("Content-Type","application/json; charset=UTF-8"),o.delete("Content-Security-Policy"),o.delete("X-Content-Type-Options"),o.delete("X-Frame-Options"),o.delete("X-XSS-Protection"),o.delete("Pragma"),o.set("Access-Control-Allow-Origin",t),o.set("Access-Control-Allow-Credentials","true"),o.append("Vary","Origin"),"POST"==e.method&&(o.delete("Cache-Control"),o.delete("Expires"),o.delete("Vary")),s}function handleOptions(n){if(null!==(n=n.headers).get("Origin")&&null!==n.get("Access-Control-Request-Method")&&null!==n.get("Access-Control-Request-Headers")){var t=e;return t["Access-Control-Allow-Origin"]=n.get("Origin"),new Response(null,{headers:t})}return new Response(null,{headers:{Allow:"GET, HEAD, POST, OPTIONS"}})}addEventListener("fetch",e=>{const n=e.request;new URL(n.url).pathname.startsWith(t)?"OPTIONS"===n.method?e.respondWith(handleOptions(n)):"GET"===n.method||"HEAD"===n.method||"POST"===n.method?e.respondWith(handleRequest(n)):e.respondWith(async()=>new Response(null,{status:405,statusText:"Method Not Allowed"})):e.respondWith(rawHtmlResponse(o))});const e={"Access-Control-Allow-Methods":"GET,HEAD,POST,OPTIONS","Access-Control-Allow-Headers":"authorization,content-type","Access-Control-Allow-Credentials":"true","Access-Control-Max-Age":3600,Vary:"Origin"},n="https://workers-tooling.cf/demos/demoapi",t="/corsproxy/";async function rawHtmlResponse(e){return new Response(e,{headers:{"content-type":"text/html;charset=UTF-8"}})}const o=`\n<!DOCTYPE html>\n<html>\n<body>\n  <h1>API GET without CORS Proxy</h1>\n  <a target='_blank' href='https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Checking_that_the_fetch_was_successful'>Shows TypeError: Failed to fetch since CORS is misconfigured</a>\n  <p id='noproxy-status'/>\n  <code id='noproxy'>Waiting</code>\n  <h1>API GET with CORS Proxy</h1>\n  <p id='proxy-status'/>\n  <code id='proxy'>Waiting</code>\n  <h1>API POST with CORS Proxy + Preflight</h1>\n  <p id='proxypreflight-status'/>\n  <code id='proxypreflight'>Waiting</code>\n  <script>\n  let reqs = {};\n  reqs.noproxy = async () => {\n    let response = await fetch('${n}')\n    return await response.json()\n  }\n  reqs.proxy = async () => {\n    let response = await fetch(window.location.origin + '${t}?apiurl=${n}')\n    return await response.json()\n  }\n  reqs.proxypreflight = async () => {\n    const reqBody = {\n      msg: "Hello world!"\n    }\n    let response = await fetch(window.location.origin + '${t}?apiurl=${n}', {\n      method: "POST",\n      headers: {\n        "Content-Type": "application/json"\n      },\n      body: JSON.stringify(reqBody),\n    })\n    return await response.json()\n  }\n  (async () => {\n    for (const [reqName, req] of Object.entries(reqs)) {\n      try {\n        let data = await req()\n        document.getElementById(reqName).innerHTML = JSON.stringify(data)\n      } catch (e) {\n        document.getElementById(reqName).innerHTML = e\n      }\n    }\n  })()\n  <\/script>\n</body>\n</html>`;