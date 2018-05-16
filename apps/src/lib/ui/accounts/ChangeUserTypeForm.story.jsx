import React from 'react';
import ChangeUserTypeForm from './ChangeUserTypeForm';
import {action} from '@storybook/addon-actions';

const DEFAULT_PROPS = {
  targetUserType: 'teacher',
  values: {
    newEmail: '',
  },
  validationErrors: {
    newEmail: undefined,
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
          targetUserType="teacher"
          values={{
            currentEmail: 'batman@bat.cave',
          }}
        />
      )
    },
    {
      name: 'convert teacher to student account',
      story: () => (
        <ChangeUserTypeForm
          {...DEFAULT_PROPS}
          targetUserType="student"
          values={{
            currentEmail: 'batman@bat.cave',
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
          }}
          validationErrors={{
            currentEmail: "Robin, get out of here!",
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
          }}
          disabled={true}
        />
      )
    }
  ]);

