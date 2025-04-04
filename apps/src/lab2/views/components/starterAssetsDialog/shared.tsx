import Alert from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React from 'react';

import styles from './starter-assets-dialog.module.scss';

const ErrorAlert: React.FC = () => (
  <div className={styles.alertContainer}>
    <Alert
      text="Something went wrong. Please try again!"
      type="danger"
      size="xs"
      className={styles.alert}
    />
  </div>
);

const Loading: React.FC = () => (
  <div className={styles.loading}>
    <FontAwesomeV6Icon iconName="spinner" animationType="spin" />
  </div>
);

export {ErrorAlert, Loading};
