var $ = window.jQuery;
var script = document.querySelector("script[data-splittest]");
var scriptData = JSON.parse(script.dataset.splittest);
var splitTestPercentage = scriptData.percentage;
var studioUrlPrefix = scriptData.studioUrlPrefix;
var pegasusUrlPrefix = scriptData.pegasusUrlPrefix;

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
  // Our current path should look something like: #/sections/:sectionId/:path
  // where /:path is optional.
  var currentPath = window.location.href;
  var sectionId = (currentPath.match(/sections\/(\d+)/) || [])[1];
  var path = (currentPath.match(/sections\/\d+\/(\S+)/) || [])[1];

  if (window.location.origin === studioUrlPrefix) {
    handleDashboard(sectionId, path);
  }

  if (window.location.origin === pegasusUrlPrefix) {
    handlePegasus(sectionId, path);
  }
});

function handleDashboard(sectionId, path) {
  // Redirect user to pegasus teacher dashboard if split test is off.
  if (splitTestPercentage === 0) {
    redirectToPegasusTeacherDashboard(sectionId, path);
  }
}

function redirectToPegasusTeacherDashboard(sectionId, path) {
  // No-op if sectionId is not provided.
  if (!sectionId) {
    return;
  }

  var pegasusTeacherDashboardUrl =
    pegasusUrlPrefix + "/teacher-dashboard#/sections/" + sectionId;
  if (path) {
    // Prepend a forward slash to our path, unless it already has one.
    if (path.at(0) !== "/") {
      path = "/" + path;
    }

    var mappedPath = null;
    Object.keys(urlMap).forEach(function(key) {
      if (urlMap[key] === path) {
        mappedPath = key;
      }
    });
    pegasusTeacherDashboardUrl += mappedPath || path;
  }

  window.location = pegasusTeacherDashboardUrl;
}

function handlePegasus(sectionId, path) {
  var experimentState = localStorage.getItem(STORAGE_KEY);

  // No-op if experiment is already off for this user or the split test is off.
  if (experimentState === ExperimentState.off || splitTestPercentage === 0) {
    return;
  }

  // Go to new teacher dashboard if experiment is already on for this user.
  if (experimentState === ExperimentState.on) {
    redirectToStudioTeacherDashboard(sectionId, path);
    return;
  }

  // Otherwise, set experiment state for this user using splitTestPercentage.
  var turnOnExperiment = Math.floor(Math.random() * 100) <= splitTestPercentage;
  if (turnOnExperiment) {
    localStorage.setItem(STORAGE_KEY, ExperimentState.on);
    redirectToStudioTeacherDashboard(sectionId, path);
  } else {
    localStorage.setItem(STORAGE_KEY, ExperimentState.off);
  }
}

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
