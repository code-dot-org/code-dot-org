import React from 'react';
import {UnconnectedMatchDetailsDialog as MatchDetailsDialog} from './MatchDetailsDialog';

export default {
  title: 'MatchDetailsDialog',
  component: MatchDetailsDialog,
};

export const DetailView = () => (
  <MatchDetailsDialog
    isDialogOpen={true}
    closeDialog={() => {}}
    questionAndAnswers={{
      question: 'Which of these go together?',
      questionType: 'Match',
      answers: ["I'm an answer", "I'm another answer"],
      options: ["I'm an option", "I'm another option"],
    }}
  />
);
