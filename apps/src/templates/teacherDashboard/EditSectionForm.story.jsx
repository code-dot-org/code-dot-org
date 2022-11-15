import React from 'react';
import {UnconnectedEditSectionForm as EditSectionForm} from './EditSectionForm';
import {action} from '@storybook/addon-actions';
import {testSection, courseOfferings} from './teacherDashboardTestHelpers';

export default {
  title: 'EditSectionForm',
  component: EditSectionForm
};

const noStudentsSection = {
  ...testSection,
  studentCount: 0
};

const studentSection = {
  ...testSection
};

const emailLogin = {
  ...testSection,
  loginType: 'email'
};

const wordLogin = {
  ...testSection,
  loginType: 'word'
};

const pictureLogin = {
  ...testSection,
  loginType: 'picture'
};

const googleLogin = {
  ...testSection,
  loginType: 'google_classroom'
};

const cleverLogin = {
  ...testSection,
  loginType: 'clever'
};

const Template = args => (
  <EditSectionForm
    title="Edit section details"
    handleSave={action('handleSave')}
    handleClose={action('handleClose')}
    editSectionProperties={action('editSectionProperties')}
    courseOfferings={courseOfferings}
    sections={{}}
    hiddenLessonState={{}}
    updateHiddenScript={() => {}}
    assignedUnitName="script name"
    assignedUnitLessonExtrasAvailable={false}
    assignedUnitTextToSpeechEnabled={false}
    {...args}
  />
);

export const GenericEmail = Template.bind({});
GenericEmail.args = {
  section: emailLogin,
  isSaveInProgress: false
};

export const GenericWord = Template.bind({});
GenericWord.args = {
  section: wordLogin,
  isSaveInProgress: false
};

export const GenericPicture = Template.bind({});
GenericPicture.args = {
  section: pictureLogin,
  isSaveInProgress: false
};

export const GenericGoogle = Template.bind({});
GenericGoogle.args = {
  section: googleLogin,
  isSaveInProgress: false
};

export const GenericClever = Template.bind({});
GenericClever.args = {
  section: cleverLogin,
  isSaveInProgress: false
};

export const NoStudents = Template.bind({});
NoStudents.args = {
  section: noStudentsSection,
  isSaveInProgress: false
};

export const Saving = Template.bind({});
Saving.args = {
  section: studentSection,
  isSaveInProgress: true
};
