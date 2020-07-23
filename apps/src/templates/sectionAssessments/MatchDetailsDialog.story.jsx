import React from 'react';
import {UnconnectedMatchDetailsDialog} from './MatchDetailsDialog';

export default storybook => {
  return storybook
    .storiesOf('Dialogs/MatchDetailsDialog', module)
    .addStoryTable([
      {
        name: 'MatchDetailsDialog',
        description: 'Detail view of a match question',
        story: () => (
          <UnconnectedMatchDetailsDialog
            isDialogOpen={true}
            closeDialog={() => {}}
            questionAndAnswers={{
              question: 'Which of these go together?',
              questionType: 'Match',
              answers: ["I'm an answer", "I'm another answer"],
              options: ["I'm an option", "I'm another option"]
            }}
          />
        )
      }
    ]);
};
