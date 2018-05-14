import React from 'react';
import ChangeUserTypeForm from './ChangeUserTypeForm';
import {action} from '@storybook/addon-actions';

const DEFAULT_PROPS = {
  targetUserType: 'teacher',
  userHasPassword: true,
  values: {
    newEmail: '',
    currentPassword: '',
    emailOptIn: '',
  },
  validationErrors: {
    newEmail: undefined,
    currentPassword: undefined,
    emailOptIn: undefined,
  },
  disabled: false,
  onChange: action('onChange'),
  onSubmit: action('onSubmit')
};

export default storybook => storybook
  .storiesOf('ChangeUserTypeForm', module)
  .addStoryTable([
    {
      name: 'convert student with password to teacher account',
      story: () => (
        <ChangeUserTypeForm
          {...DEFAULT_PROPS}
          targetUserType="teacher"
          userHasPassword={true}
          values={{
            currentEmail: 'batman@bat.cave',
            currentPassword: 'imsorich',
          }}
        />
      )
    },
    {
      name: 'convert student without password to teacher account',
      story: () => (
        <ChangeUserTypeForm
          {...DEFAULT_PROPS}
          targetUserType="teacher"
          userHasPassword={false}
          values={{
            currentEmail: 'batman@bat.cave',
            currentPassword: 'imsorich',
          }}
        />
      )
    },
    {
      name: 'convert teacher with password to student account',
      story: () => (
        <ChangeUserTypeForm
          {...DEFAULT_PROPS}
          targetUserType="student"
          userHasPassword={true}
          values={{
            currentEmail: 'batman@bat.cave',
            currentPassword: 'imsorich',
          }}
        />
      )
    },
    {
      name: 'convert teacher without password to student account',
      story: () => (
        <em>
          No dialog - at the moment we won't confirm email address
          or password in this case.
        </em>
      )
    },
    {
      name: 'with validation errors',
      story: () => (
        <ChangeUserTypeForm
          {...DEFAULT_PROPS}
          values={{
            currentEmail: 'robin@bat.cave',
            currentPassword: 'no1fan',
          }}
          validationErrors={{
            currentEmail: "Robin, get out of here!",
            currentPassword: "That's totally the wrong password."
          }}
        />
      )
    },
    {
      name: 'disabled',
      story: () => (
        <ChangeUserTypeForm
          {...DEFAULT_PROPS}
          values={{
            currentEmail: 'currently-saving@bat.cave',
            currentPassword: 'currently-saving',
          }}
          disabled={true}
        />
      )
    }
  ]);

