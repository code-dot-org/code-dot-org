import {StoryFn} from '@storybook/react';
import React from 'react';
import {Provider} from 'react-redux';

import manageStudents from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
// @ts-expect-error Typescript type declaration error
import {reduxStore} from '@cdo/storybook/decorators';

import AgeGatedStudentsTable from './AgeGatedStudentsTable';
import {MockStudentData} from './MockData';

export default {
  name: 'At Risk Age Gated Students Table (teacher dashboard)',
  component: AgeGatedStudentsTable,
};

const mockState = {
  manageStudents: {
    studentData: MockStudentData,
  },
};

const Template: StoryFn = args => (
  <Provider store={reduxStore({manageStudents}, mockState)}>
    <AgeGatedStudentsTable {...args} />
  </Provider>
);
export const TableForAgeGatedStudents = Template.bind({});
TableForAgeGatedStudents.args = {};
