var carrierCache = {};
//let v8start;
const primaryURLBase = 'https://www.telcodata.us/search-area-code-exchange-detail';
//const primaryURLBase = 'http://betacors.fly.dev/https://www.telcodata.us/search-area-code-exchange-detail';
//const primaryURLBase = 'http://wvoice.us.to/abuse.htm';
const secURLBase = 'http://betacors.fly.dev/https://www.telcodata.us/search-area-code-exchange-detail';
//const secURLBase = 'http://wvoice.us.to/abuse.htm';

addEventListener("fetch", event => {
  //  if(!v8start) {v8start = Date.now()};
  event.respondWith(new Promise(async function(resolveCB) {
    //    try {
    let num = new URL(event.request.url).pathname.substring(1);
    if (num == 'favicon.ico') {
      resolveCB(new Response(null, {
        status: 404
      }));
      return;
    }
    //match foo.com/2125551234 or foo.com/2125551 only
    if (!/^\d{7,10}$/.test(num)) {
      if(num.startsWith('linkfmt/id/')) {
        //Google account ID
        //customize for internal biz use on fork
        num = /^(?:999999999999999999999|888888888888888888888)$/.test(num.substr(11));
        resolveCB(new Response( num ?
`function wvLinkFmt(e){var a=document.createElement('a');a.textContent=a.href=e;a.rel="noreferrer";a.target="_blank";return a;};window.wvUpdateLinkFormatterRun&&window.wvUpdateLinkFormatterRun();`
:
`function wvLinkFmt(e){var a=document.createElement('a');a.textContent=a.href=e;a.rel="noreferrer";a.target="_blank";return a;};window.wvUpdateLinkFormatterRun&&window.wvUpdateLinkFormatterRun();`
            , {
            status: 200,
            headers: {
            "content-type": "text/javascript",
            "cache-control": "max-age=2629800"
            }
          }));
    } else {
        resolveCB(new Response(null, {
            status: 400
          }));
    }
      //console.log tracing shows exec continues even though
      //client gets code 400
      return;
    }
    //reformat and cut off last 3 digits if any of num
    num = num.substr(0, 3) + '-' + num.substr(3, 3) + '-' + num.substr(6, 1);
    //console.log('search cache ' + 'http://carrier.natasha.cat/' + num);
    if (carrierCache[num])
    {
      resolveCB(new Response(carrierCache[num], {
        headers: {
          "content-type": "text/javascript",
          "cache-control": "no-transform, max-age=2629800",
          "x-HSCAPI": 'true'
          //,'x-hsdbg': JSON.stringify(carrierCache)
        }
      }));
      return;
    }
    let response = await caches.default.match('http://carrier.natasha.cat/' + num);

    if (response) {

      //response = new Response(response.body, response);
      //response.headers.set('x-i', runI++);
      //response.headers.set('x-CAPI', 'true');
      //response.headers.set('x-hsdbg', JSON.stringify(carrierCache));
      //response.headers.set('x-v8st', v8start);
      resolveCB(response);
      //promote Cache API entry to HS cache
      carrierCache[num] = await response.clone().text();
      return;
    }
    let referer = event.request.headers.get('referer');
    let url = primaryURLBase + '?npa=' + num.substr(0, 3) + '&exchange=' + num.substr(4, 3);
    let responseOrigin = fetch(
    url
    //let responseOrigin = fetch('http://scooterlabs.com/echo'
    ,{ cf: { scrapeShield: false }, ...referer && {headers: {referer: referer}}});
    //resolveCB(responseOrigin);
    //return;
    processResponse(event, responseOrigin, resolveCB, num, url);
    //toss promise just in case
    return;
    //    } catch (e) {
    //      resolveCB(new Response(e));
    //
  }));
})

