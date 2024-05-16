import {action} from '@storybook/addon-actions';
import React from 'react';
import {Provider} from 'react-redux';

import {reduxStore} from '../../../../.storybook/decorators';

import {UnconnectedDeleteProjectDialog as DeleteProjectDialog} from './DeleteProjectDialog';

export default {
  component: DeleteProjectDialog,
};

const PROJECT_ID = 'MY_PROJECT_ID';

const DEFAULT_PROPS = {
  isOpen: true,
  projectId: PROJECT_ID,
  onClose: action('close'),
  deleteProject: () => console.log('Delete project'),
};
const Template = args => (
  <Provider store={reduxStore()}>
    <DeleteProjectDialog {...DEFAULT_PROPS} {...args} />
  </Provider>
);

export const Default = Template.bind({});
Default.args = {
  isDeletePending: false,
};

export const Pending = Template.bind({});
Pending.args = {
  isDeletePending: true,
};
