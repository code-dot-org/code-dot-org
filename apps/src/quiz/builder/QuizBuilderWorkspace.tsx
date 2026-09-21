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
    clearError,
  } = useQuizBuilderQuestions(levelId);
  // Only one card is expanded at a time - opening one collapses whichever
  // was open before it. A create opens the just-created question straight
  // into editing.
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleExpandedChange = (id: number, expanded: boolean) => {
    setExpandedId(expanded ? id : null);
    clearError();
  };

  const handleCreate = async () => {
    const id = await createQuestion();
    if (id !== undefined) {
      setExpandedId(id);
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
              isExpanded={question.id === expandedId}
              onExpandedChange={expanded =>
                handleExpandedChange(question.id, expanded)
              }
              error={question.id === expandedId ? error : null}
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

        {/* Once a card is expanded, its own footer shows this error instead - see error prop below. */}
        {error && expandedId === null && (
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
