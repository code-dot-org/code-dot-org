import {Tooltip, type TooltipProps as MuiTooltipProps} from '@mui/material';
import type {FunctionComponent, ReactNode} from 'react';

interface WithConditionalTooltipProps {
  children: ReactNode;
  tooltipOverlayClassName?: string;
  tooltipProps: Omit<MuiTooltipProps, 'children'>;
  showTooltip: boolean;
}

// The wrapping div carries the hover handlers, so the tooltip still shows
// for a disabled child.
const WithConditionalTooltip: FunctionComponent<
  WithConditionalTooltipProps
> = ({children, tooltipOverlayClassName, tooltipProps, showTooltip}) => {
  if (!showTooltip) {
    return <div className={tooltipOverlayClassName}>{children}</div>;
  }

  return (
    <Tooltip placement="top" {...tooltipProps}>
      {/* The control inside is disabled, so this wrapper is the only way
          for a keyboard user to reach the reason. */}
      <div className={tooltipOverlayClassName} tabIndex={0}>
        {children}
      </div>
    </Tooltip>
  );
};

export default WithConditionalTooltip;
