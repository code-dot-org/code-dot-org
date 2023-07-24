import React from 'react';
import {ConfirmEnableMakerDialog} from './ConfirmEnableMakerDialog';
import {action} from '@storybook/addon-actions';

export default {
  title: 'ConfirmEnableMakerDialog',
  component: ConfirmEnableMakerDialog,
};

// Template
const Template = args => <ConfirmEnableMakerDialog isOpen {...args} />;

// Stories
export const Overview = Template.bind({});
Overview.args = {
  handleConfirm: action('Confirm'),
  handleCancel: action('Cancel'),
};
