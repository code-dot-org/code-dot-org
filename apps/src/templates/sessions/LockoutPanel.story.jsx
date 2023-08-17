import React from 'react';
import LockoutPanel from './LockoutPanel';

const DAYS = 1000 * 60 * 60 * 24;

export default {
  title: 'LockoutPanel',
  component: LockoutPanel,
};

const Template = args => (
  <LockoutPanel
    apiURL="/permissions"
    deleteDate={new Date(Date.now() + 6 * DAYS)}
    studentEmail="student@test.com"
    {...args}
  />
);

export const NewAccount = Template.bind({});
NewAccount.args = {};

export const PendingRequest = Template.bind({});
PendingRequest.args = {
  pendingEmail: 'blah@blarg.com',
  requestDate: new Date(Date.now() - 2 * DAYS),
};
