/* global dashboard */

import $ from 'jquery';

/**
 * Dynamic generation and event bindings for project admin section of the admin box
 */
export default () => {
  if ($('.project_admin').length) {
    if (dashboard.project.isProjectLevel()) {
      if (dashboard.project.isFrozen()) {
        $('.project_admin').html($('<span>&#x2744; Frozen! To use as an example, copy this id: <input type="text" disabled value="' +
          dashboard.project.getCurrentId() +
          '"/><div><button id="unfreeze" class="btn btn-default btn-sm">Unfreeze</button><div></span>'));
          $('#unfreeze').click(function () {
            dashboard.project.unfreeze(function () {
              window.location.reload();
            });
          });
      } else {
        $('.project_admin').html($('<button id="freeze" class="btn btn-default btn-sm">Freeze for use as an exemplar &#x2744;</button>'));
        $('#freeze').click(function () {
          dashboard.project.freeze(function () {
            window.location.reload();
          });
        });
      }
    }
  }

  if (!dashboard.project.isPublished()) {
    $('#unpublished_warning').show();
  }

  if ($('#feature_project').length && dashboard.project.isProjectLevel()) {
    $('#feature_project').click(function () {
      var url = `/featured_projects/${dashboard.project.getCurrentId()}/feature`;
      $.ajax({
        url: url,
        type:'PUT',
        dataType:'json',
        success:function (data) {
          $('#unfeature_project').show();
          $('#feature_project').hide();
        },
        error:function (data) {
          alert("Shucks. Something went wrong - this project wasn't featured.");
        }
      });
    });

    $('#unfeature_project').click(function () {
      var url = `/featured_projects/${dashboard.project.getCurrentId()}/unfeature`;
      $.ajax({
        url: url,
        type:'PUT',
        dataType:'json',
        success:function (data) {
          $('#unfeature_project').hide();
          $('#feature_project').show();
        },
        error:function (data) {
          alert("Shucks. Something went wrong - this project is still featured.");
        }
      });
    });
  }

  if ($('.admin-abuse').length && dashboard.project.isProjectLevel()) {
    var abuseScore = dashboard.project.getAbuseScore();
    if (abuseScore) {
      $('.admin-abuse').show();
      $('.admin-abuse-score').text(abuseScore);
      $('.admin-abuse-reset').click(function () {
        dashboard.project.adminResetAbuseScore();
      });
    } else {
      $('.admin-report-abuse').show();
    }
  }
};
