/* A 12px info icon that shows a tooltip on hover or keyboard focus. */
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Tooltip} from '@mui/material';
import React from 'react';

import styles from './infoButton.module.scss';

interface InfoButtonProps {
  about: string;
  tooltip: string;
  tabIndex?: number;
}

const InfoButton = ({about, tooltip, tabIndex}: InfoButtonProps) => (
  <Tooltip title={tooltip}>
    <IconButton
      variant="text"
      color="tertiary"
      size="extraSmall"
      className={styles.infoButton}
      aria-label={`About ${about}`}
      tabIndex={tabIndex}
    >
      <FontAwesomeV6Icon iconName="circle-info" iconStyle="solid" />
    </IconButton>
  </Tooltip>
);

export default InfoButton;
