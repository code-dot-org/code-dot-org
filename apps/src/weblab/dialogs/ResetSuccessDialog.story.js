import React from 'react';
import {action} from '@storybook/addon-actions';
import ResetSuccessDialog from './ResetSuccessDialog';

export default {
  title: 'ResetSuccessDialog',
  component: ResetSuccessDialog,
};

const Template = arg => (
  <ResetSuccessDialog isOpen handleClose={action('close')} hideBackdrop />
);

export const Default = Template.bind({});
