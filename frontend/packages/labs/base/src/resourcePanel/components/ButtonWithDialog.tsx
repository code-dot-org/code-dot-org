import {Tooltip} from '@mui/material';
import type {FunctionComponent, ReactNode} from 'react';

import {Button, type ButtonProps} from '@code-dot-org/component-library/button';
import type {Theme} from '@code-dot-org/component-library/common/contexts';

import styles from './styles.module.scss';

interface ButtonWithDialogProps {
  text: string;
  id: string;
  theme: Theme;
  Dialog: ReactNode;
  iconName: string;
  ariaLabel?: string;
  buttonSize?: ButtonProps['size'];
  setIsDialogOpen: (isOpen: boolean) => void;
}

const ButtonWithDialog: FunctionComponent<ButtonWithDialogProps> = ({
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
      <Tooltip
        id={`tooltip-${id}`}
        title={text}
        placement="right"
        leaveDelay={hideTooltipDelayMs}
        disableInteractive
        slotProps={{tooltip: {...(theme ? {'data-theme': theme} : {})}}}
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
      </Tooltip>
      {Dialog}
    </>
  );
};

export default ButtonWithDialog;
