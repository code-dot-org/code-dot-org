import React from 'react';
import {action} from '@storybook/addon-actions';
import FatalErrorDialog from './FatalErrorDialog';

export default storybook => {
  storybook.storiesOf('Weblab/dialogs/FatalErrorDialog', module).addStoryTable([
    {
      name: 'default',
      story: () => (
        <FatalErrorDialog
          isOpen
          errorMessage="Web Lab failed to load"
          handleClose={action('close')}
          handleResetProject={action('resetting project')}
          hideBackdrop
        />
      )
    }
  ]);
};
