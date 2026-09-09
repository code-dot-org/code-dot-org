import {muiPlacementFor} from '@code-dot-org/component-library/common/helpers';
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

// The wrapping div carries the hover handlers, so the tooltip still shows
// for a disabled child.
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
      placement={muiPlacementFor(direction)}
      arrow={hideTail ? false : undefined}
      slotProps={dataTheme ? {tooltip: {'data-theme': dataTheme}} : undefined}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- the control inside is disabled, so this wrapper is the only way to reach the reason */}
      <div className={tooltipOverlayClassName} tabIndex={0}>
        {children}
      </div>
    </Tooltip>
  );
};

export default WithConditionalTooltip;
