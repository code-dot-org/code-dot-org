import {action} from '@storybook/addon-actions';
import React from 'react';

import UploadErrorDialog from './UploadErrorDialog';

export default {
  component: UploadErrorDialog,
};

const Template = args => (
  <UploadErrorDialog isOpen handleClose={action('close')} hideBackdrop />
);

export const BasicExample = Template.bind({});
