import {StoryFn} from '@storybook/react';
import React from 'react';
import {Provider} from 'react-redux';

import manageStudents from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
// @ts-expect-error Typescript type declaration error
import {reduxStore} from '@cdo/storybook/decorators';

import currentUser from '../../currentUserRedux';

import {AgeGatedStudentsBanner} from './AgeGatedStudentsBanner';

export default {
  name: 'At Risk Age Gated Students Banner (teacher dashboard)',
  component: AgeGatedStudentsBanner,
};

const Template: StoryFn = args => (
  <Provider store={reduxStore({currentUser, manageStudents})}>
    <AgeGatedStudentsBanner
      toggleModal={() => {}}
      modalOpen={false}
      ageGatedStudentsCount={1}
      {...args}
    />
  </Provider>
);
export const TableForAgeGatedStudents = Template.bind({});
