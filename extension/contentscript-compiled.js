(function(){var aa=typeof Object.defineProperties=="function"?Object.defineProperty:function(a,b,c){if(a==Array.prototype||a==Object.prototype)return a;a[b]=c.value;return a},ba=function(a){a=["object"==typeof globalThis&&globalThis,a,"object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof global&&global];for(var b=0;b<a.length;++b){var c=a[b];if(c&&c.Math==Math)return c}throw Error("Cannot find global object");},g=ba(this),ca=function(a,b){if(b)a:{var c=g;a=a.split(".");for(var d=0;d<a.length-
1;d++){var f=a[d];if(!(f in c))break a;c=c[f]}a=a[a.length-1];d=c[a];b=b(d);b!=d&&b!=null&&aa(c,a,{configurable:!0,writable:!0,value:b})}};ca("globalThis",function(a){return a||g});/*

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/
var k=this||self;var m,n;a:{for(var q=["CLOSURE_FLAGS"],r=k,t=0;t<q.length;t++)if(r=r[q[t]],r==null){n=null;break a}n=r}var u=n&&n[610401301];m=u!=null?u:!1;var v;const w=k.navigator;v=w?w.userAgentData||null:null;function x(a){return m?v?v.brands.some(({brand:b})=>b&&b.indexOf(a)!=-1):!1:!1}function y(a){var b;a:{if(b=k.navigator)if(b=b.userAgent)break a;b=""}return b.indexOf(a)!=-1};function C(){return m?!!v&&v.brands.length>0:!1}function D(){return C()?x("Chromium"):(y("Chrome")||y("CriOS"))&&!(C()?0:y("Edge"))||y("Silk")};!y("Android")||D();D();y("Safari")&&(D()||(C()?0:y("Coast"))||(C()?0:y("Opera"))||(C()?0:y("Edge"))||(C()?x("Microsoft Edge"):y("Edg/"))||C()&&x("Opera"));var E;E=typeof Symbol==="function"&&typeof Symbol()==="symbol"?Symbol.for?Symbol.for("jas"):Symbol("jas"):void 0;const da=typeof Symbol==="function"&&typeof Symbol()==="symbol"?E:"m",F=Object.getOwnPropertyDescriptor(Array.prototype,"l");
Object.defineProperties(Array.prototype,{l:{get(){function a(f,e){f&b&&c.push(e)}const b=this[da]|0,c=[];a(1,"IS_REPEATED_FIELD");a(2,"IS_IMMUTABLE_ARRAY");a(4,"IS_API_FORMATTED");a(2048,"STRING_FORMATTED");a(4096,"GBIGINT_FORMATTED");a(4096,"BINARY");a(8,"ONLY_MUTABLE_VALUES");a(32,"MUTABLE_REFERENCES_ARE_OWNED");a(64,"CONSTRUCTED");a(128,"TRANSFERRED");a(256,"HAS_SPARSE_OBJECT");a(512,"HAS_MESSAGE_ID");a(1024,"FROZEN_ARRAY");a(8192,"DESERIALIZED_FROM_BINARY");var d=b>>14&1023||536870912;d!==536870912&&
c.push(`pivot: ${d}`);d=c.join(",");return F?F.get.call(this)+"|"+d:d},configurable:!0,enumerable:!1}});typeof Proxy!=="undefined"&&new Proxy({},{getPrototypeOf:G,setPrototypeOf:G,isExtensible:G,preventExtensions:G,getOwnPropertyDescriptor:G,defineProperty:G,has:G,get:G,set:G,deleteProperty:G,apply:G,construct:G});function G(){throw Error("this array or object is owned by JSPB and should not be reused, did you mean to copy it with copyJspbArray? See go/jspb-api-gotchas#construct_from_array");};function ea(){};(function(){const a=k.jspbGetTypeName;k.jspbGetTypeName=a?b=>a(b)||void 0:ea})();function fa(a){const b=a.indexOf("'");if(b<0)return"";const c=a.substring(b+1);if(a.substring(0,b).toLowerCase()!=="utf-8")return"";a=c.indexOf("'");if(a<0)return"";try{return decodeURIComponent(c.substring(a+1))}catch(d){return""}}function H(){var a=window.location.hash;return new URLSearchParams(a[0]==="#"?a.substr(1):"")};function I(a){a=Number(a);return!a||a<0?"":a.toFixed(2)}function J(a){a=String(a);const b=a.split(",").map(Number);return b.length===1&&b[0]>0||b.length===3&&b[0]>0&&!isNaN(b[1])&&!isNaN(b[2])?a:""}function K(a){return a!=="0"&&a!=="1"?"":a}
function L(a,b){if(a){var c=(history.state||{}).fractionalStartPage,d=null,f=null,e=null,h=null;c?b&&(d=(history.state||{}).navpanes,e=(history.state||{}).zoom):(b=H(),c=I(b.get("page"))||"1",d=K(b.get("navpanes")),f=b.get("view"),e=J(b.get("zoom")),h=b.get("nameddest"));a.postMessage({type:"restoreReadingProgress",fractionalStartPage:c,navpanes:d,view:f,zoom:e,nameddest:h},"*")}}function M(){return(new URLSearchParams(window.location.hash.substring(1))).get("gsr")==="0"}
function ha(){let a;window.addEventListener("popstate",()=>{M()||a&&L(a,!1)});window.addEventListener("message",b=>{if(b.origin==="chrome-extension://"+chrome.runtime.id&&b.data&&typeof b.data==="object"&&!M())if(a=b.source,b.data.type==="ready")L(a,!0);else if(b.data.type==="pushState"){var c=I(b.data.fractionalStartPage),d=J(b.data.zoom);const f=K(b.data.navpanes);if(c||d||f){b=Number(c);const e=H();e.set("page",b.toFixed(2));history.pushState({fractionalStartPage:c,navpanes:f,zoom:d},"","#"+e.toString())}else console.log("fractionalStartPage, zoomPct, or navpanes required")}else b.data.type===
"replaceState"&&(c=I(b.data.fractionalStartPage),d=J(b.data.zoom),b=K(b.data.navpanes),c||d||b?history.replaceState({fractionalStartPage:c,navpanes:b,zoom:d},""):console.log("fractionalStartPage, zoomPct, or navpanes required"))})};/*

 Copyright Google LLC
 SPDX-License-Identifier: Apache-2.0
*/
var N={};function O(){if(N!==N)throw Error("Bad secret");};let P=globalThis.trustedTypes,Q;function ia(){let a=null;if(!P)return a;try{const b=c=>c;a=P.createPolicy("goog#html",{createHTML:b,createScript:b,createScriptURL:b})}catch(b){throw b;}return a};var R=class{constructor(a){O();this.g=a}toString(){return this.g+""}};function S(a){Q===void 0&&(Q=ia());var b=Q;return new R(b?b.createScriptURL(a):a)}function T(a){if(a instanceof R)return a.g;throw Error("Unexpected type when unwrapping TrustedResourceUrl");};function U(a){return Object.isFrozen(a)&&Object.isFrozen(a.raw)}function V(a){return a.toString().indexOf("`")===-1}const W=V(a=>a``)||V(a=>a`\0`)||V(a=>a`\n`)||V(a=>a`\u0000`),ja=U``&&U`\0`&&U`\n`&&U`\u0000`;var X=class{constructor(a){O();this.g=a}toString(){return this.g}};new X("about:blank");new X("about:invalid#zClosurez");class ka{constructor(a){this.j=a}}const la=new ka(a=>a.indexOf("chrome-extension://")===0||a.indexOf("moz-extension://")===0||a.indexOf("ms-browser-extension://")===0),ma=[];var na=a=>{console.warn(`A URL with content '${a}' was sanitized away.`)};ma.indexOf(na)===-1&&ma.push(na);var oa=chrome,pa=function(a,...b){if(!Array.isArray(a)||!Array.isArray(a.raw)||a.length!==a.raw.length||!W&&a===a.raw||!(W&&!ja||U(a))||b.length+1!==a.length)throw new TypeError("\n    ############################## ERROR ##############################\n\n    It looks like you are trying to call a template tag function (fn`...`)\n    using the normal function syntax (fn(...)), which is not supported.\n\n    The functions in the safevalues library are not designed to be called\n    like normal functions, and doing so invalidates the security guarantees\n    that safevalues provides.\n\n    If you are stuck and not sure how to proceed, please reach out to us\n    instead through:\n     - go/ise-hardening-yaqs (preferred) // LINE-INTERNAL\n     - g/ise-hardening // LINE-INTERNAL\n     - https://github.com/google/safevalues/issues\n\n    ############################## ERROR ##############################");
if(b.length===0)return S(a[0]);var c=a[0].toLowerCase();if(/^data:/.test(c))throw Error("Data URLs cannot have expressions in the template literal input.");if(/^https:\/\//.test(c)||/^\/\//.test(c)){var d=c.indexOf("//")+2;var f=c.indexOf("/",d);if(f<=d)throw Error("Can't interpolate data in a url's origin, Please make sure to fully specify the origin, terminated with '/'.");d=c.substring(d,f);if(!/^[0-9a-z.:-]+$/i.test(d))throw Error("The origin contains unsupported characters.");if(!/^[^:]*(:[0-9]+)?$/i.test(d))throw Error("Invalid port number.");
if(!/(^|\.)[a-z][^.]*$/i.test(d))throw Error("The top-level domain must start with a letter.");d=!0}else d=!1;if(!d)if(/^\//.test(c))if(c==="/"||c.length>1&&c[1]!=="/"&&c[1]!=="\\")d=!0;else throw Error("The path start in the url is invalid.");else d=!1;if(!(d=d||RegExp("^[^:\\s\\\\/]+/").test(c)))if(/^about:blank/.test(c)){if(c!=="about:blank"&&!/^about:blank#/.test(c))throw Error("The about url is invalid.");d=!0}else d=!1;if(!d)throw Error("Trying to interpolate expressions in an unsupported url format.");
c=a[0];for(d=0;d<b.length;d++)c+=encodeURIComponent(b[d])+a[d+1];return S(c)}`reader.html`;const Y=oa.runtime.getURL(T(pa).toString());var Z;a:{var qa=[la];if(Y instanceof X)Z=Y;else{for(let a=0;a<qa.length;++a){const b=qa[a];if(b instanceof ka&&b.j(Y)){Z=new X(Y);break a}}Z=void 0}}if(!Z)throw Error('"'+Y+'" is not an extension URL.');const ra=S(Y),sa="chrome-extension://"+chrome.runtime.id;
function ta(){var a=window;try{let b=a.parent;for(;b!==b.parent;)b=b.parent;return a.innerWidth>=.95*b.innerWidth&&a.innerHeight>=.95*b.innerHeight}catch(b){return!1}}function ua(a){return a.startsWith('"')&&a.endsWith('"')?a.substring(1,a.length-1):a}let va=!1;function wa(a){try{const b=new URL(a);return b.host===location.host&&b.pathname===location.pathname&&b.search===location.search}catch(b){return!1}}
function xa(){const a=new AbortController,b=a.signal,c=setTimeout(()=>{a.abort()},3E4);return{h:b,i:c}}
function ya(a,b){const {h:c,i:d}=xa(),f=b.location;fetch(a,{signal:c}).then(e=>{clearTimeout(d);var h=e.headers;h.get("Accept-Ranges")==="bytes"&&(va=!0);if(b.location===f){var l=b.postMessage,z=e.body,A=h.get("Content-Length"),za=h.get("Content-Encoding")||"";h=h.get("Content-Disposition")||"";let B="";for(let p of h.split(";"))p=p.trim(),p.startsWith("filename*=")?B=ua(fa(p.substring(10))):p.startsWith("filename=")&&!B&&(B=ua(p.substring(9)));l.call(b,{type:"pdf",body:z,length:A,encoding:za,filename:B},
"*",[e.body])}}).catch(e=>{clearTimeout(d);b.postMessage({type:"pdf",error:"fetch pdf: "+e.message},"*")})}function Aa(a,b,c,d){if(va&&b>=0&&c>b){var f=d.location;fetch(a,{headers:{Range:`bytes=${b}-${c-1}`}}).then(e=>{d.location===f&&d.postMessage({type:"pdfrange",body:e.body,begin:b},"*",[e.body])})}}
document.addEventListener("DOMContentLoaded",()=>{var a=new URLSearchParams(window.location.hash.substring(1));if(a.get("gsr")!=="0"&&a.get("toolbar")!=="0"&&document.contentType.toLowerCase()==="application/pdf"&&(!(window.innerWidth<700||window.innerHeight<350)||window===window.parent||ta())){ha();var b=document.createElement("iframe");b.style.width=b.style.height="100%";b.style.position="absolute";b.style.left=b.style.top="0";b.style.border="none";b.src=T(ra).toString();var c="",d=null,f=0;window.addEventListener("message",
e=>{function h(){d&&d.remove();c&&URL.revokeObjectURL(c);d=null;c="";clearTimeout(f)}if(e.origin===sa||e.source.parent===b.contentWindow&&e.origin==="null"){if(e.data&&typeof e.data==="object"&&e.source)switch(e.data.type){case "fetch":var l=e.data.url;if(typeof l!=="string"||!wa(l))return;ya(l,e.source);return;case "fetchrange":l=e.data.url;const z=e.data.begin,A=e.data.end;if(typeof l!=="string"||typeof z!=="number"||typeof A!=="number"||!wa(l))return;Aa(l,z,A,e.source);return}e.data==="afterprint"?
h():e.data.printBuffer&&(e=e.data.printBuffer,e instanceof ArrayBuffer?(c=URL.createObjectURL(new Blob([e],{type:"application/pdf"})),d=document.createElement("iframe"),d.onload=()=>{window.location.href.startsWith("file:")?d.contentWindow.postMessage("print","*"):d.contentWindow.print()},d.src=c,document.body.appendChild(d),f=setTimeout(()=>{h()},36E5)):console.log("Data ArrayBuffer is required."))}});a=document.createElement("body");a.appendChild(b);document.body=a}});}).call(this);
