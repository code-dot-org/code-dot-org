import React from 'react';
import ShareWarningsDialog from './ShareWarningsDialog';
import {action} from '@storybook/addon-actions';

export default storybook => {

  storybook
    .storiesOf('Dialogs/ShareWarningsDialog', module)
    .addStoryTable([
      {
        name:'ShareWarnings - age prompt, data alert',
        story: () => (
          <ShareWarningsDialog
            promptForAge={true}
            showStoreDataAlert={true}
            handleClose={action('close')}
            handleTooYoung={action('handleTooYoung')}
          />
        )
      },
      {
        name:'ShareWarnings - age prompt, no data alert',
        story: () => (
          <ShareWarningsDialog
            promptForAge={true}
            showStoreDataAlert={false}
            handleClose={action('close')}
            handleTooYoung={action('handleTooYoung')}
          />
        )
      },
      {
        name:'ShareWarnings - no age prompt, data alert',
        story: () => (
          <ShareWarningsDialog
            promptForAge={false}
            showStoreDataAlert={true}
            handleClose={action('close')}
            handleTooYoung={action('handleTooYoung')}
          />
        )
      },
    ]);
};
