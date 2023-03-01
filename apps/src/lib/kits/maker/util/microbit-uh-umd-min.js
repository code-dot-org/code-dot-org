(function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):(e=e||self,t(e.microbitUh={}))})(this,function(e){'use strict';var N=String.prototype,k=Math.max,v=Math.floor,C=Math.ceil,D=Math.min;function t(e,t){return t={exports:{}},e(t,t.exports),t.exports}function n(e){if(0!=e.length%2)throw new Error("Hex string \""+e+"\" is not divisible by 2.");var t=e.match(/.{1,2}/g);return t?new Uint8Array(t.map(function(t){var n=Number.isNaN,r=parseInt(t,16);if(n(r))throw new Error("There were some non-hex characters in \""+e+"\".");else return r})):new Uint8Array}function r(e){return e.toString(16).toUpperCase().padStart(2,"0")}function a(e){return e.reduce(function(e,t){return e+t.toString(16).toUpperCase().padStart(2,"0")},"")}function o(e){var t=e.reduce(function(e,t){return e+t.length},0),n=new Uint8Array(t);return e.reduce(function(e,t){return n.set(t,e),e+t.length},0),n}function l(e){return!!(e>=yr.Data&&e<=yr.StartLinearAddress||e>=yr.BlockStart&&e<=yr.OtherData)}function d(e){var t=e.reduce(function(e,t){return e+t},0);return 255&-t}function s(e,t,n){if(0>e||65535<e)throw new Error("Record ("+t+") address out of range: "+e);var i=n.length;if(i>32)throw new Error("Record ("+t+") data has too many bytes ("+i+").");if(!l(t))throw new Error("Record type '"+t+"' is not valid.");var s=o([new Uint8Array([i,e>>8,255&e,t]),n]),c=a(s),g=r(d(s));return":"+c+g}function c(e){if(e.length<Or)throw new Error("Record length too small: "+e);if(e.length>Pr)throw new Error("Record length is too large: "+e);if(":"!==e[0])throw new Error("Record does not start with a \":\": "+e);return!0}function g(e){c(e);var t=Tr+2+4,n=e.slice(t,t+2),r=parseInt(n,16);if(!l(r))throw new Error("Record type '"+n+"' from record '"+e+"' is not valid.");return r}function u(t){try{return n(t.slice(Ir,-2))}catch(n){throw new Error("Could not parse Intel Hex record \""+t+"\": "+n.message)}}function h(t){c(t);var r;try{r=n(t.substring(1))}catch(n){throw new Error("Could not parse Intel Hex record \""+t+"\": "+n.message)}var a=r[0],o=1,l=(r[o]<<8)+r[o+1],i=o+2,d=r[i],s=i+1,g=s+a,u=r.slice(s,g),h=r[g],p=g+1;if(r.length>p)throw new Error("Parsed record \""+t+"\" is larger than indicated by the byte count."+("\n\tExpected: "+p+"; Length: "+r.length+"."));return{byteCount:a,address:l,recordType:d,data:u,checksum:h}}function p(){return":00000001FF"}function E(e){if(0>e||4294967295<e)throw new Error("Address '"+e+"' for Extended Linear Address record is out of range.");return s(0,yr.ExtendedLinearAddress,new Uint8Array([255&e>>24,255&e>>16]))}function y(e){if(0>e||65535<e)throw new Error("Board ID out of range when creating Block Start record.");return s(0,yr.BlockStart,new Uint8Array([255&e>>8,255&e,192,222]))}function T(e){switch(e){case 4:return":0400000BFFFFFFFFF5";case 12:return":0C00000BFFFFFFFFFFFFFFFFFFFFFFFFF5";default:var t=new Uint8Array(e).fill(255);return s(0,yr.BlockEnd,t);}}function S(e){var t=new Uint8Array(e).fill(255);return s(0,yr.PaddedData,t)}function A(e,t){var n=h(e),o=new Uint8Array(n.data.length+4);o[0]=n.data.length,o[1]=n.address>>8,o[2]=255&n.address,o[3]=t,o.set(n.data,4);var l=a(o),i=r(d(o));return":"+l+i}function x(e){var t=u(e);if(2!==t.length||15&t[0]||0!==t[1])throw new Error("Invalid Extended Segment Address record "+e);var n=t[0]<<12;return E(n)}function I(e){var t=e.replace(/\r/g,"").split("\n");return t.filter(Boolean)}function m(e){for(var t=16,n=0,r=0,a=e;r<a.length;r++){var o=a[r],l=(o.length-Or)/2;if(l>t?(t=l,n=0):l===t&&n++,12<n)break}if(t>32)throw new Error("Intel Hex record data size is too large: "+t);return t}function O(e,t){var n=!Lr.includes(t),r=y(t),a=E(0),o=a.length,l=r.length,i=T(0).length,d=S(0).length,s=I(e),c=m(s);if(!s.length)return"";if(R(s))throw new Error("Board ID "+t+" Hex is already a Universal Hex.");for(var u=0,h=[];u<s.length;){var f=0,O=g(s[u]);O===yr.ExtendedLinearAddress?(a=s[u],u++):O===yr.ExtendedSegmentAddress&&(a=x(s[u]),u++),h.push(a),f+=o+1,h.push(r),f+=l+1,f+=i+1;for(var P=!1;s[u]&&512>=f+s[u].length+1;){var L=s[u++],F=g(L);if(n&&F===yr.Data)L=A(L,yr.CustomData);else if(F===yr.ExtendedLinearAddress)a=L;else if(F===yr.ExtendedSegmentAddress)L=x(L),a=L;else if(F===yr.EndOfFile){P=!0;break}h.push(L),f+=L.length+1}if(P){if(u!==s.length)if(b(s))throw new Error("Board ID "+t+" Hex is from MakeCode, import this hex into the MakeCode editor to create a Universal Hex.");else throw new Error("EoF record found at record "+u+" of "+s.length+" in Board ID "+t+" hex");h.push(T(0)),h.push(p())}else{for(;512-f>2*c;){var L=S(D((512-f-(d+1))/2,c));h.push(L),f+=L.length+1}h.push(T((512-f)/2))}}return h.push(""),h.join("\n")}function P(e,t){var n=[],r=0,a=0,o=function(e){r+=e.length+1},l=function(e){n.push(e),o(e)},i=I(e);if(!i.length)return"";if(R(i))throw new Error("Board ID "+t+" Hex is already a Universal Hex.");var d=g(i[0]);d===yr.ExtendedLinearAddress?(l(i[0]),a++):d===yr.ExtendedSegmentAddress?(l(x(i[0])),a++):l(E(0)),l(y(t));for(var s=!Lr.includes(t),c=!1;a<i.length;){var u=i[a++],h=g(u);if(h===yr.Data)l(s?A(u,yr.CustomData):u);else if(h===yr.ExtendedSegmentAddress)l(x(u));else if(h===yr.ExtendedLinearAddress)l(u);else if(h===yr.EndOfFile){c=!0;break}}if(a!==i.length)if(b(i))throw new Error("Board ID "+t+" Hex is from MakeCode, import this hex into the MakeCode editor to create a Universal Hex.");else throw new Error("EoF record found at record "+a+" of "+i.length+" in Board ID "+t+" hex ");o(T(0));for(var f=S(0).length+1,O=m(i),P=(512-r%512)%512;P>2*O;){var L=P-f>>1,u=S(D(L,O));l(u),P=(512-r%512)%512}return n.push(T(P>>1)),c&&n.push(p()),n.push(""),n.join("\n")}function L(e,t){if(void 0===t&&(t=!1),!e.length)return"";for(var n,r=t?O:P,a=p()+"\n",o=[],l=0;l<e.length-1;l++)n=r(e[l].hex,e[l].boardId),n.endsWith(a)&&(n=n.slice(0,n.length-a.length)),o.push(n);var d=r(e[e.length-1].hex,e[e.length-1].boardId);return o.push(d),d.endsWith(a)||o.push(a),o.join("")}function F(e){if(e.slice(0,":02000004".length)!==":02000004")return!1;for(var t=9;":"!==e[++t]&&t<Pr+3;);return!(":0400000A"!==e.slice(t,t+9))}function R(e){return g(e[0])===yr.ExtendedLinearAddress&&g(e[1])===yr.BlockStart&&g(e[e.length-1])===yr.EndOfFile}function b(e){var t=e.indexOf(p());if(t===e.length-1)for(;0<--t;)if(e[t]===E(536870912))return!0;for(;++t<e.length;){if(g(e[t])===yr.OtherData)return!0;if(e[t]===E(536870912))return!0}return!1}function _(e){var t=I(e);if(!t.length)throw new Error("Empty Universal Hex.");if(!R(t))throw new Error("Universal Hex format invalid.");for(var n=[yr.Data,yr.EndOfFile,yr.ExtendedSegmentAddress,yr.StartSegmentAddress],r={},a=0,o=0;o<t.length;o++){var l=t[o],d=g(l);if(n.includes(d))r[a].hex.push(l);else if(d===yr.CustomData)r[a].hex.push(A(l,yr.Data));else if(d===yr.ExtendedLinearAddress){var s=t[o+1];if(g(s)===yr.BlockStart){var c=u(s);if(4!==c.length)throw new Error("Block Start record invalid: "+s);a=(c[0]<<8)+c[1],r[a]=r[a]||{boardId:a,lastExtAdd:l,hex:[l]},o++}r[a].lastExtAdd!==l&&(r[a].lastExtAdd=l,r[a].hex.push(l))}}var h=[];return Object.keys(r).forEach(function(e){var t=r[e].hex;t[t.length-1]!==p()&&(t[t.length]=p()),h.push({boardId:r[e].boardId,hex:t.join("\n")+"\n"})}),h}var B=t(function(e){var t=e.exports={version:"2.6.11"};"number"==typeof __e&&(__e=t)}),H=B.version,Y=t(function(e){var t=e.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=t)}),U=t(function(e){var t=Y["__core-js_shared__"]||(Y["__core-js_shared__"]={});(e.exports=function(e,n){return t[e]||(t[e]=n===void 0?{}:n)})("versions",[]).push({version:B.version,mode:"global",copyright:"\xA9 2019 Denis Pushkarev (zloirock.ru)"})}),M=0,$=Math.random(),G=function(e){return"Symbol(".concat(e===void 0?"":e,")_",(++M+$).toString(36))},V=t(function(e){var t=U("wks"),n=Y.Symbol,r="function"==typeof n,a=e.exports=function(e){return t[e]||(t[e]=r&&n[e]||(r?n:G)("Symbol."+e))};a.store=t}),W=function(e){return"object"==typeof e?null!==e:"function"==typeof e},w=function(e){if(!W(e))throw TypeError(e+" is not an object!");return e},K=function(e){try{return!!e()}catch(t){return!0}},X=!K(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a}),z=Y.document,q=W(z)&&W(z.createElement),Z=function(e){return q?z.createElement(e):{}},J=!X&&!K(function(){return 7!=Object.defineProperty(Z("div"),"a",{get:function(){return 7}}).a}),Q=function(e,t){if(!W(e))return e;var n,r;if(t&&"function"==typeof(n=e.toString)&&!W(r=n.call(e)))return r;if("function"==typeof(n=e.valueOf)&&!W(r=n.call(e)))return r;if(!t&&"function"==typeof(n=e.toString)&&!W(r=n.call(e)))return r;throw TypeError("Can't convert object to primitive value")},ee=Object.defineProperty,te=X?Object.defineProperty:function(e,t,n){if(w(e),t=Q(t,!0),w(n),J)try{return ee(e,t,n)}catch(t){}if("get"in n||"set"in n)throw TypeError("Accessors not supported!");return"value"in n&&(e[t]=n.value),e},f={f:te},ne=function(e,t){return{enumerable:!(1&e),configurable:!(2&e),writable:!(4&e),value:t}},re=X?function(e,t,n){return f.f(e,t,ne(1,n))}:function(e,t,n){return e[t]=n,e},ae=V("unscopables"),oe=Array.prototype;oe[ae]==null&&re(oe,ae,{});var le=function(e){oe[ae][e]=!0},ie=function(e,t){return{value:t,done:!!e}},de={},se={}.toString,ce=function(e){return se.call(e).slice(8,-1)},ge=Object("z").propertyIsEnumerable(0)?Object:function(e){return"String"==ce(e)?e.split(""):Object(e)},ue=function(e){if(e==null)throw TypeError("Can't call method on  "+e);return e},he=function(e){return ge(ue(e))},pe={}.hasOwnProperty,Ee=function(e,t){return pe.call(e,t)},fe=U("native-function-to-string",Function.toString),ye=t(function(e){var t=G("src"),n="toString",r=(""+fe).split(n);B.inspectSource=function(e){return fe.call(e)},(e.exports=function(e,n,a,o){var l="function"==typeof a;l&&(Ee(a,"name")||re(a,"name",n));e[n]===a||(l&&(Ee(a,t)||re(a,t,e[n]?""+e[n]:r.join(n+""))),e===Y?e[n]=a:o?e[n]?e[n]=a:re(e,n,a):(delete e[n],re(e,n,a)))})(Function.prototype,n,function(){return"function"==typeof this&&this[t]||fe.call(this)})}),Te=function(e){if("function"!=typeof e)throw TypeError(e+" is not a function!");return e},Se=function(e,t,n){return(Te(e),void 0===t)?e:1===n?function(n){return e.call(t,n)}:2===n?function(n,r){return e.call(t,n,r)}:3===n?function(n,r,a){return e.call(t,n,r,a)}:function(){return e.apply(t,arguments)}},Ae="prototype",xe=function(e,t,n){var r,a,o,l,i=e&xe.F,d=e&xe.G,s=e&xe.S,c=e&xe.P,g=e&xe.B,u=d?Y:s?Y[t]||(Y[t]={}):(Y[t]||{})[Ae],h=d?B:B[t]||(B[t]={}),p=h[Ae]||(h[Ae]={});for(r in d&&(n=t),n)a=!i&&u&&void 0!==u[r],o=(a?u:n)[r],l=g&&a?Se(o,Y):c&&"function"==typeof o?Se(Function.call,o):o,u&&ye(u,r,o,e&xe.U),h[r]!=o&&re(h,r,l),c&&p[r]!=o&&(p[r]=o)};Y.core=B,xe.F=1,xe.G=2,xe.S=4,xe.P=8,xe.B=16,xe.W=32,xe.U=64,xe.R=128;var Ie=xe,me=function(e){return isNaN(e=+e)?0:(0<e?v:C)(e)},Oe=function(e){return 0<e?D(me(e),9007199254740991):0},Pe=function(e,t){return e=me(e),0>e?k(e+t,0):D(e,t)},Le=function(e){return function(t,n,r){var a,o=he(t),l=Oe(o.length),i=Pe(r,l);if(e&&n!=n){for(;l>i;)if(a=o[i++],a!=a)return!0;}else for(;l>i;i++)if((e||i in o)&&o[i]===n)return e||i||0;return!e&&-1}},Fe=U("keys"),Re=function(e){return Fe[e]||(Fe[e]=G(e))},be=Le(!1),_e=Re("IE_PROTO"),Ne=function(e,t){var n,r=he(e),a=0,o=[];for(n in r)n!=_e&&Ee(r,n)&&o.push(n);for(;t.length>a;)Ee(r,n=t[a++])&&(~be(o,n)||o.push(n));return o},ke=["constructor","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf"],ve=Object.keys||function(e){return Ne(e,ke)},Ce=X?Object.defineProperties:function(e,t){w(e);for(var n,r=ve(t),a=r.length,o=0;a>o;)f.f(e,n=r[o++],t[n]);return e},De=Y.document,Be=De&&De.documentElement,He=Re("IE_PROTO"),Ye=function(){},Ue="prototype",Me=function(){var e,t=Z("iframe"),n=ke.length,r="<",a=">";for(t.style.display="none",Be.appendChild(t),t.src="javascript:",e=t.contentWindow.document,e.open(),e.write(r+"script"+a+"document.F=Object"+r+"/script"+a),e.close(),Me=e.F;n--;)delete Me[Ue][ke[n]];return Me()},$e=Object.create||function(e,t){var n;return null===e?n=Me():(Ye[Ue]=w(e),n=new Ye,Ye[Ue]=null,n[He]=e),void 0===t?n:Ce(n,t)},Ge=f.f,Ve=V("toStringTag"),je=function(e,t,n){e&&!Ee(e=n?e:e.prototype,Ve)&&Ge(e,Ve,{configurable:!0,value:t})},We={};re(We,V("iterator"),function(){return this});var we=function(e,t,n){e.prototype=$e(We,{next:ne(1,n)}),je(e,t+" Iterator")},Ke=function(e){return Object(ue(e))},Xe=Re("IE_PROTO"),ze=Object.prototype,qe=Object.getPrototypeOf||function(e){return e=Ke(e),Ee(e,Xe)?e[Xe]:"function"==typeof e.constructor&&e instanceof e.constructor?e.constructor.prototype:e instanceof Object?ze:null},Ze=V("iterator"),Je=!([].keys&&"next"in[].keys()),Qe="keys",et="values",tt=function(){return this},nt=function(e,t,n,r,a,o,l){we(n,t,r);var i,d,s,c=function(e){return!Je&&e in p?p[e]:e===Qe?function(){return new n(this,e)}:e===et?function(){return new n(this,e)}:function(){return new n(this,e)}},g=t+" Iterator",u=a==et,h=!1,p=e.prototype,E=p[Ze]||p["@@iterator"]||a&&p[a],f=E||c(a),y=a?u?c("entries"):f:void 0,T="Array"==t?p.entries||E:E;if(T&&(s=qe(T.call(new e)),s!==Object.prototype&&s.next&&(je(s,g,!0),"function"!=typeof s[Ze]&&re(s,Ze,tt))),u&&E&&E.name!==et&&(h=!0,f=function(){return E.call(this)}),(Je||h||!p[Ze])&&re(p,Ze,f),de[t]=f,de[g]=tt,a)if(i={values:u?f:c(et),keys:o?f:c(Qe),entries:y},l)for(d in i)d in p||ye(p,d,i[d]);else Ie(Ie.P+Ie.F*(Je||h),t,i);return i},rt=nt(Array,"Array",function(e,t){this._t=he(e),this._i=0,this._k=t},function(){var e=this._t,t=this._k,n=this._i++;return!e||n>=e.length?(this._t=void 0,ie(1)):"keys"==t?ie(0,n):"values"==t?ie(0,e[n]):ie(0,[n,e[n]])},"values");de.Arguments=de.Array,le("keys"),le("values"),le("entries");for(var ot=V("iterator"),lt=V("toStringTag"),it=de.Array,dt={CSSRuleList:!0,CSSStyleDeclaration:!1,CSSValueList:!1,ClientRectList:!1,DOMRectList:!1,DOMStringList:!1,DOMTokenList:!0,DataTransferItemList:!1,FileList:!1,HTMLAllCollection:!1,HTMLCollection:!1,HTMLFormElement:!1,HTMLSelectElement:!1,MediaList:!0,MimeTypeArray:!1,NamedNodeMap:!1,NodeList:!0,PaintRequestList:!1,Plugin:!1,PluginArray:!1,SVGLengthList:!1,SVGNumberList:!1,SVGPathSegList:!1,SVGPointList:!1,SVGStringList:!1,SVGTransformList:!1,SourceBufferList:!1,StyleSheetList:!0,TextTrackCueList:!1,TextTrackList:!1,TouchList:!1},st=ve(dt),ct=0;ct<st.length;ct++){var gt,ut=st[ct],ht=dt[ut],pt=Y[ut],Et=pt&&pt.prototype;if(Et&&(Et[ot]||re(Et,ot,it),Et[lt]||re(Et,lt,ut),de[ut]=it,ht))for(gt in rt)Et[gt]||ye(Et,gt,rt[gt],!0)}var ft=V("toStringTag"),yt="Arguments"==ce(function(){return arguments}()),Tt=function(e,t){try{return e[t]}catch(t){}},St=function(e){var t,n,r;return e===void 0?"Undefined":null===e?"Null":"string"==typeof(n=Tt(t=Object(e),ft))?n:yt?ce(t):"Object"==(r=ce(t))&&"function"==typeof t.callee?"Arguments":r},At={};At[V("toStringTag")]="z","[object z]"!=At+""&&ye(Object.prototype,"toString",function(){return"[object "+St(this)+"]"},!0);(function(e,t){var n=(B.Object||{})[e]||Object[e],r={};r[e]=t(n),Ie(Ie.S+Ie.F*K(function(){n(1)}),"Object",r)})("keys",function(){return function(e){return ve(Ke(e))}});var xt=V("match"),It=function(e){var t;return W(e)&&((t=e[xt])===void 0?"RegExp"==ce(e):!!t)},mt=function(e,t,n){if(It(t))throw TypeError("String#"+n+" doesn't accept regex!");return ue(e)+""},Ot=V("match"),Pt=function(e){var t=/./;try{"/./"[e](t)}catch(n){try{return t[Ot]=!1,!"/./"[e](t)}catch(e){}}return!0},Lt="includes";Ie(Ie.P+Ie.F*Pt(Lt),"String",{includes:function(e){return!!~mt(this,e,Lt).indexOf(e,1<arguments.length?arguments[1]:void 0)}});var Ft="".endsWith;Ie(Ie.P+Ie.F*Pt("endsWith"),"String",{endsWith:function(e){var t=mt(this,e,"endsWith"),n=1<arguments.length?arguments[1]:void 0,r=Oe(t.length),a=n===void 0?r:D(Oe(n),r),o=e+"";return Ft.call(t,o,a)}});var Rt=Le(!0);Ie(Ie.P,"Array",{includes:function(e){return Rt(this,e,1<arguments.length?arguments[1]:void 0)}}),le("includes");var bt=function(e){return function(t,n){var r,o,d=ue(t)+"",s=me(n),i=d.length;return 0>s||s>=i?e?"":void 0:(r=d.charCodeAt(s),55296>r||56319<r||s+1===i||56320>(o=d.charCodeAt(s+1))||57343<o?e?d.charAt(s):r:e?d.slice(s,s+2):(r-55296<<10)+(o-56320)+65536)}}(!0),at=function(e,t,n){return t+(n?bt(e,t).length:1)},_t=RegExp.prototype.exec,Nt=function(e,t){var n=e.exec;if("function"==typeof n){var r=n.call(e,t);if("object"!=typeof r)throw new TypeError("RegExp exec method returned something other than an Object or null");return r}if("RegExp"!==St(e))throw new TypeError("RegExp#exec called on incompatible receiver");return _t.call(e,t)},kt=function(){var e=w(this),t="";return e.global&&(t+="g"),e.ignoreCase&&(t+="i"),e.multiline&&(t+="m"),e.unicode&&(t+="u"),e.sticky&&(t+="y"),t},vt=RegExp.prototype.exec,Ct=N.replace,Dt=vt,Bt="lastIndex",Ht=function(){var e=/a/,t=/b*/g;return vt.call(e,"a"),vt.call(t,"a"),0!==e[Bt]||0!==t[Bt]}(),Yt=/()??/.exec("")[1]!==void 0;(Ht||Yt)&&(Dt=function(e){var t,n,r,a,o=this;return Yt&&(n=new RegExp("^"+o.source+"$(?!\\s)",kt.call(o))),Ht&&(t=o[Bt]),r=vt.call(o,e),Ht&&r&&(o[Bt]=o.global?r.index+r[0].length:t),Yt&&r&&1<r.length&&Ct.call(r[0],n,function(){for(a=1;a<arguments.length-2;a++)void 0===arguments[a]&&(r[a]=void 0)}),r});var Ut=Dt;Ie({target:"RegExp",proto:!0,forced:Ut!==/./.exec},{exec:Ut});var Mt=V("species"),$t=!K(function(){var e=/./;return e.exec=function(){var e=[];return e.groups={a:"7"},e},"7"!=="".replace(e,"$<a>")}),Gt=function(){var e=/(?:)/,t=e.exec;e.exec=function(){return t.apply(this,arguments)};var n="ab".split(e);return 2===n.length&&"a"===n[0]&&"b"===n[1]}(),Vt=function(e,t,n){var r=V(e),a=!K(function(){var t={};return t[r]=function(){return 7},7!=""[e](t)}),o=a?!K(function(){var t=!1,n=/a/;return n.exec=function(){return t=!0,null},"split"===e&&(n.constructor={},n.constructor[Mt]=function(){return n}),n[r](""),!t}):void 0;if(!a||!o||"replace"===e&&!$t||"split"===e&&!Gt){var l=/./[r],i=n(ue,r,""[e],function(e,t,n,r,o){return t.exec===Ut?a&&!o?{done:!0,value:l.call(t,n,r)}:{done:!0,value:e.call(n,t,r)}:{done:!1}}),d=i[0],s=i[1];ye(String.prototype,e,d),re(RegExp.prototype,r,2==t?function(e,t){return s.call(e,this,t)}:function(e){return s.call(e,this)})}},jt=function(e){return e===void 0?e:e+""};Vt("replace",2,function(e,t,n,r){function a(e,t,r,a,o,l){var i=r+e.length,d=a.length,s=/\$([$&`']|\d\d?)/g;return void 0!==o&&(o=Ke(o),s=/\$([$&`']|\d\d?|<[^>]*>)/g),n.call(l,s,function(l,s){var c;switch(s.charAt(0)){case"$":return"$";case"&":return e;case"`":return t.slice(0,r);case"'":return t.slice(i);case"<":c=o[s.slice(1,-1)];break;default:var g=+s;if(0==g)return l;if(g>d){var n=v(g/10);return 0===n?l:n<=d?void 0===a[n-1]?s.charAt(1):a[n-1]+s.charAt(1):l}c=a[g-1];}return void 0===c?"":c})}return[function(r,a){var o=e(this),l=r==null?void 0:r[t];return l===void 0?n.call(o+"",r,a):l.call(r,o,a)},function(e,t){var o=r(n,e,this,t);if(o.done)return o.value;var l=w(e),d=this+"",s="function"==typeof t;s||(t=t+"");var c=l.global;if(c){var g=l.unicode;l.lastIndex=0}for(var u,h=[];(u=Nt(l,d),null!==u)&&!(h.push(u),!c);){var p=u[0]+"";""==p&&(l.lastIndex=at(d,Oe(l.lastIndex),g))}for(var E="",f=0,y=0;y<h.length;y++){u=h[y];for(var T=u[0]+"",S=k(D(me(u.index),d.length),0),A=[],x=1;x<u.length;x++)A.push(jt(u[x]));var I=u.groups;if(s){var m=[T].concat(A,S,d);I!==void 0&&m.push(I);var O=t.apply(void 0,m)+""}else O=a(T,d,S,A,I,t);S>=f&&(E+=d.slice(f,S)+O,f=S+T.length)}return E+d.slice(f)}]});var Wt=V("species"),wt=function(e,t){var n,r=w(e).constructor;return r===void 0||(n=w(r)[Wt])==null?t:Te(n)},Kt=[].push,Xt="split",zt="length",qt="lastIndex",Zt=4294967295,Jt=!K(function(){RegExp(Zt,"y")});Vt("split",2,function(e,t,n,r){var a;return a="c"=="abbc"[Xt](/(b)*/)[1]||4!="test"[Xt](/(?:)/,-1)[zt]||2!="ab"[Xt](/(?:ab)*/)[zt]||4!="."[Xt](/(.?)(.?)/)[zt]||1<"."[Xt](/()()/)[zt]||""[Xt](/.?/)[zt]?function(e,t){var r=this+"";if(void 0===e&&0===t)return[];if(!It(e))return n.call(r,e,t);for(var a,o,l,i=[],d=(e.ignoreCase?"i":"")+(e.multiline?"m":"")+(e.unicode?"u":"")+(e.sticky?"y":""),s=0,c=void 0===t?Zt:t>>>0,g=new RegExp(e.source,d+"g");(a=Ut.call(g,r))&&(o=g[qt],!(o>s&&(i.push(r.slice(s,a.index)),1<a[zt]&&a.index<r[zt]&&Kt.apply(i,a.slice(1)),l=a[0][zt],s=o,i[zt]>=c)));)g[qt]===a.index&&g[qt]++;return s===r[zt]?(l||!g.test(""))&&i.push(""):i.push(r.slice(s)),i[zt]>c?i.slice(0,c):i}:"0"[Xt](void 0,0)[zt]?function(e,t){return void 0===e&&0===t?[]:n.call(this,e,t)}:n,[function(n,r){var o=e(this),l=null==n?void 0:n[t];return void 0===l?a.call(o+"",n,r):l.call(n,o,r)},function(t,o){var l=r(a,t,this,o,a!==n);if(l.done)return l.value;var d=w(t),s=this+"",c=wt(d,RegExp),g=d.unicode,u=(d.ignoreCase?"i":"")+(d.multiline?"m":"")+(d.unicode?"u":"")+(Jt?"y":"g"),h=new c(Jt?d:"^(?:"+d.source+")",u),E=void 0===o?Zt:o>>>0;if(0===E)return[];if(0===s.length)return null===Nt(h,s)?[s]:[];for(var f=0,y=0,T=[];y<s.length;){h.lastIndex=Jt?y:0;var S,A=Nt(h,Jt?s:s.slice(y));if(null===A||(S=D(Oe(h.lastIndex+(Jt?0:y)),s.length))===f)y=at(s,y,g);else{if(T.push(s.slice(f,y)),T.length===E)return T;for(var x=1;x<=A.length-1;x++)if(T.push(A[x]),T.length===E)return T;y=f=S}}return T.push(s.slice(f)),T}]});var Qt=function(e){for(var t=Ke(this),n=Oe(t.length),r=arguments.length,a=Pe(1<r?arguments[1]:void 0,n),o=2<r?arguments[2]:void 0,l=void 0===o?n:Pe(o,n);l>a;)t[a++]=e;return t};Ie(Ie.P,"Array",{fill:Qt}),le("fill");for(var en,tn=G("typed_array"),nn=G("view"),rn=!!(Y.ArrayBuffer&&Y.DataView),an=rn,on=0,ln=["Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Uint16Array","Int32Array","Uint32Array","Float32Array","Float64Array"];on<9;)(en=Y[ln[on++]])?(re(en.prototype,tn,!0),re(en.prototype,nn,!0)):an=!1;var dn={ABV:rn,CONSTR:an,TYPED:tn,VIEW:nn},sn=function(e,t,n){for(var r in t)ye(e,r,t[r],n);return e},cn=function(e,t,n,r){if(!(e instanceof t)||r!==void 0&&r in e)throw TypeError(n+": incorrect invocation!");return e},gn=function(e){if(e===void 0)return 0;var t=me(e),n=Oe(t);if(t!==n)throw RangeError("Wrong length!");return n},un=ke.concat("length","prototype"),hn=Object.getOwnPropertyNames||function(e){return Ne(e,un)},pn={f:hn},En=t(function(e,t){function n(t,n,r){var a,o,l,d=Array(r),g=8*r-n-1,u=(1<<g)-1,h=u>>1,p=23===n?F(2,-24)-F(2,-77):0,E=0,f=0>t||0===t&&0>1/t?1:0;for(t=L(t),t!=t||t===O?(o=t==t?0:1,a=u):(a=R(b(t)/_),1>t*(l=F(2,-a))&&(a--,l*=2),t+=1<=a+h?p/l:p*F(2,1-h),2<=t*l&&(a++,l/=2),a+h>=u?(o=0,a=u):1<=a+h?(o=(t*l-1)*F(2,n),a+=h):(o=t*F(2,h-1)*F(2,n),a=0));8<=n;d[E++]=255&o,o/=256,n-=8);for(a=a<<n|o,g+=n;0<g;d[E++]=255&a,a/=256,g-=8);return d[--E]|=128*f,d}function r(t,n,r){var a,o=8*r-n-1,l=(1<<o)-1,d=l>>1,c=o-7,g=r-1,u=t[g--],h=127&u;for(u>>=7;0<c;h=256*h+t[g],g--,c-=8);for(a=h&(1<<-c)-1,h>>=-c,c+=n;0<c;a=256*a+t[g],g--,c-=8);if(0===h)h=1-d;else{if(h===l)return a?NaN:u?-O:O;a+=F(2,n),h-=d}return(u?-1:1)*a*F(2,h-n)}function a(e){return e[3]<<24|e[2]<<16|e[1]<<8|e[0]}function o(e){return[255&e]}function l(e){return[255&e,255&e>>8]}function i(e){return[255&e,255&e>>8,255&e>>16,255&e>>24]}function d(e){return n(e,52,8)}function s(e){return n(e,23,4)}function c(e,t,n){p(e.prototype,t,{get:function(){return this[n]}})}function g(e,t,n,r){var a=gn(+n);if(a+t>e[B])throw I("Wrong index!");var o=e[D]._b,l=a+e[H],i=o.slice(l,l+t);return r?i:i.reverse()}function u(e,t,n,r,a,o){var l=gn(+n);if(l+t>e[B])throw I("Wrong index!");for(var d=e[D]._b,s=l+e[H],c=r(+a),g=0;g<t;g++)d[s+g]=c[o?g:t-g-1]}var h=pn.f,p=f.f,E="ArrayBuffer",y="DataView",T="prototype",S=Y[E],A=Y[y],x=Y.Math,I=Y.RangeError,O=Y.Infinity,P=S,L=x.abs,F=x.pow,R=v,b=x.log,_=x.LN2,N="buffer",k="byteLength",C="byteOffset",D=X?"_b":N,B=X?"_l":k,H=X?"_o":C;if(!dn.ABV)S=function(e){cn(this,S,E);var t=gn(e);this._b=Qt.call(Array(t),0),this[B]=t},A=function(e,t,n){cn(this,A,y),cn(e,S,y);var r=e[B],a=me(t);if(0>a||a>r)throw I("Wrong offset!");if(n=void 0===n?r-a:Oe(n),a+n>r)throw I("Wrong length!");this[D]=e,this[H]=a,this[B]=n},X&&(c(S,k,"_l"),c(A,N,"_b"),c(A,k,"_l"),c(A,C,"_o")),sn(A[T],{getInt8:function(e){return g(this,1,e)[0]<<24>>24},getUint8:function(e){return g(this,1,e)[0]},getInt16:function(e){var t=g(this,2,e,arguments[1]);return(t[1]<<8|t[0])<<16>>16},getUint16:function(e){var t=g(this,2,e,arguments[1]);return t[1]<<8|t[0]},getInt32:function(e){return a(g(this,4,e,arguments[1]))},getUint32:function(e){return a(g(this,4,e,arguments[1]))>>>0},getFloat32:function(e){return r(g(this,4,e,arguments[1]),23,4)},getFloat64:function(e){return r(g(this,8,e,arguments[1]),52,8)},setInt8:function(e,t){u(this,1,e,o,t)},setUint8:function(e,t){u(this,1,e,o,t)},setInt16:function(e,t){u(this,2,e,l,t,arguments[2])},setUint16:function(e,t){u(this,2,e,l,t,arguments[2])},setInt32:function(e,t){u(this,4,e,i,t,arguments[2])},setUint32:function(e,t){u(this,4,e,i,t,arguments[2])},setFloat32:function(e,t){u(this,4,e,s,t,arguments[2])},setFloat64:function(e,t){u(this,8,e,d,t,arguments[2])}});else{if(!K(function(){S(1)})||!K(function(){new S(-1)})||K(function(){return new S,new S(1.5),new S(NaN),S.name!=E})){S=function(e){return cn(this,S),new P(gn(e))};for(var U,M=S[T]=P[T],$=h(P),G=0;$.length>G;)(U=$[G++])in S||re(S,U,P[U]);M.constructor=S}var m=new A(new S(2)),V=A[T].setInt8;m.setInt8(0,2147483648),m.setInt8(1,2147483649),(m.getInt8(0)||!m.getInt8(1))&&sn(A[T],{setInt8:function(e,t){V.call(this,e,t<<24>>24)},setUint8:function(e,t){V.call(this,e,t<<24>>24)}},!0)}je(S,E),je(A,y),re(A[T],dn.VIEW,!0),t[E]=S,t[y]=A}),fn=V("iterator"),yn=Array.prototype,Tn=function(e){return e!==void 0&&(de.Array===e||yn[fn]===e)},Sn=V("iterator"),An=B.getIteratorMethod=function(e){if(e!=null)return e[Sn]||e["@@iterator"]||de[St(e)]},xn=Array.isArray||function(e){return"Array"==ce(e)},In=V("species"),mn=function(e){var t;return xn(e)&&(t=e.constructor,"function"==typeof t&&(t===Array||xn(t.prototype))&&(t=void 0),W(t)&&(t=t[In],null===t&&(t=void 0))),void 0===t?Array:t},On=function(e,t){return new(mn(e))(t)},Pn=function(e,t){var n=1==e,r=4==e,a=6==e,o=t||On;return function(t,l,i){for(var d,s,c=Ke(t),g=ge(c),u=Se(l,i,3),h=Oe(g.length),p=0,E=n?o(t,h):2==e?o(t,0):void 0;h>p;p++)if((5==e||a||p in g)&&(d=g[p],s=u(d,p,c),e))if(n)E[p]=s;else if(s)switch(e){case 3:return!0;case 5:return d;case 6:return p;case 2:E.push(d);}else if(r)return!1;return a?-1:3==e||r?r:E}},Ln=V("iterator"),Fn=!1;try{var Rn=[7][Ln]();Rn["return"]=function(){Fn=!0},Array.from(Rn,function(){throw 2})}catch(t){}var bn=function(e,t){if(!t&&!Fn)return!1;var n=!1;try{var r=[7],a=r[Ln]();a.next=function(){return{done:n=!0}},r[Ln]=function(){return a},e(r)}catch(t){}return n},_n=V("species"),Nn=function(e){var t=Y[e];X&&t&&!t[_n]&&f.f(t,_n,{configurable:!0,get:function(){return this}})},kn=[].copyWithin||function(e,t){var n=Ke(this),r=Oe(n.length),a=Pe(e,r),o=Pe(t,r),l=2<arguments.length?arguments[2]:void 0,i=D((l===void 0?r:Pe(l,r))-o,r-a),d=1;for(o<a&&a<o+i&&(d=-1,o+=i-1,a+=i-1);0<i--;)o in n?n[a]=n[o]:delete n[a],a+=d,o+=d;return n},vn={}.propertyIsEnumerable,Cn={f:vn},Dn=Object.getOwnPropertyDescriptor,Bn=X?Dn:function(e,t){if(e=he(e),t=Q(t,!0),J)try{return Dn(e,t)}catch(t){}return Ee(e,t)?ne(!Cn.f.call(e,t),e[t]):void 0},Hn={f:Bn},Yn=t(function(e){if(X){var t=!1,n=Y,r=K,a=Ie,o=dn,l=En,i=cn,d=re,s=sn,c=Oe,g=gn,u=Pe,h=Q,p=Ee,E=St,y=W,T=Ke,S=pn.f,A=G,x=V,I=Pn,m=Le,P=wt,L=rt,F=f,R=Hn,b=F.f,O=R.f,_=n.RangeError,N=n.TypeError,k=n.Uint8Array,C="ArrayBuffer",D="Shared"+C,B="BYTES_PER_ELEMENT",H="prototype",U=Array[H],M=l.ArrayBuffer,$=l.DataView,j=I(0),w=I(2),z=I(3),q=I(4),Z=I(5),J=I(6),ee=m(!0),te=m(!1),ae=L.values,oe=L.keys,le=L.entries,ie=U.lastIndexOf,se=U.reduce,ce=U.reduceRight,ge=U.join,ue=U.sort,he=U.slice,pe=U.toString,fe=U.toLocaleString,ye=x("iterator"),Te=x("toStringTag"),Ae=A("typed_constructor"),xe=A("def_constructor"),Fe=o.CONSTR,Re=o.TYPED,be=o.VIEW,_e="Wrong length!",Ne=I(1,function(e,t){return Be(P(e,e[xe]),t)}),ke=r(function(){return 1===new k(new Uint16Array([1]).buffer)[0]}),ve=!!k&&!!k[H].set&&r(function(){new k(1).set({})}),Ce=function(e,t){var n=me(e);if(0>n||n%t)throw _("Wrong offset!");return n},De=function(e){if(y(e)&&Re in e)return e;throw N(e+" is not a typed array!")},Be=function(e,t){if(!(y(e)&&Ae in e))throw N("It is not a typed array constructor!");return new e(t)},He=function(e,t){return Ye(P(e,e[xe]),t)},Ye=function(e,t){for(var n=0,r=t.length,a=Be(e,r);r>n;)a[n]=t[n++];return a},Ue=function(e,t,n){b(e,t,{get:function(){return this._d[n]}})},Me=function(e){var t,n,r,a,o,l,d=T(e),s=arguments.length,g=1<s?arguments[1]:void 0,u=g!==void 0,h=An(d);if(h!=null&&!Tn(h)){for(l=h.call(d),r=[],t=0;!(o=l.next()).done;t++)r.push(o.value);d=r}for(u&&2<s&&(g=Se(g,arguments[2],2)),t=0,n=c(d.length),a=Be(this,n);n>t;t++)a[t]=u?g(d[t],t):d[t];return a},Ge=function(){for(var e=0,t=arguments.length,n=Be(this,t);t>e;)n[e]=arguments[e++];return n},Ve=!!k&&r(function(){fe.call(new k(1))}),je=function(){return fe.apply(Ve?he.call(De(this)):De(this),arguments)},We={copyWithin:function(e,t){return kn.call(De(this),e,t,2<arguments.length?arguments[2]:void 0)},every:function(e){return q(De(this),e,1<arguments.length?arguments[1]:void 0)},fill:function(){return Qt.apply(De(this),arguments)},filter:function(e){return He(this,w(De(this),e,1<arguments.length?arguments[1]:void 0))},find:function(e){return Z(De(this),e,1<arguments.length?arguments[1]:void 0)},findIndex:function(e){return J(De(this),e,1<arguments.length?arguments[1]:void 0)},forEach:function(e){j(De(this),e,1<arguments.length?arguments[1]:void 0)},indexOf:function(e){return te(De(this),e,1<arguments.length?arguments[1]:void 0)},includes:function(e){return ee(De(this),e,1<arguments.length?arguments[1]:void 0)},join:function(){return ge.apply(De(this),arguments)},lastIndexOf:function(){return ie.apply(De(this),arguments)},map:function(e){return Ne(De(this),e,1<arguments.length?arguments[1]:void 0)},reduce:function(){return se.apply(De(this),arguments)},reduceRight:function(){return ce.apply(De(this),arguments)},reverse:function(){for(var e,t=this,n=De(t).length,r=v(n/2),a=0;a<r;)e=t[a],t[a++]=t[--n],t[n]=e;return t},some:function(e){return z(De(this),e,1<arguments.length?arguments[1]:void 0)},sort:function(e){return ue.call(De(this),e)},subarray:function(e,t){var n=De(this),r=n.length,a=u(e,r);return new(P(n,n[xe]))(n.buffer,n.byteOffset+a*n.BYTES_PER_ELEMENT,c((t===void 0?r:u(t,r))-a))}},we=function(e,t){return He(this,he.call(De(this),e,t))},Xe=function(e){De(this);var t=Ce(arguments[1],1),n=this.length,r=T(e),a=c(r.length),o=0;if(a+t>n)throw _(_e);for(;o<a;)this[t+o]=r[o++]},ze={entries:function(){return le.call(De(this))},keys:function(){return oe.call(De(this))},values:function(){return ae.call(De(this))}},Ze=function(e,t){return y(e)&&e[Re]&&"symbol"!=typeof t&&t in e&&+t+""==t+""},Je=function(e,t){return Ze(e,t=h(t,!0))?ne(2,e[t]):O(e,t)},Qe=function(e,t,n){return Ze(e,t=h(t,!0))&&y(n)&&p(n,"value")&&!p(n,"get")&&!p(n,"set")&&!n.configurable&&(!p(n,"writable")||n.writable)&&(!p(n,"enumerable")||n.enumerable)?(e[t]=n.value,e):b(e,t,n)};Fe||(R.f=Je,F.f=Qe),a(a.S+a.F*!Fe,"Object",{getOwnPropertyDescriptor:Je,defineProperty:Qe}),r(function(){pe.call({})})&&(pe=fe=function(){return ge.call(this)});var et=s({},We);s(et,ze),d(et,ye,ze.values),s(et,{slice:we,set:Xe,constructor:function(){},toString:pe,toLocaleString:je}),Ue(et,"buffer","b"),Ue(et,"byteOffset","o"),Ue(et,"byteLength","l"),Ue(et,"length","e"),b(et,Te,{get:function(){return this[Re]}}),e.exports=function(e,l,s,u){u=!!u;var h=e+(u?"Clamped":"")+"Array",p=n[h],f=p||{},T=p&&qe(p),A=!p||!o.ABV,x={},I=p&&p[H],m=function(t,n){var r=t._d;return r.v["get"+e](n*l+r.o,ke)},O=function(t,n,r){var a=t._d;u&&(r=0>(r=Math.round(r))?0:255<r?255:255&r),a.v["set"+e](n*l+a.o,r,ke)},P=function(e,t){b(e,t,{get:function(){return m(this,t)},set:function(e){return O(this,t,e)},enumerable:!0})};A?(p=s(function(e,t,n,r){i(e,p,h,"_d");var a,o,s,u,f=0,T=0;if(!y(t))s=g(t),o=s*l,a=new M(o);else if(t instanceof M||(u=E(t))==C||u==D){a=t,T=Ce(n,l);var S=t.byteLength;if(void 0===r){if(S%l)throw _(_e);if(o=S-T,0>o)throw _(_e)}else if(o=c(r)*l,o+T>S)throw _(_e);s=o/l}else return Re in t?Ye(p,t):Me.call(p,t);for(d(e,"_d",{b:a,o:T,l:o,e:s,v:new $(a)});f<s;)P(e,f++)}),I=p[H]=$e(et),d(I,"constructor",p)):(!r(function(){p(1)})||!r(function(){new p(-1)})||!bn(function(e){new p,new p(null),new p(1.5),new p(e)},!0))&&(p=s(function(e,t,n,r){i(e,p,h);var a;return y(t)?t instanceof M||(a=E(t))==C||a==D?void 0===r?void 0===n?new f(t):new f(t,Ce(n,l)):new f(t,Ce(n,l),r):Re in t?Ye(p,t):Me.call(p,t):new f(g(t))}),j(T===Function.prototype?S(f):S(f).concat(S(T)),function(e){e in p||d(p,e,f[e])}),p[H]=I,!t&&(I.constructor=p));var L=I[ye],F=!!L&&("values"==L.name||L.name==null),R=ze.values;d(p,Ae,!0),d(I,Re,h),d(I,be,!0),d(I,xe,p),(u?new p(1)[Te]!=h:!(Te in I))&&b(I,Te,{get:function(){return h}}),x[h]=p,a(a.G+a.W+a.F*(p!=f),x),a(a.S,h,{BYTES_PER_ELEMENT:l}),a(a.S+a.F*r(function(){f.of.call(p,1)}),h,{from:Me,of:Ge}),B in I||d(I,B,l),a(a.P,h,We),Nn(h),a(a.P+a.F*ve,h,{set:Xe}),a(a.P+a.F*!F,h,ze),t||I.toString==pe||(I.toString=pe),a(a.P+a.F*r(function(){new p(1).slice()}),h,{slice:we}),a(a.P+a.F*(r(function(){return[1,2].toLocaleString()!=new p([1,2]).toLocaleString()})||!r(function(){I.toLocaleString.call([1,2])})),h,{toLocaleString:je}),de[h]=F?L:R,t||F||d(I,ye,R)}}else e.exports=function(){}});Yn("Uint8",1,function(e){return function(t,n,r){return e(this,t,n,r)}}),X&&"g"!=/./g.flags&&f.f(RegExp.prototype,"flags",{configurable:!0,get:kt});var Un=/./.toString,Mn=function(e){ye(RegExp.prototype,"toString",e,!0)};K(function(){return"/a/b"!=Un.call({source:"a",flags:"b"})})?Mn(function(){var e=w(this);return"/".concat(e.source,"/","flags"in e?e.flags:!X&&e instanceof RegExp?kt.call(e):void 0)}):Un.name!="toString"&&Mn(function(){return Un.call(this)});var $n=function(e){var t=ue(this)+"",r="",a=me(e);if(0>a||a==1/0)throw RangeError("Count can't be negative");for(;0<a;(a>>>=1)&&(t+=t))1&a&&(r+=t);return r},Gn=function(e,t,n,r){var a=ue(e)+"",o=a.length,l=void 0===n?" ":n+"",i=Oe(t);if(i<=o||""==l)return a;var d=i-o,s=$n.call(l,C(d/l.length));return s.length>d&&(s=s.slice(0,d)),r?s+a:a+s},Vn=Y.navigator,jn=Vn&&Vn.userAgent||"",Wn=/Version\/10\.\d+(\.\d+)?( Mobile\/\w+)? Safari\//.test(jn);Ie(Ie.P+Ie.F*Wn,"String",{padStart:function(e){return Gn(this,e,1<arguments.length?arguments[1]:void 0,!0)}});Ie(Ie.S,"Number",{isInteger:function(e){return!W(e)&&isFinite(e)&&v(e)===e}});var wn=function(e,t){if(w(e),!W(t)&&null!==t)throw TypeError(t+": can't set as prototype!")},Kn={set:Object.setPrototypeOf||("__proto__"in{}?function(e,t,n){try{n=Se(Function.call,Hn.f(Object.prototype,"__proto__").set,2),n(e,[]),t=!(e instanceof Array)}catch(n){t=!0}return function(e,r){return wn(e,r),t?e.__proto__=r:n(e,r),e}}({},!1):void 0),check:wn},Xn=Kn.set,zn=function(e,t,n){var r,a=t.constructor;return a!==n&&"function"==typeof a&&(r=a.prototype)!==n.prototype&&W(r)&&Xn&&Xn(e,r),e},qn="\t\n\x0B\f\r \xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF",Zn="["+qn+"]",Jn="\u200B\x85",Qn=RegExp("^"+Zn+Zn+"*"),er=RegExp(Zn+Zn+"*$"),tr=function(e,t,n){var r={},a=K(function(){return!!qn[e]()||Jn[e]()!=Jn}),o=r[e]=a?t(nr):qn[e];n&&(r[n]=o),Ie(Ie.P+Ie.F*a,"String",r)},nr=tr.trim=function(e,t){return e=ue(e)+"",1&t&&(e=e.replace(Qn,"")),2&t&&(e=e.replace(er,"")),e},rr=pn.f,ar=Hn.f,or=f.f,lr=tr.trim,ir="Number",dr=Y[ir],sr=dr,cr=dr.prototype,gr=ce($e(cr))==ir,ur=("trim"in N),hr=function(e){var t=Q(e,!1);if("string"==typeof t&&2<t.length){t=ur?t.trim():lr(t,3);var n,r,a,o=t.charCodeAt(0);if(43===o||45===o){if(n=t.charCodeAt(2),88===n||120===n)return NaN;}else if(48===o){switch(t.charCodeAt(1)){case 66:case 98:r=2,a=49;break;case 79:case 111:r=8,a=55;break;default:return+t;}for(var d,s=t.slice(2),c=0,g=s.length;c<g;c++)if(d=s.charCodeAt(c),48>d||d>a)return NaN;return parseInt(s,r)}}return+t};if(!dr(" 0o1")||!dr("0b1")||dr("+0x1")){dr=function(e){var t=1>arguments.length?0:e,n=this;return n instanceof dr&&(gr?K(function(){cr.valueOf.call(n)}):ce(n)!=ir)?zn(new sr(hr(t)),n,dr):hr(t)};for(var pr,Er=X?rr(sr):"MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger".split(","),fr=0;Er.length>fr;fr++)Ee(sr,pr=Er[fr])&&!Ee(dr,pr)&&or(dr,pr,ar(sr,pr));dr.prototype=cr,cr.constructor=dr,ye(Y,ir,dr)}Ie(Ie.S,"Number",{isNaN:function(e){return e!=e}}),Vt("match",1,function(e,t,r,a){return[function(n){var r=e(this),a=n==null?void 0:n[t];return a===void 0?new RegExp(n)[t](r+""):a.call(n,r)},function(e){var t=a(r,e,this);if(t.done)return t.value;var o=w(e),l=this+"";if(!o.global)return Nt(o,l);var i=o.unicode;o.lastIndex=0;for(var d,s=[],c=0;null!==(d=Nt(o,l));){var g=d[0]+"";s[c]=g,""==g&&(o.lastIndex=at(l,Oe(o.lastIndex),i)),c++}return 0===c?null:s}]});var yr;(function(e){e[e.Data=0]="Data",e[e.EndOfFile=1]="EndOfFile",e[e.ExtendedSegmentAddress=2]="ExtendedSegmentAddress",e[e.StartSegmentAddress=3]="StartSegmentAddress",e[e.ExtendedLinearAddress=4]="ExtendedLinearAddress",e[e.StartLinearAddress=5]="StartLinearAddress",e[e.BlockStart=10]="BlockStart",e[e.BlockEnd=11]="BlockEnd",e[e.PaddedData=12]="PaddedData",e[e.CustomData=13]="CustomData",e[e.OtherData=14]="OtherData"})(yr||(yr={}));var Tr=":".length,Sr=2,Ar=4,xr=2,Ir=0+Tr+Sr+Ar+xr,mr=0,Or=Tr+Sr+Ar+xr+mr+2,Pr=Or-mr+64,Lr=[39168,39169];(function(e){e[e.V1=39168]="V1",e[e.V2=39171]="V2"})(e.microbitBoardId||(e.microbitBoardId={})),e.createUniversalHex=L,e.iHexToCustomFormatBlocks=O,e.iHexToCustomFormatSection=P,e.isMakeCodeForV1Hex=function(e){return b(I(e))},e.isUniversalHex=F,e.separateUniversalHex=_,Object.defineProperty(e,"__esModule",{value:!0})});
//# sourceMappingURL=microbit-uh.umd.min.js.map