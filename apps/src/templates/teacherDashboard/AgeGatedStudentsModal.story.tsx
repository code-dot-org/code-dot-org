import {StoryFn} from '@storybook/react';
import React from 'react';
import {Provider} from 'react-redux';

// @ts-expect-error Typescript type declaration error
import {reduxStore} from '@cdo/storybook/decorators';

import currentUser from '../currentUserRedux';
import manageStudents from '../manageStudents/manageStudentsRedux';

import {UnconnectedAgeGatedStudentsModal} from './AgeGatedStudentsModal';

export default {
  name: 'At Risk Age Gated Students Modal (teacher dashboard)',
  component: UnconnectedAgeGatedStudentsModal,
};

const Template: StoryFn = args => (
  <Provider store={reduxStore({currentUser, manageStudents})}>
    <UnconnectedAgeGatedStudentsModal
      isOpen={true}
      onClose={() => {}}
      isLoadingStudents={false}
      {...args}
    />
  </Provider>
);
export const ModalForAgeGatedStudents = Template.bind({});
ModalForAgeGatedStudents.args = {
  manageStudents: {isLoadingStudents: false},
};
