import {Theme, useTheme} from '@code-dot-org/component-library/common/contexts';
import {muiPlacementFor} from '@code-dot-org/component-library/common/helpers';
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

import moduleStyles from './icon-button-with-tooltip.module.scss';

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
      theme: themeOverride,
      href,
      target = '_blank',
    }) => {
      // The bubble portals to <body>, so it cannot inherit data-theme.
      const {theme: contextTheme} = useTheme(true);
      const theme = themeOverride ?? contextTheme;

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

      const button = href ? (
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
      );

      return (
        <Tooltip
          id={`${id}-tooltip`}
          title={label}
          placement={muiPlacementFor(tooltipDirection)}
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
          {/* A disabled button fires no pointer events; the tooltip needs a live element to listen on. */}
          {disabled ? (
            <span className={moduleStyles.disabledWrapper}>{button}</span>
          ) : (
            button
          )}
        </Tooltip>
      );
    }
  );

export default IconButtonWithTooltip;
