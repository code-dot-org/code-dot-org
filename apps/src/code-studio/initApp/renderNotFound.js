import React from 'react';
import ReactDOM from 'react-dom';
import AlertExclamation from '../components/AlertExclamation';
import showProjectAdmin from '../showProjectAdmin';
import msg from '@cdo/locale';

/**
 * Renders our AbuseExclamation component, and potentially updates admin box
 * @param {project.js} project
 * @param {string} tosText
 */
export default (project, tosText) => {
  ReactDOM.render(
    <AlertExclamation>
      <div>
        <p style={styles.text} className="exclamation-abuse">
          {msg.projectNotFound()}
        </p>
        <p style={styles.text} className="exclamation-abuse">
          <a href="https://studio.code.org">{msg.goToCodeStudio()}</a>
        </p>
      </div>
    </AlertExclamation>,
    document.getElementById('codeApp')
  );

  // update admin box (if it exists) with abuse info
  showProjectAdmin(project);
};

const styles = {
  text: {
    fontSize: 18,
    lineHeight: '24px',
    padding: 5
  }
};
