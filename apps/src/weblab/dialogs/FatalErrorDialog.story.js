import {action} from '@storybook/addon-actions';
import React from 'react';

import FatalErrorDialog from './FatalErrorDialog';

export default {
  component: FatalErrorDialog,
};

export const Basic = () => (
  <FatalErrorDialog
    isOpen
    errorMessage="Web Lab failed to load"
    handleClose={action('close')}
    handleResetProject={action('resetting project')}
    hideBackdrop
  />
);
