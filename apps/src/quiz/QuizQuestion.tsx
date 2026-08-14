import RadioButton from '@code-dot-org/component-library/radioButton';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import styles from './QuizQuestion.module.scss';

export interface QuizChoice {
  id: string;
  text: string;
}

export interface QuizQuestionSummary {
  id: number;
  type: string;
  questionName: string;
  stem?: string;
  choices?: QuizChoice[];
  explanation?: string;
}

interface QuizQuestionProps {
  question: QuizQuestionSummary;
  // 0-indexed position within the questions the student is taking, for the
  // "Question X of Y" eyebrow.
  index: number;
  total: number;
  selectedChoiceId?: string;
  disabled: boolean;
  onSelectChoice: (choiceId: string) => void;
}

// One question within the quiz-taking flow: the "Question X of Y" eyebrow,
// stem, and answer choice cards. P0 is multiple choice only - see the filter
// in Quiz.tsx's quiz-taking view; this only knows how to render `choices`,
// not free-response/multi-select.
const QuizQuestion: React.FunctionComponent<QuizQuestionProps> = ({
  question,
  index,
  total,
  selectedChoiceId,
  disabled,
  onSelectChoice,
}) => (
  <li className={styles.questionSection}>
    <Typography variant="overline3" className={styles.questionEyebrow}>
      Question {index + 1} of {total}
    </Typography>
    <Typography variant="h6">
      {question.stem || question.questionName}
    </Typography>

    {question.choices && (
      <fieldset className={styles.answers}>
        <legend className={styles.answersLegend}>Answer options</legend>
        {question.choices.map(choice => {
          const isChecked = selectedChoiceId === choice.id;
          return (
            <div
              key={choice.id}
              className={classNames(
                styles.answerOption,
                isChecked && styles.answerOptionChecked
              )}
            >
              <RadioButton
                checked={isChecked}
                name={`question-${question.id}`}
                value={choice.id}
                disabled={disabled}
                onChange={() => onSelectChoice(choice.id)}
              >
                <Typography
                  variant="body2"
                  component="span"
                  className={styles.answerOptionLetter}
                >
                  {choice.id.toUpperCase()}.
                </Typography>
                <Typography variant="body2" component="span">
                  {choice.text}
                </Typography>
              </RadioButton>
            </div>
          );
        })}
      </fieldset>
    )}
  </li>
);

export default QuizQuestion;
