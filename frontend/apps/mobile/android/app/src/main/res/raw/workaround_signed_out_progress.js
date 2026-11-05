// TEMPORARY WORKAROUND, patching studio.code.org from the app. It is here to
// learn whether the site itself should do this; if it should, move it into
// the site and delete this file.
//
// Signed-out progress and level code live in sessionStorage, which the
// WebView forgets when the app's process ends; a copy in localStorage
// restores it after a restart.
var SESSION_COPY_KEY = 'codeai_session';
// Try again resets one course: MainActivity.kt names it in this cookie.
var RESET_COURSE_COOKIE = 'codeai_reset_course';
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

// Forgets a course's signed-out progress where clientState.js keeps it:
// results per level under "progress", code per level under
// "source_<course>_<level>", and, for the server's choice of the next level,
// the progress cookie of ClientState (dashboard/lib/client_state.rb). Both
// hold a map from course to level results.
function resetCourse(session, course) {
  try {
    var progress = JSON.parse(session.getItem('progress') || '{}');
    if (progress && progress[course]) {
      delete progress[course];
      originalSetItem.call(session, 'progress', JSON.stringify(progress));
    }
  } catch (e) {
    // Malformed progress: clientState.js ignores it too.
  }
  var prefix = 'source_' + course + '_';
  for (var i = session.length - 1; i >= 0; i--) {
    var key = session.key(i);
    if (key !== null && key.indexOf(prefix) === 0) {
      originalRemoveItem.call(session, key);
    }
  }
  // The cookie is rewritten with the attributes Rails gave it, which only
  // the Cookie Store API reports.
  if (window.cookieStore) {
    window.cookieStore
      .get('progress')
      .then(function (cookie) {
        if (!cookie) {
          return;
        }
        var levels = JSON.parse(decodeURIComponent(cookie.value.replace(/\+/g, ' ')));
        if (!levels || !levels[course]) {
          return;
        }
        delete levels[course];
        return window.cookieStore.set({
          name: cookie.name,
          value: encodeURIComponent(JSON.stringify(levels)),
          domain: cookie.domain,
          path: cookie.path,
          sameSite: cookie.sameSite,
          expires: cookie.expires,
        });
      })
      .catch(function () {});
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
  // Restores each saved entry the session lacks, not only into an empty one:
  // where this script runs late (AppWebViewClient.kt's injectOnCommit), the
  // site's scripts may have written first.
  var saved = JSON.parse(window.localStorage.getItem(SESSION_COPY_KEY) || '{}');
  Object.keys(saved).forEach(function (key) {
    if (session.getItem(key) === null) {
      originalSetItem.call(session, key, saved[key]);
    }
  });
  var resetCourseName = cookieValue(RESET_COURSE_COOKIE);
  if (resetCourseName) {
    resetCourse(session, resetCourseName);
    document.cookie = RESET_COURSE_COOKIE + '=; path=/; max-age=0; secure; samesite=lax';
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
