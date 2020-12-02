import React from 'react';
import AddParentEmailModal from './AddParentEmailModal';
import {action} from '@storybook/addon-actions';

export default storybook =>
  storybook
    .storiesOf('AddParentEmailModal', module)
    .add('view with no current parent email', () => (
      <AddParentEmailModal
        handleSubmit={action('handleSubmit callback')}
        handleCancel={action('handleCancel callback')}
      />
    ))
    .add('view with current parent email', () => (
      <AddParentEmailModal
        handleSubmit={action('handleSubmit callback')}
        handleCancel={action('handleCancel callback')}
        currentParentEmail={'minerva@hogwarts.edu'}
      />
    ));
