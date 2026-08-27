import {ComponentPlacementDirection} from '@code-dot-org/component-library/common/types';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Tooltip} from '@mui/material';
import React from 'react';

import styles from './info-tooltip-icon.module.scss';

interface InfoTooltipIconProps {
  id: string;
  tooltipText: string;
  direction?: ComponentPlacementDirection;
}

// Legacy `direction` names → MUI `placement`. The legacy tooltip defaulted to
// onTop, so keep that as the fallback here.
const PLACEMENT = {
  onTop: 'top',
  onRight: 'right',
  onBottom: 'bottom',
  onLeft: 'left',
} as const;

const InfoTooltipIcon: React.FunctionComponent<InfoTooltipIconProps> = ({
  id,
  tooltipText,
  direction,
}) => {
  return (
    <Tooltip
      title={tooltipText}
      placement={direction ? PLACEMENT[direction] : 'top'}
    >
      <button
        id={id}
        type="button"
        className={styles.iconButton}
        aria-label={tooltipText}
      >
        <FontAwesomeV6Icon iconName={'info-circle'} className={styles.icon} />
      </button>
    </Tooltip>
  );
};

export default InfoTooltipIcon;
