import {muiPlacementFor} from '@code-dot-org/component-library/common/helpers';
import {ComponentPlacementDirection} from '@code-dot-org/component-library/common/types';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Tooltip} from '@mui/material';
import React from 'react';

import styles from './info-tooltip-icon.module.scss';

interface InfoTooltipIconProps {
  tooltipText: string;
  direction?: ComponentPlacementDirection;
}

const InfoTooltipIcon: React.FunctionComponent<InfoTooltipIconProps> = ({
  tooltipText,
  direction,
}) => {
  return (
    <Tooltip title={tooltipText} placement={muiPlacementFor(direction)}>
      {/* Short name; the tooltip text becomes the description. */}
      <button
        type="button"
        className={styles.iconButton}
        aria-label="More information"
      >
        <FontAwesomeV6Icon iconName={'info-circle'} className={styles.icon} />
      </button>
    </Tooltip>
  );
};

export default InfoTooltipIcon;
