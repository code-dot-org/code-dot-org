(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["code.org/views/theme_common_head_after"],{

/***/ "./node_modules/details-element-polyfill/dist/details-element-polyfill.js":
/*!********************************************************************************!*\
  !*** ./node_modules/details-element-polyfill/dist/details-element-polyfill.js ***!
  \********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/*
Details Element Polyfill 1.1.0
Copyright © 2017 Javan Makhmali
 */
(function(){}).call(this),function(){var t,e,n,r,o,u,i,a,l,c;a={element:function(){var t,e,n,r,o;return e=document.createElement("details"),"open"in e?(e.innerHTML="<summary>a</summary>b",e.setAttribute("style","position: absolute; left: -9999px"),r=null!=(o=document.body)?o:document.documentElement,r.appendChild(e),t=e.offsetHeight,e.open=!0,n=e.offsetHeight,r.removeChild(e),t!==n):!1}(),toggleEvent:function(){var t;return t=document.createElement("details"),"ontoggle"in t}()},a.element&&a.toggleEvent||(o=function(){return document.head.insertAdjacentHTML("afterbegin",'<style>@charset"UTF-8";details:not([open])>*:not(summary){display:none;}details>summary{display:block;}details>summary::before{content:"\u25ba";padding-right:0.3rem;font-size:0.6rem;cursor:default;}details[open]>summary::before{content:"\u25bc";}</style>')},r=function(){var t,e,n,r,o;return t=document.createElement("details").constructor.prototype,r=t.setAttribute,n=t.removeAttribute,o=null!=(e=Object.getOwnPropertyDescriptor(t,"open"))?e.set:void 0,Object.defineProperties(t,{open:{set:function(t){return"DETAILS"===this.tagName?(t?this.setAttribute("open",""):this.removeAttribute("open"),t):null!=o?o.call(this,t):void 0}},setAttribute:{value:function(t,e){return c(this,function(n){return function(){return r.call(n,t,e)}}(this))}},removeAttribute:{value:function(t){return c(this,function(e){return function(){return n.call(e,t)}}(this))}}})},u=function(){return n(function(t){return t.hasAttribute("open")?t.removeAttribute("open"):t.setAttribute("open","")})},i=function(){var t;return"undefined"!=typeof MutationObserver&&null!==MutationObserver?(t=new MutationObserver(function(t){var e,n,r,o,u,i;for(u=[],n=0,r=t.length;r>n;n++)o=t[n],i=o.target,e=o.attributeName,"DETAILS"===i.tagName&&"open"===e?u.push(l(i)):u.push(void 0);return u}),t.observe(document.documentElement,{attributes:!0,subtree:!0})):n(function(t){var e;return e=t.getAttribute("open"),setTimeout(function(){return t.getAttribute("open")!==e?l(t):void 0},1)})},t=function(t){return!(t.defaultPrevented||t.which>1||t.altKey||t.ctrlKey||t.metaKey||t.shiftKey||t.target.isContentEditable)},n=function(n){return addEventListener("click",function(r){var o,u;return t(r)&&(o=e(r.target,"SUMMARY"))&&"DETAILS"===(null!=(u=o.parentElement)?u.tagName:void 0)?n(o.parentElement):void 0},!1)},e=function(){return"function"==typeof Element.prototype.closest?function(t,e){return t.closest(e)}:function(t,e){for(;t;){if(t.tagName===e)return t;t=t.parentElement}}}(),l=function(t){var e;return e=document.createEvent("Events"),e.initEvent("toggle",!0,!1),t.dispatchEvent(e)},c=function(t,e){var n,r;return n=t.getAttribute("open"),r=e(),t.getAttribute("open")!==n&&l(t),r},a.element||(o(),r(),u()),a.element&&!a.toggleEvent&&i())}.call(this),function(){}.call(this);

/***/ }),

/***/ "./node_modules/js-cookie/src/js.cookie.js":
/*!*************************************************!*\
  !*** ./node_modules/js-cookie/src/js.cookie.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * JavaScript Cookie v2.1.3
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
;(function (factory) {
	var registeredInModuleLoader = false;
	if (true) {
		!(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
				__WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		registeredInModuleLoader = true;
	}
	if (true) {
		module.exports = factory();
		registeredInModuleLoader = true;
	}
	if (!registeredInModuleLoader) {
		var OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			var result;
			if (typeof document === 'undefined') {
				return;
			}

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				try {
					result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				if (!converter.write) {
					value = encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
				} else {
					value = converter.write(value, key);
				}

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				return (document.cookie = [
					key, '=', value,
					attributes.expires ? '; expires=' + attributes.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
					attributes.path ? '; path=' + attributes.path : '',
					attributes.domain ? '; domain=' + attributes.domain : '',
					attributes.secure ? '; secure' : ''
				].join(''));
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var cookie = parts.slice(1).join('=');

				if (cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					var name = parts[0].replace(rdecode, decodeURIComponent);
					cookie = converter.read ?
						converter.read(cookie, name) : converter(cookie, name) ||
						cookie.replace(rdecode, decodeURIComponent);

					if (this.json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					if (key === name) {
						result = cookie;
						break;
					}

					if (!key) {
						result[name] = cookie;
					}
				} catch (e) {}
			}

			return result;
		}

		api.set = api;
		api.get = function (key) {
			return api.call(api, key);
		};
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));


/***/ }),

/***/ "./node_modules/lazysizes/lazysizes.js":
/*!*********************************************!*\
  !*** ./node_modules/lazysizes/lazysizes.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

(function(window, factory) {
	var lazySizes = factory(window, window.document);
	window.lazySizes = lazySizes;
	if( true && module.exports){
		module.exports = lazySizes;
	}
}(window, function l(window, document) {
	'use strict';
	/*jshint eqnull:true */
	if(!document.getElementsByClassName){return;}

	var lazysizes, lazySizesConfig;

	var docElem = document.documentElement;

	var Date = window.Date;

	var supportPicture = window.HTMLPictureElement;

	var _addEventListener = 'addEventListener';

	var _getAttribute = 'getAttribute';

	var addEventListener = window[_addEventListener];

	var setTimeout = window.setTimeout;

	var requestAnimationFrame = window.requestAnimationFrame || setTimeout;

	var requestIdleCallback = window.requestIdleCallback;

	var regPicture = /^picture$/i;

	var loadEvents = ['load', 'error', 'lazyincluded', '_lazyloaded'];

	var regClassCache = {};

	var forEach = Array.prototype.forEach;

	var hasClass = function(ele, cls) {
		if(!regClassCache[cls]){
			regClassCache[cls] = new RegExp('(\\s|^)'+cls+'(\\s|$)');
		}
		return regClassCache[cls].test(ele[_getAttribute]('class') || '') && regClassCache[cls];
	};

	var addClass = function(ele, cls) {
		if (!hasClass(ele, cls)){
			ele.setAttribute('class', (ele[_getAttribute]('class') || '').trim() + ' ' + cls);
		}
	};

	var removeClass = function(ele, cls) {
		var reg;
		if ((reg = hasClass(ele,cls))) {
			ele.setAttribute('class', (ele[_getAttribute]('class') || '').replace(reg, ' '));
		}
	};

	var addRemoveLoadEvents = function(dom, fn, add){
		var action = add ? _addEventListener : 'removeEventListener';
		if(add){
			addRemoveLoadEvents(dom, fn);
		}
		loadEvents.forEach(function(evt){
			dom[action](evt, fn);
		});
	};

	var triggerEvent = function(elem, name, detail, noBubbles, noCancelable){
		var event = document.createEvent('CustomEvent');

		if(!detail){
			detail = {};
		}

		detail.instance = lazysizes;

		event.initCustomEvent(name, !noBubbles, !noCancelable, detail);

		elem.dispatchEvent(event);
		return event;
	};

	var updatePolyfill = function (el, full){
		var polyfill;
		if( !supportPicture && ( polyfill = (window.picturefill || lazySizesConfig.pf) ) ){
			polyfill({reevaluate: true, elements: [el]});
		} else if(full && full.src){
			el.src = full.src;
		}
	};

	var getCSS = function (elem, style){
		return (getComputedStyle(elem, null) || {})[style];
	};

	var getWidth = function(elem, parent, width){
		width = width || elem.offsetWidth;

		while(width < lazySizesConfig.minSize && parent && !elem._lazysizesWidth){
			width =  parent.offsetWidth;
			parent = parent.parentNode;
		}

		return width;
	};

	var rAF = (function(){
		var running, waiting;
		var firstFns = [];
		var secondFns = [];
		var fns = firstFns;

		var run = function(){
			var runFns = fns;

			fns = firstFns.length ? secondFns : firstFns;

			running = true;
			waiting = false;

			while(runFns.length){
				runFns.shift()();
			}

			running = false;
		};

		var rafBatch = function(fn, queue){
			if(running && !queue){
				fn.apply(this, arguments);
			} else {
				fns.push(fn);

				if(!waiting){
					waiting = true;
					(document.hidden ? setTimeout : requestAnimationFrame)(run);
				}
			}
		};

		rafBatch._lsFlush = run;

		return rafBatch;
	})();

	var rAFIt = function(fn, simple){
		return simple ?
			function() {
				rAF(fn);
			} :
			function(){
				var that = this;
				var args = arguments;
				rAF(function(){
					fn.apply(that, args);
				});
			}
		;
	};

	var throttle = function(fn){
		var running;
		var lastTime = 0;
		var gDelay = 125;
		var RIC_DEFAULT_TIMEOUT = 666;
		var rICTimeout = RIC_DEFAULT_TIMEOUT;
		var run = function(){
			running = false;
			lastTime = Date.now();
			fn();
		};
		var idleCallback = requestIdleCallback ?
			function(){
				requestIdleCallback(run, {timeout: rICTimeout});
				if(rICTimeout !== RIC_DEFAULT_TIMEOUT){
					rICTimeout = RIC_DEFAULT_TIMEOUT;
				}
			}:
			rAFIt(function(){
				setTimeout(run);
			}, true)
		;

		return function(isPriority){
			var delay;
			if((isPriority = isPriority === true)){
				rICTimeout = 44;
			}

			if(running){
				return;
			}

			running =  true;

			delay = gDelay - (Date.now() - lastTime);

			if(delay < 0){
				delay = 0;
			}

			if(isPriority || (delay < 9 && requestIdleCallback)){
				idleCallback();
			} else {
				setTimeout(idleCallback, delay);
			}
		};
	};

	//based on http://modernjavascript.blogspot.de/2013/08/building-better-debounce.html
	var debounce = function(func) {
		var timeout, timestamp;
		var wait = 99;
		var run = function(){
			timeout = null;
			func();
		};
		var later = function() {
			var last = Date.now() - timestamp;

			if (last < wait) {
				setTimeout(later, wait - last);
			} else {
				(requestIdleCallback || run)(run);
			}
		};

		return function() {
			timestamp = Date.now();

			if (!timeout) {
				timeout = setTimeout(later, wait);
			}
		};
	};


	var loader = (function(){
		var lazyloadElems, preloadElems, isCompleted, resetPreloadingTimer, loadMode, started;

		var eLvW, elvH, eLtop, eLleft, eLright, eLbottom;

		var defaultExpand, preloadExpand, hFac;

		var regImg = /^img$/i;
		var regIframe = /^iframe$/i;

		var supportScroll = ('onscroll' in window) && !(/glebot/.test(navigator.userAgent));

		var shrinkExpand = 0;
		var currentExpand = 0;

		var isLoading = 0;
		var lowRuns = -1;

		var resetPreloading = function(e){
			isLoading--;
			if(e && e.target){
				addRemoveLoadEvents(e.target, resetPreloading);
			}

			if(!e || isLoading < 0 || !e.target){
				isLoading = 0;
			}
		};

		var isNestedVisible = function(elem, elemExpand){
			var outerRect;
			var parent = elem;
			var visible = getCSS(document.body, 'visibility') == 'hidden' || getCSS(elem, 'visibility') != 'hidden';

			eLtop -= elemExpand;
			eLbottom += elemExpand;
			eLleft -= elemExpand;
			eLright += elemExpand;

			while(visible && (parent = parent.offsetParent) && parent != document.body && parent != docElem){
				visible = ((getCSS(parent, 'opacity') || 1) > 0);

				if(visible && getCSS(parent, 'overflow') != 'visible'){
					outerRect = parent.getBoundingClientRect();
					visible = eLright > outerRect.left &&
						eLleft < outerRect.right &&
						eLbottom > outerRect.top - 1 &&
						eLtop < outerRect.bottom + 1
					;
				}
			}

			return visible;
		};

		var checkElements = function() {
			var eLlen, i, rect, autoLoadElem, loadedSomething, elemExpand, elemNegativeExpand, elemExpandVal, beforeExpandVal;

			if((loadMode = lazySizesConfig.loadMode) && isLoading < 8 && (eLlen = lazyloadElems.length)){

				i = 0;

				lowRuns++;

				if(preloadExpand == null){
					if(!('expand' in lazySizesConfig)){
						lazySizesConfig.expand = docElem.clientHeight > 500 && docElem.clientWidth > 500 ? 500 : 370;
					}

					defaultExpand = lazySizesConfig.expand;
					preloadExpand = defaultExpand * lazySizesConfig.expFactor;
				}

				if(currentExpand < preloadExpand && isLoading < 1 && lowRuns > 2 && loadMode > 2 && !document.hidden){
					currentExpand = preloadExpand;
					lowRuns = 0;
				} else if(loadMode > 1 && lowRuns > 1 && isLoading < 6){
					currentExpand = defaultExpand;
				} else {
					currentExpand = shrinkExpand;
				}

				for(; i < eLlen; i++){

					if(!lazyloadElems[i] || lazyloadElems[i]._lazyRace){continue;}

					if(!supportScroll){unveilElement(lazyloadElems[i]);continue;}

					if(!(elemExpandVal = lazyloadElems[i][_getAttribute]('data-expand')) || !(elemExpand = elemExpandVal * 1)){
						elemExpand = currentExpand;
					}

					if(beforeExpandVal !== elemExpand){
						eLvW = innerWidth + (elemExpand * hFac);
						elvH = innerHeight + elemExpand;
						elemNegativeExpand = elemExpand * -1;
						beforeExpandVal = elemExpand;
					}

					rect = lazyloadElems[i].getBoundingClientRect();

					if ((eLbottom = rect.bottom) >= elemNegativeExpand &&
						(eLtop = rect.top) <= elvH &&
						(eLright = rect.right) >= elemNegativeExpand * hFac &&
						(eLleft = rect.left) <= eLvW &&
						(eLbottom || eLright || eLleft || eLtop) &&
						(lazySizesConfig.loadHidden || getCSS(lazyloadElems[i], 'visibility') != 'hidden') &&
						((isCompleted && isLoading < 3 && !elemExpandVal && (loadMode < 3 || lowRuns < 4)) || isNestedVisible(lazyloadElems[i], elemExpand))){
						unveilElement(lazyloadElems[i]);
						loadedSomething = true;
						if(isLoading > 9){break;}
					} else if(!loadedSomething && isCompleted && !autoLoadElem &&
						isLoading < 4 && lowRuns < 4 && loadMode > 2 &&
						(preloadElems[0] || lazySizesConfig.preloadAfterLoad) &&
						(preloadElems[0] || (!elemExpandVal && ((eLbottom || eLright || eLleft || eLtop) || lazyloadElems[i][_getAttribute](lazySizesConfig.sizesAttr) != 'auto')))){
						autoLoadElem = preloadElems[0] || lazyloadElems[i];
					}
				}

				if(autoLoadElem && !loadedSomething){
					unveilElement(autoLoadElem);
				}
			}
		};

		var throttledCheckElements = throttle(checkElements);

		var switchLoadingClass = function(e){
			addClass(e.target, lazySizesConfig.loadedClass);
			removeClass(e.target, lazySizesConfig.loadingClass);
			addRemoveLoadEvents(e.target, rafSwitchLoadingClass);
		};
		var rafedSwitchLoadingClass = rAFIt(switchLoadingClass);
		var rafSwitchLoadingClass = function(e){
			rafedSwitchLoadingClass({target: e.target});
		};

		var changeIframeSrc = function(elem, src){
			try {
				elem.contentWindow.location.replace(src);
			} catch(e){
				elem.src = src;
			}
		};

		var handleSources = function(source){
			var customMedia;

			var sourceSrcset = source[_getAttribute](lazySizesConfig.srcsetAttr);

			if( (customMedia = lazySizesConfig.customMedia[source[_getAttribute]('data-media') || source[_getAttribute]('media')]) ){
				source.setAttribute('media', customMedia);
			}

			if(sourceSrcset){
				source.setAttribute('srcset', sourceSrcset);
			}
		};

		var lazyUnveil = rAFIt(function (elem, detail, isAuto, sizes, isImg){
			var src, srcset, parent, isPicture, event, firesLoad;

			if(!(event = triggerEvent(elem, 'lazybeforeunveil', detail)).defaultPrevented){

				if(sizes){
					if(isAuto){
						addClass(elem, lazySizesConfig.autosizesClass);
					} else {
						elem.setAttribute('sizes', sizes);
					}
				}

				srcset = elem[_getAttribute](lazySizesConfig.srcsetAttr);
				src = elem[_getAttribute](lazySizesConfig.srcAttr);

				if(isImg) {
					parent = elem.parentNode;
					isPicture = parent && regPicture.test(parent.nodeName || '');
				}

				firesLoad = detail.firesLoad || (('src' in elem) && (srcset || src || isPicture));

				event = {target: elem};

				if(firesLoad){
					addRemoveLoadEvents(elem, resetPreloading, true);
					clearTimeout(resetPreloadingTimer);
					resetPreloadingTimer = setTimeout(resetPreloading, 2500);

					addClass(elem, lazySizesConfig.loadingClass);
					addRemoveLoadEvents(elem, rafSwitchLoadingClass, true);
				}

				if(isPicture){
					forEach.call(parent.getElementsByTagName('source'), handleSources);
				}

				if(srcset){
					elem.setAttribute('srcset', srcset);
				} else if(src && !isPicture){
					if(regIframe.test(elem.nodeName)){
						changeIframeSrc(elem, src);
					} else {
						elem.src = src;
					}
				}

				if(isImg && (srcset || isPicture)){
					updatePolyfill(elem, {src: src});
				}
			}

			if(elem._lazyRace){
				delete elem._lazyRace;
			}
			removeClass(elem, lazySizesConfig.lazyClass);

			rAF(function(){
				if( !firesLoad || (elem.complete && elem.naturalWidth > 1)){
					if(firesLoad){
						resetPreloading(event);
					} else {
						isLoading--;
					}
					switchLoadingClass(event);
				}
			}, true);
		});

		var unveilElement = function (elem){
			var detail;

			var isImg = regImg.test(elem.nodeName);

			//allow using sizes="auto", but don't use. it's invalid. Use data-sizes="auto" or a valid value for sizes instead (i.e.: sizes="80vw")
			var sizes = isImg && (elem[_getAttribute](lazySizesConfig.sizesAttr) || elem[_getAttribute]('sizes'));
			var isAuto = sizes == 'auto';

			if( (isAuto || !isCompleted) && isImg && (elem.src || elem.srcset) && !elem.complete && !hasClass(elem, lazySizesConfig.errorClass)){return;}

			detail = triggerEvent(elem, 'lazyunveilread').detail;

			if(isAuto){
				 autoSizer.updateElem(elem, true, elem.offsetWidth);
			}

			elem._lazyRace = true;
			isLoading++;

			lazyUnveil(elem, detail, isAuto, sizes, isImg);
		};

		var onload = function(){
			if(isCompleted){return;}
			if(Date.now() - started < 999){
				setTimeout(onload, 999);
				return;
			}
			var afterScroll = debounce(function(){
				lazySizesConfig.loadMode = 3;
				throttledCheckElements();
			});

			isCompleted = true;

			lazySizesConfig.loadMode = 3;

			throttledCheckElements();

			addEventListener('scroll', function(){
				if(lazySizesConfig.loadMode == 3){
					lazySizesConfig.loadMode = 2;
				}
				afterScroll();
			}, true);
		};

		return {
			_: function(){
				started = Date.now();

				lazyloadElems = document.getElementsByClassName(lazySizesConfig.lazyClass);
				preloadElems = document.getElementsByClassName(lazySizesConfig.lazyClass + ' ' + lazySizesConfig.preloadClass);
				hFac = lazySizesConfig.hFac;

				addEventListener('scroll', throttledCheckElements, true);

				addEventListener('resize', throttledCheckElements, true);

				if(window.MutationObserver){
					new MutationObserver( throttledCheckElements ).observe( docElem, {childList: true, subtree: true, attributes: true} );
				} else {
					docElem[_addEventListener]('DOMNodeInserted', throttledCheckElements, true);
					docElem[_addEventListener]('DOMAttrModified', throttledCheckElements, true);
					setInterval(throttledCheckElements, 999);
				}

				addEventListener('hashchange', throttledCheckElements, true);

				//, 'fullscreenchange'
				['focus', 'mouseover', 'click', 'load', 'transitionend', 'animationend', 'webkitAnimationEnd'].forEach(function(name){
					document[_addEventListener](name, throttledCheckElements, true);
				});

				if((/d$|^c/.test(document.readyState))){
					onload();
				} else {
					addEventListener('load', onload);
					document[_addEventListener]('DOMContentLoaded', throttledCheckElements);
					setTimeout(onload, 20000);
				}

				if(lazyloadElems.length){
					checkElements();
					rAF._lsFlush();
				} else {
					throttledCheckElements();
				}
			},
			checkElems: throttledCheckElements,
			unveil: unveilElement
		};
	})();


	var autoSizer = (function(){
		var autosizesElems;

		var sizeElement = rAFIt(function(elem, parent, event, width){
			var sources, i, len;
			elem._lazysizesWidth = width;
			width += 'px';

			elem.setAttribute('sizes', width);

			if(regPicture.test(parent.nodeName || '')){
				sources = parent.getElementsByTagName('source');
				for(i = 0, len = sources.length; i < len; i++){
					sources[i].setAttribute('sizes', width);
				}
			}

			if(!event.detail.dataAttr){
				updatePolyfill(elem, event.detail);
			}
		});
		var getSizeElement = function (elem, dataAttr, width){
			var event;
			var parent = elem.parentNode;

			if(parent){
				width = getWidth(elem, parent, width);
				event = triggerEvent(elem, 'lazybeforesizes', {width: width, dataAttr: !!dataAttr});

				if(!event.defaultPrevented){
					width = event.detail.width;

					if(width && width !== elem._lazysizesWidth){
						sizeElement(elem, parent, event, width);
					}
				}
			}
		};

		var updateElementsSizes = function(){
			var i;
			var len = autosizesElems.length;
			if(len){
				i = 0;

				for(; i < len; i++){
					getSizeElement(autosizesElems[i]);
				}
			}
		};

		var debouncedUpdateElementsSizes = debounce(updateElementsSizes);

		return {
			_: function(){
				autosizesElems = document.getElementsByClassName(lazySizesConfig.autosizesClass);
				addEventListener('resize', debouncedUpdateElementsSizes);
			},
			checkElems: debouncedUpdateElementsSizes,
			updateElem: getSizeElement
		};
	})();

	var init = function(){
		if(!init.i){
			init.i = true;
			autoSizer._();
			loader._();
		}
	};

	(function(){
		var prop;

		var lazySizesDefaults = {
			lazyClass: 'lazyload',
			loadedClass: 'lazyloaded',
			loadingClass: 'lazyloading',
			preloadClass: 'lazypreload',
			errorClass: 'lazyerror',
			//strictClass: 'lazystrict',
			autosizesClass: 'lazyautosizes',
			srcAttr: 'data-src',
			srcsetAttr: 'data-srcset',
			sizesAttr: 'data-sizes',
			//preloadAfterLoad: false,
			minSize: 40,
			customMedia: {},
			init: true,
			expFactor: 1.5,
			hFac: 0.8,
			loadMode: 2,
			loadHidden: true,
		};

		lazySizesConfig = window.lazySizesConfig || window.lazysizesConfig || {};

		for(prop in lazySizesDefaults){
			if(!(prop in lazySizesConfig)){
				lazySizesConfig[prop] = lazySizesDefaults[prop];
			}
		}

		window.lazySizesConfig = lazySizesConfig;

		setTimeout(function(){
			if(lazySizesConfig.init){
				init();
			}
		});
	})();

	lazysizes = {
		cfg: lazySizesConfig,
		autoSizer: autoSizer,
		loader: loader,
		init: init,
		uP: updatePolyfill,
		aC: addClass,
		rC: removeClass,
		hC: hasClass,
		fire: triggerEvent,
		gW: getWidth,
		rAF: rAF,
	};

	return lazysizes;
}
));


/***/ }),

/***/ "./node_modules/lazysizes/plugins/unveilhooks/ls.unveilhooks.js":
/*!**********************************************************************!*\
  !*** ./node_modules/lazysizes/plugins/unveilhooks/ls.unveilhooks.js ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/*
This plugin extends lazySizes to lazyLoad:
background images, videos/posters and scripts

Background-Image:
For background images, use data-bg attribute:
<div class="lazyload" data-bg="bg-img.jpg"></div>

 Video:
 For video/audio use data-poster and preload="none":
 <video class="lazyload" data-poster="poster.jpg" preload="none">
 <!-- sources -->
 </video>

 Scripts:
 For scripts use data-script:
 <div class="lazyload" data-script="module-name.js"></div>


 Script modules using require:
 For modules using require use data-require:
 <div class="lazyload" data-require="module-name"></div>
*/

