// TEMPORARY WORKAROUND, patching studio.code.org from the app. It is here to
// learn whether the site itself should do this; if it should, move it into
// the site and delete this file.
//
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
