// The app's page script runs in every studio.code.org page the app loads.
// PageScript.kt adds it as a document-start script, so it runs before the
// site's own scripts and its styles apply before the first frame; a WebView
// without those gets it when the page first shows. PageScript.kt joins the page_*.js and workaround_*.js files,
// in its order, into one function, so they share one scope: this file holds
// what several of them use. PageScript.kt also defines codeaiDebugBuild and
// codeaiResetToken before them.

var DEBUG_BUILD = window.codeaiDebugBuild === true;

function sameOrigin(url) {
  try {
    return new URL(String(url), location.href).origin === location.origin;
  } catch (e) {
    return false;
  }
}

function cookieValue(name) {
  var match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// The course a course page belongs to, as the launcher's courseOf names it,
// the first level Reset course reopens and where the unit's levels are
// listed; null elsewhere, such as on /projects/ pages.
function pageCourse() {
  var path = window.location.pathname;
  var match = path.match(/^\/courses\/([A-Za-z0-9_-]+)\/units\/(\d+)/);
  if (match) {
    return {
      course: match[1],
      start: `/courses/${match[1]}/units/${match[2]}/lessons/1/levels/1`,
      structure: `/api/script_structure/courses/${match[1]}/units/${match[2]}`,
    };
  }
  match = path.match(/^\/s\/([A-Za-z0-9_-]+)/);
  if (match) {
    return {
      course: match[1],
      start: `/s/${match[1]}/lessons/1/levels/1`,
      structure: `/api/script_structure/${match[1]}`,
    };
  }
  // A course of its own levels, such as /flappy/1.
  match = path.match(/^\/(?!projects\/)([A-Za-z0-9_-]+)\/\d+\/?$/);
  if (match) {
    return {
      course: match[1],
      start: `/${match[1]}/1`,
      structure: `/api/script_structure/${match[1]}`,
    };
  }
  return null;
}

// Run once when the script starts and again on every change to the page
// (page_watch.js), so each is a lookup or a no-op.
var pageChangeHandlers = [];

function onPageChange(handler) {
  pageChangeHandlers.push(handler);
}

function pageChanged() {
  pageChangeHandlers.forEach(function (handler) {
    handler();
  });
}
