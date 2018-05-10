import React from 'react';
import ChangeEmailModal from './ChangeEmailModal';
import {action} from '@storybook/addon-actions';

export default storybook => storybook
  .storiesOf('ChangeEmailModal', module)
  .add('overview', () => (
    <ChangeEmailModal
      isOpen
      handleSubmit={action('handleSubmit callback')}
      handleCancel={action('handleCancel callback')}
      userAge={21}
    />
  ));

