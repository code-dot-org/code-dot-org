import React from 'react';
import ChangeEmailModal from './ChangeEmailModal';
import {action} from '@storybook/addon-actions';

export default storybook => storybook
  .storiesOf('ChangeEmailModal', module)
  .add('student view', () => (
    <ChangeEmailModal
      handleSubmit={action('handleSubmit callback')}
      handleCancel={action('handleCancel callback')}
      isPasswordRequired={true}
      userType="student"
    />
  ))
  .add('teacher view', () => (
    <ChangeEmailModal
      handleSubmit={action('handleSubmit callback')}
      handleCancel={action('handleCancel callback')}
      isPasswordRequired={true}
      userType="teacher"
    />
  ));
