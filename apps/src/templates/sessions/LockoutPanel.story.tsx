import {StoryFn} from '@storybook/react';
import React from 'react';
import {Provider} from 'react-redux';

import {getStore, registerReducers} from '@cdo/apps/redux';
import currentUser, {
  setInitialData,
} from '@cdo/apps/templates/currentUserRedux';
import {ChildAccountComplianceStates} from '@cdo/generated-scripts/sharedConstants';

import LockoutPanel, {LockoutPanelProps} from './LockoutPanel';

const DAYS = 1000 * 60 * 60 * 24;

export default {
  component: LockoutPanel,
};

const defaultArgs: LockoutPanelProps = {
  inSection: false,
  permissionStatus: 'l',
  apiURL: '/permissions',
  deleteDate: new Date(Date.now() + 6 * DAYS),
  disallowedEmail: 'student@test.com',
};

const store = getStore();
registerReducers({currentUser});
store.dispatch(
  setInitialData({
    id: 1,
  })
);

const Template: StoryFn<typeof LockoutPanel> = args => (
  <Provider store={store}>
    <LockoutPanel {...defaultArgs} {...args} />
  </Provider>
);

export const NewAccount = Template.bind({});
NewAccount.args = {};

export const GracePeriod = Template.bind({});
GracePeriod.args = {
  permissionStatus: ChildAccountComplianceStates.GRACE_PERIOD,
};

export const PendingRequest = Template.bind({});
PendingRequest.args = {
  pendingEmail: 'blah@blarg.com',
  requestDate: new Date(Date.now() - 2 * DAYS),
};

export const PermissionGranted = Template.bind({});
PermissionGranted.args = {
  pendingEmail: 'blah@blarg.com',
  requestDate: new Date(Date.now() - 2 * DAYS),
  permissionStatus: ChildAccountComplianceStates.PERMISSION_GRANTED,
};
