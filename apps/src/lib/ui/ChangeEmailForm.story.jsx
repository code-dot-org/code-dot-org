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
  disabled: false,
  onChange: action('onChange'),
  onSubmit: action('onSubmit')
};

export default storybook => storybook
  .storiesOf('ChangeEmailForm', module)
  .addStoryTable([
    {
      name: 'with valid content',
      story: () => (
        <ChangeEmailForm
          {...DEFAULT_PROPS}
          values={{
            newEmail: 'batman@bat.cave',
            currentPassword: 'imsorich',
          }}
        />
      )
    },
    {
      name: 'with validation errors',
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
        />
      )
    },
    {
      name: 'disabled',
      story: () => (
        <ChangeEmailForm
          {...DEFAULT_PROPS}
          values={{
            newEmail: 'currently-saving@bat.cave',
            currentPassword: 'currently-saving',
          }}
          disabled={true}
        />
      )
    }
  ]);

