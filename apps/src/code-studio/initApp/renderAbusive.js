import React from 'react';
import ReactDOM from 'react-dom';

import msg from '@cdo/locale';

import AbuseExclamation from '../components/AbuseExclamation';
import showProjectAdmin from '../showProjectAdmin';

/**
 * Renders our AbuseExclamation component, and potentially updates admin box
 * @param {project.js} project
 * @param {string} tosText
 */
export default (project, tosText) => {
  ReactDOM.render(
    React.createElement(AbuseExclamation, {
      i18n: {
        tos: tosText,
        contact_us: msg.contactUs({
          url: `https://support.code.org/hc/en-us/requests/new?&description=${encodeURIComponent(
            `Abuse error for project at url: ${project.getShareUrl()}`
          )}`,
        }),
        edit_project: msg.editProject(),
        go_to_code_studio: msg.goToCodeStudio(),
      },
      isOwner: project.isOwner(),
    }),
    document.getElementById('codeApp')
  );

  // update admin box (if it exists) with abuse info
  showProjectAdmin(project);
};
