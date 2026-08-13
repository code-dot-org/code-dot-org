import React from 'react';

import {LabProps, LevelProperties} from '@cdo/apps/lab2/types';

interface QuizQuestionSummary {
  id: number;
  questionName: string;
  explanation?: string;
}

interface QuizLevelProperties extends LevelProperties {
  quizQuestions?: QuizQuestionSummary[];
}

// Stub view for the new Quiz lab2 level type. No real quiz-taking UI yet -
// this exists only so a Quiz level can be viewed without crashing while the
// backend model (QuizQuestion/QuizAttempt/etc.) is built out. See
// dashboard/app/models/levels/quiz.rb.
const Quiz: React.FunctionComponent<LabProps> = ({levelProperties}) => {
  const {quizQuestions} = levelProperties as QuizLevelProperties;

  return (
    <div id="quiz-lab">
      <p>Quiz: {levelProperties.name} (not yet implemented)</p>
      <ul>
        {(quizQuestions || []).map(question => (
          <li key={question.id}>{question.questionName}</li>
        ))}
      </ul>
    </div>
  );
};

export default Quiz;
