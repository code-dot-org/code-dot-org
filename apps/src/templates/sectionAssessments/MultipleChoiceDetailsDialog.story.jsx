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
            questionAndAnswers={{
              question: "Hello world. I display *markdown* questions in a dialog.",
              answers: [
                {text: "I'm an answer", letter: 'A', correct: true},
                {text: "I'm another answer", letter: 'B', correct: false},
              ],
            }}
          />
        )
      }
    ]);
};
