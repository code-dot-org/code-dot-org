import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {TooltipProps} from '@code-dot-org/component-library/tooltip';
import {Tooltip} from '@mui/material';
import React from 'react';

interface WithConditionalTooltipProps {
  children: React.ReactNode;
  tooltipOverlayClassName?: string;
  tooltipProps: TooltipProps;
  showTooltip: boolean;
}

const DIRECTION_TO_PLACEMENT = {
  onTop: 'top',
  onRight: 'right',
  onBottom: 'bottom',
  onLeft: 'left',
} as const;

// Component that wraps children with a tooltip is showTooltip is true,
// otherwise it just renders the children wrapped in a div.
// The wrapper div is what carries the hover handlers, so the tooltip still
// appears for disabled children, which get no pointer events of their own.
const WithConditionalTooltip: React.FunctionComponent<
  WithConditionalTooltipProps
> = ({children, tooltipOverlayClassName, tooltipProps, showTooltip}) => {
  if (!showTooltip) {
    return <div className={tooltipOverlayClassName}>{children}</div>;
  }

  const {text, direction, hideTail, iconLeft, iconRight} = tooltipProps;
  const dataTheme = tooltipProps['data-theme'];

  const title =
    iconLeft || iconRight ? (
      <>
        {iconLeft && <FontAwesomeV6Icon {...iconLeft} />}
        {text}
        {iconRight && <FontAwesomeV6Icon {...iconRight} />}
      </>
    ) : (
      text
    );

  return (
    <Tooltip
      title={title}
      placement={direction ? DIRECTION_TO_PLACEMENT[direction] : 'top'}
      arrow={hideTail ? false : undefined}
      slotProps={dataTheme ? {tooltip: {'data-theme': dataTheme}} : undefined}
    >
      <div className={tooltipOverlayClassName}>{children}</div>
    </Tooltip>
  );
};

export default WithConditionalTooltip;
