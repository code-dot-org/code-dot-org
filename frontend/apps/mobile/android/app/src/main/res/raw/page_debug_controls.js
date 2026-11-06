// Header controls in debug builds: Reset course, Show hidden elements, and
// zoom out and zoom in.

// The header's controls, and the floating button that hides the hidden
// elements again.
var CONTROLS_ID = 'codeai-site-controls';
var HIDE_AGAIN_ID = 'codeai-hide-again';
var DEBUG_STYLE_ID = 'codeai-debug-style';

// Laid over the right of .header_right, in the space its invisible sign-in
// and menu keep, and drawn like the site's own header buttons (.header_button:
// Rename, Share, Remix). The page has the CodeAI tokens and Font Awesome.
var CONTROLS_CSS =
  ' #' + CONTROLS_ID + ' {' +
  ' position: absolute; top: 50%; right: var(--spacing-p-xs);' +
  ' display: flex; align-items: center; gap: var(--spacing-p-xxs);' +
  ' transform: translateY(-50%); }' +
  ' #' + CONTROLS_ID + ' span {' +
  ' color: var(--text-neutral-white-fixed); font-size: var(--font-size-body-sm);' +
  ' font-variant-numeric: tabular-nums; }' +
  ' #' + CONTROLS_ID + ' span[hidden] { display: none; }' +
  ' #' + CONTROLS_ID + ' button {' +
  ' height: 2rem; padding: 0 var(--spacing-p-xs); margin: 0;' +
  ' border: 1px solid var(--borders-neutral-white-fixed);' +
  ' border-radius: var(--shape-md); background-color: transparent;' +
  ' color: var(--text-neutral-white-fixed); font-size: var(--font-size-body-sm);' +
  ' line-height: 1; cursor: pointer; }' +
  // While hidden elements show, the header's own items take this space back:
  // the controls step aside, and one floating button hides the elements
  // again and brings the controls back.
  ' html.' +
  SHOWING_HIDDEN_CLASS +
  ' #' +
  CONTROLS_ID +
  ' { display: none; }' +
  ' #' +
  HIDE_AGAIN_ID +
  ' { display: none; position: fixed; right: var(--spacing-p-xs);' +
  ' bottom: var(--spacing-p-xs); z-index: 2147483647; width: 3rem; height: 3rem;' +
  ' align-items: center; justify-content: center; padding: 0; margin: 0;' +
  ' border: 2px solid var(--borders-neutral-white-fixed); border-radius: 50%;' +
  ' background-color: var(--background-brand-purple-primary-fixed);' +
  ' color: var(--text-neutral-white-fixed); font-size: 1.25rem; cursor: pointer;' +
  ' box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4); }' +
  ' html.' +
  SHOWING_HIDDEN_CLASS +
  ' #' +
  HIDE_AGAIN_ID +
  ' { display: flex; }' +
  ' #' + CONTROLS_ID + ' button:hover { background-color: var(--neutral-white-alpha-20); }' +
  ' #' + CONTROLS_ID + ' button:active { background-color: var(--neutral-white-alpha-30); }' +
  ' #' + CONTROLS_ID + ' button:focus-visible {' +
  ' outline: 1px solid var(--borders-neutral-white-fixed); outline-offset: 2px; }' +
  ' #' + CONTROLS_ID + ' button:disabled {' +
  ' background-color: transparent; opacity: 0.5; cursor: default; }' +
  // The header controls sit over the right of this, in the space the
  // invisible items keep.
  selectorList(['.header_right']) +
  ' { position: relative; }';

function ensureDebugStyle() {
  if (document.getElementById(DEBUG_STYLE_ID)) {
    return;
  }
  var style = document.createElement('style');
  style.id = DEBUG_STYLE_ID;
  style.textContent = CONTROLS_CSS;
  (document.head || document.documentElement).appendChild(style);
}

var controls = null;

// Shows, or hides again, what the app hides on site pages; the choice lasts
// across pages. The translation widget, removed rather than hidden, comes
// back on the next page.
function setShowingHidden(showing) {
  document.documentElement.classList.toggle(SHOWING_HIDDEN_CLASS, showing);
  try {
    if (showing) {
      window.localStorage.setItem(SHOWING_HIDDEN_KEY, '1');
    } else {
      window.localStorage.removeItem(SHOWING_HIDDEN_KEY);
    }
  } catch (e) {
    // Storage unavailable: the choice lasts until the page changes.
  }
  pageChanged();
}

