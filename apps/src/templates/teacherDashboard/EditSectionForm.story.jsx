import React from 'react';
import {UnconnectedEditSectionForm as EditSectionForm} from './EditSectionForm';
import {action} from '@storybook/addon-actions';
import {testSection, courseOfferings} from './teacherDashboardTestHelpers';

export default {
  title: 'EditSectionForm',
  component: EditSectionForm
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
  section: {
    ...testSection,
    loginType: 'email'
  },
  isSaveInProgress: false
};

export const GenericWord = Template.bind({});
GenericWord.args = {
  section: {
    ...testSection,
    loginType: 'word'
  },
  isSaveInProgress: false
};

export const GenericPicture = Template.bind({});
GenericPicture.args = {
  section: {
    ...testSection,
    loginType: 'picture'
  },
  isSaveInProgress: false
};

export const GenericGoogle = Template.bind({});
GenericGoogle.args = {
  section: {
    ...testSection,
    loginType: 'google_classroom'
  },
  isSaveInProgress: false
};

export const GenericClever = Template.bind({});
GenericClever.args = {
  section: {
    ...testSection,
    loginType: 'clever'
  },
  isSaveInProgress: false
};

export const NoStudents = Template.bind({});
NoStudents.args = {
  section: {
    ...testSection,
    studentCount: 0
  },
  isSaveInProgress: false
};

export const Saving = Template.bind({});
Saving.args = {
  section: testSection,
  isSaveInProgress: true
};
