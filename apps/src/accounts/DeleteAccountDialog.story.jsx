import {action} from '@storybook/addon-actions';
import React from 'react';

import DeleteAccountDialog from './DeleteAccountDialog';
import {getCheckboxes} from './DeleteAccountHelpers';

const PASSWORD = 'MY_PASSWORD';
const DELETE_VERIFICATION = 'DELETE MY ACCOUNT';

const DEFAULT_PROPS = {
  isOpen: true,
  isPasswordRequired: true,
  checkboxes: {},
  password: PASSWORD,
  deleteVerification: DELETE_VERIFICATION,
  onCheckboxChange: action('Checkbox'),
  onPasswordChange: action('Change password'),
  onDeleteVerificationChange: action('Verify'),
  onCancel: action('Cancel'),
  disableConfirm: false,
  deleteUser: action('Delete my Account'),
  isAdmin: false,
};

export default {
  component: DeleteAccountDialog,
};

const container = {
  margin: 'auto',
  width: '50%',
  padding: '10px',
};

const Template = args => (
  <div style={container}>
    <DeleteAccountDialog {...DEFAULT_PROPS} {...args} />
  </div>
);

export const DeleteStudentAccount = Template.bind({});
DeleteStudentAccount.args = {
  isTeacher: false,
  warnAboutDeletingStudents: false,
};

export const DeleteTeacherAccountWithoutStudents = Template.bind({});
DeleteTeacherAccountWithoutStudents.args = {
  isTeacher: true,
  warnAboutDeletingStudents: false,
};

export const DeleteTeacherAccountWithStudents = Template.bind({});
DeleteTeacherAccountWithStudents.args = {
  isTeacher: true,
  warnAboutDeletingStudents: true,
};

export const DeleteTeacherAccountWithStudents1Checkbox = Template.bind({});
DeleteTeacherAccountWithStudents1Checkbox.args = {
  isTeacher: true,
  warnAboutDeletingStudents: true,
  checkboxes: getCheckboxes(false, true),
};

export const DeleteTeacherAccountWithStudents5Checkbox = Template.bind({});
DeleteTeacherAccountWithStudents5Checkbox.args = {
  isTeacher: true,
  warnAboutDeletingStudents: true,
  checkboxes: getCheckboxes(true),
};
