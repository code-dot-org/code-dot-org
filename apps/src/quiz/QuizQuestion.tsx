import RadioButton from '@code-dot-org/component-library/radioButton';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import styles from './quiz-question.module.scss';

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

// Present only once the attempt is submitted and the quiz's
// show_correctness/reveal_answer_explanation settings allow it - see
// QuizAttempt#question_results. Absent otherwise, including while the
// student is still taking the quiz.
export interface QuizQuestionResult {
  correct: boolean;
  explanation?: string;
  correctChoiceId?: string;
}

interface QuizQuestionProps {
  question: QuizQuestionSummary;
  // 0-indexed position within the questions the student is taking, for the
  // "Question X of Y" eyebrow.
  index: number;
  total: number;
  selectedChoiceId?: string;
  disabled: boolean;
  result?: QuizQuestionResult;
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
  result,
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
          // The student's own selection gets a correct/incorrect style
          // (show_correctness). The actual correct choice, if reveal_
          // answer_explanation additionally allows it, gets marked correct
          // too even when it isn't what the student picked - otherwise an
          // incorrect answer would show an explanation without ever
          // revealing what the right answer actually was.
          const isGradedSelection = isChecked && !!result;
          const isRevealedCorrectChoice =
            !isChecked && result?.correctChoiceId === choice.id;
          return (
            <div
              key={choice.id}
              className={classNames(
                styles.answerOption,
                isChecked && !result && styles.answerOptionChecked,
                isGradedSelection &&
                  (result.correct
                    ? styles.answerOptionCorrect
                    : styles.answerOptionIncorrect),
                isRevealedCorrectChoice && styles.answerOptionCorrect
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

    {result && (
      <div className={styles.resultSection}>
        <Typography
          variant="body2"
          className={
            result.correct ? styles.resultCorrect : styles.resultIncorrect
          }
        >
          {result.correct ? 'Correct' : 'Incorrect'}
        </Typography>
        {result.explanation && (
          <Typography variant="body3" className={styles.resultExplanation}>
            {result.explanation}
          </Typography>
        )}
      </div>
    )}
  </li>
);

export default QuizQuestion;
