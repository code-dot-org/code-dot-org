import {Button, Typography} from '@mui/material';
import React from 'react';

import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';

import {QuizBuilderQuestionsState, QuizQuestion} from './types';

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
      <Typography variant="body2">This quiz has no questions yet.</Typography>
    );
  } else {
    outline = (
      <ol className={styles.list}>
        {questions.map(question => (
          <li key={question.id} className={styles.row}>
            <Typography variant="overline3" component="span">
              {questionTypeLabel(question.type)}
            </Typography>
            <Typography variant="strong" component="span">
              {question.questionName}
            </Typography>
            <Typography
              variant="body3"
              component="span"
              className={styles.stem}
            >
              {question.stem}
            </Typography>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <PanelContainer id="quiz-workspace" headerContent="Workspace">
      <div className={styles.workspace}>
        <header className={styles.header}>
          <Typography variant="h5" component="h1">
            {quizTitle || 'Untitled quiz'}
          </Typography>
          <Typography variant="body3">
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
    </PanelContainer>
  );
};

function questionCountLabel(count: number): string {
  return count === 1 ? '1 question' : `${count} questions`;
}

// STI class name -> label. Multiple choice is the only type today.
function questionTypeLabel(type: QuizQuestion['type']): string {
  switch (type) {
    case 'MultipleChoiceQuestion':
      return 'Multiple choice';
    default:
      return type;
  }
}

export default QuizBuilderWorkspace;
