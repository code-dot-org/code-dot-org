import {action} from '@storybook/addon-actions';
import React from 'react';

import ShareWarningsDialog from './ShareWarningsDialog';

export default {
  component: ShareWarningsDialog,
};

const DEFAULT_PROPS = {
  handleClose: action('close'),
  handleTooYoung: action('handleTooYoung'),
};

const Template = args => <ShareWarningsDialog {...DEFAULT_PROPS} {...args} />;

export const AgePromptAndDataAlert = Template.bind({});
AgePromptAndDataAlert.args = {
  promptForAge: true,
  showStoreDataAlert: true,
};

export const AgePromptAndNoDataAlert = Template.bind({});
AgePromptAndNoDataAlert.args = {
  promptForAge: true,
  showStoreDataAlert: false,
};

export const NoAgePromptAndDataAlert = Template.bind({});
NoAgePromptAndDataAlert.args = {
  promptForAge: false,
  showStoreDataAlert: true,
};
