// TEMPORARY WORKAROUND, patching studio.code.org from the app. It is here to
// learn whether the site itself should do this; if it should, move it into
// the site and delete this file.
//
// A signed-out child's progress is only in sessionStorage, so the server's
// "next level" route (script_levels#next, behind Continue on a unit's
// overview) always answers with the first level. The app finds the first
// level not yet passed itself, as Continue does for a signed-in student.
var RESUME_PARAM = 'codeai_resume';
// TestResults.MINIMUM_PASS_RESULT in apps/src/constants.js.
var MINIMUM_PASS_RESULT = 20;
var NEXT_PATH = /^\/(?:courses\/([A-Za-z0-9_-]+)\/units\/(\d+)|s\/([A-Za-z0-9_-]+))\/next\/?$/;

// Resolves to the URL of the unit's first level not yet passed, or null
// when every level is passed or the unit cannot be read.
function firstUnpassedLevel(structure) {
  return fetch(structure, {credentials: 'same-origin'})
    .then(function (response) {
      return response.ok ? response.json() : null;
    })
    .then(function (unit) {
      if (!unit) {
        return null;
      }
      var results = {};
      try {
        results = JSON.parse(window.sessionStorage.getItem('progress') || '{}')[unit.name] || {};
      } catch (e) {
        // Malformed progress: nothing counts as passed.
      }
      var next = null;
      (unit.lessons || []).some(function (lesson) {
        return (lesson.levels || []).some(function (level) {
          var passed = (level.ids || []).some(function (id) {
            return (results[id] || 0) >= MINIMUM_PASS_RESULT;
          });
          if (level.bonus || passed || !level.url || !sameOrigin(level.url)) {
            return false;
          }
          next = level.url;
          return true;
        });
      });
      return next;
    })
    .catch(function () {
      return null;
    });
}

// The landing page opens a course that starts on a level with
// ?codeai_resume; the child goes on to the first level not yet passed.
function resumeCourse() {
  var url = new URL(window.location.href);
  if (!url.searchParams.has(RESUME_PARAM)) {
    return;
  }
  url.searchParams.delete(RESUME_PARAM);
  window.history.replaceState(window.history.state, '', url.toString());
  var page = pageCourse();
  if (!page) {
    return;
  }
  firstUnpassedLevel(page.structure).then(function (next) {
    if (next && new URL(next, window.location.href).pathname !== window.location.pathname) {
      window.location.replace(next);
    }
  });
}

resumeCourse();

// Continue on a unit's overview links to the server's next-level route.
document.addEventListener(
  'click',
  function (event) {
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link || event.defaultPrevented) {
      return;
    }
    var url = new URL(link.href, window.location.href);
    var match = url.origin === window.location.origin && url.pathname.match(NEXT_PATH);
    if (!match) {
      return;
    }
    event.preventDefault();
    var structure = match[1]
      ? '/api/script_structure/courses/' + match[1] + '/units/' + match[2]
      : '/api/script_structure/' + match[3];
    firstUnpassedLevel(structure).then(function (next) {
      // Every level passed: the server's route knows where a finished
      // unit goes.
      window.location.assign(next || url.toString());
    });
  },
  true,
);
