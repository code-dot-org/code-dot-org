import {StoryFn} from '@storybook/react';
import React from 'react';

import {UnconnectedAgeGatedStudentsModal} from './AgeGatedStudentsModal';

export default {
  name: 'At Risk Age Gated Students Modal (teacher dashboard)',
  component: UnconnectedAgeGatedStudentsModal,
};

const Template: StoryFn = args => (
  <UnconnectedAgeGatedStudentsModal
    isOpen={true}
    onClose={() => {}}
    isLoadingStudents={false}
    {...args}
  />
);
export const ModalForAgeGatedStudents = Template.bind({});
ModalForAgeGatedStudents.args = {
  manageStudents: {isLoadingStudents: false},
};
