import {action} from '@storybook/addon-actions';
import React from 'react';

import {projectUpdatedStatuses as statuses} from '../../projectRedux';

import {UnconnectedRetryProjectSaveDialog as RetryProjectSaveDialog} from './RetryProjectSaveDialog';

export default {
  component: RetryProjectSaveDialog,
};

// Template
const Template = args => (
  <RetryProjectSaveDialog isOpen onTryAgain={action('try again')} {...args} />
);

// Stories
export const DialogOpenDefault = Template.bind({});
DialogOpenDefault.args = {
  projectUpdatedStatus: statuses.error,
};

export const DialogOpenWithPendingSave = Template.bind({});
DialogOpenWithPendingSave.args = {
  projectUpdatedStatus: statuses.saving,
};
