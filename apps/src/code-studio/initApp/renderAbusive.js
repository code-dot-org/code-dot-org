import React from 'react';
import ReactDOM from 'react-dom';
import AbuseExclamation from '../components/AbuseExclamation';
import showProjectAdmin from '../showProjectAdmin';

/**
 * Renders our AbuseExclamation component, and potentially updates admin box
 * @param {project.js} project
 * @param {string} tosText
 */
export default (project, tosText) => {
  ReactDOM.render(React.createElement(AbuseExclamation, {
    i18n: {
      tos: tosText,
      contact_us: window.dashboard.i18n.t('project.abuse.contact_us'),
      edit_project: window.dashboard.i18n.t('project.edit_project'),
      go_to_code_studio: window.dashboard.i18n.t('project.abuse.go_to_code_studio')
    },
    isOwner: project.isOwner()
  }), document.getElementById('codeApp'));

  // update admin box (if it exists) with abuse info
  showProjectAdmin(project);
};
