import React from 'react';
import {action} from '@storybook/addon-actions';
import UploadErrorDialog from './UploadErrorDialog';

export default {
  title: 'UploadErrorDialog',
  component: UploadErrorDialog,
};

const Template = args => (
  <UploadErrorDialog isOpen handleClose={action('close')} hideBackdrop />
);

export const BasicExample = Template.bind({});
