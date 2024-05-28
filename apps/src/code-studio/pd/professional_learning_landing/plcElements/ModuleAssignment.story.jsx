import React from 'react';

import ModuleAssignment from '@cdo/apps/code-studio/pd/professional_learning_landing/plcElements/ModuleAssignment';

export default {
  component: ModuleAssignment,
};

const Template = args => <ModuleAssignment {...args} />;

export const NotStarted = Template.bind({});
NotStarted.args = {
  moduleAssignmentData: {
    category: 'Overview',
    status: 'not_started',
  },
};

export const InProgress = Template.bind({});
InProgress.args = {
  moduleAssignmentData: {
    category: 'Overview',
    status: 'in_progress',
  },
};

export const Completed = Template.bind({});
Completed.args = {
  moduleAssignmentData: {
    category: 'Overview',
    status: 'completed',
  },
};
