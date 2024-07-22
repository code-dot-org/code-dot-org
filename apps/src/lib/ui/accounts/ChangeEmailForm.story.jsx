import {action} from '@storybook/addon-actions';
import React from 'react';

import ChangeEmailForm from './ChangeEmailForm';

const DEFAULT_PROPS = {
  values: {
    newEmail: '',
    currentPassword: '',
    emailOptIn: '',
  },
  validationErrors: {
    newEmail: undefined,
    currentPassword: undefined,
    emailOptIn: undefined,
  },
  userType: 'student',
  isPasswordRequired: true,
  disabled: false,
  onChange: action('onChange'),
  onSubmit: action('onSubmit'),
};

export default {
  component: ChangeEmailForm,
};

const Template = args => <ChangeEmailForm {...DEFAULT_PROPS} {...args} />;

export const StudentViewWithValidContent = Template.bind({});
StudentViewWithValidContent.args = {
  values: {
    newEmail: 'batman@bat.cave',
    currentPassword: 'imsorich',
  },
  userType: 'student',
};

export const StudentViewWithValidContentNoPassword = Template.bind({});
StudentViewWithValidContentNoPassword.args = {
  values: {
    newEmail: 'batman@bat.cave',
    currentPassword: 'imsorich',
  },
  userType: 'student',
  isPasswordRequired: false,
};

export const StudentViewWithValidationError = Template.bind({});
StudentViewWithValidationError.args = {
  values: {
    newEmail: 'robin@bat.cave',
    currentPassword: 'no1fan',
  },
  validationErrors: {
    newEmail: 'Robin, get out of here!',
    currentPassword: 'Thats totally the wrong password.',
  },
  userType: 'student',
};

export const StudentViewDisabled = Template.bind({});
StudentViewDisabled.args = {
  values: {
    newEmail: 'currently-saving@bat.cave',
    currentPassword: 'currently-saving',
  },
  userType: 'student',
  disabled: true,
};

export const TeacherViewWithValidContent = Template.bind({});
TeacherViewWithValidContent.args = {
  values: {
    newEmail: 'batman@bat.cave',
    currentPassword: 'imsorich',
    emailOptIn: 'yes',
  },
  userType: 'teacher',
};

export const TeacherViewWithValidContentNoPassword = Template.bind({});
TeacherViewWithValidContentNoPassword.args = {
  values: {
    newEmail: 'batman@bat.cave',
    currentPassword: 'imsorich',
    emailOptIn: 'yes',
  },
  userType: 'teacher',
  isPasswordRequired: false,
};

export const TeacherViewWithValidationErrors = Template.bind({});
TeacherViewWithValidationErrors.args = {
  values: {
    newEmail: 'robin@bat.cave',
    currentPassword: 'no1fan',
    emailOptIn: 'no',
  },
  validationErrors: {
    newEmail: 'Robin, get out of here!',
    currentPassword: "That's totally the wrong password.",
    emailOptIn: 'We are requiring you to opt in! (Not really)',
  },
  userType: 'teacher',
};

export const TeacherViewDisabled = Template.bind({});
TeacherViewDisabled.args = {
  values: {
    newEmail: 'currently-saving@bat.cave',
    currentPassword: 'currently-saving',
    emailOptIn: 'yes',
  },
  userType: 'teacher',
  disabled: true,
};
