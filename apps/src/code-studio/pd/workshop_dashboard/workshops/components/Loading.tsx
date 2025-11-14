import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React, {FC} from 'react';

import styles from './Loading.module.scss';

export const Loading: FC = () => {
  return (
    <div className={styles.loading}>
      <Typography variant="body2">Loading...</Typography>
      <FontAwesomeV6Icon iconName="spinner" animationType="spin" />
    </div>
  );
};
