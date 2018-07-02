import React from 'react';
import {UnconnectedControlProjectSharingDialog as ControlProjectSharingDialog} from './ControlProjectSharingDialog';

export default storybook => {
  storybook
    .storiesOf('ControlProjectSharingDialog', module)
    .addStoryTable([
      {
        name: 'Control Project Sharing Dialog',
        description: 'When the user clicks "Control project sharing" in the dropdown menu of the Manage Students Table, they will see this dialog.',
        story: () => (
          <ControlProjectSharingDialog
            isDialogOpen={true}
            closeDialog={() => console.log('click')}
            toggleSharingColumn={() => console.log('click')}
          />
        )
      },
    ]);
};
