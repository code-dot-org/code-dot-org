import React from 'react';
import {action} from '@storybook/addon-actions';
import {UnconnectedManageLinkedAccounts as ManageLinkedAccounts} from './ManageLinkedAccounts';

const DEFAULT_PROPS = {
  userType: 'student',
  authenticationOptions: {},
  connect: action('connect'),
  disconnect: action('disconnect'),
  userHasPassword: true,
  isGoogleClassroomStudent: false,
  isCleverStudent: false,
};

const mockAuthenticationOptions = {
  1: {id: 1, credentialType: 'google_oauth2', email: 'google@email.com'},
  2: {id: 2, credentialType: 'facebook', email: 'facebook@email.com'},
  3: {id: 3, credentialType: 'clever', email: 'clever@email.com'},
  4: {id: 4, credentialType: 'windowslive', email: 'windowslive@email.com'},
};

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
    {
      name: 'table with an error upon disconnecting',
      story: () => {
        const mockOptions = {
          ...mockAuthenticationOptions,
          2: {id: 2, credentialType: 'facebook', email: 'facebook@email.com', error: 'Oh no!'},
        };

        return (
          <ManageLinkedAccounts
            {...DEFAULT_PROPS}
            authenticationOptions={mockOptions}
          />
        );
      }
    },
    {
      name: 'table with a disabled disconnect status',
      story: () => {
        const mockOptions = {
          ...mockAuthenticationOptions,
          1: {id: 1, credentialType: 'google_oauth2', email: 'google@email.com'},
        };

        return (
          <ManageLinkedAccounts
            {...DEFAULT_PROPS}
            isGoogleClassroomStudent={true}
            authenticationOptions={mockOptions}
          />
        );
      }
    },
  ]);
