import {Button, Typography} from '@mui/material';
import React from 'react';

import {
  QuizBuilderQuestion,
  QuizBuilderQuestionsState,
} from './useQuizBuilderQuestions';

import styles from './quiz-builder-workspace.module.scss';

interface QuizBuilderWorkspaceProps extends QuizBuilderQuestionsState {
  quizTitle: string;
}

// The center column: the quiz's question outline plus a create action.
// Rows are read-only for now - opening one to edit is a later step.
const QuizBuilderWorkspace: React.FunctionComponent<
  QuizBuilderWorkspaceProps
> = ({quizTitle, questions, isLoading, isCreating, error, createQuestion}) => {
  let outline: React.ReactNode;
  if (isLoading) {
    outline = <Typography variant="body2">Loading questions…</Typography>;
  } else if (questions.length === 0) {
    outline = (
      <Typography variant="body2" className={styles.empty}>
        This quiz has no questions yet.
      </Typography>
    );
  } else {
    outline = (
      <ol className={styles.list}>
        {questions.map(question => (
          <li key={question.id} className={styles.row}>
            <span className={styles.rowType}>
              {questionTypeLabel(question.type)}
            </span>
            <span className={styles.rowName}>{question.questionName}</span>
            <span className={styles.rowStem}>{question.stem}</span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className={styles.workspace}>
      <header className={styles.header}>
        <Typography variant="h5" component="h1">
          {quizTitle || 'Untitled quiz'}
        </Typography>
        <Typography variant="body2" className={styles.count}>
          {questionCountLabel(questions.length)}
        </Typography>
      </header>

      {error && (
        <Typography variant="body2" color="error" role="alert">
          {error}
        </Typography>
      )}

      {outline}

      <Button
        className={styles.createButton}
        variant="contained"
        color="primary"
        type="button"
        loading={isCreating}
        disabled={isLoading || isCreating}
        onClick={() => createQuestion()}
      >
        + Create question
      </Button>
    </div>
  );
};

function questionCountLabel(count: number): string {
  return count === 1 ? '1 question' : `${count} questions`;
}

// STI class name -> label. Multiple choice is the only type today.
function questionTypeLabel(type: QuizBuilderQuestion['type']): string {
  switch (type) {
    case 'MultipleChoiceQuestion':
      return 'Multiple choice';
    default:
      return type;
  }
}

export default QuizBuilderWorkspace;
