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
  return showTooltip ? (
    <WithTooltip
      tooltipProps={tooltipProps}
      tooltipOverlayClassName={tooltipOverlayClassName}
    >
      <div>
        {children}
        <i
          className={classNames('fa', iconName, iconClassName)}
          aria-describedby={tooltipProps.tooltipId}
        />
      </div>
    </WithTooltip>
  ) : (
    <div>{children}</div>
  );
};

export default WithConditionalTooltip;
