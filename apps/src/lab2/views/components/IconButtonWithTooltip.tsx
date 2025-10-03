import Button, {ButtonProps} from '@code-dot-org/component-library/button';
import {
  TooltipProps,
  WithTooltip,
} from '@code-dot-org/component-library/tooltip';
import React, {memo, useCallback} from 'react';

interface IconButtonWithTooltipProps {
  id: string;
  label: string;
  icon: ButtonProps['icon'];
  type: ButtonProps['type'];
  color: ButtonProps['color'];
  buttonSize: ButtonProps['size'];
  tooltipSize: TooltipProps['size'];
  tooltipDirection: TooltipProps['direction'];
  hideTooltipTail: TooltipProps['hideTail'];
  disabled?: boolean;
  onClick: () => void;
  containerRef?: React.RefObject<HTMLDivElement>;
  className?: string;
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
    }) => {
      const handleClick = useCallback(
        (
          e:
            | React.MouseEvent<HTMLButtonElement, MouseEvent>
            | React.MouseEvent<HTMLAnchorElement, MouseEvent>
        ) => {
          onClick();
          // Adding this to prevent focus from jumping to the next button
          // and showing its tooltip when a button is disabled after click.
          // This moves focus to the container div instead.
          setTimeout(() => {
            if (containerRef?.current) {
              containerRef.current.focus();
            }
          }, 0);
        },
        [onClick, containerRef]
      );
      return (
        <WithTooltip
          tooltipProps={{
            tooltipId: `${id}-tooltip`,
            text: label,
            size: tooltipSize,
            direction: tooltipDirection,
            hideTail: hideTooltipTail,
            className: className,
          }}
        >
          <Button
            id={`${id}-button`}
            ariaLabel={label}
            type={type}
            color={color}
            size={buttonSize}
            isIconOnly
            icon={icon}
            disabled={disabled}
            onClick={handleClick}
          />
        </WithTooltip>
      );
    }
  );

export default IconButtonWithTooltip;
