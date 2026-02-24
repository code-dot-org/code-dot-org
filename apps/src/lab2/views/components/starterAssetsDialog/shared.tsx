import Alert from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React from 'react';

import styles from './starter-assets-dialog.module.scss';

const DialogAlert: React.FC<{message: string; type: 'danger' | 'warning'}> = ({
  message,
  type,
}) => (
  <div className={styles.alertContainer}>
    <Alert text={message} type={type} size="xs" className={styles.alert} />
  </div>
);

const Loading: React.FC = () => (
  <div className={styles.loading}>
    <FontAwesomeV6Icon iconName="spinner" animationType="spin" />
  </div>
);

export {DialogAlert, Loading};
