import {UnconnectedRetryProjectSaveDialog as RetryProjectSaveDialog} from './RetryProjectSaveDialog';
import React from 'react';
import {projectUpdatedStatuses as statuses} from '../../projectRedux';
import {action} from '@storybook/addon-actions';

export default {
  title: 'RetryProjectSaveDialog',
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
