import React from 'react';
import ReactDOM from 'react-dom';

import msg from '@cdo/locale';

import AlertExclamation from '../components/AlertExclamation';

export function ProjectNotFoundAlert() {
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

export default () => {
  ReactDOM.render(<ProjectNotFoundAlert />, document.getElementById('codeApp'));
};

const styles = {
  text: {
    fontSize: 18,
    lineHeight: '24px',
    padding: 5,
  },
};
