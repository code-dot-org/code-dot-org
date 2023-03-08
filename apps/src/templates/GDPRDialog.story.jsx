import React from 'react';
import GDPRDialog from './GDPRDialog';

export default {
  title: 'GDPRDialog',
  component: GDPRDialog
};

const Template = args => <GDPRDialog {...args} />;

export const Simple = Template.bind({});
Simple.args = {
  name: 'GDPR Dialog',
  description:
    'Dialog shown to users in the EU to prompt them to accept the data transfer agreement',
  isDialogOpen: true,
  currentUserId: 12345
};
