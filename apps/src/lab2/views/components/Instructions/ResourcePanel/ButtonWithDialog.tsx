import {Button, ButtonProps} from '@code-dot-org/component-library/button';
import {Theme} from '@code-dot-org/component-library/common/contexts';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import React from 'react';

import styles from './styles.module.scss';

interface ButtonWithDialogProps {
  text: string;
  id: string;
  theme: Theme;
  Dialog: React.ReactNode;
  iconName: string;
  ariaLabel?: string;
  buttonSize?: ButtonProps['size'];
  setIsDialogOpen: (isOpen: boolean) => void;
}

const ButtonWithDialog: React.FunctionComponent<ButtonWithDialogProps> = ({
  text,
  id,
  theme,
  Dialog,
  iconName,
  ariaLabel,
  buttonSize,
  setIsDialogOpen,
}) => {
  // Tooltip should disappear quickly.
  const hideTooltipDelayMs = 10;

  return (
    <>
      <WithTooltip
        tooltipProps={{
          text: text,
          tooltipId: `tooltip-${id}`,
          direction: 'onRight',
          size: 'xs',
          'data-theme': theme,
        }}
        hideDelayMs={hideTooltipDelayMs}
        hideOnFirstLeave={true}
      >
        <Button
          className={styles.bottomButton}
          onClick={() => setIsDialogOpen(true)}
          id={`uitest-${id}-button`}
          isIconOnly={true}
          icon={{iconName: iconName}}
          color={'gray'}
          type={'tertiary'}
          aria-label={ariaLabel}
          size={buttonSize}
        />
      </WithTooltip>
      {Dialog}
    </>
  );
};

export default ButtonWithDialog;
