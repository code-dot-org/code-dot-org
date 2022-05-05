import React from 'react';
import ReactDOM from 'react-dom';
import AlertExclamation from '../components/AlertExclamation';
import msg from '@cdo/locale';

export function NotFoundAlert() {
  return (
    <AlertExclamation>
      <div className="exclamation-abuse">
        <p style={styles.text}>{msg.projectNotFound()}</p>
        <p style={styles.text}>
          <a href="https://studio.code.org">{msg.goToCodeStudio()}</a>
        </p>
      </div>
    </AlertExclamation>
  );
}

/**
 * Renders our AbuseExclamation component, and potentially updates admin box
 * @param {project.js} project
 * @param {string} tosText
 */
export default (project, tosText) => {
  ReactDOM.render(<NotFoundAlert />, document.getElementById('codeApp'));
};

const styles = {
  text: {
    fontSize: 18,
    lineHeight: '24px',
    padding: 5
  }
};
