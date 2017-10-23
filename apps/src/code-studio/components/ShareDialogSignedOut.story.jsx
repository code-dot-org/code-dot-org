import React from 'react';
import { UnconnectedShareDialogSignedOut as ShareDialogSignedOut } from './ShareDialogSignedOut';

export default storybook => {
  storybook
    .storiesOf('ShareDialogSignedOut', module)
    .addStoryTable([
      {
        name: 'basic example',
        story: () => (
          <ShareDialogSignedOut
            isOpen={true}
            hideShareDialog={() => {}}
          />
        )
      }
    ]);
};
