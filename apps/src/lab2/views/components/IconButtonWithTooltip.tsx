import {Theme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  TooltipProps,
  WithTooltip,
  WithTooltipHandle,
} from '@code-dot-org/component-library/tooltip';
import {IconButton as MuiIconButton, IconButtonProps} from '@mui/material';
import React, {memo, useCallback, useRef} from 'react';

interface IconButtonWithTooltipProps {
  id: string;
  label: string;
  icon: FontAwesomeV6IconProps;
  variant?: IconButtonProps['variant'];
  color?: IconButtonProps['color'];
  size?: IconButtonProps['size'];
  tooltipSize: TooltipProps['size'];
  tooltipDirection: TooltipProps['direction'];
  hideTooltipTail?: TooltipProps['hideTail'];
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
      tooltipSize,
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
      const tooltipRef = useRef<WithTooltipHandle>(null);

      const handleClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
          // Hide the tooltip when button is clicked (keyboard or mouse)
          tooltipRef.current?.hideTooltip();
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

      const tooltipProps = {
        tooltipId: `${id}-tooltip`,
        text: label,
        size: tooltipSize,
        direction: tooltipDirection,
        hideTail: hideTooltipTail,
        className,
        'data-theme': theme,
      };

      return (
        <WithTooltip ref={tooltipRef} tooltipProps={tooltipProps}>
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
        </WithTooltip>
      );
    }
  );

export default IconButtonWithTooltip;
