import {Tooltip, type TooltipProps as MuiTooltipProps} from '@mui/material';
import {type ReactNode} from 'react';

interface WithConditionalTooltipProps {
  children: ReactNode;
  tooltipOverlayClassName?: string;
  tooltipProps: Omit<MuiTooltipProps, 'children'>;
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
    <Tooltip placement="top" {...tooltipProps}>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- the control inside is disabled, so this wrapper is the only way to reach the reason */}
      <div className={tooltipOverlayClassName} tabIndex={0}>
        {children}
        {icon}
      </div>
    </Tooltip>
  ) : (
    <div className={tooltipOverlayClassName}>{children}</div>
  );
