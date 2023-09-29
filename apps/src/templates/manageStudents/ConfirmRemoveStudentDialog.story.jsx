import React from 'react';
import ConfirmRemoveStudentDialog, {
  MINIMUM_TEST_PROPS,
} from './ConfirmRemoveStudentDialog';

export default {
  title: 'ManageStudents/ConfirmRemoveStudentsDialog',
  component: ConfirmRemoveStudentDialog,
};

const Template = args => (
  <ConfirmRemoveStudentDialog
    {...MINIMUM_TEST_PROPS}
    hideBackdrop={true}
    {...args}
  />
);

export const NeverSignedInStudent = Template.bind({});
NeverSignedInStudent.args = {
  hasEverSignedIn: false,
};

export const EverSignedInStudent = Template.bind({});
EverSignedInStudent.args = {
  hasEverSignedIn: true,
};

export const SectionSignedInStudent = Template.bind({});
SectionSignedInStudent.args = {
  hasEverSignedIn: true,
  dependsOnThisSectionForLogin: true,
};
