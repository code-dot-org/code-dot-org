import React from 'react';
import ChangeUserTypeForm from './ChangeUserTypeForm';
import {action} from '@storybook/addon-actions';

const DEFAULT_PROPS = {
  values: {
    currentEmail: '',
    emailOptIn: ''
  },
  validationErrors: {
    currentEmail: undefined,
    emailOptIn: undefined
  },
  disabled: false,
  onChange: action('onChange'),
  onSubmit: action('onSubmit')
};

export default {
  title: 'ChangeUserTypeForm',
  component: ChangeUserTypeForm
};

const container = {
  margin: 'auto',
  width: '50%',
  padding: '10px'
};

const Template = args => (
  <div style={container}>
    <ChangeUserTypeForm {...DEFAULT_PROPS} {...args} />;
  </div>
);

export const ConvertStudentToTeacher = Template.bind({});
ConvertStudentToTeacher.args = {
  values: {
    currentEmail: 'batman@bat.cave',
    emailOptIn: 'yes'
  }
};

export const WithValidationErrors = Template.bind({});
WithValidationErrors.args = {
  values: {
    currentEmail: 'robin@bat.cave',
    emailOptIn: 'no'
  },
  validationErrors: {
    currentEmail: 'Robin, get out of here!',
    emailOptIn: 'No email for you.'
  }
};

export const Disabled = Template.bind({});
Disabled.args = {
  values: {
    currentEmail: 'currently-saving@bat.cave',
    emailOptIn: 'yes'
  },
  disabled: true
};
