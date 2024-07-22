import {action} from '@storybook/addon-actions';
import React from 'react';

import ChangeUserTypeModal from './ChangeUserTypeModal';

const DEFAULT_PROPS = {
  handleSubmit: action('handleSubmit callback'),
  handleCancel: action('handleCancel callback'),
};

export default {
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
