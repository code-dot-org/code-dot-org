import React from 'react';
import GDPRDialog from './GDPRDialog';

export default storybook => {
  return storybook
    .storiesOf('Dialogs/GDPRDialog', module)
    .addStoryTable([
      {
        name: 'GDPR Dialog',
        description: 'Dialog shown to users in the EU to prompt them to accept the data transfer agreement',
        story: () => (
          <GDPRDialog
            isDialogOpen={true}
            currentUserId={12345}
          />
        )
      }
    ]);
};
