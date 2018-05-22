import React from 'react';
import ChangeUserTypeForm from './ChangeUserTypeForm';
import {action} from '@storybook/addon-actions';

const DEFAULT_PROPS = {
  values: {
    currentEmail: '',
    emailOptIn: '',
  },
  validationErrors: {
    currentEmail: undefined,
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
      name: 'convert student to teacher account',
      story: () => (
        <ChangeUserTypeForm
          {...DEFAULT_PROPS}
          values={{
            currentEmail: 'batman@bat.cave',
            emailOptIn: 'yes',
          }}
        />
      )
    },
    {
      name: 'with validation errors',
      story: () => (
        <ChangeUserTypeForm
          {...DEFAULT_PROPS}
          values={{
            currentEmail: 'robin@bat.cave',
            emailOptIn: 'no',
          }}
          validationErrors={{
            currentEmail: "Robin, get out of here!",
            emailOptIn: 'No email for you.',
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
            emailOptIn: 'yes',
          }}
          disabled={true}
        />
      )
    }
  ]);