(function(window, factory) {
	var globalInstall = function(){
		factory(window.lazySizes);
		window.removeEventListener('lazyunveilread', globalInstall, true);
	};

	factory = factory.bind(null, window, window.document);

	if( true && module.exports){
		factory(__webpack_require__(/*! lazysizes */ "./node_modules/lazysizes/lazysizes.js"));
	} else if(window.lazySizes) {
		globalInstall();
	} else {
		window.addEventListener('lazyunveilread', globalInstall, true);
	}
}(window, function(window, document, lazySizes) {
	/*jshint eqnull:true */
	'use strict';
	var bgLoad, regBgUrlEscape;
	var uniqueUrls = {};

	if(document.addEventListener){
		regBgUrlEscape = /\(|\)|\s|'/;

		bgLoad = function (url, cb){
			var img = document.createElement('img');
			img.onload = function(){
				img.onload = null;
				img.onerror = null;
				img = null;
				cb();
			};
			img.onerror = img.onload;

			img.src = url;

			if(img && img.complete && img.onload){
				img.onload();
			}
		};

		addEventListener('lazybeforeunveil', function(e){
			if(e.detail.instance != lazySizes){return;}

			var tmp, load, bg, poster;
			if(!e.defaultPrevented) {

				if(e.target.preload == 'none'){
					e.target.preload = 'auto';
				}

				tmp = e.target.getAttribute('data-link');
				if(tmp){
					addStyleScript(tmp, true);
				}

				// handle data-script
				tmp = e.target.getAttribute('data-script');
				if(tmp){
					addStyleScript(tmp);
				}

				// handle data-require
				tmp = e.target.getAttribute('data-require');
				if(tmp){
					if(lazySizes.cfg.requireJs){
						lazySizes.cfg.requireJs([tmp]);
					} else {
						addStyleScript(tmp);
					}
				}

				// handle data-bg
				bg = e.target.getAttribute('data-bg');
				if (bg) {
					e.detail.firesLoad = true;
					load = function(){
						e.target.style.backgroundImage = 'url(' + (regBgUrlEscape.test(bg) ? JSON.stringify(bg) : bg ) + ')';
						e.detail.firesLoad = false;
						lazySizes.fire(e.target, '_lazyloaded', {}, true, true);
					};

					bgLoad(bg, load);
				}

				// handle data-poster
				poster = e.target.getAttribute('data-poster');
				if(poster){
					e.detail.firesLoad = true;
					load = function(){
						e.target.poster = poster;
						e.detail.firesLoad = false;
						lazySizes.fire(e.target, '_lazyloaded', {}, true, true);
					};

					bgLoad(poster, load);

				}
			}
		}, false);

	}

	function addStyleScript(src, style){
		if(uniqueUrls[src]){
			return;
		}
		var elem = document.createElement(style ? 'link' : 'script');
		var insertElem = document.getElementsByTagName('script')[0];

		if(style){
			elem.rel = 'stylesheet';
			elem.href = src;
		} else {
			elem.src = src;
		}
		uniqueUrls[src] = true;
		uniqueUrls[elem.src || elem.href] = true;
		insertElem.parentNode.insertBefore(elem, insertElem);
	}
}));


/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./node_modules/webpack/buildin/module.js":
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function(module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),

/***/ "./node_modules/whatwg-fetch/fetch.js":
/*!********************************************!*\
  !*** ./node_modules/whatwg-fetch/fetch.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob()
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ]

    var isDataView = function(obj) {
      return obj && DataView.prototype.isPrototypeOf(obj)
    }

    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    }
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift()
        return {done: value === undefined, value: value}
      }
    }

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      }
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1])
      }, this)
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var oldValue = this.map[name]
    this.map[name] = oldValue ? oldValue+','+value : value
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    name = normalizeName(name)
    return this.has(name) ? this.map[name] : null
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value)
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this)
      }
    }
  }

  Headers.prototype.keys = function() {
    var items = []
    this.forEach(function(value, name) { items.push(name) })
    return iteratorFor(items)
  }

  Headers.prototype.values = function() {
    var items = []
    this.forEach(function(value) { items.push(value) })
    return iteratorFor(items)
  }

  Headers.prototype.entries = function() {
    var items = []
    this.forEach(function(value, name) { items.push([name, value]) })
    return iteratorFor(items)
  }

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsArrayBuffer(blob)
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsText(blob)
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf)
    var chars = new Array(view.length)

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i])
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength)
      view.set(new Uint8Array(buf))
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false

    this._initBody = function(body) {
      this._bodyInit = body
      if (!body) {
        this._bodyText = ''
      } else if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString()
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer)
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer])
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body)
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      }
    }

    this.text = function() {
      var rejected = consumed(this)
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body && input._bodyInit != null) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = String(input)
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this, { body: this._bodyInit })
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers()
    rawHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':')
      var key = parts.shift().trim()
      if (key) {
        var value = parts.join(':').trim()
        headers.append(key, value)
      }
    })
    return headers
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = 'status' in options ? options.status : 200
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = 'statusText' in options ? options.statusText : 'OK'
    this.headers = new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers
  self.Request = Request
  self.Response = Response

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init)
      var xhr = new XMLHttpRequest()

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        }
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
        var body = 'response' in xhr ? xhr.response : xhr.responseText
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);


/***/ }),

/***/ "./src/code-studio/url_test.js":
/*!*************************************!*\
  !*** ./src/code-studio/url_test.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// Tests whether the browser can access an image URL.
// Useful as a workaround for CORS security to test access to an origin.
function testImageAccess(url) {
  var successCallback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};
  var failureCallback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};
  var timeoutMs = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 5000;
  var videoElement = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  var element;

  if (videoElement) {
    element = document.createElement('video');
  } else {
    element = new Image();
  }

  var called = false;

  function finish(callback) {
    return function () {
      if (called) {
        return;
      }

      called = true;
      window.clearTimeout(timeout);
      callback();
    };
  }

  var timeout = window.setTimeout(finish(failureCallback), timeoutMs);
  element.onerror = finish(failureCallback);

  if (videoElement) {
    element.ondurationchange = finish(successCallback);
  } else {
    element.onload = finish(successCallback);
  }

  element.src = url; // store a reference to the element so it doesn't get collected

  window.testImages = window.testImages || [];
  window.testImages.push(element);
}

module.exports = testImageAccess;

/***/ }),

/***/ "./src/hamburger/hamburger.js":
/*!************************************!*\
  !*** ./src/hamburger/hamburger.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initHamburger = void 0;

var _jquery = _interopRequireDefault(__webpack_require__(/*! jquery */ "jquery"));

var _trackEvent = _interopRequireDefault(__webpack_require__(/*! ../util/trackEvent */ "./src/util/trackEvent.js"));

var _reportAbuse = __webpack_require__(/*! @cdo/apps/reportAbuse */ "./src/reportAbuse.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var initHamburger = function initHamburger() {
  (0, _jquery["default"])(function () {
    (0, _jquery["default"])('#hamburger-icon').click(function (e) {
      (0, _jquery["default"])(this).toggleClass('active');
      (0, _jquery["default"])('#hamburger').removeClass('user-is-tabbing');
      (0, _jquery["default"])('#help-button').removeClass('user-is-tabbing');
      (0, _jquery["default"])('#hamburger #hamburger-contents').slideToggle();
      e.preventDefault();
    }); // allows users to toggle help menu by pressing return
    // while tabbing through elements

    (0, _jquery["default"])('#hamburger').on('keypress', function (e) {
      if (e.type === 'keypress' && e.which === 13 && e.target.className !== 'hamburger-expandable-item item') {
        (0, _jquery["default"])(this).toggleClass('active');
        (0, _jquery["default"])('#hamburger-icon').toggleClass('active');
        (0, _jquery["default"])('#hamburger #hamburger-contents').slideToggle();
        e.preventDefault();
      }
    });
    (0, _jquery["default"])(document).on('keypress keydown click', function (e) {
      var hamburger = (0, _jquery["default"])('#hamburger'); // If we didn't click the hamburger itself, and also nothing inside it,
      // then hide it.

      if (!hamburger.is(e.target) && hamburger.has(e.target).length === 0 && e.target.className !== 'hamburger-expandable-item item') {
        hamburger.children('#hamburger-contents').slideUp();
        (0, _jquery["default"])('#hamburger-icon').removeClass('active');
      }

      var helpButton = (0, _jquery["default"])('#help-button'); // If the user is using the keyboard to navigate,
      // add a class that retains element outline

      if (e.type === 'keydown' && e.which === 9) {
        hamburger.addClass('user-is-tabbing');
        helpButton.addClass('user-is-tabbing');
      } // If we didn't click the help button itself, and also nothing inside it,
      // then hide it.


      if (!helpButton.is(e.target) && helpButton.has(e.target).length === 0) {
        helpButton.children('#help-contents').slideUp();
        (0, _jquery["default"])('#help-icon').removeClass('active');
      }
    });
    (0, _jquery["default"])('.hamburger-expandable-item').each(function () {
      (0, _jquery["default"])(this).on('keypress click', function (e) {
        if (e.type === 'keypress' && e.which === 13 || e.type === 'click') {
          (0, _jquery["default"])('#' + (0, _jquery["default"])(this).attr('id') + '-items').slideToggle();
          (0, _jquery["default"])(this).find('.arrow-down').toggle();
          (0, _jquery["default"])(this).find('.arrow-up').toggle();
          e.preventDefault();
        }
      });
    });
    (0, _jquery["default"])('#help-icon').click(function (e) {
      (0, _jquery["default"])(this).toggleClass('active');
      (0, _jquery["default"])('#hamburger').removeClass('user-is-tabbing');
      (0, _jquery["default"])('#help-button').removeClass('user-is-tabbing');
      (0, _jquery["default"])('#help-button #help-contents').slideToggle();
      e.preventDefault();
    }); // allows users to toggle help menu by pressing return
    // while tabbing through elements

    (0, _jquery["default"])('#help-button').on('keypress', function (e) {
      if (e.type === 'keypress' && e.which === 13) {
        (0, _jquery["default"])(this).toggleClass('active');
        (0, _jquery["default"])('#help-button #help-contents').slideToggle();
        e.preventDefault();
      }
    });
    (0, _jquery["default"])('#help-icon #report-bug').click(function () {
      (0, _trackEvent["default"])('help_ui', 'report-bug', 'hamburger');
    });
    (0, _jquery["default"])('#help-icon #support').click(function () {
      (0, _trackEvent["default"])('help_ui', 'support', 'hamburger');
    }); // This item is not in the hamburger, but actually in the studio footer.

    (0, _jquery["default"])('.footer #support').click(function () {
      (0, _trackEvent["default"])('help_ui', 'support', 'studio_footer');
    }); // This item is not in the hamburger, but actually in the pegasus footers for
    // desktop and mobile.

    (0, _jquery["default"])('#pagefooter #support').each(function () {
      (0, _jquery["default"])(this).click(function () {
        (0, _trackEvent["default"])('help_ui', 'support', 'studio_footer');
      });
    });
    var channelId = (0, _reportAbuse.getChannelIdFromUrl)(location.href);
    var alreadyReportedAbuse = (0, _reportAbuse.userAlreadyReportedAbuse)(channelId);

    if (alreadyReportedAbuse) {
      var reportAbuseButton = (0, _jquery["default"])('#report-abuse');

      if (reportAbuseButton) {
        reportAbuseButton.hide();
      }
    }
  });
};

exports.initHamburger = initHamburger;

/***/ }),

/***/ "./src/reportAbuse.js":
/*!****************************!*\
  !*** ./src/reportAbuse.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getChannelIdFromUrl = exports.userAlreadyReportedAbuse = void 0;

var _jsCookie = _interopRequireDefault(__webpack_require__(/*! js-cookie */ "./node_modules/js-cookie/src/js.cookie.js"));

var _lodash = _interopRequireDefault(__webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * Determines if the current user has already submitted an Abuse report for this project.
 * @returns {boolean} true if the user has reported the given project for abuse.
 */
var userAlreadyReportedAbuse = function userAlreadyReportedAbuse(channelId) {
  return _jsCookie["default"].get('reported_abuse') && _lodash["default"].includes(JSON.parse(_jsCookie["default"].get('reported_abuse')), channelId);
};
/**
 * Extracts a channel id from the given abuse url
 * @returns {string} Channel id, or undefined if we can't get one.
 */


exports.userAlreadyReportedAbuse = userAlreadyReportedAbuse;

var getChannelIdFromUrl = function getChannelIdFromUrl(abuseUrl) {
  var match;

  if (abuseUrl.indexOf('codeprojects') >= 0) {
    match = /.*codeprojects.*[^\/]+\/([^\/]+)/.exec(abuseUrl);
  } else {
    match = /.*\/projects\/[^\/]+\/([^\/]+)/.exec(abuseUrl);
  }

  return match && match[1];
};

exports.getChannelIdFromUrl = getChannelIdFromUrl;

/***/ }),

/***/ "./src/sites/code.org/pages/views/theme_common_head_after.js":
/*!*******************************************************************!*\
  !*** ./src/sites/code.org/pages/views/theme_common_head_after.js ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(/*! details-element-polyfill */ "./node_modules/details-element-polyfill/dist/details-element-polyfill.js");

__webpack_require__(/*! lazysizes */ "./node_modules/lazysizes/lazysizes.js");

__webpack_require__(/*! lazysizes/plugins/unveilhooks/ls.unveilhooks */ "./node_modules/lazysizes/plugins/unveilhooks/ls.unveilhooks.js");

var _browserDetector = __webpack_require__(/*! @cdo/apps/util/browser-detector */ "./src/util/browser-detector.js");

var _hamburger = __webpack_require__(/*! @cdo/apps/hamburger/hamburger */ "./src/hamburger/hamburger.js");

var _loadVideos = __webpack_require__(/*! @cdo/apps/util/loadVideos */ "./src/util/loadVideos.js");

var _url_test = _interopRequireDefault(__webpack_require__(/*! @cdo/apps/code-studio/url_test */ "./src/code-studio/url_test.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// Prevent filtered errors from being passed to New Relic.
if (window.newrelic) {
  window.newrelic.setErrorHandler(function (err) {
    // Remove errors from unsupportenewrelicnd IE versions
    return !!(0, _browserDetector.isUnsupportedBrowser)();
  });
}

$(document).ready(function () {
  if ((0, _browserDetector.isUnsupportedBrowser)()) {
    $('#warning-banner').show();
  }
});
(0, _hamburger.initHamburger)();
$(window).load(function () {
  if (document.getElementsByClassName('insert_video_player').length > 0) {
    var urlParams = window.location.search;
    var forcePlayer = false;

    if (urlParams.indexOf('force_youtube_fallback') !== -1) {
      forcePlayer = 'fallback';
    } else if (urlParams.indexOf('force_youtube_player') !== -1) {
      forcePlayer = 'youtube';
    }

    (0, _loadVideos.loadVideos)(forcePlayer);
  } // This code works for both the congrats_share and the more general
  // share_buttons partials.  (Only the former features a share-button-container.)


  $(document).ready(function () {
    (0, _url_test["default"])('https://facebook.com/favicon.ico' + '?' + Math.random(), function () {
      $('.share-button-facebook-link').show();
      $('.share-button-container').show();
    });
    (0, _url_test["default"])('https://twitter.com/favicon.ico' + '?' + Math.random(), function () {
      $('.share-button-twitter-link').show();
      $('.share-button-container').show();
    });
  });
});

/***/ }),

/***/ "./src/util/browser-detector.js":
/*!**************************************!*\
  !*** ./src/util/browser-detector.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isUnsupportedBrowser = isUnsupportedBrowser;
exports.isMobileDevice = isMobileDevice;
exports.isIE11 = isIE11;
exports.isStorageAvailable = isStorageAvailable;

// We support IE 11+
function isUnsupportedIE() {
  var isIE = navigator.userAgent.indexOf('MSIE') !== -1;
  var IEVersion = navigator.appVersion.indexOf('Trident/');
  var IEBelow8 = isIE && IEVersion < 8;
  var IE7 = navigator.userAgent.match('MSIE 7.0;');
  var IE8 = navigator.userAgent.match('MSIE 8.0;');
  var IE9 = navigator.userAgent.match('MSIE 9.0;');
  var IE10 = navigator.userAgent.match('MSIE 10.0;');
  var unsupported = IEBelow8 || IE7 || IE8 || IE9 || IE10;
  return unsupported;
} // We support Chrome 33.x +


function isUnsupportedChrome() {
  var isChrome = navigator.userAgent.lastIndexOf('Chrome/') !== -1;
  var chromeVersion = navigator.userAgent.substr(navigator.userAgent.lastIndexOf('Chrome/') + 7, 2);
  var unsupported = isChrome && chromeVersion < 33;
  return unsupported;
} // We support Safari 7.0.x +


function isUnsupportedSafari() {
  var isSafari = navigator.userAgent.indexOf('Safari/') !== -1;
  var safariVersion = navigator.userAgent.substr(navigator.userAgent.lastIndexOf('Version/') + 8, 2);
  var unsupported = isSafari && safariVersion < 7;
  return unsupported;
} // We support Firefox 25.x +


function isUnsupportedFirefox() {
  var isFirefox = navigator.userAgent.indexOf('Firefox') !== -1;
  var firefoxVersion = navigator.userAgent.substr(navigator.userAgent.lastIndexOf('Firefox/') + 8, 2);
  var unsupported = isFirefox && firefoxVersion < 25;
  return unsupported;
} // https://support.code.org/hc/en-us/articles/202591743
// for the full list of supported browsers


function isUnsupportedBrowser() {
  var isUnsupported = false;
  isUnsupported = isUnsupportedIE() || isUnsupportedChrome() || isUnsupportedSafari() || isUnsupportedFirefox();
  return isUnsupported;
} // Detect a mobile device.


function isMobileDevice() {
  // Adapted from http://detectmobilebrowsers.com/ with the addition of |android|ipad|playbook|silk as
  // it suggests at http://detectmobilebrowsers.com/about
  // Note that there are two regular expressions in the blob.  The first tests against variable a (the entire
  // user agent) while the second tests against just the first four characters in it.
  var check = false;

  (function (a) {
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
      check = true;
    }
  })(navigator.userAgent || navigator.vendor || window.opera);

  return check;
} // Detect IE11.  Adapted from
// http://stackoverflow.com/questions/21825157/internet-explorer-11-detection/21825207#21825207


function isIE11() {
  var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
  return isIE11;
} // Determine whether local storage is available.  On macOS Safari Private Mode it won't be.
// Adapted from https://gist.github.com/paulirish/5558557#gistcomment-1755099


function isStorageAvailable(type) {
  try {
    var storage = window[type],
        x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
}

/***/ }),

/***/ "./src/util/loadVideos.js":
/*!********************************!*\
  !*** ./src/util/loadVideos.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadVideos = loadVideos;

var _url_test = _interopRequireDefault(__webpack_require__(/*! ../code-studio/url_test */ "./src/code-studio/url_test.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// forcePlayer can be "youtube", "fallback", or false if we just want to
// detect the appropriate player.
function loadVideos(forcePlayer) {
  if (forcePlayer) {
    setupVideos(forcePlayer);
  } else {
    (0, _url_test["default"])('https://www.youtube-nocookie.com/favicon.ico?' + Math.random(), function () {
      setupVideos('youtube');
    }, function () {
      setupVideos('fallback');
    });
  }
} // Set up appropriate video players by inserting them into the DOM alongside all items with
// class "insert_video_player".
// Such insertion points have two attributes:
//   data-video_code with the youtube ID, and
//   data-download_path with a full URL to an mp4 video.
// Parameter player is either "youtube" or "fallback".


function setupVideos(player) {
  if (player === 'fallback') {
    var doc = document;
    var video_css = doc.createElement('link');
    var video = doc.createElement('script');
    video_css.type = 'text/css';
    video_css.href = '/css/video-js.min.css';
    video_css.rel = 'stylesheet';
    doc.getElementsByTagName('head')[0].appendChild(video_css);
    video.type = 'text/javascript';
    video.src = '/js/video.min.js';
    doc.body.appendChild(video);
  }

  $('.insert_video_player').each(function () {
    var downloadPath = $(this).data('download-path'); // Use fallback player if that's the preference.
    // It requires a downloadPath, and it doesn't seem to work on IE8 because
    // it relies upon a missing addEventListener.

    if (player === 'fallback' && downloadPath && window.addEventListener) {
      $(this).parent().append('<video ' + 'style="position:absolute; top: 0; left: 0; width: 100%; height: 100%" ' + 'width="100%" height="100%" ' + 'class="video-js lazyload vjs-big-play-centered" ' + 'preload="none" ' + 'data-setup=\'{"nativeControlsForTouch": true}\' ' + 'controls>' + '  <source src="' + downloadPath + '" type="video/mp4"/>' + '</video>');
    } else {
      // Always default to YouTube player.
      $(this).parent().append('<iframe class="lazyload" ' + 'style="position:absolute; top: 0; left: 0; width: 100%; height: 100%" ' + "data-src=\"https://www.youtube-nocookie.com/embed/".concat($(this).data('video-code'), "?iv_load_policy=3&rel=0&autohide=1&showinfo=0&enablejsapi=1\" ") + 'frameborder="0" ' + 'allowfullscreen=true' + ">");
    }
  });
}

/***/ }),

/***/ "./src/util/trackEvent.js":
/*!********************************!*\
  !*** ./src/util/trackEvent.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = trackEvent;

/* global window */

/**
 * Report an event to Google Analytics.
 * trackEvent is provided by _analytics.html.haml in most cases.
 * In those where it isn't, we want this call to be a simple no-op.
 */
function trackEvent() {
  var _window;

  if (false) {}

  (_window = window).trackEvent.apply(_window, arguments);
}

module.exports = exports["default"];

/***/ }),

/***/ 127:
/*!*****************************************************************************************************************!*\
  !*** multi @babel/polyfill/noConflict whatwg-fetch ./src/sites/code.org/pages/views/theme_common_head_after.js ***!
  \*****************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! @babel/polyfill/noConflict */"./node_modules/@babel/polyfill/noConflict.js");
__webpack_require__(/*! whatwg-fetch */"./node_modules/whatwg-fetch/fetch.js");
module.exports = __webpack_require__(/*! ./src/sites/code.org/pages/views/theme_common_head_after.js */"./src/sites/code.org/pages/views/theme_common_head_after.js");


/***/ }),

