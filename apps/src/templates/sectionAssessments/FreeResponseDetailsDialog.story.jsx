import React from 'react';
import {UnconnectedFreeResponseDetailsDialog} from '@cdo/apps/templates/sectionAssessments/FreeResponseDetailsDialog';

export default storybook => {
  return storybook
    .storiesOf('Dialogs/FreeResponseDetailsDialog', module)
    .addStoryTable([
      {
        name: 'FreeResponseDetailsDialog',
        description: 'Detail view of a free response question',
        story: () => (
          <UnconnectedFreeResponseDetailsDialog
            isDialogOpen={true}
            closeDialog={() => {}}
            questionAndAnswers={{
              question: "Hello world. I display *markdown* questions in a dialog.",
              answers: [],
            }}
          />
        )
      }
    ]);
};
