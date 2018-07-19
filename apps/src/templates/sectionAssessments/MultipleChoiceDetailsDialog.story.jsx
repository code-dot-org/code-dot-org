import React from 'react';
import {UnconnectedMultipleChoiceDetailsDialog} from './MultipleChoiceDetailsDialog';

export default storybook => {
  return storybook
    .storiesOf('Dialogs/MultipleChoiceDetailsDialog', module)
    .addStoryTable([
      {
        name: 'MultipleChoiceDetailsDialog',
        description: 'Detail view of a multiple choice question',
        story: () => (
          <UnconnectedMultipleChoiceDetailsDialog
            isDialogOpen={true}
            closeDialog={() => {}}
            questionText={"Hello world. I display *markdown* questions."}
          />
        )
      }
    ]);
};
