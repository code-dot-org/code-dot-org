import {
  MuiCustomDialog,
  type MuiCustomDialogProps,
} from '@code-dot-org/component-library/dialog';
import React from 'react';

import moduleStyles from './craftDialog.module.css';

export interface CraftDialogProps extends MuiCustomDialogProps {
  isOpen: boolean;
}

/**
 * A version of <Dialog/> with Minecraft styles.
 */
const CraftDialog = ({isOpen, ...props}: CraftDialogProps) =>
  isOpen ? (
    <MuiCustomDialog
      className={moduleStyles.craftDialog}
      data-theme="Dark"
      {...props}
      mode="dark"
    />
  ) : (
    <></>
  );

export default CraftDialog;
