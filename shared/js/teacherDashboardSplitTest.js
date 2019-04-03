var $ = window.jQuery;
var script = document.querySelector("script[data-splittest]");
var scriptData = JSON.parse(script.dataset.splittest);
var studioUrlPrefix = scriptData.studioUrlPrefix;

/**
 * Maps any paths that *do not* match between pegasus and dashboard teacher dashboards.
 * The key should be the path (prefaced with a forward slash) in pegasus, and the value
 * should be the corresponding path in dashboard.
 */
var urlMap = {
  "/print_signin_cards": "/login_info",
  "/manage": "/manage_students"
};

$(document).ready(function() {
  // No-op if user is already on Code Studio teacher dashboard.
  if (window.location.origin === studioUrlPrefix) {
    return;
  }

  // Our current path should look something like: #/sections/:sectionId/:path
  // where /:path is optional.
  var currentPath = window.location.href;
  var sectionId = (currentPath.match(/sections\/(\d+)/) || [])[1];
  var path = (currentPath.match(/sections\/\d+\/(\S+)/) || [])[1];

  // Redirect all users to Code Studio teacher dashboard.
  redirectToStudioTeacherDashboard(sectionId, path);
});

function redirectToStudioTeacherDashboard(sectionId, path) {
  // No-op if sectionId is not provided.
  if (!sectionId) {
    return;
  }

  var studioTeacherDashboardUrl =
    studioUrlPrefix + "/teacher_dashboard/sections/" + sectionId;
  if (path) {
    // Prepend a forward slash to our path, unless it already has one.
    if (path.at(0) !== "/") {
      path = "/" + path;
    }
    studioTeacherDashboardUrl += urlMap[path] || path;
  }

  window.location = studioTeacherDashboardUrl;
}
