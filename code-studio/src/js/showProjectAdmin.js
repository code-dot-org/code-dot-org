/* global dashboard ReactDOM */

import $ from 'jquery';

/**
 * Dynamic generation and event bindings for project admin section of the admin box
 */
module.exports = function showProjectAdmin() {
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
      $('#freeze').click(function () {
        dashboard.project.freeze(function () {
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

  var StyleGuide = window.StyleGuide;
  if (StyleGuide) {
    $('.project_admin').append('<div class="style-guide"/></div>');
    var styleGuideRoot = $('.project_admin .style-guide')[0];
    ReactDOM.render(<StyleGuide />, styleGuideRoot);
  }
};
