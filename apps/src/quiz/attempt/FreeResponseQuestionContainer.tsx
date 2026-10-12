import React, {useState} from 'react';

import {QuizQuestionSummary} from '../types';

import AttemptCard from './AttemptCard';
import QuestionDescription from './QuestionDescription';

import styles from './free-response-question-container.module.scss';

export interface FreeResponseQuestionContainerProps {
  question: Omit<QuizQuestionSummary, 'page'>;
  // Omit for a quiz with only one question.
  questionLabel?: string;
}

// TODO: keep the answer in QuizAttemptWorkspace, passed down as a prop, and
// save it once the backend reads free response answers from response_data.
const FreeResponseQuestionContainer: React.FunctionComponent<
  FreeResponseQuestionContainerProps
> = ({question, questionLabel}) => {
  const [answer, setAnswer] = useState('');
  return (
    <AttemptCard
      label={questionLabel}
      title={question.questionTitle}
      description={<QuestionDescription markdown={question.description} />}
    >
      <textarea
        className={styles.answer}
        name={`question-${question.id}`}
        aria-label={question.questionTitle}
        rows={6}
        value={answer}
        onChange={e => setAnswer(e.target.value)}
      />
    </AttemptCard>
  );
};

export default FreeResponseQuestionContainer;
