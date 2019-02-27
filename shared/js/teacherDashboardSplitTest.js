var $ = window.jQuery;
var script = document.querySelector("script[data-splittest]");
var scriptData = JSON.parse(script.dataset.splittest);
var splitTestPercentage = scriptData.percentage;
var studioUrlPrefix = scriptData.studioUrlPrefix;

var STORAGE_KEY = "teacher-dashboard-experiment";
var ExperimentState = {
  on: "on",
  off: "off"
};

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
  var experimentState = localStorage.getItem(STORAGE_KEY);

  // No-op if experiment is already off for this user or the entire experiment is off.
  if (experimentState === ExperimentState.off || splitTestPercentage === 0) {
    return;
  }

  // Our current path should look something like: #/sections/:sectionId/:path
  // where /:path is optional.
  var currentPath = window.location.href;
  var sectionId = (currentPath.match(/sections\/(\d+)/) || [])[1];
  var path = (currentPath.match(/sections\/\d+\/(\S+)/) || [])[1];

  // Go to new teacher dashboard if experiment is already on for this user.
  if (experimentState === ExperimentState.on) {
    redirectToStudioTeacherDashboard(sectionId, path, false);
  }

  // Otherwise, set experiment state for this user using splitTestPercentage.
  var turnOnExperiment = Math.floor(Math.random() * 100) <= splitTestPercentage;
  if (turnOnExperiment) {
    localStorage.setItem(STORAGE_KEY, ExperimentState.on);
    redirectToStudioTeacherDashboard(sectionId, path, true);
  } else {
    localStorage.setItem(STORAGE_KEY, ExperimentState.off);
  }
});

function redirectToStudioTeacherDashboard(sectionId, path, enableExperiment) {
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
  if (enableExperiment) {
    studioTeacherDashboardUrl += "?enableExperiments=teacher-dashboard-react";
  }

  window.location = studioTeacherDashboardUrl;
}
