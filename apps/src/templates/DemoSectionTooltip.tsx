import {Tooltip} from '@mui/material';
import React from 'react';

import styles from './DemoSectionTooltip.module.scss';

// Static strings by design: the i18n pipeline no longer accepts new keys;
// user-facing copy lives in code.
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

// Wraps a control that is disabled for demo sections so hovering explains
// why. The span anchor receives the hover/focus events Tooltip attaches,
// because disabled buttons do not fire them.
const DemoSectionTooltip: React.FC<DemoSectionTooltipProps> = ({
  isDemoSection = false,
  tooltipId,
  text = DEMO_SECTION_DISABLED_MESSAGE,
  children,
}) =>
  isDemoSection ? (
    <Tooltip id={tooltipId} title={text} placement="top">
      <span className={styles.anchor}>{children}</span>
    </Tooltip>
  ) : (
    <>{children}</>
  );

export default DemoSectionTooltip;
