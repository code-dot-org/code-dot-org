import React from 'react';
import {ConfirmEnableMakerDialog} from './ConfirmEnableMakerDialog';

export default storybook => {
  return storybook
      .storiesOf('ConfirmEnableMakerDialog', module)
      .add('overview', () => {
        return (
          <ConfirmEnableMakerDialog
            isOpen
            handleConfirm={storybook.action('Confirm')}
            handleCancel={storybook.action('Cancel')}
          />
        );
      });
};
