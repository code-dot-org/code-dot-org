import {Theme} from '@code-dot-org/component-library/common/contexts';
import {ComponentPlacementDirection} from '@code-dot-org/component-library/common/types';
import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  IconButton as MuiIconButton,
  IconButtonProps,
  Tooltip,
} from '@mui/material';
import React, {memo, useCallback, useState} from 'react';

// Legacy direction → MUI placement ('none' and unset → top).
const PLACEMENT: Record<
  ComponentPlacementDirection,
  'top' | 'right' | 'bottom' | 'left'
> = {
  onTop: 'top',
  onRight: 'right',
  onBottom: 'bottom',
  onLeft: 'left',
  none: 'top',
};

interface IconButtonWithTooltipProps {
  id: string;
  label: string;
  icon: FontAwesomeV6IconProps;
  variant?: IconButtonProps['variant'];
  color?: IconButtonProps['color'];
  size?: IconButtonProps['size'];
  tooltipDirection?: ComponentPlacementDirection;
  hideTooltipTail?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  containerRef?: React.RefObject<HTMLDivElement>;
  className?: string;
  theme?: Theme;
  href?: string;
  target?: string;
}

const IconButtonWithTooltip: React.FunctionComponent<IconButtonWithTooltipProps> =
  memo(
    ({
      id,
      label,
      icon,
      variant = 'contained',
      color = 'primary',
      size = 'medium',
      tooltipDirection,
      hideTooltipTail,
      disabled = false,
      onClick,
      containerRef,
      className,
      theme,
      href,
      target = '_blank',
    }) => {
      // Controlled so a click can force the tooltip shut.
      const [open, setOpen] = useState(false);

      const handleClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
          // Hide the tooltip when button is clicked (keyboard or mouse)
          setOpen(false);
          onClick?.();
          // Adding this to prevent focus from jumping to the next button
          // and showing its tooltip when a button is disabled after click.
          // This moves focus to the container div instead.
          setTimeout(() => {
            containerRef?.current?.focus();
          }, 0);
        },
        [onClick, containerRef]
      );

      const iconElement = <FontAwesomeV6Icon {...icon} />;

      return (
        <Tooltip
          id={`${id}-tooltip`}
          title={label}
          placement={tooltipDirection ? PLACEMENT[tooltipDirection] : 'top'}
          arrow={!hideTooltipTail}
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          slotProps={{
            tooltip: {
              ...(theme ? {'data-theme': theme} : {}),
              ...(className ? {className} : {}),
            },
          }}
        >
          {href ? (
            <MuiIconButton
              id={`${id}-button`}
              aria-label={label}
              variant={variant}
              color={color}
              size={size}
              disabled={disabled}
              href={href}
              target={target}
              rel={target === '_blank' ? 'noopener noreferrer' : undefined}
            >
              {iconElement}
            </MuiIconButton>
          ) : (
            <MuiIconButton
              id={`${id}-button`}
              aria-label={label}
              variant={variant}
              color={color}
              size={size}
              disabled={disabled}
              onClick={handleClick}
              type="button"
            >
              {iconElement}
            </MuiIconButton>
          )}
        </Tooltip>
      );
    }
  );

export default IconButtonWithTooltip;