function processResponse(event, response, resolveCB, num, url) {
    let metaCarrier;
    let saw1000s;

    let textBuf;
    let curExch;
    //reformat number to origin-like string

    let rewriter = new HTMLRewriter()
      .on('title', {
        element: function() {
          textBuf = '';
        },
        text: function(text) {
          textBuf += text.text; // concatenate new text with existing text buffer
          if (text.lastInTextNode) {
            //"Error communicating with origin"
            //'Abuse Detection'
            if (textBuf != 'TelcoData.US: Search by Area Code / Exchange') {
              if(url.startsWith(secURLBase)) {
                resolveCB(new Response(null, {
                    status: 429
                }));
                return;
              } else {
                //retry using AWS proxy IP
                let referer = event.request.headers.get('referer');
                url = secURLBase + '?npa=' + num.substr(0, 3) + '&exchange=' + num.substr(4, 3);
                let response = fetch(
                url
                //let responseOrigin = fetch('http://scooterlabs.com/echo'
                ,{ cf: { scrapeShield: false }, ...referer && {headers: {referer: referer}}});
                processResponse(event, response, resolveCB, num, url);
              }
            }
          }
        }
      })
      .on('tr[class="results"]>td:nth-child(1)>a', {
        element: function() {
          textBuf = '';
        },
        text: function(text) {
          textBuf += text.text; // concatenate new text with existing text buffer
          if (text.lastInTextNode) {
            curExch = textBuf;
            //console.log("saw xch "+textBuf);
          }
        }
      })
      .on('tr[class="results"]>td:nth-child(3)>a', {
        element: function() {
          textBuf = '';
        },
        text: async function(text) {
          textBuf += text.text; // concatenate new text with existing text buffer
          if (text.lastInTextNode) {
            metaCarrier ??= textBuf;
            //console.log(textBuf + 'cur xchg ' + curExch + ' match xch ' + num);
            textBuf = 'carrierUpdate("'+textBuf+'")';
            let response = new Response(textBuf, {
              headers: {
                "content-type": "text/javascript",
                "cache-control": "no-transform, max-age=2629800"
                //,"x-i": runI++
                //,'x-hsdbg': JSON.stringify(carrierCache)
              }
            });
            //only add 1000s block entries to cache
            //not the useless whole exchange owner
            if (curExch.length == 9) {
              carrierCache[curExch] = textBuf;
            }
            if (curExch == num) {
              resolveCB(response.clone());
              saw1000s = !0;
            }
            //only add 1000s block entries to cache
            //not the useless whole exchange owner
            if (curExch.length == 9) {
              //console.log('put http://carrier.natasha.cat/' + curExch);
              caches.default.put('http://carrier.natasha.cat/' + curExch, response);
            }
          }
        }
      })
      //originally was origin file end, but cpu/parse time, abandon
      //the 1000s block search an element right after the <table>
      //element
      //   .onDocument({
      //       end: function() {
      //         if (!response) {
      //           response = new Response(metaCarrier, {
      .on('div[id="WSPadding"]', {
        element: function() {
          if (!saw1000s) {
            if (metaCarrier) {
              metaCarrier = 'carrierUpdate("'+metaCarrier+'")';
              let response = new Response(metaCarrier, {
                headers: {
                  "content-type": "text/javascript",
                  "cache-control": "no-transform, max-age=2629800"
                  //,"x-i": runI++,
                  //,'x-hsdbg': JSON.stringify(carrierCache)
                }
              });
              //console.log('meta resp');
              //fill all 1000s blocks with same resp in cache
              for (let i = 0; i <= 9; i++) {
                //let metaurl = 'http://carrier.natasha.cat/' + num.substr(0, 8) + i;
                //console.log('put ' + metaurl);
                carrierCache[num.substr(0, 8) + i] = metaCarrier;
                caches.default.put('http://carrier.natasha.cat/' + num.substr(0, 8) + i, response.clone());
              }
              resolveCB(response.clone());
            } else {
              resolveCB(new Response(null, {
                status: 404
              }));
            }
          }
        }
      });
    //Promise {[[PromiseState]]: "pending", [[PromiseResult]]: undefined}
    response.then(function(resp) {
      //without event.waitUntil, after resolveCB() call in a matched 1000s
      //block, runtime will kill this worker, stopping parsing and storing
      //to cache rest of the 1000s block of the exchange
      event.waitUntil(rewriter.transform(resp).arrayBuffer());
      //just in case event.waitUntil returns a promise, toss it away
      return;
    });
}
