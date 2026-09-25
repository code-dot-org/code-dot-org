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
    error,
    errorQuestionId,
    addPendingQuestion,
    saveQuestion,
    removeQuestion,
  } = useQuizBuilderQuestions(levelId);
  // Only one card is expanded at a time - opening one collapses whichever
  // was open before it. A create opens the just-created question straight
  // into editing.
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleCreate = () => {
    setExpandedId(addPendingQuestion());
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
                setExpandedId(expanded ? question.id : null)
              }
              error={question.id === errorQuestionId ? error : null}
              onSave={saveQuestion}
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

        {/* A question-specific error shows on that question's card instead - see error prop below. */}
        {error && errorQuestionId === null && (
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
          disabled={isLoading}
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
