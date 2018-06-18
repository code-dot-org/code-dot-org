import React from 'react';
import ChangeEmailForm from './ChangeEmailForm';
import {action} from '@storybook/addon-actions';

const DEFAULT_PROPS = {
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
  userType: 'student',
  isPasswordRequired: true,
  disabled: false,
  onChange: action('onChange'),
  onSubmit: action('onSubmit')
};

export default storybook => storybook
  .storiesOf('ChangeEmailForm', module)
  .addStoryTable([
    {
      name: 'student view, with valid content',
      story: () => (
        <ChangeEmailForm
          {...DEFAULT_PROPS}
          values={{
            newEmail: 'batman@bat.cave',
            currentPassword: 'imsorich',
          }}
          userType="student"
        />
      )
    },
    {
      name: 'student view, with valid content and no password',
      story: () => (
        <ChangeEmailForm
          {...DEFAULT_PROPS}
          values={{
            newEmail: 'batman@bat.cave',
            currentPassword: 'imsorich',
          }}
          userType="student"
          isPasswordRequired={false}
        />
      )
    },
    {
      name: 'student view, with validation errors',
      story: () => (
        <ChangeEmailForm
          {...DEFAULT_PROPS}
          values={{
            newEmail: 'robin@bat.cave',
            currentPassword: 'no1fan',
          }}
          validationErrors={{
            newEmail: "Robin, get out of here!",
            currentPassword: "That's totally the wrong password."
          }}
          userType="student"
        />
      )
    },
    {
      name: 'student view, disabled',
      story: () => (
        <ChangeEmailForm
          {...DEFAULT_PROPS}
          values={{
            newEmail: 'currently-saving@bat.cave',
            currentPassword: 'currently-saving',
          }}
          userType="student"
          disabled={true}
        />
      )
    },
    {
      name: 'teacher view, with valid content',
      story: () => (
        <ChangeEmailForm
          {...DEFAULT_PROPS}
          values={{
            newEmail: 'batman@bat.cave',
            currentPassword: 'imsorich',
            emailOptIn: 'yes',
          }}
          userType="teacher"
        />
      )
    },
    {
      name: 'teacher view, with valid content and no password',
      story: () => (
        <ChangeEmailForm
          {...DEFAULT_PROPS}
          values={{
            newEmail: 'batman@bat.cave',
            currentPassword: 'imsorich',
            emailOptIn: 'yes',
          }}
          userType="teacher"
          isPasswordRequired={false}
        />
      )
    },
    {
      name: 'teacher view, with validation errors',
      story: () => (
        <ChangeEmailForm
          {...DEFAULT_PROPS}
          values={{
            newEmail: 'robin@bat.cave',
            currentPassword: 'no1fan',
            emailOptIn: 'no',
          }}
          validationErrors={{
            newEmail: "Robin, get out of here!",
            currentPassword: "That's totally the wrong password.",
            emailOptIn: 'We are requiring you to opt in! (Not really)',
          }}
          userType="teacher"
        />
      )
    },
    {
      name: 'teacher view, disabled',
      story: () => (
        <ChangeEmailForm
          {...DEFAULT_PROPS}
          values={{
            newEmail: 'currently-saving@bat.cave',
            currentPassword: 'currently-saving',
            emailOptIn: 'yes',
          }}
          userType="teacher"
          disabled={true}
        />
      )
    }
  ]);
