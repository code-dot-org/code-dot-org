import {ComponentPlacementDirection} from '@code-dot-org/component-library/common/types';
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

// Legacy direction → MUI placement ('none' and unset → top).
const DIRECTION_TO_PLACEMENT: Record<
  ComponentPlacementDirection,
  'top' | 'right' | 'bottom' | 'left'
> = {
  onTop: 'top',
  onRight: 'right',
  onBottom: 'bottom',
  onLeft: 'left',
  none: 'top',
};

// Wraps children in a tooltip when showTooltip is true. The wrapping div
// carries the hover handlers, so the tooltip still shows for disabled children.
const WithConditionalTooltip: React.FunctionComponent<
  WithConditionalTooltipProps
> = ({children, tooltipOverlayClassName, tooltipProps, showTooltip}) => {
  if (!showTooltip) {
    return <div className={tooltipOverlayClassName}>{children}</div>;
  }

  const {text, direction, hideTail, iconLeft, iconRight, tooltipId} =
    tooltipProps;
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
      id={tooltipId}
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
