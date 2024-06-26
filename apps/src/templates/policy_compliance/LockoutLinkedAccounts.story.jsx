import React from 'react';

import LockoutLinkedAccounts from './LockoutLinkedAccounts';

export default {
  component: LockoutLinkedAccounts,
};

const Template = args => (
  <LockoutLinkedAccounts
    apiUrl="/permissions"
    requestDate={new Date()}
    {...args}
  />
);

export const NoEmailSent = Template.bind({});
NoEmailSent.args = {
  permissionStatus: null,
};

export const PendingRequest = Template.bind({});
PendingRequest.args = {
  pendingEmail: 'parent-email@code.org',
  requestDate: new Date(),
};

export const RequestGranted = Template.bind({});
RequestGranted.args = {
  pendingEmail: 'parent-email@code.org',
  requestDate: new Date(),
  permissionStatus: 'g',
};
