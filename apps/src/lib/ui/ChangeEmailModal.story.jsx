import React from 'react';
import ChangeEmailModal from './ChangeEmailModal';
import {action} from '@storybook/addon-actions';

export default storybook => storybook
  .storiesOf('ChangeEmailModal', module)
  .add('overview', () => {
    const railsForm = document.createElement('form');
    return (
      <ChangeEmailModal
        isOpen
        handleSubmit={action('handleSubmit callback')}
        handleCancel={action('handleCancel callback')}
        railsForm={railsForm}
        userAge={21}
      />
    );
  });

