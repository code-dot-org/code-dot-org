import {type ReactNode} from 'react';

import {
  WithTooltip,
  type TooltipProps,
} from '@code-dot-org/component-library/tooltip';

interface WithConditionalTooltipProps {
  children: ReactNode;
  tooltipOverlayClassName?: string;
  tooltipProps: TooltipProps;
  showTooltip: boolean;
  /** Status icon rendered beside the children while the tooltip shows. */
  icon?: ReactNode;
}

/**
 * Wraps children in a tooltip when `showTooltip` is set, appending an optional
 * status icon beside them; otherwise renders the children in a bare div.
 * Ported from apps/src/codebridge/components/WithConditionalTooltip.tsx — the
 * legacy version takes raw FontAwesome class-name strings, whereas here the
 * caller passes an already-rendered icon node.
 */
export const WithConditionalTooltip = ({
  children,
  tooltipOverlayClassName,
  tooltipProps,
  showTooltip,
  icon,
}: WithConditionalTooltipProps) =>
  showTooltip ? (
    <WithTooltip
      tooltipProps={tooltipProps}
      tooltipOverlayClassName={tooltipOverlayClassName}
    >
      <div>
        {children}
        {icon}
      </div>
    </WithTooltip>
  ) : (
    <div>{children}</div>
  );
