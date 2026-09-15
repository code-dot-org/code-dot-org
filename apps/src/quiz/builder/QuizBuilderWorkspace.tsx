import {Button, Typography} from '@mui/material';
import React, {useState} from 'react';

import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';

import QuizQuestionCard from './QuizQuestionCard';
import useQuizBuilderQuestions from './useQuizBuilderQuestions';

import styles from './quiz-builder-workspace.module.scss';

interface QuizBuilderWorkspaceProps {
  levelId: number;
  quizTitle: string;
}

// The center column: the quiz's question outline plus a create action.
// Each row is a QuizQuestionCard, expandable in place for editing.
const QuizBuilderWorkspace: React.FunctionComponent<
  QuizBuilderWorkspaceProps
> = ({levelId, quizTitle}) => {
  const {
    questions,
    isLoading,
    isCreating,
    error,
    createQuestion,
    updateQuestion,
    removeQuestion,
  } = useQuizBuilderQuestions(levelId);
  // Opens the just-created question straight into editing, since a create
  // only ever seeds placeholder-but-valid content (see
  // NEW_QUESTION_DEFAULTS in useQuizBuilderQuestions).
  const [justCreatedId, setJustCreatedId] = useState<number | null>(null);

  const handleCreate = async () => {
    const id = await createQuestion();
    if (id !== undefined) {
      setJustCreatedId(id);
    }
  };

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
          <li key={question.id}>
            <QuizQuestionCard
              question={question}
              startExpanded={question.id === justCreatedId}
              onUpdate={updateQuestion}
              onRemove={removeQuestion}
            />
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
          onClick={handleCreate}
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

export default QuizBuilderWorkspace;
