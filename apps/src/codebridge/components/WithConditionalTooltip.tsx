import {
  TooltipProps,
  WithTooltip,
} from '@code-dot-org/component-library/tooltip';
import React from 'react';

interface WithConditionalTooltipProps {
  children: React.ReactNode;
  tooltipOverlayClassName?: string;
  tooltipProps: TooltipProps;
  showTooltip: boolean;
}

// Component that wraps children with a tooltip is showTooltip is true,
// otherwise it just renders the children wrapped in a div.
// The wrapper div is what carries the hover handlers, so the tooltip still
// appears for disabled children, which get no pointer events of their own.
const WithConditionalTooltip: React.FunctionComponent<
  WithConditionalTooltipProps
> = ({children, tooltipOverlayClassName, tooltipProps, showTooltip}) => {
  return showTooltip ? (
    <WithTooltip
      tooltipProps={tooltipProps}
      tooltipOverlayClassName={tooltipOverlayClassName}
    >
      <div>{children}</div>
    </WithTooltip>
  ) : (
    <div>{children}</div>
  );
};

export default WithConditionalTooltip;
