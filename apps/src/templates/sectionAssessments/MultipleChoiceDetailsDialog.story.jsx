import React from 'react';
import MultipleChoiceDetailsDialog from './MultipleChoiceDetailsDialog';

export default storybook => {
  return storybook
    .storiesOf('Dialogs/MultipleChoiceDetailsDialog', module)
    .addStoryTable([
      {
        name: 'MultipleChoiceDetailsDialog',
        description: 'Detail view of a multiple choice question',
        story: () => (
          <MultipleChoiceDetailsDialog
            isDialogOpen={true}
            closeDialog={() => {}}
            questionText={"Hello world. I display *markdown* questions."}
          />
        )
      }
    ]);
};
