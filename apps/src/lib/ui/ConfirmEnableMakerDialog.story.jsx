import React from 'react';
import {ConfirmEnableMakerDialog} from './ConfirmEnableMakerDialog';
import {action} from '@storybook/addon-actions';

export default storybook => {
  return storybook
      .storiesOf('MakerToolkit/ConfirmEnableMakerDialog', module)
      .add('overview', () => {
        return (
          <ConfirmEnableMakerDialog
            isOpen
            handleConfirm={action('Confirm')}
            handleCancel={action('Cancel')}
          />
        );
      });
};
