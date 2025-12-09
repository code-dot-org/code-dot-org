import {
  Button,
  LinkButton,
  ButtonProps,
  LinkButtonProps,
} from '@code-dot-org/component-library/button';
import {Theme} from '@code-dot-org/component-library/common/contexts';
import {
  TooltipProps,
  WithTooltip,
  WithTooltipHandle,
} from '@code-dot-org/component-library/tooltip';
import React, {memo, useCallback, useRef} from 'react';

interface IconButtonWithTooltipProps {
  id: string;
  label: string;
  icon: ButtonProps['icon'];
  type: ButtonProps['type'];
  color: ButtonProps['color'];
  buttonSize?: ButtonProps['size'];
  tooltipSize: TooltipProps['size'];
  tooltipDirection: TooltipProps['direction'];
  hideTooltipTail?: TooltipProps['hideTail'];
  disabled?: boolean;
  onClick?: () => void;
  containerRef?: React.RefObject<HTMLDivElement>;
  className?: string;
  theme?: Theme;
  href?: LinkButtonProps['href'];
  target?: LinkButtonProps['target'];
}

const IconButtonWithTooltip: React.FunctionComponent<IconButtonWithTooltipProps> =
  memo(
    ({
      id,
      label,
      icon,
      type,
      color,
      buttonSize,
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

      // Common props shared between Button and LinkButton.
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
            <LinkButton {...commonButtonProps} href={href} target={target} />
          ) : (
            <Button {...commonButtonProps} onClick={handleClick} />
          )}
        </WithTooltip>
      );
    }
  );

export default IconButtonWithTooltip;
