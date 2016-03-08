/* global dashboard */

/**
 * Dynamic generation and event bindings for project admin section of the admin box
 */

 dashboard.admin = (function (dashboard) {
  function showProjectAdmin() {
    if ($('.project_admin') === 0) {
      return;
    }

    if (dashboard.project.isProjectLevel()) {
      if (dashboard.project.isFrozen()) {
        $('.project_admin').html($('<span>&#x2744; Frozen! To use as an example, copy this id: <input type="text" disabled value="' +
                                   dashboard.project.getCurrentId() +
                                   '"/></span>'));
      } else {
        $('.project_admin').html($('<button id="freeze" class="btn btn-default btn-sm">Freeze for use as an exemplar &#x2744;</button>'));
        $('#freeze').click(function() {
          dashboard.project.freeze(function() {
            window.location.reload();
          });
        });
      }
    }

    var abuseScore = dashboard.project.getAbuseScore();
    if (abuseScore) {
      $('.admin-abuse').show();
      $('.admin-abuse-score').text(abuseScore);
      $('.admin-abuse-reset').click(function () {
        dashboard.project.adminResetAbuseScore();
      });
    }
  }

  return {
    showProjectAdmin: showProjectAdmin
  };
})(window.dashboard);
