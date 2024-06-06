import React, {AriaAttributes} from 'react';

import Tooltip, {TooltipOverlay, TooltipProps} from './Tooltip';

export interface WithTooltipProps {
  children: React.ReactElement<AriaAttributes>;
  tooltipOverlayClassName?: string;
  tooltipProps: TooltipProps;
}

const WithTooltip: React.FunctionComponent<WithTooltipProps> = ({
  children,
  tooltipOverlayClassName,
  tooltipProps,
}) => {
  // Check if children is a valid React element and clone it with ariaDescribedBy attribute
  // to make sure the tooltip is displayed correctly
  const componentToWrap =
    React.isValidElement(children) &&
    React.cloneElement(children, {'aria-describedby': tooltipProps.tooltipId});

  return (
    <TooltipOverlay className={tooltipOverlayClassName}>
      {componentToWrap}
      <Tooltip {...tooltipProps} />
    </TooltipOverlay>
  );
};

export default WithTooltip;
