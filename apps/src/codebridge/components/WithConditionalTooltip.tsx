import classNames from 'classnames';
import React from 'react';

import {TooltipProps, WithTooltip} from '@cdo/apps/componentLibrary/tooltip';

interface WithConditionalTooltipProps {
  children: React.ReactNode;
  tooltipOverlayClassName?: string;
  tooltipProps: TooltipProps;
  showTooltip: boolean;
  iconName: string;
  iconClassName: string;
}
const WithConditionalTooltip: React.FunctionComponent<
  WithConditionalTooltipProps
> = ({
  children,
  tooltipOverlayClassName,
  tooltipProps,
  showTooltip,
  iconName,
  iconClassName,
}) => {
  return (
    <div>
      {showTooltip ? (
        <WithTooltip
          tooltipProps={tooltipProps}
          tooltipOverlayClassName={tooltipOverlayClassName}
        >
          {children}
          <i
            className={classNames('fa', iconName, iconClassName)}
            aria-describedby={tooltipProps.tooltipId}
          />
        </WithTooltip>
      ) : (
        children
      )}
    </div>
  );
};

export default WithConditionalTooltip;
