import {Tooltip} from '@mui/material';
import {memo, useCallback, useState} from 'react';
import type {FunctionComponent, RefObject} from 'react';

import {
  Button,
  LinkButton,
  type ButtonProps,
  type LinkButtonProps,
} from '@code-dot-org/component-library/button';
import {
  type Theme,
  useTheme,
} from '@code-dot-org/component-library/common/contexts';
import {muiPlacementFor} from '@code-dot-org/component-library/common/helpers';
import type {ComponentPlacementDirection} from '@code-dot-org/component-library/common/types';

import moduleStyles from './iconButtonWithTooltip.module.scss';

export interface IconButtonWithTooltipProps {
  id: string;
  label: string;
  icon: ButtonProps['icon'];
  type: ButtonProps['type'];
  color: ButtonProps['color'];
  buttonSize?: ButtonProps['size'];
  tooltipDirection?: ComponentPlacementDirection;
  hideTooltipTail?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  containerRef?: RefObject<HTMLDivElement | null>;
  className?: string;
  theme?: Theme;
  href?: LinkButtonProps['href'];
  target?: LinkButtonProps['target'];
}

const IconButtonWithTooltip: FunctionComponent<IconButtonWithTooltipProps> =
  memo(
    ({
      id,
      label,
      icon,
      type,
      color,
      buttonSize,
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

      const handleClick = useCallback(() => {
        setOpen(false);
        onClick?.();
        // Move focus to the container, so it does not land on the next
        // button, and show that tooltip, when this one disables itself.
        setTimeout(() => {
          containerRef?.current?.focus();
        }, 0);
      }, [onClick, containerRef]);

      const commonButtonProps = {
        id: `${id}-button`,
        ariaLabel: label,
        type,
        color,
        size: buttonSize,
        isIconOnly: true,
        icon,
        disabled,
      };

      const button = href ? (
        <LinkButton {...commonButtonProps} href={href} target={target} />
      ) : (
        <Button {...commonButtonProps} onClick={handleClick} />
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
          {/* A disabled button fires no pointer events, and LinkButton takes
              no ref: the tooltip needs a live element to attach to. */}
          {href || disabled ? (
            <span className={moduleStyles.anchor}>{button}</span>
          ) : (
            button
          )}
        </Tooltip>
      );
    },
  );

export default IconButtonWithTooltip;
