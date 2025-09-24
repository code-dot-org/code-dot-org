import Button from '@code-dot-org/component-library/button';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import React, {memo, useCallback} from 'react';

interface IconButtonWithTooltipProps {
  id: string;
  i18nLabel: string;
  icon: string;
  disabled?: boolean;
  onClick: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

const IconButtonWithTooltip: React.FunctionComponent<IconButtonWithTooltipProps> =
  memo(({id, i18nLabel, icon, disabled = false, onClick, containerRef}) => {
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
          if (containerRef.current) {
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
          text: i18nLabel,
          direction: 'onBottom',
          size: 'xs',
          hideTail: true,
        }}
      >
        <Button
          id={`${id}-button`}
          ariaLabel={i18nLabel}
          type="tertiary"
          color="black"
          size="xs"
          isIconOnly
          icon={{iconStyle: 'solid', iconName: icon}}
          disabled={disabled}
          onClick={handleClick}
        />
      </WithTooltip>
    );
  });

export default IconButtonWithTooltip;
