import React from 'react';
import {UnconnectedControlProjectSharingDialog as ControlProjectSharingDialog} from './ControlProjectSharingDialog';

export default {
  title: 'ManageStudents/ControlProjectSharingDialog', // eslint-disable-line storybook/no-title-property-in-meta
  component: ControlProjectSharingDialog,
};

const Template = args => (
  <ControlProjectSharingDialog
    isDialogOpen={true}
    closeDialog={() => console.log('click')}
    showSharingColumn={() => console.log('click')}
    {...args}
  />
);

export const ControlProjectSharingDialogOpen = Template.bind({});
