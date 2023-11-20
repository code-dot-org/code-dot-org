import React from 'react';
import ChangeUserTypeModal from './ChangeUserTypeModal';
import {action} from '@storybook/addon-actions';

const DEFAULT_PROPS = {
  handleSubmit: action('handleSubmit callback'),
  handleCancel: action('handleCancel callback'),
};

export default {
  title: 'ChangeUserTypeModal',
  component: ChangeUserTypeModal,
};

const container = {
  margin: 'auto',
  width: '50%',
  padding: '10px',
};

const Template = args => (
  <div style={container}>
    <ChangeUserTypeModal {...DEFAULT_PROPS} {...args} />
  </div>
);

export const StudentBecomingTeacher = Template.bind({});
