import {StoryFn} from '@storybook/react';
import React from 'react';
import {Provider} from 'react-redux';

// @ts-expect-error Typescript type declaration error
import {reduxStore} from '@cdo/storybook/decorators';

import currentUser from '../../currentUserRedux';
import manageStudents from '../../manageStudents/manageStudentsRedux';

import AgeGatedStudentsModal from './AgeGatedStudentsModal';
import {MockStudentData} from './MockData';

export default {
  name: 'At Risk Age Gated Students Modal (teacher dashboard)',
  component: AgeGatedStudentsModal,
};

const mockState = {
  manageStudents: {
    studentData: MockStudentData,
    isLoadingStudents: false,
  },
};

const Template: StoryFn = args => (
  <Provider store={reduxStore({currentUser, manageStudents}, mockState)}>
    <AgeGatedStudentsModal isOpen={true} onClose={() => {}} {...args} />
  </Provider>
);
export const ModalForAgeGatedStudents = Template.bind({});
ModalForAgeGatedStudents.args = {};
