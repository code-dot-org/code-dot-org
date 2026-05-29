import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  TooltipProps,
  WithTooltip,
} from '@code-dot-org/component-library/tooltip';
import classNames from 'classnames';
import React from 'react';

import styles from './info-tooltip-icon.module.scss';

interface InfoTooltipIconProps {
  id: string;
  tooltipText: string;
  direction?: TooltipProps['direction'];
}

const InfoTooltipIcon: React.FunctionComponent<InfoTooltipIconProps> = ({
  id,
  tooltipText,
  direction,
}) => {
  return (
    <WithTooltip
      tooltipProps={{
        text: tooltipText,
        size: 's',
        tooltipId: `${id}-tooltip`,
        direction,
        className: classNames(
          styles.tooltip,
          direction && styles[`tooltip-${direction}`]
        ),
      }}
    >
      <button type="button" className={styles.iconButton}>
        <FontAwesomeV6Icon iconName={'info-circle'} className={styles.icon} />
      </button>
    </WithTooltip>
  );
};

export default InfoTooltipIcon;
