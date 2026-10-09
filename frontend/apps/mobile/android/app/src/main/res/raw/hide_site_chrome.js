// Runs in every studio.code.org page the app loads. PageInjector.kt puts it
// at the top of <head>, so it runs while the page is parsed and its styles
// apply before the first frame. It applies "Elements to Hide in the Wrapper";
// item numbers below refer to that document. The logo stays and returns to
// the landing page; Android Back is the app's only Back control.
//
// Site elements are hidden with CSS, not removed, because React still owns
// some of them. A MutationObserver reapplies everything when the site adds or
// replaces elements. MainActivity.kt handles the logo's /codeai-app/home
// link and never loads it; it also blocks YouTube (item 3) and the
// certificate pages (item 6), which CSS cannot reach.
//
// It also keeps signed-out progress across app restarts, zooms the page,
// loads the header's zoom controls in debug builds, tells the app when the
// page has settled, and holds Google's tag scripts until then.
(function () {
  if (window.__codeaiHideSiteChrome) {
    return;
  }
  window.__codeaiHideSiteChrome = true;

  var HOME_URL = 'https://studio.code.org/codeai-app/home';

  // MainActivity.kt keeps its loading cover up until this says the page is
  // done: loaded, no studio.code.org request open, and unchanged for a moment.
  // Many pages fetch their content and render it after the load event.
  var SETTLE_MS = 500;
  var lastChange = Date.now();
  var openRequests = 0;

  function sameOrigin(url) {
    try {
      return new URL(String(url), location.href).origin === location.origin;
    } catch (e) {
      return false;
    }
  }

  function requestDone() {
    openRequests = Math.max(0, openRequests - 1);
    lastChange = Date.now();
  }

  if (window.fetch) {
    var originalFetch = window.fetch;
    window.fetch = function (input) {
      var url = input && typeof input === 'object' && 'url' in input ? input.url : input;
      var promise = originalFetch.apply(this, arguments);
      if (sameOrigin(url)) {
        openRequests++;
        promise.then(requestDone, requestDone);
      }
      return promise;
    };
  }

  var originalOpen = XMLHttpRequest.prototype.open;
  var originalSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.__codeaiCounted = sameOrigin(url);
    return originalOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function () {
    if (this.__codeaiCounted) {
      openRequests++;
      this.addEventListener('loadend', requestDone);
    }
    return originalSend.apply(this, arguments);
  };

  window.__codeaiSettled = function () {
    return (
      document.readyState === 'complete' &&
      openRequests === 0 &&
      Date.now() - lastChange >= SETTLE_MS
    );
  };

  // Google's tag scripts start once the page has settled, when the browser is
  // idle, instead of running while the page loads and holding up its load
  // event. PageInjector.kt turns the one in the HTML into a placeholder; the
  // one the site adds later (gtm.js) is held here. What the site reports in
  // the meantime waits in window.dataLayer.
  var DEFERRED_SCRIPT_ORIGIN = 'https://www.googletagmanager.com/';
  var DEFERRED_SCRIPT_MAX_WAIT_MS = 5000;
  var heldScripts = [];
  var holdingScripts = true;
  var originalInsertBefore = Node.prototype.insertBefore;
  var originalAppendChild = Node.prototype.appendChild;

  function heldScript(node) {
    return (
      holdingScripts &&
      node &&
      node.nodeName === 'SCRIPT' &&
      typeof node.src === 'string' &&
      node.src.indexOf(DEFERRED_SCRIPT_ORIGIN) === 0
    );
  }

  Node.prototype.insertBefore = function (node) {
    if (heldScript(node)) {
      heldScripts.push(node);
      return node;
    }
    return originalInsertBefore.apply(this, arguments);
  };
  Node.prototype.appendChild = function (node) {
    if (heldScript(node)) {
      heldScripts.push(node);
      return node;
    }
    return originalAppendChild.apply(this, arguments);
  };

  function startHeldScripts() {
    holdingScripts = false;
    var scripts = Array.prototype.map.call(
      document.querySelectorAll('script[data-codeai-deferred-src]'),
      function (placeholder) {
        var script = document.createElement('script');
        script.async = true;
        script.src = placeholder.getAttribute('data-codeai-deferred-src');
        placeholder.removeAttribute('data-codeai-deferred-src');
        return script;
      },
    ).concat(heldScripts);
    heldScripts = [];
    var parent = document.head || document.documentElement;
    scripts.forEach(function (script) {
      originalAppendChild.call(parent, script);
    });
  }

  window.addEventListener('load', function () {
    var deadline = Date.now() + DEFERRED_SCRIPT_MAX_WAIT_MS;
    var wait = setInterval(function () {
      if (window.__codeaiSettled() || Date.now() >= deadline) {
        clearInterval(wait);
        if (window.requestIdleCallback) {
          requestIdleCallback(startHeldScripts, {timeout: 2000});
        } else {
          startHeldScripts();
        }
      }
    }, 250);
  });

  function cookieValue(name) {
    var match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  // Signed-out progress and level code live in sessionStorage, which the
  // WebView forgets when the app's process ends; a copy in localStorage
  // restores it after a restart. A reset (MainActivity.kt) deletes the copy
  // and changes the codeai_reset cookie; a page that sees a new value starts
  // with empty sessionStorage too, since the WebView's copy outlives the reset.
  var SESSION_COPY_KEY = 'codeai_session';
  var RESET_KEY = 'codeai_reset';
  var storageMethods = Storage.prototype;
  var originalSetItem = storageMethods.setItem;
  var originalRemoveItem = storageMethods.removeItem;
  var originalClear = storageMethods.clear;
  var copyPending = false;

  function copySession() {
    copyPending = false;
    try {
      var session = window.sessionStorage;
      var copy = {};
      for (var i = 0; i < session.length; i++) {
        var key = session.key(i);
        copy[key] = session.getItem(key);
      }
      originalSetItem.call(window.localStorage, SESSION_COPY_KEY, JSON.stringify(copy));
    } catch (e) {
      // Storage full or unavailable: progress lasts until the app closes.
    }
  }

  function scheduleCopy(storage) {
    if (storage === window.sessionStorage && !copyPending) {
      copyPending = true;
      Promise.resolve().then(copySession);
    }
  }

  try {
    var session = window.sessionStorage;
    if (session.length === 0) {
      var saved = JSON.parse(window.localStorage.getItem(SESSION_COPY_KEY) || '{}');
      Object.keys(saved).forEach(function (key) {
        originalSetItem.call(session, key, saved[key]);
      });
    }
    var resetMark = cookieValue('codeai_reset') || '';
    if (session.getItem(RESET_KEY) !== resetMark) {
      originalClear.call(session);
      originalSetItem.call(session, RESET_KEY, resetMark);
    }
    storageMethods.setItem = function () {
      originalSetItem.apply(this, arguments);
      scheduleCopy(this);
    };
    storageMethods.removeItem = function () {
      originalRemoveItem.apply(this, arguments);
      scheduleCopy(this);
    };
    storageMethods.clear = function () {
      originalClear.apply(this, arguments);
      scheduleCopy(this);
    };
    // Catches writes that bypass setItem, such as sessionStorage.key = value.
    window.addEventListener('pagehide', copySession);
    copySession();
  } catch (e) {
    // Storage unavailable: the site runs as in a browser.
  }

  // Page zoom as a browser does it: the layout narrows and everything is
  // drawn larger, so the page reflows and taps land where they look. The
  // viewport carries it, which the WebView honors in wide-viewport mode
  // (MainActivity.kt). The old labs rewrite their viewport when they start,
  // so it is reapplied on every change. The level, a percentage, is in the
  // codeai_zoom cookie. Debug builds of the app let it change: there,
  // window.codeaiZoom is the header controls' interface. MainActivity.kt
  // defines codeaiDebugBuild before this script.
  var DEBUG_BUILD = window.codeaiDebugBuild === true;
  var ZOOM_LEVELS = [50, 67, 75, 80, 90, 100, 110, 125, 150, 175, 200];
  var ZOOM_COOKIE = 'codeai_zoom';

  // Read once per page: apply() asks on every change to the page, and reading
  // document.cookie that often cost a level load about 0.3s on a Fire HD 8.
  var zoom = null;

  function zoomLevel() {
    if (!DEBUG_BUILD) {
      return 100;
    }
    if (zoom === null) {
      var level = Number(cookieValue(ZOOM_COOKIE));
      zoom = ZOOM_LEVELS.indexOf(level) >= 0 ? level : 100;
    }
    return zoom;
  }

  function viewportContent() {
    var scale = zoomLevel() / 100;
    // outerWidth is the WebView's width, whatever the page's scale.
    var width = Math.round((window.outerWidth || screen.width) / scale);
    return (
      'width=' + width + ', initial-scale=' + scale + ', minimum-scale=' + scale +
      ', maximum-scale=' + scale + ', user-scalable=no, viewport-fit=cover'
    );
  }

  function applyZoom() {
    var metas = document.querySelectorAll('meta[name="viewport"]');
    if (metas.length === 0) {
      var meta = document.createElement('meta');
      meta.name = 'viewport';
      (document.head || document.documentElement).appendChild(meta);
      metas = [meta];
    }
    var content = viewportContent();
    for (var i = 0; i < metas.length; i++) {
      if (metas[i].getAttribute('content') !== content) {
        metas[i].setAttribute('content', content);
      }
    }
  }

  if (DEBUG_BUILD) {
    window.codeaiZoom = {
      levels: ZOOM_LEVELS.slice(),
      level: zoomLevel,
      setLevel: function (level) {
        if (ZOOM_LEVELS.indexOf(level) < 0) {
          return;
        }
        document.cookie =
          ZOOM_COOKIE + '=' + level + '; path=/; max-age=315569520; secure; samesite=lax';
        zoom = level;
        applyZoom();
      },
    };
  }
  applyZoom();
  window.addEventListener('resize', applyZoom);

  // English only for now. Rails renders in the locale of ?lang=, else of the
  // language_ cookie, and saves ?lang= in the cookie; the site's own scripts
  // can change the cookie too. MainActivity.kt and PageInjector.kt set it
  // before each page. If a page still finds the cookie is not en-US, a ?lang=
  // other than English, or itself rendered in another language, it sets the
  // cookie and reloads without ?lang=. Two tries per tab, so a cookie that
  // will not stick cannot loop the page.
  var LOCALE = 'en-US';
  var LOCALE_COOKIE =
    'language_=' + LOCALE + '; domain=.code.org; path=/; max-age=315569520; secure; samesite=lax';
  var LOCALE_RELOADS_KEY = 'codeai_locale_reloads';

  function localeCookie() {
    return cookieValue('language_');
  }

  function isEnglish(tag) {
    return !tag || /^en(-|$)/i.test(tag);
  }

  function enforceLocale() {
    try {
      var url = new URL(location.href);
      if (
        localeCookie() === LOCALE &&
        isEnglish(url.searchParams.get('lang')) &&
        isEnglish(document.documentElement.lang)
      ) {
        sessionStorage.removeItem(LOCALE_RELOADS_KEY);
        return;
      }
      document.cookie = LOCALE_COOKIE;
      var reloads = Number(sessionStorage.getItem(LOCALE_RELOADS_KEY) || 0);
      if (localeCookie() !== LOCALE || reloads >= 2) {
        return;
      }
      sessionStorage.setItem(LOCALE_RELOADS_KEY, String(reloads + 1));
      url.searchParams.delete('lang');
      location.replace(url.toString());
    } catch (e) {
      // Cookies or storage unavailable: leave the page as the site rendered it.
    }
  }

  enforceLocale();
  // Pages restored from the back-forward cache do not run this script again.
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      enforceLocale();
    }
  });
  var STYLE_ID = 'codeai-app-style';
  // The header's zoom controls, in debug builds: a bundle the app serves
  // from its own origin, built from entrypoints/siteControls.tsx.
  var CONTROLS_URL = 'https://localhost/site-controls';
  var CONTROLS_ID = 'codeai-site-controls-script';
  var REMOVED_ID = 'localize-widget';

  // Removed from the layout.
  var HIDDEN = [
    // 1. Site links in the header.
    '.headerlinks',
    // 2. Footers and their language dropdown.
    'footer.footer',
    '#page-small-footer',
    '.small-footer-base',
    '#localeForm',
    // 3. With YouTube blocked, video levels use Code.org's fallback player,
    // whose caption link only suggests switching back to YouTube.
    '#fallback-player-caption-dialog-link',
    // 4. Download Video link.
    'a.download-video',
    'a[href$=".mp4"]',
    // 5. Project sharing in the dialog after the last level.
    '.sharing-content',
    // 8. "Need help?" videos and hints beside the lab.
    '#reference_area',
    // Cookie banner and translation widget: the app is English only, and
    // both can lead out of the app.
    '#gdpr-dialog',
    '#onetrust-consent-sdk',
    '#localize-widget',
  ];

  // Invisible and untappable but still laid out, so the lesson navigation
  // stays where it is on the site. Descendants are listed too because a child
  // may set visibility: visible and show through.
  var INVISIBLE = [
    // 1. New project, account or sign-in, help and the menu.
    '.create_menu',
    '#sign_in_or_user',
    '#help-button',
    '#hamburger',
    // 9. Share, Remix and "I finished!" in the header.
    '.project_share',
    '.project_remix',
    '.header_finished',
  ];

  // Rules for a single level, keyed by path.
  var LEVEL_RULES = [
    // 10. Finish button, which leads to sharing.
    {
      path: /^\/courses\/dance-ai-2023\/units\/1\/lessons\/1\/levels\/10\/?$/,
      hidden: ['#finishButton'],
    },
  ];

  // 7. "Provide your age": answered as under 13, the Kids+ audience, which is
  // what the dialog itself stores for that answer, along with turning on its
  // song filter. Nothing leaves the device. The separate 13+ sign-in dialog
  // (anon_over13) is left alone: it gates content for older users.
  try {
    if (sessionStorage.getItem('ad_anon_over13') === null) {
      sessionStorage.setItem('ad_anon_over13', 'false');
      sessionStorage.setItem('song_filter_on', 'true');
    }
  } catch (e) {
    // Storage can be unavailable; the dialog then shows as on the site.
  }

  LEVEL_RULES.forEach(function (rule) {
    if (rule.path.test(location.pathname)) {
      HIDDEN = HIDDEN.concat(rule.hidden);
    }
  });

  // The :not(#id) prefix adds one ID of specificity, so site rules such as
  // "#hamburger.show-small-desktop { display: flex !important }" lose.
  function selectorList(selectors) {
    return selectors
      .map(function (selector) {
        return 'html:not(#codeai-app) ' + selector;
      })
      .join(', ');
  }

  var CSS =
    selectorList(HIDDEN) +
    ' { display: none !important; } ' +
    selectorList(
      INVISIBLE.concat(
        INVISIBLE.map(function (selector) {
          return selector + ' *';
        }),
      ),
    ) +
    ' { visibility: hidden !important; pointer-events: none !important; }' +
    // The header controls sit over the right of this, in the space the
    // invisible items keep.
    selectorList(['.header_right']) +
    ' { position: relative; }';

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    (document.head || document.documentElement).appendChild(style);
  }

  // 1. The logo returns to the landing page.
  function ensureLogoLink() {
    var logo = document.getElementById('logo_home_link');
    if (logo && logo.getAttribute('href') !== HOME_URL) {
      logo.setAttribute('href', HOME_URL);
      logo.removeAttribute('target');
    }
  }

  function removeWidgets() {
    var widget = document.getElementById(REMOVED_ID);
    if (widget) {
      widget.parentNode.removeChild(widget);
    }
    // Shown on WebViews the site does not support, including Fire OS 8's
    // Chromium 124. It covers the header and links out of the app. The banner
    // holds other warnings too, so it is hidden only while it carries this one.
    var unsupported = document.getElementById('unsupported-browser');
    if (unsupported) {
      var banner = unsupported.closest('#warning-banner') || unsupported;
      banner.style.setProperty('display', 'none', 'important');
    }
  }

  function ensureControls() {
    var head = document.head;
    if (!DEBUG_BUILD || !head || document.getElementById(CONTROLS_ID)) {
      return;
    }
    var style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = CONTROLS_URL + '.css';
    var script = document.createElement('script');
    script.id = CONTROLS_ID;
    script.src = CONTROLS_URL + '.js';
    script.async = true;
    head.appendChild(style);
    head.appendChild(script);
  }

  // Runs on every DOM change, so each step is a lookup or a no-op.
  function apply() {
    ensureStyle();
    ensureLogoLink();
    removeWidgets();
    applyZoom();
    ensureControls();
  }

  // English only for now, whatever the device language. Client-side
  // translators such as Localize read these, and this script runs before them.
  Object.defineProperty(Navigator.prototype, 'language', {
    configurable: true,
    get: function () {
      return 'en-US';
    },
  });
  Object.defineProperty(Navigator.prototype, 'languages', {
    configurable: true,
    get: function () {
      return ['en-US', 'en'];
    },
  });

  // The site's code calls these, which WebViews before Chromium 103 lack;
  // without Object.hasOwn, Music Lab and Dance Party fail to load. Each is
  // defined only where missing, with the standard behavior.
  function polyfill(target, name, value) {
    if (!(name in target)) {
      Object.defineProperty(target, name, {
        configurable: true,
        writable: true,
        value: value,
      });
    }
  }
  polyfill(Object, 'hasOwn', function (object, key) {
    return Object.prototype.hasOwnProperty.call(Object(object), key);
  });
  function at(index) {
    var length = this.length;
    var i = Math.trunc(index) || 0;
    i = i < 0 ? length + i : i;
    return i < 0 || i >= length ? undefined : this[i];
  }
  [Array.prototype, String.prototype].forEach(function (proto) {
    polyfill(proto, 'at', at);
  });
  if (typeof Int8Array !== 'undefined') {
    polyfill(Object.getPrototypeOf(Int8Array.prototype), 'at', at);
  }
  polyfill(Array.prototype, 'findLast', function (predicate, thisArg) {
    for (var i = this.length - 1; i >= 0; i--) {
      if (predicate.call(thisArg, this[i], i, this)) {
        return this[i];
      }
    }
    return undefined;
  });
  polyfill(Array.prototype, 'findLastIndex', function (predicate, thisArg) {
    for (var i = this.length - 1; i >= 0; i--) {
      if (predicate.call(thisArg, this[i], i, this)) {
        return i;
      }
    }
    return -1;
  });
  if (typeof AbortSignal !== 'undefined') {
    polyfill(AbortSignal, 'timeout', function (ms) {
      var controller = new AbortController();
      setTimeout(function () {
        controller.abort(new DOMException('signal timed out', 'TimeoutError'));
      }, ms);
      return controller.signal;
    });
  }

  // Android's WebView has no speechSynthesis, and the Lab2 labs (Music Lab,
  // Music Lab: Jam Session and others) read it at load and fail without it.
  // This stand-in lets them load; read-aloud is silent until the app bridges
  // to Android's text-to-speech.
  if (!('speechSynthesis' in window)) {
    var noop = function () {};
    window.speechSynthesis = {
      speaking: false,
      pending: false,
      paused: false,
      onvoiceschanged: null,
      speak: noop,
      cancel: noop,
      pause: noop,
      resume: noop,
      getVoices: function () {
        return [];
      },
      addEventListener: noop,
      removeEventListener: noop,
    };
    window.SpeechSynthesisUtterance = function (text) {
      this.text = text || '';
      this.lang = 'en-US';
      this.rate = 1;
      this.pitch = 1;
      this.volume = 1;
      this.voice = null;
    };
  }

  // Labs such as AI for Oceans advance on a tap anywhere on the page, which
  // would swallow a tap on the logo. This script runs before the site's, so
  // these window listeners run first and keep logo taps from the lab; the
  // link's own navigation still happens.
  ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'click']
    .forEach(function (type) {
      window.addEventListener(
        type,
        function (event) {
          var target = event.target;
          if (target && target.closest && target.closest('#logo_home_link')) {
            event.stopImmediatePropagation();
          }
        },
        true,
      );
    });

  apply();
  // Attribute changes are watched for the viewport's content only.
  new MutationObserver(function () {
    lastChange = Date.now();
    apply();
  }).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['content'],
  });
})();
