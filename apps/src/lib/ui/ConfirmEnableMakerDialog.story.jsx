import {action} from '@storybook/addon-actions';
import React from 'react';

import {ConfirmEnableMakerDialog} from './ConfirmEnableMakerDialog';

export default {
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
