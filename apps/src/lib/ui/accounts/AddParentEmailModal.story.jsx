import React from 'react';
import AddParentEmailModal from './AddParentEmailModal';
import {action} from '@storybook/addon-actions';

const DEFAULT_PROPS = {
  handleSubmit: action('handleSubmit callback'),
  handleCancel: action('handleCancel callback'),
};

export default {
  title: 'AddParentEmailModal',
  component: AddParentEmailModal,
};

const container = {
  margin: 'auto',
  width: '50%',
  padding: '10px',
};

const Template = args => (
  <div style={container}>
    <AddParentEmailModal {...DEFAULT_PROPS} {...args} />
  </div>
);

export const ViewWithNoCurrentParentEmail = Template.bind({});

export const ViewWithCurrentParentEmail = Template.bind({});
ViewWithCurrentParentEmail.args = {
  currentParentEmail: 'minerva@hogwarts.edu',
};
