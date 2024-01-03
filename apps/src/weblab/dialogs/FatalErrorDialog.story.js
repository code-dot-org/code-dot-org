import React from 'react';
import {action} from '@storybook/addon-actions';
import FatalErrorDialog from './FatalErrorDialog';

export default {
  title: 'FatalErrorDialog',
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
