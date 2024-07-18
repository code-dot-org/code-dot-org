import {action} from '@storybook/addon-actions';
import React from 'react';

import {UnconnectedPublishDialog as PublishDialog} from './PublishDialog';

const PROJECT_ID = 'MY_PROJECT_ID';
const PROJECT_TYPE = 'MY_PROJECT_TYPE';

const publishDialogDefaultProps = {
  isOpen: true,
  isPublishPending: false,
  projectId: PROJECT_ID,
  projectType: PROJECT_TYPE,
  onConfirmPublish: action('publish'),
  onClose: action('close'),
};

const Template = overrides => (
  <PublishDialog {...publishDialogDefaultProps} {...overrides} />
);

export const DialogOpen = Template.bind({});

export const DialogOpenPublishPending = Template.bind({});
DialogOpenPublishPending.args = {
  isPublishPending: true,
};

export default {
  component: PublishDialog,
};
