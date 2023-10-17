import React from 'react';
import ChangeEmailModal from './ChangeEmailModal';
import {action} from '@storybook/addon-actions';

const DEFAULT_PROPS = {
  handleSubmit: action('handleSubmit callback'),
  handleCancel: action('handleCancel callback'),
  isPasswordRequired: true,
};

export default {
  title: 'ChangeEmailModal',
  component: ChangeEmailModal,
};

const container = {
  margin: 'auto',
  width: '50%',
  padding: '10px',
};

const Template = args => (
  <div style={container}>
    <ChangeEmailModal {...DEFAULT_PROPS} {...args} />
  </div>
);

export const StudentView = Template.bind({});
StudentView.args = {
  userType: 'student',
};

export const TeacherView = Template.bind({});
TeacherView.args = {
  userType: 'teacher',
};
