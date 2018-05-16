import React from 'react';
import ChangeUserTypeModal from './ChangeUserTypeModal';
import {action} from '@storybook/addon-actions';

export default storybook => storybook
  .storiesOf('ChangeUserTypeModal', module)
  .add('student becoming teacher', () => (
    <ChangeUserTypeModal
      handleSubmit={action('handleSubmit callback')}
      handleCancel={action('handleCancel callback')}
    />
  ));
