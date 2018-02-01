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
          '"/></span>'));
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

  if ($('#feature_project').length && dashboard.project.isProjectLevel()) {
    var unfeatureUrl = `/featured_projects/unfeature`;
    $('#unfeature_project').click(function () {
      $.ajax({
        url: unfeatureUrl,
        type:'PUT',
        dataType:'json',
        data: {
          featured_project: {
            project_id: dashboard.project.getCurrentId(),
          }
        },
        success:function (data){
          $('#unfeature_project').hide();
          $('#feature_project').hide();
          $('#refeature_project').show();
        },
        error:function (data){
          alert("Shucks. Something went wrong - this project is still featured.");
        }
      });
    });

    $('#feature_project').click(function () {
      $.ajax({
        url:'/featured_projects',
        type:'POST',
        dataType:'json',
        data: {
          featured_project: {
            project_id: dashboard.project.getCurrentId(),
          }
        },
        success:function (data){
          $('#unfeature_project').show();
          $('#feature_project').hide();
          $('#refeature_project').hide();
        },
        error:function (data){
          alert("Shucks. Something went wrong - this project wasn't featured.");
        }
      });
    });

    $('#refeature_project').click(function () {
      var refeatureUrl = `/featured_projects/refeature`;
      $.ajax({
        url: refeatureUrl,
        type:'PUT',
        dataType:'json',
        data: {
          featured_project: {
            project_id: dashboard.project.getCurrentId(),
          }
        },
        success:function (data){
          $('#unfeature_project').show();
          $('#feature_project').hide();
          $('#refeature_project').hide();
        },
        error:function (data){
          alert("Shucks. Something went wrong - this project wasn't featured.");
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
