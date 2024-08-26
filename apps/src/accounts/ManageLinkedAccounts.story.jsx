import {action} from '@storybook/addon-actions';
import React from 'react';

import {UnconnectedManageLinkedAccounts as ManageLinkedAccounts} from './ManageLinkedAccounts';

const DEFAULT_PROPS = {
  userType: 'student',
  authenticationOptions: {},
  connect: action('connect'),
  disconnect: action('disconnect'),
  userHasPassword: true,
  isGoogleClassroomStudent: false,
  isCleverStudent: false,
  personalAccountLinkingEnabled: true,
};

const mockAuthenticationOptions = {
  1: {id: 1, credentialType: 'google_oauth2', email: 'google@email.com'},
  2: {id: 2, credentialType: 'facebook', email: 'facebook@email.com'},
  3: {id: 3, credentialType: 'clever', email: 'clever@email.com'},
  4: {
    id: 4,
    credentialType: 'microsoft_v2_auth',
    email: 'microsoft@email.com',
  },
};

export default {
  component: ManageLinkedAccounts,
};

const Template = args => <ManageLinkedAccounts {...DEFAULT_PROPS} {...args} />;

export const DefaultTable = Template.bind({});

export const TableForTeachersWithAllAuthOptions = Template.bind({});
TableForTeachersWithAllAuthOptions.args = {
  userType: 'teacher',
  authenticationOptions: mockAuthenticationOptions,
};

export const TableForStudentsWithAllAuthOptions = Template.bind({});
TableForStudentsWithAllAuthOptions.args = {
  userType: 'student',
  authenticationOptions: mockAuthenticationOptions,
};

export const TableWithErrorWhenDisconnecting = Template.bind({});
TableWithErrorWhenDisconnecting.args = {
  authenticationOptions: {
    ...mockAuthenticationOptions,
    2: {
      id: 2,
      credentialType: 'facebook',
      email: 'facebook@email.com',
      error: 'Oh no!',
    },
  },
};

export const TableWithADisabledDisconnectStatus = Template.bind({});
TableWithADisabledDisconnectStatus.args = {
  authenticationOptions: {
    ...mockAuthenticationOptions,
    1: {id: 1, credentialType: 'google_oauth2', email: 'google@email.com'},
  },
  isGoogleClassroomStudent: true,
};
