import React from 'react';
import AddParentEmailModal from './AddParentEmailModal';
import {action} from '@storybook/addon-actions';

export default storybook =>
  storybook
    .storiesOf('AddParentEmailModal', module)
    .add('view', () => (
      <AddParentEmailModal
        handleSubmit={action('handleSubmit callback')}
        handleCancel={action('handleCancel callback')}
      />
    ));
