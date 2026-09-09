import {Tooltip} from '@mui/material';
import React from 'react';

import styles from './DemoSectionTooltip.module.scss';

export const DEMO_SECTION_DISABLED_MESSAGE = 'Not available for demo sections';

interface DemoSectionTooltipProps {
  // Render the tooltip only when true; otherwise children pass through
  // unwrapped. Callers pass isDemoSection.
  isDemoSection?: boolean;
  // Must be unique per page.
  tooltipId: string;
  text?: string;
  children: React.ReactNode;
}

// The span anchor takes the hover and focus events, because a disabled
// button does not fire them.
const DemoSectionTooltip: React.FC<DemoSectionTooltipProps> = ({
  isDemoSection = false,
  tooltipId,
  text = DEMO_SECTION_DISABLED_MESSAGE,
  children,
}) =>
  isDemoSection ? (
    <Tooltip id={tooltipId} title={text} placement="top">
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- the control inside is disabled, so this wrapper is the only way to reach the reason */}
      <span className={styles.anchor} tabIndex={0}>
        {children}
      </span>
    </Tooltip>
  ) : (
    <>{children}</>
  );

export default DemoSectionTooltip;
