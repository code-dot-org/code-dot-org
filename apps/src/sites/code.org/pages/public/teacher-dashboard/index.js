var script = document.querySelector('script[data-teacherdashboard]');
var scriptData = JSON.parse(script.dataset.teacherdashboard);
var studioUrlPrefix = scriptData.studio_url;

function redirectToDashboard() {
  // Our current location should look something like: #/sections/:sectionId/:path
  // where /:path is optional.
  var currentLocation = window.location.href;
  var sectionId = (currentLocation.match(/sections\/(\d+)/) || [])[1];
  var path = (currentLocation.match(/sections\/\d+\/(\S+)/) || [])[1];

  // Redirect to Code Studio root URL if no sectionId is found.
  if (!sectionId) {
    window.location = studioUrlPrefix;
    return;
  }

  var studioTeacherDashboardUrl =
    studioUrlPrefix + '/teacher_dashboard/sections/' + sectionId;
  if (path) {
    // Prepend a forward slash to our path, unless it already has one.
    if (path.at(0) !== '/') {
      path = '/' + path;
    }
    studioTeacherDashboardUrl += path;
  }

  window.location = studioTeacherDashboardUrl;
}

redirectToDashboard();
