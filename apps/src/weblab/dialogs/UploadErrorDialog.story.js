import React from 'react';
import {action} from '@storybook/addon-actions';
import UploadErrorDialog from './UploadErrorDialog';

export default storybook => {
  storybook
    .storiesOf('Weblab/dialogs/UploadErrorDialog', module)
    .addStoryTable([
      {
        name: 'default',
        story: () => (
          <UploadErrorDialog
            isOpen
            handleClose={action('close')}
            hideBackdrop
          />
        )
      }
    ]);
};
