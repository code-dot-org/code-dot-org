/* global dashboard */
import React from 'react';
import ReactDOM from 'react-dom';
var AbuseExclamation = require('../components/abuse_exclamation');
var showProjectAdmin = require('../showProjectAdmin');

/**
 * Renders our AbuseExclamation component, and potentially updates admin box
 */
module.exports = function () {
  ReactDOM.render(React.createElement(AbuseExclamation, {
    i18n: {
      // TODO(bcjordan): i18n
      tos: 'This project contains information that cannot be shared with others. Please contact the app owner to fix the contents of their app.',
      contact_us: window.dashboard.i18n.t('project.abuse.contact_us'),
      edit_project: window.dashboard.i18n.t('project.edit_project'),
      go_to_code_studio: window.dashboard.i18n.t('project.abuse.go_to_code_studio')
    },
    isOwner: dashboard.project.isOwner()
  }), document.getElementById('codeApp'));

  // update admin box (if it exists) with abuse info
  showProjectAdmin();
};
