import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Tooltip} from '@mui/material';
import React from 'react';

import styles from './unsaved-badge.module.scss';

const UnsavedBadge: React.FunctionComponent<{label: string}> = ({label}) => (
  <Tooltip title={label}>
    <div className={styles.badge} role="img" aria-label={label}>
      <FontAwesomeV6Icon iconName="triangle-exclamation" iconStyle="solid" />
    </div>
  </Tooltip>
);

export default UnsavedBadge;
