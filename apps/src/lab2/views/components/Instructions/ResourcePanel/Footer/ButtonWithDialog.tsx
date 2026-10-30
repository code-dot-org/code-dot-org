import {Theme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  IconButton as MuiIconButton,
  IconButtonProps as MuiIconButtonProps,
  Tooltip,
} from '@mui/material';
import React from 'react';

import styles from '../styles.module.scss';

interface ButtonWithDialogProps {
  text: string;
  id: string;
  theme: Theme;
  Dialog: React.ReactNode;
  iconName: string;
  ariaLabel?: string;
  buttonSize?: MuiIconButtonProps['size'];
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
      <Tooltip
        title={text}
        placement="right"
        leaveDelay={hideTooltipDelayMs}
        disableInteractive
        slotProps={theme ? {tooltip: {'data-theme': theme}} : undefined}
      >
        <MuiIconButton
          id={`uitest-${id}-button`}
          variant="text"
          color="tertiary"
          size={buttonSize}
          className={styles.bottomButton}
          onClick={() => setIsDialogOpen(true)}
          aria-label={ariaLabel}
          type="button"
        >
          <FontAwesomeV6Icon iconName={iconName} />
        </MuiIconButton>
      </Tooltip>
      {Dialog}
    </>
  );
};

export default ButtonWithDialog;
