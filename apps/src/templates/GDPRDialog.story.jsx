import React from 'react';
import GDPRDialog from './GDPRDialog';

export default {
  title: 'GDPRDialog',
  component: GDPRDialog,
};

const Template = args => <GDPRDialog {...args} />;

export const Simple = Template.bind({});
Simple.args = {
  isDialogOpen: true,
  currentUserId: 12345,
};
