import React from 'react';
import {action} from '@storybook/addon-actions';
import ManageLinkedAccounts from './ManageLinkedAccounts';

const DEFAULT_PROPS = {
  userType: 'student',
  authenticationOptions: [],
  connect: action('connect'),
  disconnect: action('disconnect'),
  userHasPassword: true,
  isGoogleClassroomStudent: false,
  isCleverStudent: false,
};

const mockAuthenticationOptions = [
  {id: 1, credential_type: 'google_oauth2', email: 'google@email.com'},
  {id: 2, credential_type: 'facebook', email: 'facebook@email.com'},
  {id: 3, credential_type: 'clever', email: 'clever@email.com'},
  {id: 4, credential_type: 'windowslive', email: 'windowslive@email.com'},
];

export default storybook => storybook
  .storiesOf('ManageLinkedAccounts', module)
  .addStoryTable([
    {
      name: 'default table',
      story: () => (
        <ManageLinkedAccounts
          {...DEFAULT_PROPS}
        />
      )
    },
    {
      name: 'table for teacher with all authentication options',
      story: () => (
        <ManageLinkedAccounts
          {...DEFAULT_PROPS}
          userType="teacher"
          authenticationOptions={mockAuthenticationOptions}
        />
      )
    },
    {
      name: 'table for student with all authentication options',
      story: () => (
        <ManageLinkedAccounts
          {...DEFAULT_PROPS}
          userType="student"
          authenticationOptions={mockAuthenticationOptions}
        />
      )
    },
  ]);
