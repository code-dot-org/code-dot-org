import {Button, Typography} from '@mui/material';
import React, {useMemo, useState} from 'react';

import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';

import AddItemButton from './AddItemButton';
import QuizQuestionCard from './QuizQuestionCard';
import {QuizBuilderQuestion} from './types';
import useQuizBuilderQuestions from './useQuizBuilderQuestions';

import styles from './quiz-builder-workspace.module.scss';

interface QuizBuilderWorkspaceProps {
  levelId: number;
  quizTitle: string;
}

interface QuizPage {
  page: number;
  questions: QuizBuilderQuestion[];
}

// Groups the flat list into pages, ascending by page number.
// There's no UI yet to move an existing question to a different page, or to
// reorder or delete a page - a page exists only as long as it has a question.
function groupByPage(questions: QuizBuilderQuestion[]): QuizPage[] {
  const pages = new Map<number, QuizBuilderQuestion[]>();
  questions.forEach(question => {
    const page = question.page ?? 1;
    const pageQuestions = pages.get(page);
    if (pageQuestions) {
      pageQuestions.push(question);
    } else {
      pages.set(page, [question]);
    }
  });
  return Array.from(pages.entries())
    .sort(([a], [b]) => a - b)
    .map(([page, pageQuestions]) => ({page, questions: pageQuestions}));
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
    errorQuestionId,
    createQuestion,
    updateQuestion,
    removeQuestion,
  } = useQuizBuilderQuestions(levelId);
  // Only one card is expanded at a time - opening one collapses whichever
  // was open before it. A create opens the just-created question straight
  // into editing.
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const pages = useMemo(() => groupByPage(questions), [questions]);

  const handleCreate = async (page: number) => {
    const id = await createQuestion(page);
    if (id !== undefined) {
      setExpandedId(id);
    }
  };

  let outline: React.ReactNode;
  if (isLoading) {
    outline = <Typography variant="body2">Loading questions…</Typography>;
  } else if (questions.length === 0) {
    outline = (
      <>
        <Typography variant="body2">This quiz has no questions yet.</Typography>
        <Button
          className={styles.createButton}
          variant="contained"
          color="primary"
          type="button"
          loading={isCreating}
          disabled={isCreating}
          onClick={() => handleCreate(1)}
        >
          + Create question
        </Button>
      </>
    );
  } else {
    // A page only exists because a placement references it - there's no
    // separate page entity, so starting one just means creating its first
    // question one past the last page currently in use.
    const nextPage = pages[pages.length - 1].page + 1;
    outline = (
      <div className={styles.pages}>
        {pages.map(({page, questions: pageQuestions}) => (
          <div key={page} className={styles.page}>
            <div className={styles.pageHeader}>
              <Typography variant="overline3" className={styles.pageLabel}>
                Page {page}
              </Typography>
              <Typography variant="body3" component="span">
                {questionCountLabel(pageQuestions.length)}
              </Typography>
            </div>
            <ol className={styles.list}>
              {pageQuestions.map(question => (
                <li key={question.id}>
                  <QuizQuestionCard
                    question={question}
                    isExpanded={question.id === expandedId}
                    onExpandedChange={expanded =>
                      setExpandedId(expanded ? question.id : null)
                    }
                    error={question.id === errorQuestionId ? error : null}
                    onUpdate={updateQuestion}
                    onRemove={removeQuestion}
                  />
                </li>
              ))}
            </ol>
            <AddItemButton
              label="Create question"
              onClick={() => handleCreate(page)}
              disabled={isCreating}
              loading={isCreating}
            />
          </div>
        ))}
        <Button
          className={styles.addPageButton}
          variant="text"
          color="secondary"
          size="extraSmall"
          type="button"
          disabled={isCreating}
          onClick={() => handleCreate(nextPage)}
        >
          + Add page
        </Button>
      </div>
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
      </div>
    </PanelContainer>
  );
};

function questionCountLabel(count: number): string {
  return count === 1 ? '1 question' : `${count} questions`;
}

export default QuizBuilderWorkspace;
