import React from 'react';
import {UnconnectedFreeResponseDetailsDialog as FreeResponseDetailsDialog} from '@cdo/apps/templates/sectionAssessments/FreeResponseDetailsDialog';

export default {
  component: FreeResponseDetailsDialog,
};

const Template = args => <FreeResponseDetailsDialog {...args} />;

export const Example = Template.bind({});
Example.args = {
  isDialogOpen: true,
  closeDialog: () => {},
  questionAndAnswers: {
    question: 'Hello world. I display *markdown* questions in a dialog.',
    answers: [],
  },
};
