import {Tooltip, TooltipProps as MuiTooltipProps} from '@mui/material';
import React from 'react';

interface WithConditionalTooltipProps {
  children: React.ReactNode;
  tooltipOverlayClassName?: string;
  tooltipProps: Omit<MuiTooltipProps, 'children'>;
  showTooltip: boolean;
}

// The wrapping div carries the hover handlers, so the tooltip still shows
// for a disabled child.
const WithConditionalTooltip: React.FunctionComponent<
  WithConditionalTooltipProps
> = ({children, tooltipOverlayClassName, tooltipProps, showTooltip}) => {
  if (!showTooltip) {
    return <div className={tooltipOverlayClassName}>{children}</div>;
  }

  return (
    <Tooltip placement="top" {...tooltipProps}>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- the control inside is disabled, so this wrapper is the only way to reach the reason */}
      <div className={tooltipOverlayClassName} tabIndex={0}>
        {children}
      </div>
    </Tooltip>
  );
};

export default WithConditionalTooltip;