function showHiddenButton() {
  var button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('data-show-hidden', '');
  button.setAttribute('aria-label', 'Show hidden elements');
  button.title = 'Show hidden elements';
  button.innerHTML = '<i class="fa-solid fa-eye" aria-hidden="true"></i>';
  button.addEventListener('click', function () {
    setShowingHidden(true);
  });
  return button;
}

var hideAgainButton = null;

// The one control while hidden elements show, floating over the page.
function ensureHideAgainButton() {
  if (hideAgainButton === null) {
    hideAgainButton = document.createElement('button');
    hideAgainButton.id = HIDE_AGAIN_ID;
    hideAgainButton.type = 'button';
    hideAgainButton.setAttribute('aria-label', 'Hide elements again');
    hideAgainButton.title = 'Hide elements again';
    hideAgainButton.innerHTML = '<i class="fa-solid fa-eye-slash" aria-hidden="true"></i>';
    hideAgainButton.addEventListener('click', function () {
      setShowingHidden(false);
    });
  }
  if (document.body && hideAgainButton.parentElement !== document.body) {
    document.body.appendChild(hideAgainButton);
  }
}

// Forgets this course's progress and reopens its first level, as Try
// again on the landing page does; MainActivity.kt handles the link, and
// honors it only with the token it gave this script.
function resetCourseButton(page) {
  var button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('data-reset', '');
  button.setAttribute('aria-label', 'Reset course');
  button.title = 'Reset course';
  button.innerHTML = '<i class="fa-solid fa-eraser" aria-hidden="true"></i>';
  button.addEventListener('click', function () {
    window.location.href =
      window.location.origin +
      '/codeai-app/reset?course=' +
      encodeURIComponent(page.course) +
      '&next=' +
      encodeURIComponent(window.location.origin + page.start) +
      '&token=' +
      encodeURIComponent(window.codeaiResetToken);
  });
  return button;
}

function zoomButton(label, icon, step) {
  var button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('data-zoom', '');
  button.setAttribute('data-label', label);
  button.innerHTML = '<i class="fa-solid fa-' + icon + '" aria-hidden="true"></i>';
  button.addEventListener('click', function () {
    // From the page's level, which another page may have changed since.
    setZoomLevel(ZOOM_LEVELS[ZOOM_LEVELS.indexOf(zoomLevel()) + step]);
    refreshControls();
  });
  return button;
}

function refreshControls() {
  var index = ZOOM_LEVELS.indexOf(zoomLevel());
  var level = controls.querySelector('span');
  level.textContent = zoomLevel() + '%';
  level.hidden = zoomLevel() === 100;
  var buttons = controls.querySelectorAll('button[data-zoom]');
  for (var i = 0; i < buttons.length; i++) {
    var label = buttons[i].getAttribute('data-label') + ' (' + zoomLevel() + '%)';
    buttons[i].setAttribute('aria-label', label);
    buttons[i].title = label;
  }
  buttons[0].disabled = index <= 0;
  buttons[1].disabled = index >= ZOOM_LEVELS.length - 1;
}

// The site may render or replace its header after this runs.
function ensureControls() {
  if (controls === null) {
    controls = document.createElement('div');
    controls.id = CONTROLS_ID;
    // The level between the buttons, shown only when it is not 100%; the
    // buttons' labels say it to screen readers.
    var level = document.createElement('span');
    level.setAttribute('aria-hidden', 'true');
    var page = pageCourse();
    if (page) {
      controls.appendChild(resetCourseButton(page));
    }
    controls.appendChild(showHiddenButton());
    controls.appendChild(zoomButton('Zoom out', 'magnifying-glass-minus', -1));
    controls.appendChild(level);
    controls.appendChild(zoomButton('Zoom in', 'magnifying-glass-plus', 1));
    refreshControls();
  }
  var headerRight = document.querySelector('.header_right');
  if (headerRight && controls.parentElement !== headerRight) {
    headerRight.appendChild(controls);
    alignControls();
  }
  ensureHideAgainButton();
}

// The controls' right gap matches the logo's left one. The site pads the
// header's two sides differently, so both are measured, not assumed.
function alignControls() {
  var logo = document.getElementById('logo_home_link');
  var headerRight = controls && controls.parentElement;
  if (!logo || !headerRight) {
    return;
  }
  var rightInset =
    document.documentElement.clientWidth - headerRight.getBoundingClientRect().right;
  var inset = logo.getBoundingClientRect().left - rightInset;
  controls.style.right = Math.max(0, inset) + 'px';
}

window.addEventListener('resize', function () {
  if (DEBUG_BUILD) {
    alignControls();
  }
});

if (DEBUG_BUILD) {
  onPageChange(ensureDebugStyle);
  onPageChange(ensureControls);
}
