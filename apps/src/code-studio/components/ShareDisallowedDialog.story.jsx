import React from 'react';
import { UnconnectedShareDisallowedDialog as ShareDisallowedDialog } from './ShareDisallowedDialog';

export default storybook => {
  storybook
    .storiesOf('ShareDisallowedDialog', module)
    .addStoryTable([
      {
        name: 'basic example',
        story: () => (
          <ShareDisallowedDialog
            isOpen={true}
            hideShareDialog={() => {}}
          />
        )
      }
    ]);
};
