async function handleRequest(request) {
  const url = new URL(request.url)
  let apiurl = url.searchParams.get('apiurl')
  var clientOrigin = request.headers.get('Origin')
  // Rewrite request to point to API url. This also makes the request mutable
  // so we can add the correct Origin header to make the API server think
  // that this request isn't cross-site.
  request = new Request(apiurl, request)
  apiurl = new URL(apiurl);
  //FIX Bad request: Origin and Referer header don't match.
  let h = request.headers;
  h.set('Origin', apiurl.origin)
  h.set('Referer',apiurl.origin)
  h.set('Host', apiurl.host)
  let response = await fetch(request)
  /*for (i of response.headers.entries()) {
  console.log(i);}*/
  //console.log(new Map(request.headers))
  //console.log(new Map(response.headers))
  // Recreate the response so we can modify the headers
  response = new Response(response.body, response)
  h = response.headers;
  if(h.get('Content-Type') ==
    "application/json+protobuf; charset=UTF-8") {
    h.set('Content-Type', "application/json; charset=UTF-8");
    }
  h.delete("Content-Security-Policy");
  h.delete("X-Content-Type-Options");
  h.delete("X-Frame-Options");
  h.delete("X-XSS-Protection");
  h.delete("Pragma");
//console.log(new Map(response.headers))
  // Set CORS headers
  h.set('Access-Control-Allow-Origin', clientOrigin)
  h.set('Access-Control-Allow-Credentials', 'true')
  // Append to/Add Vary header so browser will cache response correctly
  h.append('Vary', 'Origin')
  //POST can't be cached by any browser, these headers are garbage
  if (request.method == 'POST') {
    h.delete("Cache-Control");
    h.delete("Expires");
    h.delete("Vary");
  }
  return response
}
function handleOptions(request) {
  // Make sure the necesssary headers are present
  // for this to be a valid pre-flight request
  request = request.headers;
  if (
    request.get('Origin') !== null &&
    request.get('Access-Control-Request-Method') !== null &&
    request.get('Access-Control-Request-Headers') !== null
  ) {
    // Handle CORS pre-flight request.
    // If you want to check the requested method + headers
    // you can do that here.
    var respHeaders = corsHeaders;
    respHeaders['Access-Control-Allow-Origin'] = request.get('Origin')
    return new Response(null, {
      headers: respHeaders,
    })
  } else {
    // Handle standard OPTIONS request.
    // If you want to allow other HTTP Methods, you can do that here.
    return new Response(null, {
      headers: {
        Allow: 'GET, HEAD, POST, OPTIONS',
      },
    })
  }
}

// drop back to wvoice static files, but increase cache from GH 10 mins default
async function HandleStatic(url, request) {
      url.hostname = 'wvoice.us.to'
      let response = await fetch(url.toString(), request)
// Recreate the response so we can modify the headers
      response = new Response(response.body, response)
      response.headers.set("Cache-Control", "public, max-age=3600")
      return response
}

addEventListener('fetch', async event => {
  const request = event.request
  const url = new URL(request.url)
  // TODO We should filter that destination URL is a google domain
  // so this lil worker isn't an open proxy :-/
  if (url.pathname.startsWith(proxyEndpoint)) {
    if (request.method === 'OPTIONS') {
      // Handle CORS preflight requests
      event.respondWith(handleOptions(request))
    } else if (
      request.method === 'GET' ||
      request.method === 'HEAD' ||
      request.method === 'POST'
    ) {
      // Handle requests to the API server
      event.respondWith(handleRequest(request))
    } else {
      event.respondWith(async () => {
        return new Response(null, {
          status: 405,
          statusText: 'Method Not Allowed',
        })
      })
    }
  } else {
    event.respondWith(HandleStatic(url,request));
  }
})
// We support the GET, POST, HEAD, and OPTIONS methods from any origin,
// and accept the Content-Type header on requests. These headers must be
// present on all responses to all CORS requests. In practice, this means
// all responses to OPTIONS requests.
const corsHeaders = {
  'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'authorization,content-type',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': 3600,
  'Vary': 'Origin',
}
// The endpoint you want the CORS reverse proxy to be on
const proxyEndpoint = '/corsproxy/'