/***/ "jquery":
/*!********************!*\
  !*** external "$" ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = $;

/***/ })

},[[127,"webpack-runtime","vendors"]]]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS5vcmcvdmlld3MvdGhlbWVfY29tbW9uX2hlYWRfYWZ0ZXIuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvZGV0YWlscy1lbGVtZW50LXBvbHlmaWxsL2Rpc3QvZGV0YWlscy1lbGVtZW50LXBvbHlmaWxsLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9qcy1jb29raWUvc3JjL2pzLmNvb2tpZS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvbGF6eXNpemVzL2xhenlzaXplcy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvbGF6eXNpemVzL3BsdWdpbnMvdW52ZWlsaG9va3MvbHMudW52ZWlsaG9va3MuanMiLCJ3ZWJwYWNrOi8vLyh3ZWJwYWNrKS9idWlsZGluL2dsb2JhbC5qcyIsIndlYnBhY2s6Ly8vKHdlYnBhY2spL2J1aWxkaW4vbW9kdWxlLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy93aGF0d2ctZmV0Y2gvZmV0Y2guanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvZGUtc3R1ZGlvL3VybF90ZXN0LmpzIiwid2VicGFjazovLy8uL3NyYy9oYW1idXJnZXIvaGFtYnVyZ2VyLmpzIiwid2VicGFjazovLy8uL3NyYy9yZXBvcnRBYnVzZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvc2l0ZXMvY29kZS5vcmcvcGFnZXMvdmlld3MvdGhlbWVfY29tbW9uX2hlYWRfYWZ0ZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWwvYnJvd3Nlci1kZXRlY3Rvci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbC9sb2FkVmlkZW9zLmpzIiwid2VicGFjazovLy8uL3NyYy91dGlsL3RyYWNrRXZlbnQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkRldGFpbHMgRWxlbWVudCBQb2x5ZmlsbCAxLjEuMFxuQ29weXJpZ2h0IMKpIDIwMTcgSmF2YW4gTWFraG1hbGlcbiAqL1xuKGZ1bmN0aW9uKCl7fSkuY2FsbCh0aGlzKSxmdW5jdGlvbigpe3ZhciB0LGUsbixyLG8sdSxpLGEsbCxjO2E9e2VsZW1lbnQ6ZnVuY3Rpb24oKXt2YXIgdCxlLG4scixvO3JldHVybiBlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkZXRhaWxzXCIpLFwib3BlblwiaW4gZT8oZS5pbm5lckhUTUw9XCI8c3VtbWFyeT5hPC9zdW1tYXJ5PmJcIixlLnNldEF0dHJpYnV0ZShcInN0eWxlXCIsXCJwb3NpdGlvbjogYWJzb2x1dGU7IGxlZnQ6IC05OTk5cHhcIikscj1udWxsIT0obz1kb2N1bWVudC5ib2R5KT9vOmRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxyLmFwcGVuZENoaWxkKGUpLHQ9ZS5vZmZzZXRIZWlnaHQsZS5vcGVuPSEwLG49ZS5vZmZzZXRIZWlnaHQsci5yZW1vdmVDaGlsZChlKSx0IT09bik6ITF9KCksdG9nZ2xlRXZlbnQ6ZnVuY3Rpb24oKXt2YXIgdDtyZXR1cm4gdD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGV0YWlsc1wiKSxcIm9udG9nZ2xlXCJpbiB0fSgpfSxhLmVsZW1lbnQmJmEudG9nZ2xlRXZlbnR8fChvPWZ1bmN0aW9uKCl7cmV0dXJuIGRvY3VtZW50LmhlYWQuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYWZ0ZXJiZWdpblwiLCc8c3R5bGU+QGNoYXJzZXRcIlVURi04XCI7ZGV0YWlsczpub3QoW29wZW5dKT4qOm5vdChzdW1tYXJ5KXtkaXNwbGF5Om5vbmU7fWRldGFpbHM+c3VtbWFyeXtkaXNwbGF5OmJsb2NrO31kZXRhaWxzPnN1bW1hcnk6OmJlZm9yZXtjb250ZW50OlwiXFx1MjViYVwiO3BhZGRpbmctcmlnaHQ6MC4zcmVtO2ZvbnQtc2l6ZTowLjZyZW07Y3Vyc29yOmRlZmF1bHQ7fWRldGFpbHNbb3Blbl0+c3VtbWFyeTo6YmVmb3Jle2NvbnRlbnQ6XCJcXHUyNWJjXCI7fTwvc3R5bGU+Jyl9LHI9ZnVuY3Rpb24oKXt2YXIgdCxlLG4scixvO3JldHVybiB0PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkZXRhaWxzXCIpLmNvbnN0cnVjdG9yLnByb3RvdHlwZSxyPXQuc2V0QXR0cmlidXRlLG49dC5yZW1vdmVBdHRyaWJ1dGUsbz1udWxsIT0oZT1PYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHQsXCJvcGVuXCIpKT9lLnNldDp2b2lkIDAsT2JqZWN0LmRlZmluZVByb3BlcnRpZXModCx7b3Blbjp7c2V0OmZ1bmN0aW9uKHQpe3JldHVyblwiREVUQUlMU1wiPT09dGhpcy50YWdOYW1lPyh0P3RoaXMuc2V0QXR0cmlidXRlKFwib3BlblwiLFwiXCIpOnRoaXMucmVtb3ZlQXR0cmlidXRlKFwib3BlblwiKSx0KTpudWxsIT1vP28uY2FsbCh0aGlzLHQpOnZvaWQgMH19LHNldEF0dHJpYnV0ZTp7dmFsdWU6ZnVuY3Rpb24odCxlKXtyZXR1cm4gYyh0aGlzLGZ1bmN0aW9uKG4pe3JldHVybiBmdW5jdGlvbigpe3JldHVybiByLmNhbGwobix0LGUpfX0odGhpcykpfX0scmVtb3ZlQXR0cmlidXRlOnt2YWx1ZTpmdW5jdGlvbih0KXtyZXR1cm4gYyh0aGlzLGZ1bmN0aW9uKGUpe3JldHVybiBmdW5jdGlvbigpe3JldHVybiBuLmNhbGwoZSx0KX19KHRoaXMpKX19fSl9LHU9ZnVuY3Rpb24oKXtyZXR1cm4gbihmdW5jdGlvbih0KXtyZXR1cm4gdC5oYXNBdHRyaWJ1dGUoXCJvcGVuXCIpP3QucmVtb3ZlQXR0cmlidXRlKFwib3BlblwiKTp0LnNldEF0dHJpYnV0ZShcIm9wZW5cIixcIlwiKX0pfSxpPWZ1bmN0aW9uKCl7dmFyIHQ7cmV0dXJuXCJ1bmRlZmluZWRcIiE9dHlwZW9mIE11dGF0aW9uT2JzZXJ2ZXImJm51bGwhPT1NdXRhdGlvbk9ic2VydmVyPyh0PW5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uKHQpe3ZhciBlLG4scixvLHUsaTtmb3IodT1bXSxuPTAscj10Lmxlbmd0aDtyPm47bisrKW89dFtuXSxpPW8udGFyZ2V0LGU9by5hdHRyaWJ1dGVOYW1lLFwiREVUQUlMU1wiPT09aS50YWdOYW1lJiZcIm9wZW5cIj09PWU/dS5wdXNoKGwoaSkpOnUucHVzaCh2b2lkIDApO3JldHVybiB1fSksdC5vYnNlcnZlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCx7YXR0cmlidXRlczohMCxzdWJ0cmVlOiEwfSkpOm4oZnVuY3Rpb24odCl7dmFyIGU7cmV0dXJuIGU9dC5nZXRBdHRyaWJ1dGUoXCJvcGVuXCIpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXtyZXR1cm4gdC5nZXRBdHRyaWJ1dGUoXCJvcGVuXCIpIT09ZT9sKHQpOnZvaWQgMH0sMSl9KX0sdD1mdW5jdGlvbih0KXtyZXR1cm4hKHQuZGVmYXVsdFByZXZlbnRlZHx8dC53aGljaD4xfHx0LmFsdEtleXx8dC5jdHJsS2V5fHx0Lm1ldGFLZXl8fHQuc2hpZnRLZXl8fHQudGFyZ2V0LmlzQ29udGVudEVkaXRhYmxlKX0sbj1mdW5jdGlvbihuKXtyZXR1cm4gYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsZnVuY3Rpb24ocil7dmFyIG8sdTtyZXR1cm4gdChyKSYmKG89ZShyLnRhcmdldCxcIlNVTU1BUllcIikpJiZcIkRFVEFJTFNcIj09PShudWxsIT0odT1vLnBhcmVudEVsZW1lbnQpP3UudGFnTmFtZTp2b2lkIDApP24oby5wYXJlbnRFbGVtZW50KTp2b2lkIDB9LCExKX0sZT1mdW5jdGlvbigpe3JldHVyblwiZnVuY3Rpb25cIj09dHlwZW9mIEVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3Q/ZnVuY3Rpb24odCxlKXtyZXR1cm4gdC5jbG9zZXN0KGUpfTpmdW5jdGlvbih0LGUpe2Zvcig7dDspe2lmKHQudGFnTmFtZT09PWUpcmV0dXJuIHQ7dD10LnBhcmVudEVsZW1lbnR9fX0oKSxsPWZ1bmN0aW9uKHQpe3ZhciBlO3JldHVybiBlPWRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiRXZlbnRzXCIpLGUuaW5pdEV2ZW50KFwidG9nZ2xlXCIsITAsITEpLHQuZGlzcGF0Y2hFdmVudChlKX0sYz1mdW5jdGlvbih0LGUpe3ZhciBuLHI7cmV0dXJuIG49dC5nZXRBdHRyaWJ1dGUoXCJvcGVuXCIpLHI9ZSgpLHQuZ2V0QXR0cmlidXRlKFwib3BlblwiKSE9PW4mJmwodCkscn0sYS5lbGVtZW50fHwobygpLHIoKSx1KCkpLGEuZWxlbWVudCYmIWEudG9nZ2xlRXZlbnQmJmkoKSl9LmNhbGwodGhpcyksZnVuY3Rpb24oKXt9LmNhbGwodGhpcyk7IiwiLyohXG4gKiBKYXZhU2NyaXB0IENvb2tpZSB2Mi4xLjNcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9qcy1jb29raWUvanMtY29va2llXG4gKlxuICogQ29weXJpZ2h0IDIwMDYsIDIwMTUgS2xhdXMgSGFydGwgJiBGYWduZXIgQnJhY2tcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICovXG47KGZ1bmN0aW9uIChmYWN0b3J5KSB7XG5cdHZhciByZWdpc3RlcmVkSW5Nb2R1bGVMb2FkZXIgPSBmYWxzZTtcblx0aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuXHRcdGRlZmluZShmYWN0b3J5KTtcblx0XHRyZWdpc3RlcmVkSW5Nb2R1bGVMb2FkZXIgPSB0cnVlO1xuXHR9XG5cdGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0XHRyZWdpc3RlcmVkSW5Nb2R1bGVMb2FkZXIgPSB0cnVlO1xuXHR9XG5cdGlmICghcmVnaXN0ZXJlZEluTW9kdWxlTG9hZGVyKSB7XG5cdFx0dmFyIE9sZENvb2tpZXMgPSB3aW5kb3cuQ29va2llcztcblx0XHR2YXIgYXBpID0gd2luZG93LkNvb2tpZXMgPSBmYWN0b3J5KCk7XG5cdFx0YXBpLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHR3aW5kb3cuQ29va2llcyA9IE9sZENvb2tpZXM7XG5cdFx0XHRyZXR1cm4gYXBpO1xuXHRcdH07XG5cdH1cbn0oZnVuY3Rpb24gKCkge1xuXHRmdW5jdGlvbiBleHRlbmQgKCkge1xuXHRcdHZhciBpID0gMDtcblx0XHR2YXIgcmVzdWx0ID0ge307XG5cdFx0Zm9yICg7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBhdHRyaWJ1dGVzID0gYXJndW1lbnRzWyBpIF07XG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gYXR0cmlidXRlcykge1xuXHRcdFx0XHRyZXN1bHRba2V5XSA9IGF0dHJpYnV0ZXNba2V5XTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdGZ1bmN0aW9uIGluaXQgKGNvbnZlcnRlcikge1xuXHRcdGZ1bmN0aW9uIGFwaSAoa2V5LCB2YWx1ZSwgYXR0cmlidXRlcykge1xuXHRcdFx0dmFyIHJlc3VsdDtcblx0XHRcdGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gV3JpdGVcblxuXHRcdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdGF0dHJpYnV0ZXMgPSBleHRlbmQoe1xuXHRcdFx0XHRcdHBhdGg6ICcvJ1xuXHRcdFx0XHR9LCBhcGkuZGVmYXVsdHMsIGF0dHJpYnV0ZXMpO1xuXG5cdFx0XHRcdGlmICh0eXBlb2YgYXR0cmlidXRlcy5leHBpcmVzID09PSAnbnVtYmVyJykge1xuXHRcdFx0XHRcdHZhciBleHBpcmVzID0gbmV3IERhdGUoKTtcblx0XHRcdFx0XHRleHBpcmVzLnNldE1pbGxpc2Vjb25kcyhleHBpcmVzLmdldE1pbGxpc2Vjb25kcygpICsgYXR0cmlidXRlcy5leHBpcmVzICogODY0ZSs1KTtcblx0XHRcdFx0XHRhdHRyaWJ1dGVzLmV4cGlyZXMgPSBleHBpcmVzO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRyZXN1bHQgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG5cdFx0XHRcdFx0aWYgKC9eW1xce1xcW10vLnRlc3QocmVzdWx0KSkge1xuXHRcdFx0XHRcdFx0dmFsdWUgPSByZXN1bHQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGNhdGNoIChlKSB7fVxuXG5cdFx0XHRcdGlmICghY29udmVydGVyLndyaXRlKSB7XG5cdFx0XHRcdFx0dmFsdWUgPSBlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKHZhbHVlKSlcblx0XHRcdFx0XHRcdC5yZXBsYWNlKC8lKDIzfDI0fDI2fDJCfDNBfDNDfDNFfDNEfDJGfDNGfDQwfDVCfDVEfDVFfDYwfDdCfDdEfDdDKS9nLCBkZWNvZGVVUklDb21wb25lbnQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHZhbHVlID0gY29udmVydGVyLndyaXRlKHZhbHVlLCBrZXkpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0a2V5ID0gZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyhrZXkpKTtcblx0XHRcdFx0a2V5ID0ga2V5LnJlcGxhY2UoLyUoMjN8MjR8MjZ8MkJ8NUV8NjB8N0MpL2csIGRlY29kZVVSSUNvbXBvbmVudCk7XG5cdFx0XHRcdGtleSA9IGtleS5yZXBsYWNlKC9bXFwoXFwpXS9nLCBlc2NhcGUpO1xuXG5cdFx0XHRcdHJldHVybiAoZG9jdW1lbnQuY29va2llID0gW1xuXHRcdFx0XHRcdGtleSwgJz0nLCB2YWx1ZSxcblx0XHRcdFx0XHRhdHRyaWJ1dGVzLmV4cGlyZXMgPyAnOyBleHBpcmVzPScgKyBhdHRyaWJ1dGVzLmV4cGlyZXMudG9VVENTdHJpbmcoKSA6ICcnLCAvLyB1c2UgZXhwaXJlcyBhdHRyaWJ1dGUsIG1heC1hZ2UgaXMgbm90IHN1cHBvcnRlZCBieSBJRVxuXHRcdFx0XHRcdGF0dHJpYnV0ZXMucGF0aCA/ICc7IHBhdGg9JyArIGF0dHJpYnV0ZXMucGF0aCA6ICcnLFxuXHRcdFx0XHRcdGF0dHJpYnV0ZXMuZG9tYWluID8gJzsgZG9tYWluPScgKyBhdHRyaWJ1dGVzLmRvbWFpbiA6ICcnLFxuXHRcdFx0XHRcdGF0dHJpYnV0ZXMuc2VjdXJlID8gJzsgc2VjdXJlJyA6ICcnXG5cdFx0XHRcdF0uam9pbignJykpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBSZWFkXG5cblx0XHRcdGlmICgha2V5KSB7XG5cdFx0XHRcdHJlc3VsdCA9IHt9O1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBUbyBwcmV2ZW50IHRoZSBmb3IgbG9vcCBpbiB0aGUgZmlyc3QgcGxhY2UgYXNzaWduIGFuIGVtcHR5IGFycmF5XG5cdFx0XHQvLyBpbiBjYXNlIHRoZXJlIGFyZSBubyBjb29raWVzIGF0IGFsbC4gQWxzbyBwcmV2ZW50cyBvZGQgcmVzdWx0IHdoZW5cblx0XHRcdC8vIGNhbGxpbmcgXCJnZXQoKVwiXG5cdFx0XHR2YXIgY29va2llcyA9IGRvY3VtZW50LmNvb2tpZSA/IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOyAnKSA6IFtdO1xuXHRcdFx0dmFyIHJkZWNvZGUgPSAvKCVbMC05QS1aXXsyfSkrL2c7XG5cdFx0XHR2YXIgaSA9IDA7XG5cblx0XHRcdGZvciAoOyBpIDwgY29va2llcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgcGFydHMgPSBjb29raWVzW2ldLnNwbGl0KCc9Jyk7XG5cdFx0XHRcdHZhciBjb29raWUgPSBwYXJ0cy5zbGljZSgxKS5qb2luKCc9Jyk7XG5cblx0XHRcdFx0aWYgKGNvb2tpZS5jaGFyQXQoMCkgPT09ICdcIicpIHtcblx0XHRcdFx0XHRjb29raWUgPSBjb29raWUuc2xpY2UoMSwgLTEpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHR2YXIgbmFtZSA9IHBhcnRzWzBdLnJlcGxhY2UocmRlY29kZSwgZGVjb2RlVVJJQ29tcG9uZW50KTtcblx0XHRcdFx0XHRjb29raWUgPSBjb252ZXJ0ZXIucmVhZCA/XG5cdFx0XHRcdFx0XHRjb252ZXJ0ZXIucmVhZChjb29raWUsIG5hbWUpIDogY29udmVydGVyKGNvb2tpZSwgbmFtZSkgfHxcblx0XHRcdFx0XHRcdGNvb2tpZS5yZXBsYWNlKHJkZWNvZGUsIGRlY29kZVVSSUNvbXBvbmVudCk7XG5cblx0XHRcdFx0XHRpZiAodGhpcy5qc29uKSB7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRjb29raWUgPSBKU09OLnBhcnNlKGNvb2tpZSk7XG5cdFx0XHRcdFx0XHR9IGNhdGNoIChlKSB7fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChrZXkgPT09IG5hbWUpIHtcblx0XHRcdFx0XHRcdHJlc3VsdCA9IGNvb2tpZTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICgha2V5KSB7XG5cdFx0XHRcdFx0XHRyZXN1bHRbbmFtZV0gPSBjb29raWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGNhdGNoIChlKSB7fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblxuXHRcdGFwaS5zZXQgPSBhcGk7XG5cdFx0YXBpLmdldCA9IGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdHJldHVybiBhcGkuY2FsbChhcGksIGtleSk7XG5cdFx0fTtcblx0XHRhcGkuZ2V0SlNPTiA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBhcGkuYXBwbHkoe1xuXHRcdFx0XHRqc29uOiB0cnVlXG5cdFx0XHR9LCBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuXHRcdH07XG5cdFx0YXBpLmRlZmF1bHRzID0ge307XG5cblx0XHRhcGkucmVtb3ZlID0gZnVuY3Rpb24gKGtleSwgYXR0cmlidXRlcykge1xuXHRcdFx0YXBpKGtleSwgJycsIGV4dGVuZChhdHRyaWJ1dGVzLCB7XG5cdFx0XHRcdGV4cGlyZXM6IC0xXG5cdFx0XHR9KSk7XG5cdFx0fTtcblxuXHRcdGFwaS53aXRoQ29udmVydGVyID0gaW5pdDtcblxuXHRcdHJldHVybiBhcGk7XG5cdH1cblxuXHRyZXR1cm4gaW5pdChmdW5jdGlvbiAoKSB7fSk7XG59KSk7XG4iLCIoZnVuY3Rpb24od2luZG93LCBmYWN0b3J5KSB7XG5cdHZhciBsYXp5U2l6ZXMgPSBmYWN0b3J5KHdpbmRvdywgd2luZG93LmRvY3VtZW50KTtcblx0d2luZG93LmxhenlTaXplcyA9IGxhenlTaXplcztcblx0aWYodHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyl7XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBsYXp5U2l6ZXM7XG5cdH1cbn0od2luZG93LCBmdW5jdGlvbiBsKHdpbmRvdywgZG9jdW1lbnQpIHtcblx0J3VzZSBzdHJpY3QnO1xuXHQvKmpzaGludCBlcW51bGw6dHJ1ZSAqL1xuXHRpZighZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSl7cmV0dXJuO31cblxuXHR2YXIgbGF6eXNpemVzLCBsYXp5U2l6ZXNDb25maWc7XG5cblx0dmFyIGRvY0VsZW0gPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cblx0dmFyIERhdGUgPSB3aW5kb3cuRGF0ZTtcblxuXHR2YXIgc3VwcG9ydFBpY3R1cmUgPSB3aW5kb3cuSFRNTFBpY3R1cmVFbGVtZW50O1xuXG5cdHZhciBfYWRkRXZlbnRMaXN0ZW5lciA9ICdhZGRFdmVudExpc3RlbmVyJztcblxuXHR2YXIgX2dldEF0dHJpYnV0ZSA9ICdnZXRBdHRyaWJ1dGUnO1xuXG5cdHZhciBhZGRFdmVudExpc3RlbmVyID0gd2luZG93W19hZGRFdmVudExpc3RlbmVyXTtcblxuXHR2YXIgc2V0VGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0O1xuXG5cdHZhciByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHNldFRpbWVvdXQ7XG5cblx0dmFyIHJlcXVlc3RJZGxlQ2FsbGJhY2sgPSB3aW5kb3cucmVxdWVzdElkbGVDYWxsYmFjaztcblxuXHR2YXIgcmVnUGljdHVyZSA9IC9ecGljdHVyZSQvaTtcblxuXHR2YXIgbG9hZEV2ZW50cyA9IFsnbG9hZCcsICdlcnJvcicsICdsYXp5aW5jbHVkZWQnLCAnX2xhenlsb2FkZWQnXTtcblxuXHR2YXIgcmVnQ2xhc3NDYWNoZSA9IHt9O1xuXG5cdHZhciBmb3JFYWNoID0gQXJyYXkucHJvdG90eXBlLmZvckVhY2g7XG5cblx0dmFyIGhhc0NsYXNzID0gZnVuY3Rpb24oZWxlLCBjbHMpIHtcblx0XHRpZighcmVnQ2xhc3NDYWNoZVtjbHNdKXtcblx0XHRcdHJlZ0NsYXNzQ2FjaGVbY2xzXSA9IG5ldyBSZWdFeHAoJyhcXFxcc3xeKScrY2xzKycoXFxcXHN8JCknKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlZ0NsYXNzQ2FjaGVbY2xzXS50ZXN0KGVsZVtfZ2V0QXR0cmlidXRlXSgnY2xhc3MnKSB8fCAnJykgJiYgcmVnQ2xhc3NDYWNoZVtjbHNdO1xuXHR9O1xuXG5cdHZhciBhZGRDbGFzcyA9IGZ1bmN0aW9uKGVsZSwgY2xzKSB7XG5cdFx0aWYgKCFoYXNDbGFzcyhlbGUsIGNscykpe1xuXHRcdFx0ZWxlLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAoZWxlW19nZXRBdHRyaWJ1dGVdKCdjbGFzcycpIHx8ICcnKS50cmltKCkgKyAnICcgKyBjbHMpO1xuXHRcdH1cblx0fTtcblxuXHR2YXIgcmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbihlbGUsIGNscykge1xuXHRcdHZhciByZWc7XG5cdFx0aWYgKChyZWcgPSBoYXNDbGFzcyhlbGUsY2xzKSkpIHtcblx0XHRcdGVsZS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgKGVsZVtfZ2V0QXR0cmlidXRlXSgnY2xhc3MnKSB8fCAnJykucmVwbGFjZShyZWcsICcgJykpO1xuXHRcdH1cblx0fTtcblxuXHR2YXIgYWRkUmVtb3ZlTG9hZEV2ZW50cyA9IGZ1bmN0aW9uKGRvbSwgZm4sIGFkZCl7XG5cdFx0dmFyIGFjdGlvbiA9IGFkZCA/IF9hZGRFdmVudExpc3RlbmVyIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuXHRcdGlmKGFkZCl7XG5cdFx0XHRhZGRSZW1vdmVMb2FkRXZlbnRzKGRvbSwgZm4pO1xuXHRcdH1cblx0XHRsb2FkRXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXZ0KXtcblx0XHRcdGRvbVthY3Rpb25dKGV2dCwgZm4pO1xuXHRcdH0pO1xuXHR9O1xuXG5cdHZhciB0cmlnZ2VyRXZlbnQgPSBmdW5jdGlvbihlbGVtLCBuYW1lLCBkZXRhaWwsIG5vQnViYmxlcywgbm9DYW5jZWxhYmxlKXtcblx0XHR2YXIgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnQ3VzdG9tRXZlbnQnKTtcblxuXHRcdGlmKCFkZXRhaWwpe1xuXHRcdFx0ZGV0YWlsID0ge307XG5cdFx0fVxuXG5cdFx0ZGV0YWlsLmluc3RhbmNlID0gbGF6eXNpemVzO1xuXG5cdFx0ZXZlbnQuaW5pdEN1c3RvbUV2ZW50KG5hbWUsICFub0J1YmJsZXMsICFub0NhbmNlbGFibGUsIGRldGFpbCk7XG5cblx0XHRlbGVtLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuXHRcdHJldHVybiBldmVudDtcblx0fTtcblxuXHR2YXIgdXBkYXRlUG9seWZpbGwgPSBmdW5jdGlvbiAoZWwsIGZ1bGwpe1xuXHRcdHZhciBwb2x5ZmlsbDtcblx0XHRpZiggIXN1cHBvcnRQaWN0dXJlICYmICggcG9seWZpbGwgPSAod2luZG93LnBpY3R1cmVmaWxsIHx8IGxhenlTaXplc0NvbmZpZy5wZikgKSApe1xuXHRcdFx0cG9seWZpbGwoe3JlZXZhbHVhdGU6IHRydWUsIGVsZW1lbnRzOiBbZWxdfSk7XG5cdFx0fSBlbHNlIGlmKGZ1bGwgJiYgZnVsbC5zcmMpe1xuXHRcdFx0ZWwuc3JjID0gZnVsbC5zcmM7XG5cdFx0fVxuXHR9O1xuXG5cdHZhciBnZXRDU1MgPSBmdW5jdGlvbiAoZWxlbSwgc3R5bGUpe1xuXHRcdHJldHVybiAoZ2V0Q29tcHV0ZWRTdHlsZShlbGVtLCBudWxsKSB8fCB7fSlbc3R5bGVdO1xuXHR9O1xuXG5cdHZhciBnZXRXaWR0aCA9IGZ1bmN0aW9uKGVsZW0sIHBhcmVudCwgd2lkdGgpe1xuXHRcdHdpZHRoID0gd2lkdGggfHwgZWxlbS5vZmZzZXRXaWR0aDtcblxuXHRcdHdoaWxlKHdpZHRoIDwgbGF6eVNpemVzQ29uZmlnLm1pblNpemUgJiYgcGFyZW50ICYmICFlbGVtLl9sYXp5c2l6ZXNXaWR0aCl7XG5cdFx0XHR3aWR0aCA9ICBwYXJlbnQub2Zmc2V0V2lkdGg7XG5cdFx0XHRwYXJlbnQgPSBwYXJlbnQucGFyZW50Tm9kZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gd2lkdGg7XG5cdH07XG5cblx0dmFyIHJBRiA9IChmdW5jdGlvbigpe1xuXHRcdHZhciBydW5uaW5nLCB3YWl0aW5nO1xuXHRcdHZhciBmaXJzdEZucyA9IFtdO1xuXHRcdHZhciBzZWNvbmRGbnMgPSBbXTtcblx0XHR2YXIgZm5zID0gZmlyc3RGbnM7XG5cblx0XHR2YXIgcnVuID0gZnVuY3Rpb24oKXtcblx0XHRcdHZhciBydW5GbnMgPSBmbnM7XG5cblx0XHRcdGZucyA9IGZpcnN0Rm5zLmxlbmd0aCA/IHNlY29uZEZucyA6IGZpcnN0Rm5zO1xuXG5cdFx0XHRydW5uaW5nID0gdHJ1ZTtcblx0XHRcdHdhaXRpbmcgPSBmYWxzZTtcblxuXHRcdFx0d2hpbGUocnVuRm5zLmxlbmd0aCl7XG5cdFx0XHRcdHJ1bkZucy5zaGlmdCgpKCk7XG5cdFx0XHR9XG5cblx0XHRcdHJ1bm5pbmcgPSBmYWxzZTtcblx0XHR9O1xuXG5cdFx0dmFyIHJhZkJhdGNoID0gZnVuY3Rpb24oZm4sIHF1ZXVlKXtcblx0XHRcdGlmKHJ1bm5pbmcgJiYgIXF1ZXVlKXtcblx0XHRcdFx0Zm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZucy5wdXNoKGZuKTtcblxuXHRcdFx0XHRpZighd2FpdGluZyl7XG5cdFx0XHRcdFx0d2FpdGluZyA9IHRydWU7XG5cdFx0XHRcdFx0KGRvY3VtZW50LmhpZGRlbiA/IHNldFRpbWVvdXQgOiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUpKHJ1bik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0cmFmQmF0Y2guX2xzRmx1c2ggPSBydW47XG5cblx0XHRyZXR1cm4gcmFmQmF0Y2g7XG5cdH0pKCk7XG5cblx0dmFyIHJBRkl0ID0gZnVuY3Rpb24oZm4sIHNpbXBsZSl7XG5cdFx0cmV0dXJuIHNpbXBsZSA/XG5cdFx0XHRmdW5jdGlvbigpIHtcblx0XHRcdFx0ckFGKGZuKTtcblx0XHRcdH0gOlxuXHRcdFx0ZnVuY3Rpb24oKXtcblx0XHRcdFx0dmFyIHRoYXQgPSB0aGlzO1xuXHRcdFx0XHR2YXIgYXJncyA9IGFyZ3VtZW50cztcblx0XHRcdFx0ckFGKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0Zm4uYXBwbHkodGhhdCwgYXJncyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdDtcblx0fTtcblxuXHR2YXIgdGhyb3R0bGUgPSBmdW5jdGlvbihmbil7XG5cdFx0dmFyIHJ1bm5pbmc7XG5cdFx0dmFyIGxhc3RUaW1lID0gMDtcblx0XHR2YXIgZ0RlbGF5ID0gMTI1O1xuXHRcdHZhciBSSUNfREVGQVVMVF9USU1FT1VUID0gNjY2O1xuXHRcdHZhciBySUNUaW1lb3V0ID0gUklDX0RFRkFVTFRfVElNRU9VVDtcblx0XHR2YXIgcnVuID0gZnVuY3Rpb24oKXtcblx0XHRcdHJ1bm5pbmcgPSBmYWxzZTtcblx0XHRcdGxhc3RUaW1lID0gRGF0ZS5ub3coKTtcblx0XHRcdGZuKCk7XG5cdFx0fTtcblx0XHR2YXIgaWRsZUNhbGxiYWNrID0gcmVxdWVzdElkbGVDYWxsYmFjayA/XG5cdFx0XHRmdW5jdGlvbigpe1xuXHRcdFx0XHRyZXF1ZXN0SWRsZUNhbGxiYWNrKHJ1biwge3RpbWVvdXQ6IHJJQ1RpbWVvdXR9KTtcblx0XHRcdFx0aWYocklDVGltZW91dCAhPT0gUklDX0RFRkFVTFRfVElNRU9VVCl7XG5cdFx0XHRcdFx0cklDVGltZW91dCA9IFJJQ19ERUZBVUxUX1RJTUVPVVQ7XG5cdFx0XHRcdH1cblx0XHRcdH06XG5cdFx0XHRyQUZJdChmdW5jdGlvbigpe1xuXHRcdFx0XHRzZXRUaW1lb3V0KHJ1bik7XG5cdFx0XHR9LCB0cnVlKVxuXHRcdDtcblxuXHRcdHJldHVybiBmdW5jdGlvbihpc1ByaW9yaXR5KXtcblx0XHRcdHZhciBkZWxheTtcblx0XHRcdGlmKChpc1ByaW9yaXR5ID0gaXNQcmlvcml0eSA9PT0gdHJ1ZSkpe1xuXHRcdFx0XHRySUNUaW1lb3V0ID0gNDQ7XG5cdFx0XHR9XG5cblx0XHRcdGlmKHJ1bm5pbmcpe1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHJ1bm5pbmcgPSAgdHJ1ZTtcblxuXHRcdFx0ZGVsYXkgPSBnRGVsYXkgLSAoRGF0ZS5ub3coKSAtIGxhc3RUaW1lKTtcblxuXHRcdFx0aWYoZGVsYXkgPCAwKXtcblx0XHRcdFx0ZGVsYXkgPSAwO1xuXHRcdFx0fVxuXG5cdFx0XHRpZihpc1ByaW9yaXR5IHx8IChkZWxheSA8IDkgJiYgcmVxdWVzdElkbGVDYWxsYmFjaykpe1xuXHRcdFx0XHRpZGxlQ2FsbGJhY2soKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNldFRpbWVvdXQoaWRsZUNhbGxiYWNrLCBkZWxheSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fTtcblxuXHQvL2Jhc2VkIG9uIGh0dHA6Ly9tb2Rlcm5qYXZhc2NyaXB0LmJsb2dzcG90LmRlLzIwMTMvMDgvYnVpbGRpbmctYmV0dGVyLWRlYm91bmNlLmh0bWxcblx0dmFyIGRlYm91bmNlID0gZnVuY3Rpb24oZnVuYykge1xuXHRcdHZhciB0aW1lb3V0LCB0aW1lc3RhbXA7XG5cdFx0dmFyIHdhaXQgPSA5OTtcblx0XHR2YXIgcnVuID0gZnVuY3Rpb24oKXtcblx0XHRcdHRpbWVvdXQgPSBudWxsO1xuXHRcdFx0ZnVuYygpO1xuXHRcdH07XG5cdFx0dmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbGFzdCA9IERhdGUubm93KCkgLSB0aW1lc3RhbXA7XG5cblx0XHRcdGlmIChsYXN0IDwgd2FpdCkge1xuXHRcdFx0XHRzZXRUaW1lb3V0KGxhdGVyLCB3YWl0IC0gbGFzdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQocmVxdWVzdElkbGVDYWxsYmFjayB8fCBydW4pKHJ1bik7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdHRpbWVzdGFtcCA9IERhdGUubm93KCk7XG5cblx0XHRcdGlmICghdGltZW91dCkge1xuXHRcdFx0XHR0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fTtcblxuXG5cdHZhciBsb2FkZXIgPSAoZnVuY3Rpb24oKXtcblx0XHR2YXIgbGF6eWxvYWRFbGVtcywgcHJlbG9hZEVsZW1zLCBpc0NvbXBsZXRlZCwgcmVzZXRQcmVsb2FkaW5nVGltZXIsIGxvYWRNb2RlLCBzdGFydGVkO1xuXG5cdFx0dmFyIGVMdlcsIGVsdkgsIGVMdG9wLCBlTGxlZnQsIGVMcmlnaHQsIGVMYm90dG9tO1xuXG5cdFx0dmFyIGRlZmF1bHRFeHBhbmQsIHByZWxvYWRFeHBhbmQsIGhGYWM7XG5cblx0XHR2YXIgcmVnSW1nID0gL15pbWckL2k7XG5cdFx0dmFyIHJlZ0lmcmFtZSA9IC9eaWZyYW1lJC9pO1xuXG5cdFx0dmFyIHN1cHBvcnRTY3JvbGwgPSAoJ29uc2Nyb2xsJyBpbiB3aW5kb3cpICYmICEoL2dsZWJvdC8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSk7XG5cblx0XHR2YXIgc2hyaW5rRXhwYW5kID0gMDtcblx0XHR2YXIgY3VycmVudEV4cGFuZCA9IDA7XG5cblx0XHR2YXIgaXNMb2FkaW5nID0gMDtcblx0XHR2YXIgbG93UnVucyA9IC0xO1xuXG5cdFx0dmFyIHJlc2V0UHJlbG9hZGluZyA9IGZ1bmN0aW9uKGUpe1xuXHRcdFx0aXNMb2FkaW5nLS07XG5cdFx0XHRpZihlICYmIGUudGFyZ2V0KXtcblx0XHRcdFx0YWRkUmVtb3ZlTG9hZEV2ZW50cyhlLnRhcmdldCwgcmVzZXRQcmVsb2FkaW5nKTtcblx0XHRcdH1cblxuXHRcdFx0aWYoIWUgfHwgaXNMb2FkaW5nIDwgMCB8fCAhZS50YXJnZXQpe1xuXHRcdFx0XHRpc0xvYWRpbmcgPSAwO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHR2YXIgaXNOZXN0ZWRWaXNpYmxlID0gZnVuY3Rpb24oZWxlbSwgZWxlbUV4cGFuZCl7XG5cdFx0XHR2YXIgb3V0ZXJSZWN0O1xuXHRcdFx0dmFyIHBhcmVudCA9IGVsZW07XG5cdFx0XHR2YXIgdmlzaWJsZSA9IGdldENTUyhkb2N1bWVudC5ib2R5LCAndmlzaWJpbGl0eScpID09ICdoaWRkZW4nIHx8IGdldENTUyhlbGVtLCAndmlzaWJpbGl0eScpICE9ICdoaWRkZW4nO1xuXG5cdFx0XHRlTHRvcCAtPSBlbGVtRXhwYW5kO1xuXHRcdFx0ZUxib3R0b20gKz0gZWxlbUV4cGFuZDtcblx0XHRcdGVMbGVmdCAtPSBlbGVtRXhwYW5kO1xuXHRcdFx0ZUxyaWdodCArPSBlbGVtRXhwYW5kO1xuXG5cdFx0XHR3aGlsZSh2aXNpYmxlICYmIChwYXJlbnQgPSBwYXJlbnQub2Zmc2V0UGFyZW50KSAmJiBwYXJlbnQgIT0gZG9jdW1lbnQuYm9keSAmJiBwYXJlbnQgIT0gZG9jRWxlbSl7XG5cdFx0XHRcdHZpc2libGUgPSAoKGdldENTUyhwYXJlbnQsICdvcGFjaXR5JykgfHwgMSkgPiAwKTtcblxuXHRcdFx0XHRpZih2aXNpYmxlICYmIGdldENTUyhwYXJlbnQsICdvdmVyZmxvdycpICE9ICd2aXNpYmxlJyl7XG5cdFx0XHRcdFx0b3V0ZXJSZWN0ID0gcGFyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0XHRcdHZpc2libGUgPSBlTHJpZ2h0ID4gb3V0ZXJSZWN0LmxlZnQgJiZcblx0XHRcdFx0XHRcdGVMbGVmdCA8IG91dGVyUmVjdC5yaWdodCAmJlxuXHRcdFx0XHRcdFx0ZUxib3R0b20gPiBvdXRlclJlY3QudG9wIC0gMSAmJlxuXHRcdFx0XHRcdFx0ZUx0b3AgPCBvdXRlclJlY3QuYm90dG9tICsgMVxuXHRcdFx0XHRcdDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdmlzaWJsZTtcblx0XHR9O1xuXG5cdFx0dmFyIGNoZWNrRWxlbWVudHMgPSBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBlTGxlbiwgaSwgcmVjdCwgYXV0b0xvYWRFbGVtLCBsb2FkZWRTb21ldGhpbmcsIGVsZW1FeHBhbmQsIGVsZW1OZWdhdGl2ZUV4cGFuZCwgZWxlbUV4cGFuZFZhbCwgYmVmb3JlRXhwYW5kVmFsO1xuXG5cdFx0XHRpZigobG9hZE1vZGUgPSBsYXp5U2l6ZXNDb25maWcubG9hZE1vZGUpICYmIGlzTG9hZGluZyA8IDggJiYgKGVMbGVuID0gbGF6eWxvYWRFbGVtcy5sZW5ndGgpKXtcblxuXHRcdFx0XHRpID0gMDtcblxuXHRcdFx0XHRsb3dSdW5zKys7XG5cblx0XHRcdFx0aWYocHJlbG9hZEV4cGFuZCA9PSBudWxsKXtcblx0XHRcdFx0XHRpZighKCdleHBhbmQnIGluIGxhenlTaXplc0NvbmZpZykpe1xuXHRcdFx0XHRcdFx0bGF6eVNpemVzQ29uZmlnLmV4cGFuZCA9IGRvY0VsZW0uY2xpZW50SGVpZ2h0ID4gNTAwICYmIGRvY0VsZW0uY2xpZW50V2lkdGggPiA1MDAgPyA1MDAgOiAzNzA7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0ZGVmYXVsdEV4cGFuZCA9IGxhenlTaXplc0NvbmZpZy5leHBhbmQ7XG5cdFx0XHRcdFx0cHJlbG9hZEV4cGFuZCA9IGRlZmF1bHRFeHBhbmQgKiBsYXp5U2l6ZXNDb25maWcuZXhwRmFjdG9yO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoY3VycmVudEV4cGFuZCA8IHByZWxvYWRFeHBhbmQgJiYgaXNMb2FkaW5nIDwgMSAmJiBsb3dSdW5zID4gMiAmJiBsb2FkTW9kZSA+IDIgJiYgIWRvY3VtZW50LmhpZGRlbil7XG5cdFx0XHRcdFx0Y3VycmVudEV4cGFuZCA9IHByZWxvYWRFeHBhbmQ7XG5cdFx0XHRcdFx0bG93UnVucyA9IDA7XG5cdFx0XHRcdH0gZWxzZSBpZihsb2FkTW9kZSA+IDEgJiYgbG93UnVucyA+IDEgJiYgaXNMb2FkaW5nIDwgNil7XG5cdFx0XHRcdFx0Y3VycmVudEV4cGFuZCA9IGRlZmF1bHRFeHBhbmQ7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y3VycmVudEV4cGFuZCA9IHNocmlua0V4cGFuZDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGZvcig7IGkgPCBlTGxlbjsgaSsrKXtcblxuXHRcdFx0XHRcdGlmKCFsYXp5bG9hZEVsZW1zW2ldIHx8IGxhenlsb2FkRWxlbXNbaV0uX2xhenlSYWNlKXtjb250aW51ZTt9XG5cblx0XHRcdFx0XHRpZighc3VwcG9ydFNjcm9sbCl7dW52ZWlsRWxlbWVudChsYXp5bG9hZEVsZW1zW2ldKTtjb250aW51ZTt9XG5cblx0XHRcdFx0XHRpZighKGVsZW1FeHBhbmRWYWwgPSBsYXp5bG9hZEVsZW1zW2ldW19nZXRBdHRyaWJ1dGVdKCdkYXRhLWV4cGFuZCcpKSB8fCAhKGVsZW1FeHBhbmQgPSBlbGVtRXhwYW5kVmFsICogMSkpe1xuXHRcdFx0XHRcdFx0ZWxlbUV4cGFuZCA9IGN1cnJlbnRFeHBhbmQ7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYoYmVmb3JlRXhwYW5kVmFsICE9PSBlbGVtRXhwYW5kKXtcblx0XHRcdFx0XHRcdGVMdlcgPSBpbm5lcldpZHRoICsgKGVsZW1FeHBhbmQgKiBoRmFjKTtcblx0XHRcdFx0XHRcdGVsdkggPSBpbm5lckhlaWdodCArIGVsZW1FeHBhbmQ7XG5cdFx0XHRcdFx0XHRlbGVtTmVnYXRpdmVFeHBhbmQgPSBlbGVtRXhwYW5kICogLTE7XG5cdFx0XHRcdFx0XHRiZWZvcmVFeHBhbmRWYWwgPSBlbGVtRXhwYW5kO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJlY3QgPSBsYXp5bG9hZEVsZW1zW2ldLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG5cdFx0XHRcdFx0aWYgKChlTGJvdHRvbSA9IHJlY3QuYm90dG9tKSA+PSBlbGVtTmVnYXRpdmVFeHBhbmQgJiZcblx0XHRcdFx0XHRcdChlTHRvcCA9IHJlY3QudG9wKSA8PSBlbHZIICYmXG5cdFx0XHRcdFx0XHQoZUxyaWdodCA9IHJlY3QucmlnaHQpID49IGVsZW1OZWdhdGl2ZUV4cGFuZCAqIGhGYWMgJiZcblx0XHRcdFx0XHRcdChlTGxlZnQgPSByZWN0LmxlZnQpIDw9IGVMdlcgJiZcblx0XHRcdFx0XHRcdChlTGJvdHRvbSB8fCBlTHJpZ2h0IHx8IGVMbGVmdCB8fCBlTHRvcCkgJiZcblx0XHRcdFx0XHRcdChsYXp5U2l6ZXNDb25maWcubG9hZEhpZGRlbiB8fCBnZXRDU1MobGF6eWxvYWRFbGVtc1tpXSwgJ3Zpc2liaWxpdHknKSAhPSAnaGlkZGVuJykgJiZcblx0XHRcdFx0XHRcdCgoaXNDb21wbGV0ZWQgJiYgaXNMb2FkaW5nIDwgMyAmJiAhZWxlbUV4cGFuZFZhbCAmJiAobG9hZE1vZGUgPCAzIHx8IGxvd1J1bnMgPCA0KSkgfHwgaXNOZXN0ZWRWaXNpYmxlKGxhenlsb2FkRWxlbXNbaV0sIGVsZW1FeHBhbmQpKSl7XG5cdFx0XHRcdFx0XHR1bnZlaWxFbGVtZW50KGxhenlsb2FkRWxlbXNbaV0pO1xuXHRcdFx0XHRcdFx0bG9hZGVkU29tZXRoaW5nID0gdHJ1ZTtcblx0XHRcdFx0XHRcdGlmKGlzTG9hZGluZyA+IDkpe2JyZWFrO31cblx0XHRcdFx0XHR9IGVsc2UgaWYoIWxvYWRlZFNvbWV0aGluZyAmJiBpc0NvbXBsZXRlZCAmJiAhYXV0b0xvYWRFbGVtICYmXG5cdFx0XHRcdFx0XHRpc0xvYWRpbmcgPCA0ICYmIGxvd1J1bnMgPCA0ICYmIGxvYWRNb2RlID4gMiAmJlxuXHRcdFx0XHRcdFx0KHByZWxvYWRFbGVtc1swXSB8fCBsYXp5U2l6ZXNDb25maWcucHJlbG9hZEFmdGVyTG9hZCkgJiZcblx0XHRcdFx0XHRcdChwcmVsb2FkRWxlbXNbMF0gfHwgKCFlbGVtRXhwYW5kVmFsICYmICgoZUxib3R0b20gfHwgZUxyaWdodCB8fCBlTGxlZnQgfHwgZUx0b3ApIHx8IGxhenlsb2FkRWxlbXNbaV1bX2dldEF0dHJpYnV0ZV0obGF6eVNpemVzQ29uZmlnLnNpemVzQXR0cikgIT0gJ2F1dG8nKSkpKXtcblx0XHRcdFx0XHRcdGF1dG9Mb2FkRWxlbSA9IHByZWxvYWRFbGVtc1swXSB8fCBsYXp5bG9hZEVsZW1zW2ldO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKGF1dG9Mb2FkRWxlbSAmJiAhbG9hZGVkU29tZXRoaW5nKXtcblx0XHRcdFx0XHR1bnZlaWxFbGVtZW50KGF1dG9Mb2FkRWxlbSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0dmFyIHRocm90dGxlZENoZWNrRWxlbWVudHMgPSB0aHJvdHRsZShjaGVja0VsZW1lbnRzKTtcblxuXHRcdHZhciBzd2l0Y2hMb2FkaW5nQ2xhc3MgPSBmdW5jdGlvbihlKXtcblx0XHRcdGFkZENsYXNzKGUudGFyZ2V0LCBsYXp5U2l6ZXNDb25maWcubG9hZGVkQ2xhc3MpO1xuXHRcdFx0cmVtb3ZlQ2xhc3MoZS50YXJnZXQsIGxhenlTaXplc0NvbmZpZy5sb2FkaW5nQ2xhc3MpO1xuXHRcdFx0YWRkUmVtb3ZlTG9hZEV2ZW50cyhlLnRhcmdldCwgcmFmU3dpdGNoTG9hZGluZ0NsYXNzKTtcblx0XHR9O1xuXHRcdHZhciByYWZlZFN3aXRjaExvYWRpbmdDbGFzcyA9IHJBRkl0KHN3aXRjaExvYWRpbmdDbGFzcyk7XG5cdFx0dmFyIHJhZlN3aXRjaExvYWRpbmdDbGFzcyA9IGZ1bmN0aW9uKGUpe1xuXHRcdFx0cmFmZWRTd2l0Y2hMb2FkaW5nQ2xhc3Moe3RhcmdldDogZS50YXJnZXR9KTtcblx0XHR9O1xuXG5cdFx0dmFyIGNoYW5nZUlmcmFtZVNyYyA9IGZ1bmN0aW9uKGVsZW0sIHNyYyl7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRlbGVtLmNvbnRlbnRXaW5kb3cubG9jYXRpb24ucmVwbGFjZShzcmMpO1xuXHRcdFx0fSBjYXRjaChlKXtcblx0XHRcdFx0ZWxlbS5zcmMgPSBzcmM7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHZhciBoYW5kbGVTb3VyY2VzID0gZnVuY3Rpb24oc291cmNlKXtcblx0XHRcdHZhciBjdXN0b21NZWRpYTtcblxuXHRcdFx0dmFyIHNvdXJjZVNyY3NldCA9IHNvdXJjZVtfZ2V0QXR0cmlidXRlXShsYXp5U2l6ZXNDb25maWcuc3Jjc2V0QXR0cik7XG5cblx0XHRcdGlmKCAoY3VzdG9tTWVkaWEgPSBsYXp5U2l6ZXNDb25maWcuY3VzdG9tTWVkaWFbc291cmNlW19nZXRBdHRyaWJ1dGVdKCdkYXRhLW1lZGlhJykgfHwgc291cmNlW19nZXRBdHRyaWJ1dGVdKCdtZWRpYScpXSkgKXtcblx0XHRcdFx0c291cmNlLnNldEF0dHJpYnV0ZSgnbWVkaWEnLCBjdXN0b21NZWRpYSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmKHNvdXJjZVNyY3NldCl7XG5cdFx0XHRcdHNvdXJjZS5zZXRBdHRyaWJ1dGUoJ3NyY3NldCcsIHNvdXJjZVNyY3NldCk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHZhciBsYXp5VW52ZWlsID0gckFGSXQoZnVuY3Rpb24gKGVsZW0sIGRldGFpbCwgaXNBdXRvLCBzaXplcywgaXNJbWcpe1xuXHRcdFx0dmFyIHNyYywgc3Jjc2V0LCBwYXJlbnQsIGlzUGljdHVyZSwgZXZlbnQsIGZpcmVzTG9hZDtcblxuXHRcdFx0aWYoIShldmVudCA9IHRyaWdnZXJFdmVudChlbGVtLCAnbGF6eWJlZm9yZXVudmVpbCcsIGRldGFpbCkpLmRlZmF1bHRQcmV2ZW50ZWQpe1xuXG5cdFx0XHRcdGlmKHNpemVzKXtcblx0XHRcdFx0XHRpZihpc0F1dG8pe1xuXHRcdFx0XHRcdFx0YWRkQ2xhc3MoZWxlbSwgbGF6eVNpemVzQ29uZmlnLmF1dG9zaXplc0NsYXNzKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0ZWxlbS5zZXRBdHRyaWJ1dGUoJ3NpemVzJywgc2l6ZXMpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHNyY3NldCA9IGVsZW1bX2dldEF0dHJpYnV0ZV0obGF6eVNpemVzQ29uZmlnLnNyY3NldEF0dHIpO1xuXHRcdFx0XHRzcmMgPSBlbGVtW19nZXRBdHRyaWJ1dGVdKGxhenlTaXplc0NvbmZpZy5zcmNBdHRyKTtcblxuXHRcdFx0XHRpZihpc0ltZykge1xuXHRcdFx0XHRcdHBhcmVudCA9IGVsZW0ucGFyZW50Tm9kZTtcblx0XHRcdFx0XHRpc1BpY3R1cmUgPSBwYXJlbnQgJiYgcmVnUGljdHVyZS50ZXN0KHBhcmVudC5ub2RlTmFtZSB8fCAnJyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRmaXJlc0xvYWQgPSBkZXRhaWwuZmlyZXNMb2FkIHx8ICgoJ3NyYycgaW4gZWxlbSkgJiYgKHNyY3NldCB8fCBzcmMgfHwgaXNQaWN0dXJlKSk7XG5cblx0XHRcdFx0ZXZlbnQgPSB7dGFyZ2V0OiBlbGVtfTtcblxuXHRcdFx0XHRpZihmaXJlc0xvYWQpe1xuXHRcdFx0XHRcdGFkZFJlbW92ZUxvYWRFdmVudHMoZWxlbSwgcmVzZXRQcmVsb2FkaW5nLCB0cnVlKTtcblx0XHRcdFx0XHRjbGVhclRpbWVvdXQocmVzZXRQcmVsb2FkaW5nVGltZXIpO1xuXHRcdFx0XHRcdHJlc2V0UHJlbG9hZGluZ1RpbWVyID0gc2V0VGltZW91dChyZXNldFByZWxvYWRpbmcsIDI1MDApO1xuXG5cdFx0XHRcdFx0YWRkQ2xhc3MoZWxlbSwgbGF6eVNpemVzQ29uZmlnLmxvYWRpbmdDbGFzcyk7XG5cdFx0XHRcdFx0YWRkUmVtb3ZlTG9hZEV2ZW50cyhlbGVtLCByYWZTd2l0Y2hMb2FkaW5nQ2xhc3MsIHRydWUpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoaXNQaWN0dXJlKXtcblx0XHRcdFx0XHRmb3JFYWNoLmNhbGwocGFyZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzb3VyY2UnKSwgaGFuZGxlU291cmNlcyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZihzcmNzZXQpe1xuXHRcdFx0XHRcdGVsZW0uc2V0QXR0cmlidXRlKCdzcmNzZXQnLCBzcmNzZXQpO1xuXHRcdFx0XHR9IGVsc2UgaWYoc3JjICYmICFpc1BpY3R1cmUpe1xuXHRcdFx0XHRcdGlmKHJlZ0lmcmFtZS50ZXN0KGVsZW0ubm9kZU5hbWUpKXtcblx0XHRcdFx0XHRcdGNoYW5nZUlmcmFtZVNyYyhlbGVtLCBzcmMpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRlbGVtLnNyYyA9IHNyYztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZihpc0ltZyAmJiAoc3Jjc2V0IHx8IGlzUGljdHVyZSkpe1xuXHRcdFx0XHRcdHVwZGF0ZVBvbHlmaWxsKGVsZW0sIHtzcmM6IHNyY30pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmKGVsZW0uX2xhenlSYWNlKXtcblx0XHRcdFx0ZGVsZXRlIGVsZW0uX2xhenlSYWNlO1xuXHRcdFx0fVxuXHRcdFx0cmVtb3ZlQ2xhc3MoZWxlbSwgbGF6eVNpemVzQ29uZmlnLmxhenlDbGFzcyk7XG5cblx0XHRcdHJBRihmdW5jdGlvbigpe1xuXHRcdFx0XHRpZiggIWZpcmVzTG9hZCB8fCAoZWxlbS5jb21wbGV0ZSAmJiBlbGVtLm5hdHVyYWxXaWR0aCA+IDEpKXtcblx0XHRcdFx0XHRpZihmaXJlc0xvYWQpe1xuXHRcdFx0XHRcdFx0cmVzZXRQcmVsb2FkaW5nKGV2ZW50KTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0aXNMb2FkaW5nLS07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHN3aXRjaExvYWRpbmdDbGFzcyhldmVudCk7XG5cdFx0XHRcdH1cblx0XHRcdH0sIHRydWUpO1xuXHRcdH0pO1xuXG5cdFx0dmFyIHVudmVpbEVsZW1lbnQgPSBmdW5jdGlvbiAoZWxlbSl7XG5cdFx0XHR2YXIgZGV0YWlsO1xuXG5cdFx0XHR2YXIgaXNJbWcgPSByZWdJbWcudGVzdChlbGVtLm5vZGVOYW1lKTtcblxuXHRcdFx0Ly9hbGxvdyB1c2luZyBzaXplcz1cImF1dG9cIiwgYnV0IGRvbid0IHVzZS4gaXQncyBpbnZhbGlkLiBVc2UgZGF0YS1zaXplcz1cImF1dG9cIiBvciBhIHZhbGlkIHZhbHVlIGZvciBzaXplcyBpbnN0ZWFkIChpLmUuOiBzaXplcz1cIjgwdndcIilcblx0XHRcdHZhciBzaXplcyA9IGlzSW1nICYmIChlbGVtW19nZXRBdHRyaWJ1dGVdKGxhenlTaXplc0NvbmZpZy5zaXplc0F0dHIpIHx8IGVsZW1bX2dldEF0dHJpYnV0ZV0oJ3NpemVzJykpO1xuXHRcdFx0dmFyIGlzQXV0byA9IHNpemVzID09ICdhdXRvJztcblxuXHRcdFx0aWYoIChpc0F1dG8gfHwgIWlzQ29tcGxldGVkKSAmJiBpc0ltZyAmJiAoZWxlbS5zcmMgfHwgZWxlbS5zcmNzZXQpICYmICFlbGVtLmNvbXBsZXRlICYmICFoYXNDbGFzcyhlbGVtLCBsYXp5U2l6ZXNDb25maWcuZXJyb3JDbGFzcykpe3JldHVybjt9XG5cblx0XHRcdGRldGFpbCA9IHRyaWdnZXJFdmVudChlbGVtLCAnbGF6eXVudmVpbHJlYWQnKS5kZXRhaWw7XG5cblx0XHRcdGlmKGlzQXV0byl7XG5cdFx0XHRcdCBhdXRvU2l6ZXIudXBkYXRlRWxlbShlbGVtLCB0cnVlLCBlbGVtLm9mZnNldFdpZHRoKTtcblx0XHRcdH1cblxuXHRcdFx0ZWxlbS5fbGF6eVJhY2UgPSB0cnVlO1xuXHRcdFx0aXNMb2FkaW5nKys7XG5cblx0XHRcdGxhenlVbnZlaWwoZWxlbSwgZGV0YWlsLCBpc0F1dG8sIHNpemVzLCBpc0ltZyk7XG5cdFx0fTtcblxuXHRcdHZhciBvbmxvYWQgPSBmdW5jdGlvbigpe1xuXHRcdFx0aWYoaXNDb21wbGV0ZWQpe3JldHVybjt9XG5cdFx0XHRpZihEYXRlLm5vdygpIC0gc3RhcnRlZCA8IDk5OSl7XG5cdFx0XHRcdHNldFRpbWVvdXQob25sb2FkLCA5OTkpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR2YXIgYWZ0ZXJTY3JvbGwgPSBkZWJvdW5jZShmdW5jdGlvbigpe1xuXHRcdFx0XHRsYXp5U2l6ZXNDb25maWcubG9hZE1vZGUgPSAzO1xuXHRcdFx0XHR0aHJvdHRsZWRDaGVja0VsZW1lbnRzKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0aXNDb21wbGV0ZWQgPSB0cnVlO1xuXG5cdFx0XHRsYXp5U2l6ZXNDb25maWcubG9hZE1vZGUgPSAzO1xuXG5cdFx0XHR0aHJvdHRsZWRDaGVja0VsZW1lbnRzKCk7XG5cblx0XHRcdGFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGlmKGxhenlTaXplc0NvbmZpZy5sb2FkTW9kZSA9PSAzKXtcblx0XHRcdFx0XHRsYXp5U2l6ZXNDb25maWcubG9hZE1vZGUgPSAyO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGFmdGVyU2Nyb2xsKCk7XG5cdFx0XHR9LCB0cnVlKTtcblx0XHR9O1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdF86IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHN0YXJ0ZWQgPSBEYXRlLm5vdygpO1xuXG5cdFx0XHRcdGxhenlsb2FkRWxlbXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGxhenlTaXplc0NvbmZpZy5sYXp5Q2xhc3MpO1xuXHRcdFx0XHRwcmVsb2FkRWxlbXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGxhenlTaXplc0NvbmZpZy5sYXp5Q2xhc3MgKyAnICcgKyBsYXp5U2l6ZXNDb25maWcucHJlbG9hZENsYXNzKTtcblx0XHRcdFx0aEZhYyA9IGxhenlTaXplc0NvbmZpZy5oRmFjO1xuXG5cdFx0XHRcdGFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRocm90dGxlZENoZWNrRWxlbWVudHMsIHRydWUpO1xuXG5cdFx0XHRcdGFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRocm90dGxlZENoZWNrRWxlbWVudHMsIHRydWUpO1xuXG5cdFx0XHRcdGlmKHdpbmRvdy5NdXRhdGlvbk9ic2VydmVyKXtcblx0XHRcdFx0XHRuZXcgTXV0YXRpb25PYnNlcnZlciggdGhyb3R0bGVkQ2hlY2tFbGVtZW50cyApLm9ic2VydmUoIGRvY0VsZW0sIHtjaGlsZExpc3Q6IHRydWUsIHN1YnRyZWU6IHRydWUsIGF0dHJpYnV0ZXM6IHRydWV9ICk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZG9jRWxlbVtfYWRkRXZlbnRMaXN0ZW5lcl0oJ0RPTU5vZGVJbnNlcnRlZCcsIHRocm90dGxlZENoZWNrRWxlbWVudHMsIHRydWUpO1xuXHRcdFx0XHRcdGRvY0VsZW1bX2FkZEV2ZW50TGlzdGVuZXJdKCdET01BdHRyTW9kaWZpZWQnLCB0aHJvdHRsZWRDaGVja0VsZW1lbnRzLCB0cnVlKTtcblx0XHRcdFx0XHRzZXRJbnRlcnZhbCh0aHJvdHRsZWRDaGVja0VsZW1lbnRzLCA5OTkpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YWRkRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsIHRocm90dGxlZENoZWNrRWxlbWVudHMsIHRydWUpO1xuXG5cdFx0XHRcdC8vLCAnZnVsbHNjcmVlbmNoYW5nZSdcblx0XHRcdFx0Wydmb2N1cycsICdtb3VzZW92ZXInLCAnY2xpY2snLCAnbG9hZCcsICd0cmFuc2l0aW9uZW5kJywgJ2FuaW1hdGlvbmVuZCcsICd3ZWJraXRBbmltYXRpb25FbmQnXS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpe1xuXHRcdFx0XHRcdGRvY3VtZW50W19hZGRFdmVudExpc3RlbmVyXShuYW1lLCB0aHJvdHRsZWRDaGVja0VsZW1lbnRzLCB0cnVlKTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0aWYoKC9kJHxeYy8udGVzdChkb2N1bWVudC5yZWFkeVN0YXRlKSkpe1xuXHRcdFx0XHRcdG9ubG9hZCgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBvbmxvYWQpO1xuXHRcdFx0XHRcdGRvY3VtZW50W19hZGRFdmVudExpc3RlbmVyXSgnRE9NQ29udGVudExvYWRlZCcsIHRocm90dGxlZENoZWNrRWxlbWVudHMpO1xuXHRcdFx0XHRcdHNldFRpbWVvdXQob25sb2FkLCAyMDAwMCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZihsYXp5bG9hZEVsZW1zLmxlbmd0aCl7XG5cdFx0XHRcdFx0Y2hlY2tFbGVtZW50cygpO1xuXHRcdFx0XHRcdHJBRi5fbHNGbHVzaCgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRocm90dGxlZENoZWNrRWxlbWVudHMoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGNoZWNrRWxlbXM6IHRocm90dGxlZENoZWNrRWxlbWVudHMsXG5cdFx0XHR1bnZlaWw6IHVudmVpbEVsZW1lbnRcblx0XHR9O1xuXHR9KSgpO1xuXG5cblx0dmFyIGF1dG9TaXplciA9IChmdW5jdGlvbigpe1xuXHRcdHZhciBhdXRvc2l6ZXNFbGVtcztcblxuXHRcdHZhciBzaXplRWxlbWVudCA9IHJBRkl0KGZ1bmN0aW9uKGVsZW0sIHBhcmVudCwgZXZlbnQsIHdpZHRoKXtcblx0XHRcdHZhciBzb3VyY2VzLCBpLCBsZW47XG5cdFx0XHRlbGVtLl9sYXp5c2l6ZXNXaWR0aCA9IHdpZHRoO1xuXHRcdFx0d2lkdGggKz0gJ3B4JztcblxuXHRcdFx0ZWxlbS5zZXRBdHRyaWJ1dGUoJ3NpemVzJywgd2lkdGgpO1xuXG5cdFx0XHRpZihyZWdQaWN0dXJlLnRlc3QocGFyZW50Lm5vZGVOYW1lIHx8ICcnKSl7XG5cdFx0XHRcdHNvdXJjZXMgPSBwYXJlbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NvdXJjZScpO1xuXHRcdFx0XHRmb3IoaSA9IDAsIGxlbiA9IHNvdXJjZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xuXHRcdFx0XHRcdHNvdXJjZXNbaV0uc2V0QXR0cmlidXRlKCdzaXplcycsIHdpZHRoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZighZXZlbnQuZGV0YWlsLmRhdGFBdHRyKXtcblx0XHRcdFx0dXBkYXRlUG9seWZpbGwoZWxlbSwgZXZlbnQuZGV0YWlsKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHR2YXIgZ2V0U2l6ZUVsZW1lbnQgPSBmdW5jdGlvbiAoZWxlbSwgZGF0YUF0dHIsIHdpZHRoKXtcblx0XHRcdHZhciBldmVudDtcblx0XHRcdHZhciBwYXJlbnQgPSBlbGVtLnBhcmVudE5vZGU7XG5cblx0XHRcdGlmKHBhcmVudCl7XG5cdFx0XHRcdHdpZHRoID0gZ2V0V2lkdGgoZWxlbSwgcGFyZW50LCB3aWR0aCk7XG5cdFx0XHRcdGV2ZW50ID0gdHJpZ2dlckV2ZW50KGVsZW0sICdsYXp5YmVmb3Jlc2l6ZXMnLCB7d2lkdGg6IHdpZHRoLCBkYXRhQXR0cjogISFkYXRhQXR0cn0pO1xuXG5cdFx0XHRcdGlmKCFldmVudC5kZWZhdWx0UHJldmVudGVkKXtcblx0XHRcdFx0XHR3aWR0aCA9IGV2ZW50LmRldGFpbC53aWR0aDtcblxuXHRcdFx0XHRcdGlmKHdpZHRoICYmIHdpZHRoICE9PSBlbGVtLl9sYXp5c2l6ZXNXaWR0aCl7XG5cdFx0XHRcdFx0XHRzaXplRWxlbWVudChlbGVtLCBwYXJlbnQsIGV2ZW50LCB3aWR0aCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHZhciB1cGRhdGVFbGVtZW50c1NpemVzID0gZnVuY3Rpb24oKXtcblx0XHRcdHZhciBpO1xuXHRcdFx0dmFyIGxlbiA9IGF1dG9zaXplc0VsZW1zLmxlbmd0aDtcblx0XHRcdGlmKGxlbil7XG5cdFx0XHRcdGkgPSAwO1xuXG5cdFx0XHRcdGZvcig7IGkgPCBsZW47IGkrKyl7XG5cdFx0XHRcdFx0Z2V0U2l6ZUVsZW1lbnQoYXV0b3NpemVzRWxlbXNbaV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHZhciBkZWJvdW5jZWRVcGRhdGVFbGVtZW50c1NpemVzID0gZGVib3VuY2UodXBkYXRlRWxlbWVudHNTaXplcyk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0XzogZnVuY3Rpb24oKXtcblx0XHRcdFx0YXV0b3NpemVzRWxlbXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGxhenlTaXplc0NvbmZpZy5hdXRvc2l6ZXNDbGFzcyk7XG5cdFx0XHRcdGFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGRlYm91bmNlZFVwZGF0ZUVsZW1lbnRzU2l6ZXMpO1xuXHRcdFx0fSxcblx0XHRcdGNoZWNrRWxlbXM6IGRlYm91bmNlZFVwZGF0ZUVsZW1lbnRzU2l6ZXMsXG5cdFx0XHR1cGRhdGVFbGVtOiBnZXRTaXplRWxlbWVudFxuXHRcdH07XG5cdH0pKCk7XG5cblx0dmFyIGluaXQgPSBmdW5jdGlvbigpe1xuXHRcdGlmKCFpbml0Lmkpe1xuXHRcdFx0aW5pdC5pID0gdHJ1ZTtcblx0XHRcdGF1dG9TaXplci5fKCk7XG5cdFx0XHRsb2FkZXIuXygpO1xuXHRcdH1cblx0fTtcblxuXHQoZnVuY3Rpb24oKXtcblx0XHR2YXIgcHJvcDtcblxuXHRcdHZhciBsYXp5U2l6ZXNEZWZhdWx0cyA9IHtcblx0XHRcdGxhenlDbGFzczogJ2xhenlsb2FkJyxcblx0XHRcdGxvYWRlZENsYXNzOiAnbGF6eWxvYWRlZCcsXG5cdFx0XHRsb2FkaW5nQ2xhc3M6ICdsYXp5bG9hZGluZycsXG5cdFx0XHRwcmVsb2FkQ2xhc3M6ICdsYXp5cHJlbG9hZCcsXG5cdFx0XHRlcnJvckNsYXNzOiAnbGF6eWVycm9yJyxcblx0XHRcdC8vc3RyaWN0Q2xhc3M6ICdsYXp5c3RyaWN0Jyxcblx0XHRcdGF1dG9zaXplc0NsYXNzOiAnbGF6eWF1dG9zaXplcycsXG5cdFx0XHRzcmNBdHRyOiAnZGF0YS1zcmMnLFxuXHRcdFx0c3Jjc2V0QXR0cjogJ2RhdGEtc3Jjc2V0Jyxcblx0XHRcdHNpemVzQXR0cjogJ2RhdGEtc2l6ZXMnLFxuXHRcdFx0Ly9wcmVsb2FkQWZ0ZXJMb2FkOiBmYWxzZSxcblx0XHRcdG1pblNpemU6IDQwLFxuXHRcdFx0Y3VzdG9tTWVkaWE6IHt9LFxuXHRcdFx0aW5pdDogdHJ1ZSxcblx0XHRcdGV4cEZhY3RvcjogMS41LFxuXHRcdFx0aEZhYzogMC44LFxuXHRcdFx0bG9hZE1vZGU6IDIsXG5cdFx0XHRsb2FkSGlkZGVuOiB0cnVlLFxuXHRcdH07XG5cblx0XHRsYXp5U2l6ZXNDb25maWcgPSB3aW5kb3cubGF6eVNpemVzQ29uZmlnIHx8IHdpbmRvdy5sYXp5c2l6ZXNDb25maWcgfHwge307XG5cblx0XHRmb3IocHJvcCBpbiBsYXp5U2l6ZXNEZWZhdWx0cyl7XG5cdFx0XHRpZighKHByb3AgaW4gbGF6eVNpemVzQ29uZmlnKSl7XG5cdFx0XHRcdGxhenlTaXplc0NvbmZpZ1twcm9wXSA9IGxhenlTaXplc0RlZmF1bHRzW3Byb3BdO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHdpbmRvdy5sYXp5U2l6ZXNDb25maWcgPSBsYXp5U2l6ZXNDb25maWc7XG5cblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHRpZihsYXp5U2l6ZXNDb25maWcuaW5pdCl7XG5cdFx0XHRcdGluaXQoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSkoKTtcblxuXHRsYXp5c2l6ZXMgPSB7XG5cdFx0Y2ZnOiBsYXp5U2l6ZXNDb25maWcsXG5cdFx0YXV0b1NpemVyOiBhdXRvU2l6ZXIsXG5cdFx0bG9hZGVyOiBsb2FkZXIsXG5cdFx0aW5pdDogaW5pdCxcblx0XHR1UDogdXBkYXRlUG9seWZpbGwsXG5cdFx0YUM6IGFkZENsYXNzLFxuXHRcdHJDOiByZW1vdmVDbGFzcyxcblx0XHRoQzogaGFzQ2xhc3MsXG5cdFx0ZmlyZTogdHJpZ2dlckV2ZW50LFxuXHRcdGdXOiBnZXRXaWR0aCxcblx0XHRyQUY6IHJBRixcblx0fTtcblxuXHRyZXR1cm4gbGF6eXNpemVzO1xufVxuKSk7XG4iLCIvKlxuVGhpcyBwbHVnaW4gZXh0ZW5kcyBsYXp5U2l6ZXMgdG8gbGF6eUxvYWQ6XG5iYWNrZ3JvdW5kIGltYWdlcywgdmlkZW9zL3Bvc3RlcnMgYW5kIHNjcmlwdHNcblxuQmFja2dyb3VuZC1JbWFnZTpcbkZvciBiYWNrZ3JvdW5kIGltYWdlcywgdXNlIGRhdGEtYmcgYXR0cmlidXRlOlxuPGRpdiBjbGFzcz1cImxhenlsb2FkXCIgZGF0YS1iZz1cImJnLWltZy5qcGdcIj48L2Rpdj5cblxuIFZpZGVvOlxuIEZvciB2aWRlby9hdWRpbyB1c2UgZGF0YS1wb3N0ZXIgYW5kIHByZWxvYWQ9XCJub25lXCI6XG4gPHZpZGVvIGNsYXNzPVwibGF6eWxvYWRcIiBkYXRhLXBvc3Rlcj1cInBvc3Rlci5qcGdcIiBwcmVsb2FkPVwibm9uZVwiPlxuIDwhLS0gc291cmNlcyAtLT5cbiA8L3ZpZGVvPlxuXG4gU2NyaXB0czpcbiBGb3Igc2NyaXB0cyB1c2UgZGF0YS1zY3JpcHQ6XG4gPGRpdiBjbGFzcz1cImxhenlsb2FkXCIgZGF0YS1zY3JpcHQ9XCJtb2R1bGUtbmFtZS5qc1wiPjwvZGl2PlxuXG5cbiBTY3JpcHQgbW9kdWxlcyB1c2luZyByZXF1aXJlOlxuIEZvciBtb2R1bGVzIHVzaW5nIHJlcXVpcmUgdXNlIGRhdGEtcmVxdWlyZTpcbiA8ZGl2IGNsYXNzPVwibGF6eWxvYWRcIiBkYXRhLXJlcXVpcmU9XCJtb2R1bGUtbmFtZVwiPjwvZGl2PlxuKi9cblxuKGZ1bmN0aW9uKHdpbmRvdywgZmFjdG9yeSkge1xuXHR2YXIgZ2xvYmFsSW5zdGFsbCA9IGZ1bmN0aW9uKCl7XG5cdFx0ZmFjdG9yeSh3aW5kb3cubGF6eVNpemVzKTtcblx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbGF6eXVudmVpbHJlYWQnLCBnbG9iYWxJbnN0YWxsLCB0cnVlKTtcblx0fTtcblxuXHRmYWN0b3J5ID0gZmFjdG9yeS5iaW5kKG51bGwsIHdpbmRvdywgd2luZG93LmRvY3VtZW50KTtcblxuXHRpZih0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKXtcblx0XHRmYWN0b3J5KHJlcXVpcmUoJ2xhenlzaXplcycpKTtcblx0fSBlbHNlIGlmKHdpbmRvdy5sYXp5U2l6ZXMpIHtcblx0XHRnbG9iYWxJbnN0YWxsKCk7XG5cdH0gZWxzZSB7XG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xhenl1bnZlaWxyZWFkJywgZ2xvYmFsSW5zdGFsbCwgdHJ1ZSk7XG5cdH1cbn0od2luZG93LCBmdW5jdGlvbih3aW5kb3csIGRvY3VtZW50LCBsYXp5U2l6ZXMpIHtcblx0Lypqc2hpbnQgZXFudWxsOnRydWUgKi9cblx0J3VzZSBzdHJpY3QnO1xuXHR2YXIgYmdMb2FkLCByZWdCZ1VybEVzY2FwZTtcblx0dmFyIHVuaXF1ZVVybHMgPSB7fTtcblxuXHRpZihkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKXtcblx0XHRyZWdCZ1VybEVzY2FwZSA9IC9cXCh8XFwpfFxcc3wnLztcblxuXHRcdGJnTG9hZCA9IGZ1bmN0aW9uICh1cmwsIGNiKXtcblx0XHRcdHZhciBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcblx0XHRcdGltZy5vbmxvYWQgPSBmdW5jdGlvbigpe1xuXHRcdFx0XHRpbWcub25sb2FkID0gbnVsbDtcblx0XHRcdFx0aW1nLm9uZXJyb3IgPSBudWxsO1xuXHRcdFx0XHRpbWcgPSBudWxsO1xuXHRcdFx0XHRjYigpO1xuXHRcdFx0fTtcblx0XHRcdGltZy5vbmVycm9yID0gaW1nLm9ubG9hZDtcblxuXHRcdFx0aW1nLnNyYyA9IHVybDtcblxuXHRcdFx0aWYoaW1nICYmIGltZy5jb21wbGV0ZSAmJiBpbWcub25sb2FkKXtcblx0XHRcdFx0aW1nLm9ubG9hZCgpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRhZGRFdmVudExpc3RlbmVyKCdsYXp5YmVmb3JldW52ZWlsJywgZnVuY3Rpb24oZSl7XG5cdFx0XHRpZihlLmRldGFpbC5pbnN0YW5jZSAhPSBsYXp5U2l6ZXMpe3JldHVybjt9XG5cblx0XHRcdHZhciB0bXAsIGxvYWQsIGJnLCBwb3N0ZXI7XG5cdFx0XHRpZighZS5kZWZhdWx0UHJldmVudGVkKSB7XG5cblx0XHRcdFx0aWYoZS50YXJnZXQucHJlbG9hZCA9PSAnbm9uZScpe1xuXHRcdFx0XHRcdGUudGFyZ2V0LnByZWxvYWQgPSAnYXV0byc7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0bXAgPSBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbGluaycpO1xuXHRcdFx0XHRpZih0bXApe1xuXHRcdFx0XHRcdGFkZFN0eWxlU2NyaXB0KHRtcCwgdHJ1ZSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBoYW5kbGUgZGF0YS1zY3JpcHRcblx0XHRcdFx0dG1wID0gZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXNjcmlwdCcpO1xuXHRcdFx0XHRpZih0bXApe1xuXHRcdFx0XHRcdGFkZFN0eWxlU2NyaXB0KHRtcCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBoYW5kbGUgZGF0YS1yZXF1aXJlXG5cdFx0XHRcdHRtcCA9IGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1yZXF1aXJlJyk7XG5cdFx0XHRcdGlmKHRtcCl7XG5cdFx0XHRcdFx0aWYobGF6eVNpemVzLmNmZy5yZXF1aXJlSnMpe1xuXHRcdFx0XHRcdFx0bGF6eVNpemVzLmNmZy5yZXF1aXJlSnMoW3RtcF0pO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRhZGRTdHlsZVNjcmlwdCh0bXApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIGhhbmRsZSBkYXRhLWJnXG5cdFx0XHRcdGJnID0gZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWJnJyk7XG5cdFx0XHRcdGlmIChiZykge1xuXHRcdFx0XHRcdGUuZGV0YWlsLmZpcmVzTG9hZCA9IHRydWU7XG5cdFx0XHRcdFx0bG9hZCA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0XHRlLnRhcmdldC5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSAndXJsKCcgKyAocmVnQmdVcmxFc2NhcGUudGVzdChiZykgPyBKU09OLnN0cmluZ2lmeShiZykgOiBiZyApICsgJyknO1xuXHRcdFx0XHRcdFx0ZS5kZXRhaWwuZmlyZXNMb2FkID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRsYXp5U2l6ZXMuZmlyZShlLnRhcmdldCwgJ19sYXp5bG9hZGVkJywge30sIHRydWUsIHRydWUpO1xuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRiZ0xvYWQoYmcsIGxvYWQpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gaGFuZGxlIGRhdGEtcG9zdGVyXG5cdFx0XHRcdHBvc3RlciA9IGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1wb3N0ZXInKTtcblx0XHRcdFx0aWYocG9zdGVyKXtcblx0XHRcdFx0XHRlLmRldGFpbC5maXJlc0xvYWQgPSB0cnVlO1xuXHRcdFx0XHRcdGxvYWQgPSBmdW5jdGlvbigpe1xuXHRcdFx0XHRcdFx0ZS50YXJnZXQucG9zdGVyID0gcG9zdGVyO1xuXHRcdFx0XHRcdFx0ZS5kZXRhaWwuZmlyZXNMb2FkID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRsYXp5U2l6ZXMuZmlyZShlLnRhcmdldCwgJ19sYXp5bG9hZGVkJywge30sIHRydWUsIHRydWUpO1xuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRiZ0xvYWQocG9zdGVyLCBsb2FkKTtcblxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSwgZmFsc2UpO1xuXG5cdH1cblxuXHRmdW5jdGlvbiBhZGRTdHlsZVNjcmlwdChzcmMsIHN0eWxlKXtcblx0XHRpZih1bmlxdWVVcmxzW3NyY10pe1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHR2YXIgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoc3R5bGUgPyAnbGluaycgOiAnc2NyaXB0Jyk7XG5cdFx0dmFyIGluc2VydEVsZW0gPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF07XG5cblx0XHRpZihzdHlsZSl7XG5cdFx0XHRlbGVtLnJlbCA9ICdzdHlsZXNoZWV0Jztcblx0XHRcdGVsZW0uaHJlZiA9IHNyYztcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZWxlbS5zcmMgPSBzcmM7XG5cdFx0fVxuXHRcdHVuaXF1ZVVybHNbc3JjXSA9IHRydWU7XG5cdFx0dW5pcXVlVXJsc1tlbGVtLnNyYyB8fCBlbGVtLmhyZWZdID0gdHJ1ZTtcblx0XHRpbnNlcnRFbGVtLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGVsZW0sIGluc2VydEVsZW0pO1xuXHR9XG59KSk7XG4iLCJ2YXIgZztcblxuLy8gVGhpcyB3b3JrcyBpbiBub24tc3RyaWN0IG1vZGVcbmcgPSAoZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzO1xufSkoKTtcblxudHJ5IHtcblx0Ly8gVGhpcyB3b3JrcyBpZiBldmFsIGlzIGFsbG93ZWQgKHNlZSBDU1ApXG5cdGcgPSBnIHx8IG5ldyBGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCk7XG59IGNhdGNoIChlKSB7XG5cdC8vIFRoaXMgd29ya3MgaWYgdGhlIHdpbmRvdyByZWZlcmVuY2UgaXMgYXZhaWxhYmxlXG5cdGlmICh0eXBlb2Ygd2luZG93ID09PSBcIm9iamVjdFwiKSBnID0gd2luZG93O1xufVxuXG4vLyBnIGNhbiBzdGlsbCBiZSB1bmRlZmluZWQsIGJ1dCBub3RoaW5nIHRvIGRvIGFib3V0IGl0Li4uXG4vLyBXZSByZXR1cm4gdW5kZWZpbmVkLCBpbnN0ZWFkIG9mIG5vdGhpbmcgaGVyZSwgc28gaXQnc1xuLy8gZWFzaWVyIHRvIGhhbmRsZSB0aGlzIGNhc2UuIGlmKCFnbG9iYWwpIHsgLi4ufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGc7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuXHRpZiAoIW1vZHVsZS53ZWJwYWNrUG9seWZpbGwpIHtcblx0XHRtb2R1bGUuZGVwcmVjYXRlID0gZnVuY3Rpb24oKSB7fTtcblx0XHRtb2R1bGUucGF0aHMgPSBbXTtcblx0XHQvLyBtb2R1bGUucGFyZW50ID0gdW5kZWZpbmVkIGJ5IGRlZmF1bHRcblx0XHRpZiAoIW1vZHVsZS5jaGlsZHJlbikgbW9kdWxlLmNoaWxkcmVuID0gW107XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZSwgXCJsb2FkZWRcIiwge1xuXHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiBtb2R1bGUubDtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLCBcImlkXCIsIHtcblx0XHRcdGVudW1lcmFibGU6IHRydWUsXG5cdFx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gbW9kdWxlLmk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0bW9kdWxlLndlYnBhY2tQb2x5ZmlsbCA9IDE7XG5cdH1cblx0cmV0dXJuIG1vZHVsZTtcbn07XG4iLCIoZnVuY3Rpb24oc2VsZikge1xuICAndXNlIHN0cmljdCc7XG5cbiAgaWYgKHNlbGYuZmV0Y2gpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHZhciBzdXBwb3J0ID0ge1xuICAgIHNlYXJjaFBhcmFtczogJ1VSTFNlYXJjaFBhcmFtcycgaW4gc2VsZixcbiAgICBpdGVyYWJsZTogJ1N5bWJvbCcgaW4gc2VsZiAmJiAnaXRlcmF0b3InIGluIFN5bWJvbCxcbiAgICBibG9iOiAnRmlsZVJlYWRlcicgaW4gc2VsZiAmJiAnQmxvYicgaW4gc2VsZiAmJiAoZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICBuZXcgQmxvYigpXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSkoKSxcbiAgICBmb3JtRGF0YTogJ0Zvcm1EYXRhJyBpbiBzZWxmLFxuICAgIGFycmF5QnVmZmVyOiAnQXJyYXlCdWZmZXInIGluIHNlbGZcbiAgfVxuXG4gIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyKSB7XG4gICAgdmFyIHZpZXdDbGFzc2VzID0gW1xuICAgICAgJ1tvYmplY3QgSW50OEFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50OEFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgSW50MTZBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDE2QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQzMkFycmF5XScsXG4gICAgICAnW29iamVjdCBGbG9hdDMyQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nXG4gICAgXVxuXG4gICAgdmFyIGlzRGF0YVZpZXcgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmogJiYgRGF0YVZpZXcucHJvdG90eXBlLmlzUHJvdG90eXBlT2Yob2JqKVxuICAgIH1cblxuICAgIHZhciBpc0FycmF5QnVmZmVyVmlldyA9IEFycmF5QnVmZmVyLmlzVmlldyB8fCBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmogJiYgdmlld0NsYXNzZXMuaW5kZXhPZihPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSkgPiAtMVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU5hbWUobmFtZSkge1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIG5hbWUgPSBTdHJpbmcobmFtZSlcbiAgICB9XG4gICAgaWYgKC9bXmEtejAtOVxcLSMkJSYnKisuXFxeX2B8fl0vaS50ZXN0KG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGNoYXJhY3RlciBpbiBoZWFkZXIgZmllbGQgbmFtZScpXG4gICAgfVxuICAgIHJldHVybiBuYW1lLnRvTG93ZXJDYXNlKClcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZVZhbHVlKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHZhbHVlID0gU3RyaW5nKHZhbHVlKVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuXG4gIC8vIEJ1aWxkIGEgZGVzdHJ1Y3RpdmUgaXRlcmF0b3IgZm9yIHRoZSB2YWx1ZSBsaXN0XG4gIGZ1bmN0aW9uIGl0ZXJhdG9yRm9yKGl0ZW1zKSB7XG4gICAgdmFyIGl0ZXJhdG9yID0ge1xuICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGl0ZW1zLnNoaWZ0KClcbiAgICAgICAgcmV0dXJuIHtkb25lOiB2YWx1ZSA9PT0gdW5kZWZpbmVkLCB2YWx1ZTogdmFsdWV9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuaXRlcmFibGUpIHtcbiAgICAgIGl0ZXJhdG9yW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZXJhdG9yXG4gIH1cblxuICBmdW5jdGlvbiBIZWFkZXJzKGhlYWRlcnMpIHtcbiAgICB0aGlzLm1hcCA9IHt9XG5cbiAgICBpZiAoaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMpIHtcbiAgICAgIGhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCB2YWx1ZSlcbiAgICAgIH0sIHRoaXMpXG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGhlYWRlcnMpKSB7XG4gICAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24oaGVhZGVyKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKGhlYWRlclswXSwgaGVhZGVyWzFdKVxuICAgICAgfSwgdGhpcylcbiAgICB9IGVsc2UgaWYgKGhlYWRlcnMpIHtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGhlYWRlcnMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCBoZWFkZXJzW25hbWVdKVxuICAgICAgfSwgdGhpcylcbiAgICB9XG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5hcHBlbmQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIG5hbWUgPSBub3JtYWxpemVOYW1lKG5hbWUpXG4gICAgdmFsdWUgPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSlcbiAgICB2YXIgb2xkVmFsdWUgPSB0aGlzLm1hcFtuYW1lXVxuICAgIHRoaXMubWFwW25hbWVdID0gb2xkVmFsdWUgPyBvbGRWYWx1ZSsnLCcrdmFsdWUgOiB2YWx1ZVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGVbJ2RlbGV0ZSddID0gZnVuY3Rpb24obmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24obmFtZSkge1xuICAgIG5hbWUgPSBub3JtYWxpemVOYW1lKG5hbWUpXG4gICAgcmV0dXJuIHRoaXMuaGFzKG5hbWUpID8gdGhpcy5tYXBbbmFtZV0gOiBudWxsXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwLmhhc093blByb3BlcnR5KG5vcm1hbGl6ZU5hbWUobmFtZSkpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldID0gbm9ybWFsaXplVmFsdWUodmFsdWUpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24oY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMubWFwKSB7XG4gICAgICBpZiAodGhpcy5tYXAuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB0aGlzLm1hcFtuYW1lXSwgbmFtZSwgdGhpcylcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5rZXlzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHsgaXRlbXMucHVzaChuYW1lKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLnZhbHVlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7IGl0ZW1zLnB1c2godmFsdWUpIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZW50cmllcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7IGl0ZW1zLnB1c2goW25hbWUsIHZhbHVlXSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBpZiAoc3VwcG9ydC5pdGVyYWJsZSkge1xuICAgIEhlYWRlcnMucHJvdG90eXBlW1N5bWJvbC5pdGVyYXRvcl0gPSBIZWFkZXJzLnByb3RvdHlwZS5lbnRyaWVzXG4gIH1cblxuICBmdW5jdGlvbiBjb25zdW1lZChib2R5KSB7XG4gICAgaWYgKGJvZHkuYm9keVVzZWQpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKSlcbiAgICB9XG4gICAgYm9keS5ib2R5VXNlZCA9IHRydWVcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlc29sdmUocmVhZGVyLnJlc3VsdClcbiAgICAgIH1cbiAgICAgIHJlYWRlci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChyZWFkZXIuZXJyb3IpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRCbG9iQXNBcnJheUJ1ZmZlcihibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICB2YXIgcHJvbWlzZSA9IGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGJsb2IpXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRCbG9iQXNUZXh0KGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgIHZhciBwcm9taXNlID0gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgICByZWFkZXIucmVhZEFzVGV4dChibG9iKVxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQXJyYXlCdWZmZXJBc1RleHQoYnVmKSB7XG4gICAgdmFyIHZpZXcgPSBuZXcgVWludDhBcnJheShidWYpXG4gICAgdmFyIGNoYXJzID0gbmV3IEFycmF5KHZpZXcubGVuZ3RoKVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2aWV3Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBjaGFyc1tpXSA9IFN0cmluZy5mcm9tQ2hhckNvZGUodmlld1tpXSlcbiAgICB9XG4gICAgcmV0dXJuIGNoYXJzLmpvaW4oJycpXG4gIH1cblxuICBmdW5jdGlvbiBidWZmZXJDbG9uZShidWYpIHtcbiAgICBpZiAoYnVmLnNsaWNlKSB7XG4gICAgICByZXR1cm4gYnVmLnNsaWNlKDApXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmLmJ5dGVMZW5ndGgpXG4gICAgICB2aWV3LnNldChuZXcgVWludDhBcnJheShidWYpKVxuICAgICAgcmV0dXJuIHZpZXcuYnVmZmVyXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gQm9keSgpIHtcbiAgICB0aGlzLmJvZHlVc2VkID0gZmFsc2VcblxuICAgIHRoaXMuX2luaXRCb2R5ID0gZnVuY3Rpb24oYm9keSkge1xuICAgICAgdGhpcy5fYm9keUluaXQgPSBib2R5XG4gICAgICBpZiAoIWJvZHkpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSAnJ1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYmxvYiAmJiBCbG9iLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlCbG9iID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmZvcm1EYXRhICYmIEZvcm1EYXRhLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlGb3JtRGF0YSA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5zZWFyY2hQYXJhbXMgJiYgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keS50b1N0cmluZygpXG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIgJiYgc3VwcG9ydC5ibG9iICYmIGlzRGF0YVZpZXcoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUFycmF5QnVmZmVyID0gYnVmZmVyQ2xvbmUoYm9keS5idWZmZXIpXG4gICAgICAgIC8vIElFIDEwLTExIGNhbid0IGhhbmRsZSBhIERhdGFWaWV3IGJvZHkuXG4gICAgICAgIHRoaXMuX2JvZHlJbml0ID0gbmV3IEJsb2IoW3RoaXMuX2JvZHlBcnJheUJ1ZmZlcl0pXG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIgJiYgKEFycmF5QnVmZmVyLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpIHx8IGlzQXJyYXlCdWZmZXJWaWV3KGJvZHkpKSkge1xuICAgICAgICB0aGlzLl9ib2R5QXJyYXlCdWZmZXIgPSBidWZmZXJDbG9uZShib2R5KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bnN1cHBvcnRlZCBCb2R5SW5pdCB0eXBlJylcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKSkge1xuICAgICAgICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ3RleHQvcGxhaW47Y2hhcnNldD1VVEYtOCcpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUJsb2IgJiYgdGhpcy5fYm9keUJsb2IudHlwZSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsIHRoaXMuX2JvZHlCbG9iLnR5cGUpXG4gICAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5zZWFyY2hQYXJhbXMgJiYgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PVVURi04JylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0LmJsb2IpIHtcbiAgICAgIHRoaXMuYmxvYiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUJsb2IpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUFycmF5QnVmZmVyKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy5fYm9keUFycmF5QnVmZmVyXSkpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIGJsb2InKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlUZXh0XSkpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5hcnJheUJ1ZmZlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5fYm9keUFycmF5QnVmZmVyKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbnN1bWVkKHRoaXMpIHx8IFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuYmxvYigpLnRoZW4ocmVhZEJsb2JBc0FycmF5QnVmZmVyKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy50ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgcmV0dXJuIHJlYWRCbG9iQXNUZXh0KHRoaXMuX2JvZHlCbG9iKVxuICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZWFkQXJyYXlCdWZmZXJBc1RleHQodGhpcy5fYm9keUFycmF5QnVmZmVyKSlcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyB0ZXh0JylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keVRleHQpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuZm9ybURhdGEpIHtcbiAgICAgIHRoaXMuZm9ybURhdGEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oZGVjb2RlKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuanNvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oSlNPTi5wYXJzZSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLy8gSFRUUCBtZXRob2RzIHdob3NlIGNhcGl0YWxpemF0aW9uIHNob3VsZCBiZSBub3JtYWxpemVkXG4gIHZhciBtZXRob2RzID0gWydERUxFVEUnLCAnR0VUJywgJ0hFQUQnLCAnT1BUSU9OUycsICdQT1NUJywgJ1BVVCddXG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplTWV0aG9kKG1ldGhvZCkge1xuICAgIHZhciB1cGNhc2VkID0gbWV0aG9kLnRvVXBwZXJDYXNlKClcbiAgICByZXR1cm4gKG1ldGhvZHMuaW5kZXhPZih1cGNhc2VkKSA+IC0xKSA/IHVwY2FzZWQgOiBtZXRob2RcbiAgfVxuXG4gIGZ1bmN0aW9uIFJlcXVlc3QoaW5wdXQsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICAgIHZhciBib2R5ID0gb3B0aW9ucy5ib2R5XG5cbiAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBSZXF1ZXN0KSB7XG4gICAgICBpZiAoaW5wdXQuYm9keVVzZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJylcbiAgICAgIH1cbiAgICAgIHRoaXMudXJsID0gaW5wdXQudXJsXG4gICAgICB0aGlzLmNyZWRlbnRpYWxzID0gaW5wdXQuY3JlZGVudGlhbHNcbiAgICAgIGlmICghb3B0aW9ucy5oZWFkZXJzKSB7XG4gICAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKGlucHV0LmhlYWRlcnMpXG4gICAgICB9XG4gICAgICB0aGlzLm1ldGhvZCA9IGlucHV0Lm1ldGhvZFxuICAgICAgdGhpcy5tb2RlID0gaW5wdXQubW9kZVxuICAgICAgaWYgKCFib2R5ICYmIGlucHV0Ll9ib2R5SW5pdCAhPSBudWxsKSB7XG4gICAgICAgIGJvZHkgPSBpbnB1dC5fYm9keUluaXRcbiAgICAgICAgaW5wdXQuYm9keVVzZWQgPSB0cnVlXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudXJsID0gU3RyaW5nKGlucHV0KVxuICAgIH1cblxuICAgIHRoaXMuY3JlZGVudGlhbHMgPSBvcHRpb25zLmNyZWRlbnRpYWxzIHx8IHRoaXMuY3JlZGVudGlhbHMgfHwgJ29taXQnXG4gICAgaWYgKG9wdGlvbnMuaGVhZGVycyB8fCAhdGhpcy5oZWFkZXJzKSB7XG4gICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgfVxuICAgIHRoaXMubWV0aG9kID0gbm9ybWFsaXplTWV0aG9kKG9wdGlvbnMubWV0aG9kIHx8IHRoaXMubWV0aG9kIHx8ICdHRVQnKVxuICAgIHRoaXMubW9kZSA9IG9wdGlvbnMubW9kZSB8fCB0aGlzLm1vZGUgfHwgbnVsbFxuICAgIHRoaXMucmVmZXJyZXIgPSBudWxsXG5cbiAgICBpZiAoKHRoaXMubWV0aG9kID09PSAnR0VUJyB8fCB0aGlzLm1ldGhvZCA9PT0gJ0hFQUQnKSAmJiBib2R5KSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdCb2R5IG5vdCBhbGxvd2VkIGZvciBHRVQgb3IgSEVBRCByZXF1ZXN0cycpXG4gICAgfVxuICAgIHRoaXMuX2luaXRCb2R5KGJvZHkpXG4gIH1cblxuICBSZXF1ZXN0LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCh0aGlzLCB7IGJvZHk6IHRoaXMuX2JvZHlJbml0IH0pXG4gIH1cblxuICBmdW5jdGlvbiBkZWNvZGUoYm9keSkge1xuICAgIHZhciBmb3JtID0gbmV3IEZvcm1EYXRhKClcbiAgICBib2R5LnRyaW0oKS5zcGxpdCgnJicpLmZvckVhY2goZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIGlmIChieXRlcykge1xuICAgICAgICB2YXIgc3BsaXQgPSBieXRlcy5zcGxpdCgnPScpXG4gICAgICAgIHZhciBuYW1lID0gc3BsaXQuc2hpZnQoKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICB2YXIgdmFsdWUgPSBzcGxpdC5qb2luKCc9JykucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgZm9ybS5hcHBlbmQoZGVjb2RlVVJJQ29tcG9uZW50KG5hbWUpLCBkZWNvZGVVUklDb21wb25lbnQodmFsdWUpKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIGZvcm1cbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlSGVhZGVycyhyYXdIZWFkZXJzKSB7XG4gICAgdmFyIGhlYWRlcnMgPSBuZXcgSGVhZGVycygpXG4gICAgcmF3SGVhZGVycy5zcGxpdCgvXFxyP1xcbi8pLmZvckVhY2goZnVuY3Rpb24obGluZSkge1xuICAgICAgdmFyIHBhcnRzID0gbGluZS5zcGxpdCgnOicpXG4gICAgICB2YXIga2V5ID0gcGFydHMuc2hpZnQoKS50cmltKClcbiAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gcGFydHMuam9pbignOicpLnRyaW0oKVxuICAgICAgICBoZWFkZXJzLmFwcGVuZChrZXksIHZhbHVlKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIGhlYWRlcnNcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXF1ZXN0LnByb3RvdHlwZSlcblxuICBmdW5jdGlvbiBSZXNwb25zZShib2R5SW5pdCwgb3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IHt9XG4gICAgfVxuXG4gICAgdGhpcy50eXBlID0gJ2RlZmF1bHQnXG4gICAgdGhpcy5zdGF0dXMgPSAnc3RhdHVzJyBpbiBvcHRpb25zID8gb3B0aW9ucy5zdGF0dXMgOiAyMDBcbiAgICB0aGlzLm9rID0gdGhpcy5zdGF0dXMgPj0gMjAwICYmIHRoaXMuc3RhdHVzIDwgMzAwXG4gICAgdGhpcy5zdGF0dXNUZXh0ID0gJ3N0YXR1c1RleHQnIGluIG9wdGlvbnMgPyBvcHRpb25zLnN0YXR1c1RleHQgOiAnT0snXG4gICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIHRoaXMudXJsID0gb3B0aW9ucy51cmwgfHwgJydcbiAgICB0aGlzLl9pbml0Qm9keShib2R5SW5pdClcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXNwb25zZS5wcm90b3R5cGUpXG5cbiAgUmVzcG9uc2UucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZSh0aGlzLl9ib2R5SW5pdCwge1xuICAgICAgc3RhdHVzOiB0aGlzLnN0YXR1cyxcbiAgICAgIHN0YXR1c1RleHQ6IHRoaXMuc3RhdHVzVGV4dCxcbiAgICAgIGhlYWRlcnM6IG5ldyBIZWFkZXJzKHRoaXMuaGVhZGVycyksXG4gICAgICB1cmw6IHRoaXMudXJsXG4gICAgfSlcbiAgfVxuXG4gIFJlc3BvbnNlLmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IDAsIHN0YXR1c1RleHQ6ICcnfSlcbiAgICByZXNwb25zZS50eXBlID0gJ2Vycm9yJ1xuICAgIHJldHVybiByZXNwb25zZVxuICB9XG5cbiAgdmFyIHJlZGlyZWN0U3RhdHVzZXMgPSBbMzAxLCAzMDIsIDMwMywgMzA3LCAzMDhdXG5cbiAgUmVzcG9uc2UucmVkaXJlY3QgPSBmdW5jdGlvbih1cmwsIHN0YXR1cykge1xuICAgIGlmIChyZWRpcmVjdFN0YXR1c2VzLmluZGV4T2Yoc3RhdHVzKSA9PT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbnZhbGlkIHN0YXR1cyBjb2RlJylcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IHN0YXR1cywgaGVhZGVyczoge2xvY2F0aW9uOiB1cmx9fSlcbiAgfVxuXG4gIHNlbGYuSGVhZGVycyA9IEhlYWRlcnNcbiAgc2VsZi5SZXF1ZXN0ID0gUmVxdWVzdFxuICBzZWxmLlJlc3BvbnNlID0gUmVzcG9uc2VcblxuICBzZWxmLmZldGNoID0gZnVuY3Rpb24oaW5wdXQsIGluaXQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGlucHV0LCBpbml0KVxuICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG5cbiAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgICAgc3RhdHVzOiB4aHIuc3RhdHVzLFxuICAgICAgICAgIHN0YXR1c1RleHQ6IHhoci5zdGF0dXNUZXh0LFxuICAgICAgICAgIGhlYWRlcnM6IHBhcnNlSGVhZGVycyh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkgfHwgJycpXG4gICAgICAgIH1cbiAgICAgICAgb3B0aW9ucy51cmwgPSAncmVzcG9uc2VVUkwnIGluIHhociA/IHhoci5yZXNwb25zZVVSTCA6IG9wdGlvbnMuaGVhZGVycy5nZXQoJ1gtUmVxdWVzdC1VUkwnKVxuICAgICAgICB2YXIgYm9keSA9ICdyZXNwb25zZScgaW4geGhyID8geGhyLnJlc3BvbnNlIDogeGhyLnJlc3BvbnNlVGV4dFxuICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZShib2R5LCBvcHRpb25zKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9udGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgfVxuXG4gICAgICB4aHIub3BlbihyZXF1ZXN0Lm1ldGhvZCwgcmVxdWVzdC51cmwsIHRydWUpXG5cbiAgICAgIGlmIChyZXF1ZXN0LmNyZWRlbnRpYWxzID09PSAnaW5jbHVkZScpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWVcbiAgICAgIH1cblxuICAgICAgaWYgKCdyZXNwb25zZVR5cGUnIGluIHhociAmJiBzdXBwb3J0LmJsb2IpIHtcbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdibG9iJ1xuICAgICAgfVxuXG4gICAgICByZXF1ZXN0LmhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSlcbiAgICAgIH0pXG5cbiAgICAgIHhoci5zZW5kKHR5cGVvZiByZXF1ZXN0Ll9ib2R5SW5pdCA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogcmVxdWVzdC5fYm9keUluaXQpXG4gICAgfSlcbiAgfVxuICBzZWxmLmZldGNoLnBvbHlmaWxsID0gdHJ1ZVxufSkodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnID8gc2VsZiA6IHRoaXMpO1xuIiwiLy8gVGVzdHMgd2hldGhlciB0aGUgYnJvd3NlciBjYW4gYWNjZXNzIGFuIGltYWdlIFVSTC5cbi8vIFVzZWZ1bCBhcyBhIHdvcmthcm91bmQgZm9yIENPUlMgc2VjdXJpdHkgdG8gdGVzdCBhY2Nlc3MgdG8gYW4gb3JpZ2luLlxuZnVuY3Rpb24gdGVzdEltYWdlQWNjZXNzKHVybCkge1xuICB2YXIgc3VjY2Vzc0NhbGxiYWNrID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBmdW5jdGlvbiAoKSB7fTtcbiAgdmFyIGZhaWx1cmVDYWxsYmFjayA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogZnVuY3Rpb24gKCkge307XG4gIHZhciB0aW1lb3V0TXMgPSBhcmd1bWVudHMubGVuZ3RoID4gMyAmJiBhcmd1bWVudHNbM10gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1szXSA6IDUwMDA7XG4gIHZhciB2aWRlb0VsZW1lbnQgPSBhcmd1bWVudHMubGVuZ3RoID4gNCAmJiBhcmd1bWVudHNbNF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1s0XSA6IGZhbHNlO1xuICB2YXIgZWxlbWVudDtcblxuICBpZiAodmlkZW9FbGVtZW50KSB7XG4gICAgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ZpZGVvJyk7XG4gIH0gZWxzZSB7XG4gICAgZWxlbWVudCA9IG5ldyBJbWFnZSgpO1xuICB9XG5cbiAgdmFyIGNhbGxlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGZpbmlzaChjYWxsYmFjaykge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoY2FsbGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICBjYWxsYmFjaygpO1xuICAgIH07XG4gIH1cblxuICB2YXIgdGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0KGZpbmlzaChmYWlsdXJlQ2FsbGJhY2spLCB0aW1lb3V0TXMpO1xuICBlbGVtZW50Lm9uZXJyb3IgPSBmaW5pc2goZmFpbHVyZUNhbGxiYWNrKTtcblxuICBpZiAodmlkZW9FbGVtZW50KSB7XG4gICAgZWxlbWVudC5vbmR1cmF0aW9uY2hhbmdlID0gZmluaXNoKHN1Y2Nlc3NDYWxsYmFjayk7XG4gIH0gZWxzZSB7XG4gICAgZWxlbWVudC5vbmxvYWQgPSBmaW5pc2goc3VjY2Vzc0NhbGxiYWNrKTtcbiAgfVxuXG4gIGVsZW1lbnQuc3JjID0gdXJsOyAvLyBzdG9yZSBhIHJlZmVyZW5jZSB0byB0aGUgZWxlbWVudCBzbyBpdCBkb2Vzbid0IGdldCBjb2xsZWN0ZWRcblxuICB3aW5kb3cudGVzdEltYWdlcyA9IHdpbmRvdy50ZXN0SW1hZ2VzIHx8IFtdO1xuICB3aW5kb3cudGVzdEltYWdlcy5wdXNoKGVsZW1lbnQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRlc3RJbWFnZUFjY2VzczsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuaW5pdEhhbWJ1cmdlciA9IHZvaWQgMDtcblxudmFyIF9qcXVlcnkgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJqcXVlcnlcIikpO1xuXG52YXIgX3RyYWNrRXZlbnQgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuLi91dGlsL3RyYWNrRXZlbnRcIikpO1xuXG52YXIgX3JlcG9ydEFidXNlID0gcmVxdWlyZShcIkBjZG8vYXBwcy9yZXBvcnRBYnVzZVwiKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgXCJkZWZhdWx0XCI6IG9iaiB9OyB9XG5cbnZhciBpbml0SGFtYnVyZ2VyID0gZnVuY3Rpb24gaW5pdEhhbWJ1cmdlcigpIHtcbiAgKDAsIF9qcXVlcnlbXCJkZWZhdWx0XCJdKShmdW5jdGlvbiAoKSB7XG4gICAgKDAsIF9qcXVlcnlbXCJkZWZhdWx0XCJdKSgnI2hhbWJ1cmdlci1pY29uJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICAgICgwLCBfanF1ZXJ5W1wiZGVmYXVsdFwiXSkodGhpcykudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgKDAsIF9qcXVlcnlbXCJkZWZhdWx0XCJdKSgnI2hhbWJ1cmdlcicpLnJlbW92ZUNsYXNzKCd1c2VyLWlzLXRhYmJpbmcnKTtcbiAgICAgICgwLCBfanF1ZXJ5W1wiZGVmYXVsdFwiXSkoJyNoZWxwLWJ1dHRvbicpLnJlbW92ZUNsYXNzKCd1c2VyLWlzLXRhYmJpbmcnKTtcbiAgICAgICgwLCBfanF1ZXJ5W1wiZGVmYXVsdFwiXSkoJyNoYW1idXJnZXIgI2hhbWJ1cmdlci1jb250ZW50cycpLnNsaWRlVG9nZ2xlKCk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSk7IC8vIGFsbG93cyB1c2VycyB0byB0b2dnbGUgaGVscCBtZW51IGJ5IHByZXNzaW5nIHJldHVyblxuICAgIC8vIHdoaWxlIHRhYmJpbmcgdGhyb3VnaCBlbGVtZW50c1xuXG4gICAgKDAsIF9qcXVlcnlbXCJkZWZhdWx0XCJdKSgnI2hhbWJ1cmdlcicpLm9uKCdrZXlwcmVzcycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBpZiAoZS50eXBlID09PSAna2V5cHJlc3MnICYmIGUud2hpY2ggPT09IDEzICYmIGUudGFyZ2V0LmNsYXNzTmFtZSAhPT0gJ2hhbWJ1cmdlci1leHBhbmRhYmxlLWl0ZW0gaXRlbScpIHtcbiAgICAgICAgKDAsIF9qcXVlcnlbXCJkZWZhdWx0XCJdKSh0aGlzKS50b2dnbGVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICgwLCBfanF1ZXJ5W1wiZGVmYXVsdFwiXSkoJyNoYW1idXJnZXItaWNvbicpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgKDAsIF9qcXVlcnlbXCJkZWZhdWx0XCJdKSgnI2hhbWJ1cmdlciAjaGFtYnVyZ2VyLWNvbnRlbnRzJykuc2xpZGVUb2dnbGUoKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgIH0pO1xuICAgICgwLCBfanF1ZXJ5W1wiZGVmYXVsdFwiXSkoZG9jdW1lbnQpLm9uKCdrZXlwcmVzcyBrZXlkb3duIGNsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIHZhciBoYW1idXJnZXIgPSAoMCwgX2pxdWVyeVtcImRlZmF1bHRcIl0pKCcjaGFtYnVyZ2VyJyk7IC8vIElmIHdlIGRpZG4ndCBjbGljayB0aGUgaGFtYnVyZ2VyIGl0c2VsZiwgYW5kIGFsc28gbm90aGluZyBpbnNpZGUgaXQsXG4gICAgICAvLyB0aGVuIGhpZGUgaXQuXG5cbiAgICAgIGlmICghaGFtYnVyZ2VyLmlzKGUudGFyZ2V0KSAmJiBoYW1idXJnZXIuaGFzKGUudGFyZ2V0KS5sZW5ndGggPT09IDAgJiYgZS50YXJnZXQuY2xhc3NOYW1lICE9PSAnaGFtYnVyZ2VyLWV4cGFuZGFibGUtaXRlbSBpdGVtJykge1xuICAgICAgICBoYW1idXJnZXIuY2hpbGRyZW4oJyNoYW1idXJnZXItY29udGVudHMnKS5zbGlkZVVwKCk7XG4gICAgICAgICgwLCBfanF1ZXJ5W1wiZGVmYXVsdFwiXSkoJyNoYW1idXJnZXItaWNvbicpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGhlbHBCdXR0b24gPSAoMCwgX2pxdWVyeVtcImRlZmF1bHRcIl0pKCcjaGVscC1idXR0b24nKTsgLy8gSWYgdGhlIHVzZXIgaXMgdXNpbmcgdGhlIGtleWJvYXJkIHRvIG5hdmlnYXRlLFxuICAgICAgLy8gYWRkIGEgY2xhc3MgdGhhdCByZXRhaW5zIGVsZW1lbnQgb3V0bGluZVxuXG4gICAgICBpZiAoZS50eXBlID09PSAna2V5ZG93bicgJiYgZS53aGljaCA9PT0gOSkge1xuICAgICAgICBoYW1idXJnZXIuYWRkQ2xhc3MoJ3VzZXItaXMtdGFiYmluZycpO1xuICAgICAgICBoZWxwQnV0dG9uLmFkZENsYXNzKCd1c2VyLWlzLXRhYmJpbmcnKTtcbiAgICAgIH0gLy8gSWYgd2UgZGlkbid0IGNsaWNrIHRoZSBoZWxwIGJ1dHRvbiBpdHNlbGYsIGFuZCBhbHNvIG5vdGhpbmcgaW5zaWRlIGl0LFxuICAgICAgLy8gdGhlbiBoaWRlIGl0LlxuXG5cbiAgICAgIGlmICghaGVscEJ1dHRvbi5pcyhlLnRhcmdldCkgJiYgaGVscEJ1dHRvbi5oYXMoZS50YXJnZXQpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBoZWxwQnV0dG9uLmNoaWxkcmVuKCcjaGVscC1jb250ZW50cycpLnNsaWRlVXAoKTtcbiAgICAgICAgKDAsIF9qcXVlcnlbXCJkZWZhdWx0XCJdKSgnI2hlbHAtaWNvbicpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICAoMCwgX2pxdWVyeVtcImRlZmF1bHRcIl0pKCcuaGFtYnVyZ2VyLWV4cGFuZGFibGUtaXRlbScpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgKDAsIF9qcXVlcnlbXCJkZWZhdWx0XCJdKSh0aGlzKS5vbigna2V5cHJlc3MgY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoZS50eXBlID09PSAna2V5cHJlc3MnICYmIGUud2hpY2ggPT09IDEzIHx8IGUudHlwZSA9PT0gJ2NsaWNrJykge1xuICAgICAgICAgICgwLCBfanF1ZXJ5W1wiZGVmYXVsdFwiXSkoJyMnICsgKDAsIF9qcXVlcnlbXCJkZWZhdWx0XCJdKSh0aGlzKS5hdHRyKCdpZCcpICsgJy1pdGVtcycpLnNsaWRlVG9nZ2xlKCk7XG4gICAgICAgICAgKDAsIF9qcXVlcnlbXCJkZWZhdWx0XCJdKSh0aGlzKS5maW5kKCcuYXJyb3ctZG93bicpLnRvZ2dsZSgpO1xuICAgICAgICAgICgwLCBfanF1ZXJ5W1wiZGVmYXVsdFwiXSkodGhpcykuZmluZCgnLmFycm93LXVwJykudG9nZ2xlKCk7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICAoMCwgX2pxdWVyeVtcImRlZmF1bHRcIl0pKCcjaGVscC1pY29uJykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICAgICgwLCBfanF1ZXJ5W1wiZGVmYXVsdFwiXSkodGhpcykudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgKDAsIF9qcXVlcnlbXCJkZWZhdWx0XCJdKSgnI2hhbWJ1cmdlcicpLnJlbW92ZUNsYXNzKCd1c2VyLWlzLXRhYmJpbmcnKTtcbiAgICAgICgwLCBfanF1ZXJ5W1wiZGVmYXVsdFwiXSkoJyNoZWxwLWJ1dHRvbicpLnJlbW92ZUNsYXNzKCd1c2VyLWlzLXRhYmJpbmcnKTtcbiAgICAgICgwLCBfanF1ZXJ5W1wiZGVmYXVsdFwiXSkoJyNoZWxwLWJ1dHRvbiAjaGVscC1jb250ZW50cycpLnNsaWRlVG9nZ2xlKCk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSk7IC8vIGFsbG93cyB1c2VycyB0byB0b2dnbGUgaGVscCBtZW51IGJ5IHByZXNzaW5nIHJldHVyblxuICAgIC8vIHdoaWxlIHRhYmJpbmcgdGhyb3VnaCBlbGVtZW50c1xuXG4gICAgKDAsIF9qcXVlcnlbXCJkZWZhdWx0XCJdKSgnI2hlbHAtYnV0dG9uJykub24oJ2tleXByZXNzJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGlmIChlLnR5cGUgPT09ICdrZXlwcmVzcycgJiYgZS53aGljaCA9PT0gMTMpIHtcbiAgICAgICAgKDAsIF9qcXVlcnlbXCJkZWZhdWx0XCJdKSh0aGlzKS50b2dnbGVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICgwLCBfanF1ZXJ5W1wiZGVmYXVsdFwiXSkoJyNoZWxwLWJ1dHRvbiAjaGVscC1jb250ZW50cycpLnNsaWRlVG9nZ2xlKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICAoMCwgX2pxdWVyeVtcImRlZmF1bHRcIl0pKCcjaGVscC1pY29uICNyZXBvcnQtYnVnJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgKDAsIF90cmFja0V2ZW50W1wiZGVmYXVsdFwiXSkoJ2hlbHBfdWknLCAncmVwb3J0LWJ1ZycsICdoYW1idXJnZXInKTtcbiAgICB9KTtcbiAgICAoMCwgX2pxdWVyeVtcImRlZmF1bHRcIl0pKCcjaGVscC1pY29uICNzdXBwb3J0JykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgKDAsIF90cmFja0V2ZW50W1wiZGVmYXVsdFwiXSkoJ2hlbHBfdWknLCAnc3VwcG9ydCcsICdoYW1idXJnZXInKTtcbiAgICB9KTsgLy8gVGhpcyBpdGVtIGlzIG5vdCBpbiB0aGUgaGFtYnVyZ2VyLCBidXQgYWN0dWFsbHkgaW4gdGhlIHN0dWRpbyBmb290ZXIuXG5cbiAgICAoMCwgX2pxdWVyeVtcImRlZmF1bHRcIl0pKCcuZm9vdGVyICNzdXBwb3J0JykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgKDAsIF90cmFja0V2ZW50W1wiZGVmYXVsdFwiXSkoJ2hlbHBfdWknLCAnc3VwcG9ydCcsICdzdHVkaW9fZm9vdGVyJyk7XG4gICAgfSk7IC8vIFRoaXMgaXRlbSBpcyBub3QgaW4gdGhlIGhhbWJ1cmdlciwgYnV0IGFjdHVhbGx5IGluIHRoZSBwZWdhc3VzIGZvb3RlcnMgZm9yXG4gICAgLy8gZGVza3RvcCBhbmQgbW9iaWxlLlxuXG4gICAgKDAsIF9qcXVlcnlbXCJkZWZhdWx0XCJdKSgnI3BhZ2Vmb290ZXIgI3N1cHBvcnQnKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICgwLCBfanF1ZXJ5W1wiZGVmYXVsdFwiXSkodGhpcykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAoMCwgX3RyYWNrRXZlbnRbXCJkZWZhdWx0XCJdKSgnaGVscF91aScsICdzdXBwb3J0JywgJ3N0dWRpb19mb290ZXInKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHZhciBjaGFubmVsSWQgPSAoMCwgX3JlcG9ydEFidXNlLmdldENoYW5uZWxJZEZyb21VcmwpKGxvY2F0aW9uLmhyZWYpO1xuICAgIHZhciBhbHJlYWR5UmVwb3J0ZWRBYnVzZSA9ICgwLCBfcmVwb3J0QWJ1c2UudXNlckFscmVhZHlSZXBvcnRlZEFidXNlKShjaGFubmVsSWQpO1xuXG4gICAgaWYgKGFscmVhZHlSZXBvcnRlZEFidXNlKSB7XG4gICAgICB2YXIgcmVwb3J0QWJ1c2VCdXR0b24gPSAoMCwgX2pxdWVyeVtcImRlZmF1bHRcIl0pKCcjcmVwb3J0LWFidXNlJyk7XG5cbiAgICAgIGlmIChyZXBvcnRBYnVzZUJ1dHRvbikge1xuICAgICAgICByZXBvcnRBYnVzZUJ1dHRvbi5oaWRlKCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn07XG5cbmV4cG9ydHMuaW5pdEhhbWJ1cmdlciA9IGluaXRIYW1idXJnZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmdldENoYW5uZWxJZEZyb21VcmwgPSBleHBvcnRzLnVzZXJBbHJlYWR5UmVwb3J0ZWRBYnVzZSA9IHZvaWQgMDtcblxudmFyIF9qc0Nvb2tpZSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcImpzLWNvb2tpZVwiKSk7XG5cbnZhciBfbG9kYXNoID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwibG9kYXNoXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgXCJkZWZhdWx0XCI6IG9iaiB9OyB9XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiB0aGUgY3VycmVudCB1c2VyIGhhcyBhbHJlYWR5IHN1Ym1pdHRlZCBhbiBBYnVzZSByZXBvcnQgZm9yIHRoaXMgcHJvamVjdC5cbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRoZSB1c2VyIGhhcyByZXBvcnRlZCB0aGUgZ2l2ZW4gcHJvamVjdCBmb3IgYWJ1c2UuXG4gKi9cbnZhciB1c2VyQWxyZWFkeVJlcG9ydGVkQWJ1c2UgPSBmdW5jdGlvbiB1c2VyQWxyZWFkeVJlcG9ydGVkQWJ1c2UoY2hhbm5lbElkKSB7XG4gIHJldHVybiBfanNDb29raWVbXCJkZWZhdWx0XCJdLmdldCgncmVwb3J0ZWRfYWJ1c2UnKSAmJiBfbG9kYXNoW1wiZGVmYXVsdFwiXS5pbmNsdWRlcyhKU09OLnBhcnNlKF9qc0Nvb2tpZVtcImRlZmF1bHRcIl0uZ2V0KCdyZXBvcnRlZF9hYnVzZScpKSwgY2hhbm5lbElkKTtcbn07XG4vKipcbiAqIEV4dHJhY3RzIGEgY2hhbm5lbCBpZCBmcm9tIHRoZSBnaXZlbiBhYnVzZSB1cmxcbiAqIEByZXR1cm5zIHtzdHJpbmd9IENoYW5uZWwgaWQsIG9yIHVuZGVmaW5lZCBpZiB3ZSBjYW4ndCBnZXQgb25lLlxuICovXG5cblxuZXhwb3J0cy51c2VyQWxyZWFkeVJlcG9ydGVkQWJ1c2UgPSB1c2VyQWxyZWFkeVJlcG9ydGVkQWJ1c2U7XG5cbnZhciBnZXRDaGFubmVsSWRGcm9tVXJsID0gZnVuY3Rpb24gZ2V0Q2hhbm5lbElkRnJvbVVybChhYnVzZVVybCkge1xuICB2YXIgbWF0Y2g7XG5cbiAgaWYgKGFidXNlVXJsLmluZGV4T2YoJ2NvZGVwcm9qZWN0cycpID49IDApIHtcbiAgICBtYXRjaCA9IC8uKmNvZGVwcm9qZWN0cy4qW15cXC9dK1xcLyhbXlxcL10rKS8uZXhlYyhhYnVzZVVybCk7XG4gIH0gZWxzZSB7XG4gICAgbWF0Y2ggPSAvLipcXC9wcm9qZWN0c1xcL1teXFwvXStcXC8oW15cXC9dKykvLmV4ZWMoYWJ1c2VVcmwpO1xuICB9XG5cbiAgcmV0dXJuIG1hdGNoICYmIG1hdGNoWzFdO1xufTtcblxuZXhwb3J0cy5nZXRDaGFubmVsSWRGcm9tVXJsID0gZ2V0Q2hhbm5lbElkRnJvbVVybDsiLCJcInVzZSBzdHJpY3RcIjtcblxucmVxdWlyZShcImRldGFpbHMtZWxlbWVudC1wb2x5ZmlsbFwiKTtcblxucmVxdWlyZShcImxhenlzaXplc1wiKTtcblxucmVxdWlyZShcImxhenlzaXplcy9wbHVnaW5zL3VudmVpbGhvb2tzL2xzLnVudmVpbGhvb2tzXCIpO1xuXG52YXIgX2Jyb3dzZXJEZXRlY3RvciA9IHJlcXVpcmUoXCJAY2RvL2FwcHMvdXRpbC9icm93c2VyLWRldGVjdG9yXCIpO1xuXG52YXIgX2hhbWJ1cmdlciA9IHJlcXVpcmUoXCJAY2RvL2FwcHMvaGFtYnVyZ2VyL2hhbWJ1cmdlclwiKTtcblxudmFyIF9sb2FkVmlkZW9zID0gcmVxdWlyZShcIkBjZG8vYXBwcy91dGlsL2xvYWRWaWRlb3NcIik7XG5cbnZhciBfdXJsX3Rlc3QgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAY2RvL2FwcHMvY29kZS1zdHVkaW8vdXJsX3Rlc3RcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuLy8gUHJldmVudCBmaWx0ZXJlZCBlcnJvcnMgZnJvbSBiZWluZyBwYXNzZWQgdG8gTmV3IFJlbGljLlxuaWYgKHdpbmRvdy5uZXdyZWxpYykge1xuICB3aW5kb3cubmV3cmVsaWMuc2V0RXJyb3JIYW5kbGVyKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAvLyBSZW1vdmUgZXJyb3JzIGZyb20gdW5zdXBwb3J0ZW5ld3JlbGljbmQgSUUgdmVyc2lvbnNcbiAgICByZXR1cm4gISEoMCwgX2Jyb3dzZXJEZXRlY3Rvci5pc1Vuc3VwcG9ydGVkQnJvd3NlcikoKTtcbiAgfSk7XG59XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgaWYgKCgwLCBfYnJvd3NlckRldGVjdG9yLmlzVW5zdXBwb3J0ZWRCcm93c2VyKSgpKSB7XG4gICAgJCgnI3dhcm5pbmctYmFubmVyJykuc2hvdygpO1xuICB9XG59KTtcbigwLCBfaGFtYnVyZ2VyLmluaXRIYW1idXJnZXIpKCk7XG4kKHdpbmRvdykubG9hZChmdW5jdGlvbiAoKSB7XG4gIGlmIChkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdpbnNlcnRfdmlkZW9fcGxheWVyJykubGVuZ3RoID4gMCkge1xuICAgIHZhciB1cmxQYXJhbXMgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoO1xuICAgIHZhciBmb3JjZVBsYXllciA9IGZhbHNlO1xuXG4gICAgaWYgKHVybFBhcmFtcy5pbmRleE9mKCdmb3JjZV95b3V0dWJlX2ZhbGxiYWNrJykgIT09IC0xKSB7XG4gICAgICBmb3JjZVBsYXllciA9ICdmYWxsYmFjayc7XG4gICAgfSBlbHNlIGlmICh1cmxQYXJhbXMuaW5kZXhPZignZm9yY2VfeW91dHViZV9wbGF5ZXInKSAhPT0gLTEpIHtcbiAgICAgIGZvcmNlUGxheWVyID0gJ3lvdXR1YmUnO1xuICAgIH1cblxuICAgICgwLCBfbG9hZFZpZGVvcy5sb2FkVmlkZW9zKShmb3JjZVBsYXllcik7XG4gIH0gLy8gVGhpcyBjb2RlIHdvcmtzIGZvciBib3RoIHRoZSBjb25ncmF0c19zaGFyZSBhbmQgdGhlIG1vcmUgZ2VuZXJhbFxuICAvLyBzaGFyZV9idXR0b25zIHBhcnRpYWxzLiAgKE9ubHkgdGhlIGZvcm1lciBmZWF0dXJlcyBhIHNoYXJlLWJ1dHRvbi1jb250YWluZXIuKVxuXG5cbiAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuICAgICgwLCBfdXJsX3Rlc3RbXCJkZWZhdWx0XCJdKSgnaHR0cHM6Ly9mYWNlYm9vay5jb20vZmF2aWNvbi5pY28nICsgJz8nICsgTWF0aC5yYW5kb20oKSwgZnVuY3Rpb24gKCkge1xuICAgICAgJCgnLnNoYXJlLWJ1dHRvbi1mYWNlYm9vay1saW5rJykuc2hvdygpO1xuICAgICAgJCgnLnNoYXJlLWJ1dHRvbi1jb250YWluZXInKS5zaG93KCk7XG4gICAgfSk7XG4gICAgKDAsIF91cmxfdGVzdFtcImRlZmF1bHRcIl0pKCdodHRwczovL3R3aXR0ZXIuY29tL2Zhdmljb24uaWNvJyArICc/JyArIE1hdGgucmFuZG9tKCksIGZ1bmN0aW9uICgpIHtcbiAgICAgICQoJy5zaGFyZS1idXR0b24tdHdpdHRlci1saW5rJykuc2hvdygpO1xuICAgICAgJCgnLnNoYXJlLWJ1dHRvbi1jb250YWluZXInKS5zaG93KCk7XG4gICAgfSk7XG4gIH0pO1xufSk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmlzVW5zdXBwb3J0ZWRCcm93c2VyID0gaXNVbnN1cHBvcnRlZEJyb3dzZXI7XG5leHBvcnRzLmlzTW9iaWxlRGV2aWNlID0gaXNNb2JpbGVEZXZpY2U7XG5leHBvcnRzLmlzSUUxMSA9IGlzSUUxMTtcbmV4cG9ydHMuaXNTdG9yYWdlQXZhaWxhYmxlID0gaXNTdG9yYWdlQXZhaWxhYmxlO1xuXG4vLyBXZSBzdXBwb3J0IElFIDExK1xuZnVuY3Rpb24gaXNVbnN1cHBvcnRlZElFKCkge1xuICB2YXIgaXNJRSA9IG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignTVNJRScpICE9PSAtMTtcbiAgdmFyIElFVmVyc2lvbiA9IG5hdmlnYXRvci5hcHBWZXJzaW9uLmluZGV4T2YoJ1RyaWRlbnQvJyk7XG4gIHZhciBJRUJlbG93OCA9IGlzSUUgJiYgSUVWZXJzaW9uIDwgODtcbiAgdmFyIElFNyA9IG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goJ01TSUUgNy4wOycpO1xuICB2YXIgSUU4ID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgnTVNJRSA4LjA7Jyk7XG4gIHZhciBJRTkgPSBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKCdNU0lFIDkuMDsnKTtcbiAgdmFyIElFMTAgPSBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKCdNU0lFIDEwLjA7Jyk7XG4gIHZhciB1bnN1cHBvcnRlZCA9IElFQmVsb3c4IHx8IElFNyB8fCBJRTggfHwgSUU5IHx8IElFMTA7XG4gIHJldHVybiB1bnN1cHBvcnRlZDtcbn0gLy8gV2Ugc3VwcG9ydCBDaHJvbWUgMzMueCArXG5cblxuZnVuY3Rpb24gaXNVbnN1cHBvcnRlZENocm9tZSgpIHtcbiAgdmFyIGlzQ2hyb21lID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5sYXN0SW5kZXhPZignQ2hyb21lLycpICE9PSAtMTtcbiAgdmFyIGNocm9tZVZlcnNpb24gPSBuYXZpZ2F0b3IudXNlckFnZW50LnN1YnN0cihuYXZpZ2F0b3IudXNlckFnZW50Lmxhc3RJbmRleE9mKCdDaHJvbWUvJykgKyA3LCAyKTtcbiAgdmFyIHVuc3VwcG9ydGVkID0gaXNDaHJvbWUgJiYgY2hyb21lVmVyc2lvbiA8IDMzO1xuICByZXR1cm4gdW5zdXBwb3J0ZWQ7XG59IC8vIFdlIHN1cHBvcnQgU2FmYXJpIDcuMC54ICtcblxuXG5mdW5jdGlvbiBpc1Vuc3VwcG9ydGVkU2FmYXJpKCkge1xuICB2YXIgaXNTYWZhcmkgPSBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ1NhZmFyaS8nKSAhPT0gLTE7XG4gIHZhciBzYWZhcmlWZXJzaW9uID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5zdWJzdHIobmF2aWdhdG9yLnVzZXJBZ2VudC5sYXN0SW5kZXhPZignVmVyc2lvbi8nKSArIDgsIDIpO1xuICB2YXIgdW5zdXBwb3J0ZWQgPSBpc1NhZmFyaSAmJiBzYWZhcmlWZXJzaW9uIDwgNztcbiAgcmV0dXJuIHVuc3VwcG9ydGVkO1xufSAvLyBXZSBzdXBwb3J0IEZpcmVmb3ggMjUueCArXG5cblxuZnVuY3Rpb24gaXNVbnN1cHBvcnRlZEZpcmVmb3goKSB7XG4gIHZhciBpc0ZpcmVmb3ggPSBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ0ZpcmVmb3gnKSAhPT0gLTE7XG4gIHZhciBmaXJlZm94VmVyc2lvbiA9IG5hdmlnYXRvci51c2VyQWdlbnQuc3Vic3RyKG5hdmlnYXRvci51c2VyQWdlbnQubGFzdEluZGV4T2YoJ0ZpcmVmb3gvJykgKyA4LCAyKTtcbiAgdmFyIHVuc3VwcG9ydGVkID0gaXNGaXJlZm94ICYmIGZpcmVmb3hWZXJzaW9uIDwgMjU7XG4gIHJldHVybiB1bnN1cHBvcnRlZDtcbn0gLy8gaHR0cHM6Ly9zdXBwb3J0LmNvZGUub3JnL2hjL2VuLXVzL2FydGljbGVzLzIwMjU5MTc0M1xuLy8gZm9yIHRoZSBmdWxsIGxpc3Qgb2Ygc3VwcG9ydGVkIGJyb3dzZXJzXG5cblxuZnVuY3Rpb24gaXNVbnN1cHBvcnRlZEJyb3dzZXIoKSB7XG4gIHZhciBpc1Vuc3VwcG9ydGVkID0gZmFsc2U7XG4gIGlzVW5zdXBwb3J0ZWQgPSBpc1Vuc3VwcG9ydGVkSUUoKSB8fCBpc1Vuc3VwcG9ydGVkQ2hyb21lKCkgfHwgaXNVbnN1cHBvcnRlZFNhZmFyaSgpIHx8IGlzVW5zdXBwb3J0ZWRGaXJlZm94KCk7XG4gIHJldHVybiBpc1Vuc3VwcG9ydGVkO1xufSAvLyBEZXRlY3QgYSBtb2JpbGUgZGV2aWNlLlxuXG5cbmZ1bmN0aW9uIGlzTW9iaWxlRGV2aWNlKCkge1xuICAvLyBBZGFwdGVkIGZyb20gaHR0cDovL2RldGVjdG1vYmlsZWJyb3dzZXJzLmNvbS8gd2l0aCB0aGUgYWRkaXRpb24gb2YgfGFuZHJvaWR8aXBhZHxwbGF5Ym9va3xzaWxrIGFzXG4gIC8vIGl0IHN1Z2dlc3RzIGF0IGh0dHA6Ly9kZXRlY3Rtb2JpbGVicm93c2Vycy5jb20vYWJvdXRcbiAgLy8gTm90ZSB0aGF0IHRoZXJlIGFyZSB0d28gcmVndWxhciBleHByZXNzaW9ucyBpbiB0aGUgYmxvYi4gIFRoZSBmaXJzdCB0ZXN0cyBhZ2FpbnN0IHZhcmlhYmxlIGEgKHRoZSBlbnRpcmVcbiAgLy8gdXNlciBhZ2VudCkgd2hpbGUgdGhlIHNlY29uZCB0ZXN0cyBhZ2FpbnN0IGp1c3QgdGhlIGZpcnN0IGZvdXIgY2hhcmFjdGVycyBpbiBpdC5cbiAgdmFyIGNoZWNrID0gZmFsc2U7XG5cbiAgKGZ1bmN0aW9uIChhKSB7XG4gICAgaWYgKC8oYW5kcm9pZHxiYlxcZCt8bWVlZ28pLittb2JpbGV8YXZhbnRnb3xiYWRhXFwvfGJsYWNrYmVycnl8YmxhemVyfGNvbXBhbHxlbGFpbmV8ZmVubmVjfGhpcHRvcHxpZW1vYmlsZXxpcChob25lfG9kKXxpcmlzfGtpbmRsZXxsZ2UgfG1hZW1vfG1pZHB8bW1wfG1vYmlsZS4rZmlyZWZveHxuZXRmcm9udHxvcGVyYSBtKG9ifGluKWl8cGFsbSggb3MpP3xwaG9uZXxwKGl4aXxyZSlcXC98cGx1Y2tlcnxwb2NrZXR8cHNwfHNlcmllcyg0fDYpMHxzeW1iaWFufHRyZW98dXBcXC4oYnJvd3NlcnxsaW5rKXx2b2RhZm9uZXx3YXB8d2luZG93cyAoY2V8cGhvbmUpfHhkYXx4aWlub3xhbmRyb2lkfGlwYWR8cGxheWJvb2t8c2lsay9pLnRlc3QoYSkgfHwgLzEyMDd8NjMxMHw2NTkwfDNnc298NHRocHw1MFsxLTZdaXw3NzBzfDgwMnN8YSB3YXxhYmFjfGFjKGVyfG9vfHNcXC0pfGFpKGtvfHJuKXxhbChhdnxjYXxjbyl8YW1vaXxhbihleHxueXx5dyl8YXB0dXxhcihjaHxnbyl8YXModGV8dXMpfGF0dHd8YXUoZGl8XFwtbXxyIHxzICl8YXZhbnxiZShja3xsbHxucSl8YmkobGJ8cmQpfGJsKGFjfGF6KXxicihlfHYpd3xidW1ifGJ3XFwtKG58dSl8YzU1XFwvfGNhcGl8Y2N3YXxjZG1cXC18Y2VsbHxjaHRtfGNsZGN8Y21kXFwtfGNvKG1wfG5kKXxjcmF3fGRhKGl0fGxsfG5nKXxkYnRlfGRjXFwtc3xkZXZpfGRpY2F8ZG1vYnxkbyhjfHApb3xkcygxMnxcXC1kKXxlbCg0OXxhaSl8ZW0obDJ8dWwpfGVyKGljfGswKXxlc2w4fGV6KFs0LTddMHxvc3x3YXx6ZSl8ZmV0Y3xmbHkoXFwtfF8pfGcxIHV8ZzU2MHxnZW5lfGdmXFwtNXxnXFwtbW98Z28oXFwud3xvZCl8Z3IoYWR8dW4pfGhhaWV8aGNpdHxoZFxcLShtfHB8dCl8aGVpXFwtfGhpKHB0fHRhKXxocCggaXxpcCl8aHNcXC1jfGh0KGMoXFwtfCB8X3xhfGd8cHxzfHQpfHRwKXxodShhd3x0Yyl8aVxcLSgyMHxnb3xtYSl8aTIzMHxpYWMoIHxcXC18XFwvKXxpYnJvfGlkZWF8aWcwMXxpa29tfGltMWt8aW5ub3xpcGFxfGlyaXN8amEodHx2KWF8amJyb3xqZW11fGppZ3N8a2RkaXxrZWppfGtndCggfFxcLyl8a2xvbnxrcHQgfGt3Y1xcLXxreW8oY3xrKXxsZShub3x4aSl8bGcoIGd8XFwvKGt8bHx1KXw1MHw1NHxcXC1bYS13XSl8bGlid3xseW54fG0xXFwtd3xtM2dhfG01MFxcL3xtYSh0ZXx1aXx4byl8bWMoMDF8MjF8Y2EpfG1cXC1jcnxtZShyY3xyaSl8bWkobzh8b2F8dHMpfG1tZWZ8bW8oMDF8MDJ8Yml8ZGV8ZG98dChcXC18IHxvfHYpfHp6KXxtdCg1MHxwMXx2ICl8bXdicHxteXdhfG4xMFswLTJdfG4yMFsyLTNdfG4zMCgwfDIpfG41MCgwfDJ8NSl8bjcoMCgwfDEpfDEwKXxuZSgoY3xtKVxcLXxvbnx0Znx3Znx3Z3x3dCl8bm9rKDZ8aSl8bnpwaHxvMmltfG9wKHRpfHd2KXxvcmFufG93ZzF8cDgwMHxwYW4oYXxkfHQpfHBkeGd8cGcoMTN8XFwtKFsxLThdfGMpKXxwaGlsfHBpcmV8cGwoYXl8dWMpfHBuXFwtMnxwbyhja3xydHxzZSl8cHJveHxwc2lvfHB0XFwtZ3xxYVxcLWF8cWMoMDd8MTJ8MjF8MzJ8NjB8XFwtWzItN118aVxcLSl8cXRla3xyMzgwfHI2MDB8cmFrc3xyaW05fHJvKHZlfHpvKXxzNTVcXC98c2EoZ2V8bWF8bW18bXN8bnl8dmEpfHNjKDAxfGhcXC18b298cFxcLSl8c2RrXFwvfHNlKGMoXFwtfDB8MSl8NDd8bWN8bmR8cmkpfHNnaFxcLXxzaGFyfHNpZShcXC18bSl8c2tcXC0wfHNsKDQ1fGlkKXxzbShhbHxhcnxiM3xpdHx0NSl8c28oZnR8bnkpfHNwKDAxfGhcXC18dlxcLXx2ICl8c3koMDF8bWIpfHQyKDE4fDUwKXx0NigwMHwxMHwxOCl8dGEoZ3R8bGspfHRjbFxcLXx0ZGdcXC18dGVsKGl8bSl8dGltXFwtfHRcXC1tb3x0byhwbHxzaCl8dHMoNzB8bVxcLXxtM3xtNSl8dHhcXC05fHVwKFxcLmJ8ZzF8c2kpfHV0c3R8djQwMHx2NzUwfHZlcml8dmkocmd8dGUpfHZrKDQwfDVbMC0zXXxcXC12KXx2bTQwfHZvZGF8dnVsY3x2eCg1Mnw1M3w2MHw2MXw3MHw4MHw4MXw4M3w4NXw5OCl8dzNjKFxcLXwgKXx3ZWJjfHdoaXR8d2koZyB8bmN8bncpfHdtbGJ8d29udXx4NzAwfHlhc1xcLXx5b3VyfHpldG98enRlXFwtL2kudGVzdChhLnN1YnN0cigwLCA0KSkpIHtcbiAgICAgIGNoZWNrID0gdHJ1ZTtcbiAgICB9XG4gIH0pKG5hdmlnYXRvci51c2VyQWdlbnQgfHwgbmF2aWdhdG9yLnZlbmRvciB8fCB3aW5kb3cub3BlcmEpO1xuXG4gIHJldHVybiBjaGVjaztcbn0gLy8gRGV0ZWN0IElFMTEuICBBZGFwdGVkIGZyb21cbi8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjE4MjUxNTcvaW50ZXJuZXQtZXhwbG9yZXItMTEtZGV0ZWN0aW9uLzIxODI1MjA3IzIxODI1MjA3XG5cblxuZnVuY3Rpb24gaXNJRTExKCkge1xuICB2YXIgaXNJRTExID0gISF3aW5kb3cuTVNJbnB1dE1ldGhvZENvbnRleHQgJiYgISFkb2N1bWVudC5kb2N1bWVudE1vZGU7XG4gIHJldHVybiBpc0lFMTE7XG59IC8vIERldGVybWluZSB3aGV0aGVyIGxvY2FsIHN0b3JhZ2UgaXMgYXZhaWxhYmxlLiAgT24gbWFjT1MgU2FmYXJpIFByaXZhdGUgTW9kZSBpdCB3b24ndCBiZS5cbi8vIEFkYXB0ZWQgZnJvbSBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9wYXVsaXJpc2gvNTU1ODU1NyNnaXN0Y29tbWVudC0xNzU1MDk5XG5cblxuZnVuY3Rpb24gaXNTdG9yYWdlQXZhaWxhYmxlKHR5cGUpIHtcbiAgdHJ5IHtcbiAgICB2YXIgc3RvcmFnZSA9IHdpbmRvd1t0eXBlXSxcbiAgICAgICAgeCA9ICdfX3N0b3JhZ2VfdGVzdF9fJztcbiAgICBzdG9yYWdlLnNldEl0ZW0oeCwgeCk7XG4gICAgc3RvcmFnZS5yZW1vdmVJdGVtKHgpO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmxvYWRWaWRlb3MgPSBsb2FkVmlkZW9zO1xuXG52YXIgX3VybF90ZXN0ID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi4vY29kZS1zdHVkaW8vdXJsX3Rlc3RcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuLy8gZm9yY2VQbGF5ZXIgY2FuIGJlIFwieW91dHViZVwiLCBcImZhbGxiYWNrXCIsIG9yIGZhbHNlIGlmIHdlIGp1c3Qgd2FudCB0b1xuLy8gZGV0ZWN0IHRoZSBhcHByb3ByaWF0ZSBwbGF5ZXIuXG5mdW5jdGlvbiBsb2FkVmlkZW9zKGZvcmNlUGxheWVyKSB7XG4gIGlmIChmb3JjZVBsYXllcikge1xuICAgIHNldHVwVmlkZW9zKGZvcmNlUGxheWVyKTtcbiAgfSBlbHNlIHtcbiAgICAoMCwgX3VybF90ZXN0W1wiZGVmYXVsdFwiXSkoJ2h0dHBzOi8vd3d3LnlvdXR1YmUtbm9jb29raWUuY29tL2Zhdmljb24uaWNvPycgKyBNYXRoLnJhbmRvbSgpLCBmdW5jdGlvbiAoKSB7XG4gICAgICBzZXR1cFZpZGVvcygneW91dHViZScpO1xuICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgIHNldHVwVmlkZW9zKCdmYWxsYmFjaycpO1xuICAgIH0pO1xuICB9XG59IC8vIFNldCB1cCBhcHByb3ByaWF0ZSB2aWRlbyBwbGF5ZXJzIGJ5IGluc2VydGluZyB0aGVtIGludG8gdGhlIERPTSBhbG9uZ3NpZGUgYWxsIGl0ZW1zIHdpdGhcbi8vIGNsYXNzIFwiaW5zZXJ0X3ZpZGVvX3BsYXllclwiLlxuLy8gU3VjaCBpbnNlcnRpb24gcG9pbnRzIGhhdmUgdHdvIGF0dHJpYnV0ZXM6XG4vLyAgIGRhdGEtdmlkZW9fY29kZSB3aXRoIHRoZSB5b3V0dWJlIElELCBhbmRcbi8vICAgZGF0YS1kb3dubG9hZF9wYXRoIHdpdGggYSBmdWxsIFVSTCB0byBhbiBtcDQgdmlkZW8uXG4vLyBQYXJhbWV0ZXIgcGxheWVyIGlzIGVpdGhlciBcInlvdXR1YmVcIiBvciBcImZhbGxiYWNrXCIuXG5cblxuZnVuY3Rpb24gc2V0dXBWaWRlb3MocGxheWVyKSB7XG4gIGlmIChwbGF5ZXIgPT09ICdmYWxsYmFjaycpIHtcbiAgICB2YXIgZG9jID0gZG9jdW1lbnQ7XG4gICAgdmFyIHZpZGVvX2NzcyA9IGRvYy5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG4gICAgdmFyIHZpZGVvID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgIHZpZGVvX2Nzcy50eXBlID0gJ3RleHQvY3NzJztcbiAgICB2aWRlb19jc3MuaHJlZiA9ICcvY3NzL3ZpZGVvLWpzLm1pbi5jc3MnO1xuICAgIHZpZGVvX2Nzcy5yZWwgPSAnc3R5bGVzaGVldCc7XG4gICAgZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQodmlkZW9fY3NzKTtcbiAgICB2aWRlby50eXBlID0gJ3RleHQvamF2YXNjcmlwdCc7XG4gICAgdmlkZW8uc3JjID0gJy9qcy92aWRlby5taW4uanMnO1xuICAgIGRvYy5ib2R5LmFwcGVuZENoaWxkKHZpZGVvKTtcbiAgfVxuXG4gICQoJy5pbnNlcnRfdmlkZW9fcGxheWVyJykuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGRvd25sb2FkUGF0aCA9ICQodGhpcykuZGF0YSgnZG93bmxvYWQtcGF0aCcpOyAvLyBVc2UgZmFsbGJhY2sgcGxheWVyIGlmIHRoYXQncyB0aGUgcHJlZmVyZW5jZS5cbiAgICAvLyBJdCByZXF1aXJlcyBhIGRvd25sb2FkUGF0aCwgYW5kIGl0IGRvZXNuJ3Qgc2VlbSB0byB3b3JrIG9uIElFOCBiZWNhdXNlXG4gICAgLy8gaXQgcmVsaWVzIHVwb24gYSBtaXNzaW5nIGFkZEV2ZW50TGlzdGVuZXIuXG5cbiAgICBpZiAocGxheWVyID09PSAnZmFsbGJhY2snICYmIGRvd25sb2FkUGF0aCAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgJCh0aGlzKS5wYXJlbnQoKS5hcHBlbmQoJzx2aWRlbyAnICsgJ3N0eWxlPVwicG9zaXRpb246YWJzb2x1dGU7IHRvcDogMDsgbGVmdDogMDsgd2lkdGg6IDEwMCU7IGhlaWdodDogMTAwJVwiICcgKyAnd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiICcgKyAnY2xhc3M9XCJ2aWRlby1qcyBsYXp5bG9hZCB2anMtYmlnLXBsYXktY2VudGVyZWRcIiAnICsgJ3ByZWxvYWQ9XCJub25lXCIgJyArICdkYXRhLXNldHVwPVxcJ3tcIm5hdGl2ZUNvbnRyb2xzRm9yVG91Y2hcIjogdHJ1ZX1cXCcgJyArICdjb250cm9scz4nICsgJyAgPHNvdXJjZSBzcmM9XCInICsgZG93bmxvYWRQYXRoICsgJ1wiIHR5cGU9XCJ2aWRlby9tcDRcIi8+JyArICc8L3ZpZGVvPicpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBBbHdheXMgZGVmYXVsdCB0byBZb3VUdWJlIHBsYXllci5cbiAgICAgICQodGhpcykucGFyZW50KCkuYXBwZW5kKCc8aWZyYW1lIGNsYXNzPVwibGF6eWxvYWRcIiAnICsgJ3N0eWxlPVwicG9zaXRpb246YWJzb2x1dGU7IHRvcDogMDsgbGVmdDogMDsgd2lkdGg6IDEwMCU7IGhlaWdodDogMTAwJVwiICcgKyBcImRhdGEtc3JjPVxcXCJodHRwczovL3d3dy55b3V0dWJlLW5vY29va2llLmNvbS9lbWJlZC9cIi5jb25jYXQoJCh0aGlzKS5kYXRhKCd2aWRlby1jb2RlJyksIFwiP2l2X2xvYWRfcG9saWN5PTMmcmVsPTAmYXV0b2hpZGU9MSZzaG93aW5mbz0wJmVuYWJsZWpzYXBpPTFcXFwiIFwiKSArICdmcmFtZWJvcmRlcj1cIjBcIiAnICsgJ2FsbG93ZnVsbHNjcmVlbj10cnVlJyArIFwiPlwiKTtcbiAgICB9XG4gIH0pO1xufSIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB0cmFja0V2ZW50O1xuXG4vKiBnbG9iYWwgd2luZG93ICovXG5cbi8qKlxuICogUmVwb3J0IGFuIGV2ZW50IHRvIEdvb2dsZSBBbmFseXRpY3MuXG4gKiB0cmFja0V2ZW50IGlzIHByb3ZpZGVkIGJ5IF9hbmFseXRpY3MuaHRtbC5oYW1sIGluIG1vc3QgY2FzZXMuXG4gKiBJbiB0aG9zZSB3aGVyZSBpdCBpc24ndCwgd2Ugd2FudCB0aGlzIGNhbGwgdG8gYmUgYSBzaW1wbGUgbm8tb3AuXG4gKi9cbmZ1bmN0aW9uIHRyYWNrRXZlbnQoKSB7XG4gIHZhciBfd2luZG93O1xuXG4gIGlmIChJTl9VTklUX1RFU1QgfHwgSU5fU1RPUllCT09LKSB7XG4gICAgLy8gV2Ugc2hvdWxkIHNpbGVudGx5IG5vLW9wIGluIHRlc3RzLCBidXQgaW4gb3RoZXIgcGxhY2VzIHdlIGFjdHVhbGx5XG4gICAgLy8gd2FudCB0aGlzIGNhbGwgdG8gZmFpbCBpZiB3aW5kb3cudHJhY2tFdmVudCBpcyBub3QgYXZhaWxhYmxlLlxuICAgIHJldHVybjtcbiAgfVxuXG4gIChfd2luZG93ID0gd2luZG93KS50cmFja0V2ZW50LmFwcGx5KF93aW5kb3csIGFyZ3VtZW50cyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1tcImRlZmF1bHRcIl07Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7OztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUMzSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNwckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNoSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDNWNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0EiLCJzb3VyY2VSb290IjoiIn0=
;
