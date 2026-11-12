// Applies "Elements to Hide in the Wrapper"; item numbers below refer to that
// document. The logo stays and returns to the landing page; Android Back is
// the app's only Back control.
//
// Site elements are hidden with CSS, not removed, because React still owns
// some of them; the rules are reapplied when the site adds or replaces
// elements. MainActivity.kt handles the logo's /codeai-app/home link and
// never loads it; AppWebViewClient.kt also blocks YouTube (item 3) and the
// certificate pages (item 6), which CSS cannot reach.

var HOME_URL = 'https://studio.code.org/codeai-app/home';
var STYLE_ID = 'codeai-app-style';
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
  // "You are not signed in" callout on a course's levels: the app has no
  // sign-in, and its links lead to sign-in and sign-up.
  '.signin_callout_wrapper',
  // Links off studio.code.org, such as Get help: Amazon Kids+ allows no
  // links out of the app, so MainActivity.kt ignores them and they would
  // do nothing. Relative links stay on the site; other schemes, such as
  // mailto:, are left as they are.
  'a[href^="http"]:not([href^="https://studio.code.org/"]):not([href^="http://studio.code.org/"])',
  'a[href^="//"]:not([href^="//studio.code.org/"])',
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
      return `html:not(#codeai-app) ${selector}`;
    })
    .join(', ');
}

// Debug builds can show what HIDDEN and INVISIBLE take away: the class on
// <html> switches those rules off and outlines what they would hide.
var SHOWING_HIDDEN_CLASS = 'codeai-show-hidden';
var SHOWING_HIDDEN_KEY = 'codeai_show_hidden';

function hidingSelectorList(selectors) {
  return selectorList(
    selectors.map(function (selector) {
      return `:not(.${SHOWING_HIDDEN_CLASS}) ${selector}`;
    }),
  ).replace(/html:not\(#codeai-app\) :not/g, 'html:not(#codeai-app):not');
}

function showingHidden() {
  return document.documentElement.classList.contains(SHOWING_HIDDEN_CLASS);
}

if (DEBUG_BUILD) {
  try {
    if (window.localStorage.getItem(SHOWING_HIDDEN_KEY) === '1') {
      document.documentElement.classList.add(SHOWING_HIDDEN_CLASS);
    }
  } catch (e) {
    // Storage unavailable: the page starts with them hidden.
  }
}

var INVISIBLE_AND_CONTENTS = INVISIBLE.concat(
  INVISIBLE.map(function (selector) {
    return `${selector} *`;
  }),
);
// removeWidgets() hides the unsupported-browser warning itself; the
// sign-in callout's wrapper has no size, so its popover is outlined.
var OUTLINED_SELECTORS = HIDDEN.concat(INVISIBLE, [
  '#unsupported-browser',
  '.signin_callout_wrapper > * > *',
]).map(function (selector) {
  return `html.${SHOWING_HIDDEN_CLASS} ${selector}`;
});

var CSS = `
  ${hidingSelectorList(HIDDEN)} { display: none !important; }
  ${hidingSelectorList(INVISIBLE_AND_CONTENTS)} {
    visibility: hidden !important; pointer-events: none !important;
  }
  ${OUTLINED_SELECTORS.join(', ')} {
    outline: 2px dashed #e5007e !important; outline-offset: -2px;
  }
`;

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
  var showing = showingHidden();
  var widget = document.getElementById(REMOVED_ID);
  if (widget && !showing) {
    widget.parentNode.removeChild(widget);
  }
  // Shown on WebViews the site does not support, including Fire OS 8's
  // Chromium 124. It covers the header and links out of the app. The banner
  // holds other warnings too, so it is hidden only while it carries this one.
  // A debug build showing hidden elements puts it below the header instead,
  // so the header's own items show.
  var unsupported = document.getElementById('unsupported-browser');
  if (unsupported) {
    var banner = unsupported.closest('#warning-banner') || unsupported;
    var header = document.querySelector('.header-wrapper');
    if (showing) {
      banner.style.removeProperty('display');
      if (header) {
        banner.style.setProperty('top', `${header.offsetHeight}px`);
      }
    } else {
      banner.style.setProperty('display', 'none', 'important');
      banner.style.removeProperty('top');
    }
  }
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

onPageChange(ensureStyle);
onPageChange(ensureLogoLink);
onPageChange(removeWidgets);
