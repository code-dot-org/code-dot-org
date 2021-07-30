import React from 'react';
import {action} from '@storybook/addon-actions';
import ResetSuccessDialog from './ResetSuccessDialog';

export default storybook => {
  storybook
    .storiesOf('Weblab/dialogs/ResetSuccessDialog', module)
    .addStoryTable([
      {
        name: 'default',
        story: () => (
          <ResetSuccessDialog
            isOpen
            handleClose={action('close')}
            hideBackdrop
          />
        )
      }
    ]);
};
