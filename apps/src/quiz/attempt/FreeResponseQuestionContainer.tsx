import React from 'react';

import {QuizQuestionSummary} from '../types';

import AttemptCard from './AttemptCard';
import QuestionDescription from './QuestionDescription';

import styles from './free-response-question-container.module.scss';

export interface FreeResponseQuestionContainerProps {
  question: Omit<QuizQuestionSummary, 'page'>;
  // Omit for a quiz with only one question.
  questionLabel?: string;
  answerText: string;
  onChangeAnswerText: (answerText: string) => void;
  onBlur?: () => void;
  headingRef?: React.Ref<HTMLHeadingElement>;
  disabled?: boolean;
}

const FreeResponseQuestionContainer: React.FunctionComponent<
  FreeResponseQuestionContainerProps
> = ({
  question,
  questionLabel,
  answerText,
  onChangeAnswerText,
  onBlur,
  headingRef,
  disabled,
}) => (
  <AttemptCard
    label={questionLabel}
    title={question.questionTitle}
    headingRef={headingRef}
    description={<QuestionDescription markdown={question.description} />}
  >
    <textarea
      className={styles.answer}
      name={`question-${question.id}`}
      aria-label={question.questionTitle}
      rows={6}
      value={answerText}
      onChange={e => onChangeAnswerText(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
    />
  </AttemptCard>
);

export default FreeResponseQuestionContainer;
