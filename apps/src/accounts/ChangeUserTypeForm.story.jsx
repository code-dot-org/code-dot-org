import {action} from '@storybook/addon-actions';
import React from 'react';

import ChangeUserTypeForm from './ChangeUserTypeForm';

const DEFAULT_PROPS = {
  values: {
    email: '',
    emailOptIn: '',
  },
  validationErrors: {
    email: undefined,
    emailOptIn: undefined,
  },
  disabled: false,
  onChange: action('onChange'),
  onSubmit: action('onSubmit'),
};

export default {
  component: ChangeUserTypeForm,
};

const Template = args => <ChangeUserTypeForm {...DEFAULT_PROPS} {...args} />;

export const ConvertStudentToTeacher = Template.bind({});
ConvertStudentToTeacher.args = {
  values: {
    email: 'batman@bat.cave',
    emailOptIn: 'yes',
  },
};

export const WithValidationErrors = Template.bind({});
WithValidationErrors.args = {
  values: {
    email: 'robin@bat.cave',
    emailOptIn: 'no',
  },
  validationErrors: {
    email: 'Robin, get out of here!',
    emailOptIn: 'No email for you.',
  },
};

export const Disabled = Template.bind({});
Disabled.args = {
  values: {
    email: 'currently-saving@bat.cave',
    emailOptIn: 'yes',
  },
  disabled: true,
};
