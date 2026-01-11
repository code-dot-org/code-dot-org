import classNames from 'classnames';
import type {FunctionComponent, ReactNode} from 'react';

import {
  TooltipProps,
  WithTooltip,
} from '@code-dot-org/component-library/tooltip';

interface WithConditionalTooltipProps {
  children: ReactNode;
  tooltipOverlayClassName?: string;
  tooltipProps: TooltipProps;
  showTooltip: boolean;
  iconName?: string;
  iconClassName?: string;
}

// Component that wraps children with a tooltip is showTooltip is true,
// otherwise it just renders the children wrapped in a div.
const WithConditionalTooltip: FunctionComponent<
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
        {iconName && (
          <i
            className={classNames('fa', iconName, iconClassName)}
            aria-describedby={tooltipProps.tooltipId}
          />
        )}
      </div>
    </WithTooltip>
  ) : (
    <div>{children}</div>
  );
};

export default WithConditionalTooltip;
