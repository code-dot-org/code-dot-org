import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button, Typography} from '@mui/material';
import React, {useMemo, useState} from 'react';

import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';

import {groupByPage} from '../utils';

import AddItemButton from './AddItemButton';
import IntroScreenCard from './IntroScreenCard';
import {QuizConfigurationData} from './QuizConfigurationPanel';
import QuizQuestionCard from './QuizQuestionCard';
import {isPendingQuestionId} from './types';
import useQuizBuilderQuestions from './useQuizBuilderQuestions';

import styles from './quiz-builder-workspace.module.scss';

interface QuizBuilderWorkspaceProps {
  levelId: number;
  quizTitle: string;
  showIntroScreen: boolean;
  customIntroText: string;
  hasTimeLimit: boolean;
  onSaveQuizConfig: (fields: Partial<QuizConfigurationData>) => Promise<void>;
}

// The center column: the quiz's question outline plus a create action.
// Each row is a QuizQuestionCard, expandable in place for editing.
const QuizBuilderWorkspace: React.FunctionComponent<
  QuizBuilderWorkspaceProps
> = ({
  levelId,
  quizTitle,
  showIntroScreen,
  customIntroText,
  hasTimeLimit,
  onSaveQuizConfig,
}) => {
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
  const hasPendingQuestion = questions.some(question =>
    isPendingQuestionId(question.id)
  );
  const pages = useMemo(() => groupByPage(questions), [questions]);

  const handleCreate = (page: number) => {
    setExpandedId(addPendingQuestion(page));
  };

  let outline: React.ReactNode;
  if (isLoading) {
    outline = <Typography variant="body2">Loading questions…</Typography>;
  } else if (questions.length === 0) {
    outline = (
      <Typography variant="body2">This quiz has no questions yet.</Typography>
    );
  } else {
    const nextPage = pages[pages.length - 1].page + 1;
    outline = (
      <div className={styles.pages}>
        {pages.map(({page, questions: pageQuestions}) => {
          const pageHasPendingQuestion = pageQuestions.some(question =>
            isPendingQuestionId(question.id)
          );
          return (
            <div key={page} className={styles.page}>
              <div className={styles.pageHeader}>
                <Typography variant="overline2" className={styles.pageLabel}>
                  Page {page}
                </Typography>
                <FontAwesomeV6Icon
                  iconName="circle"
                  iconStyle="solid"
                  className={styles.pageHeaderDot}
                />
                <Typography variant="body4" component="span">
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
                      onSave={saveQuestion}
                      onRemove={removeQuestion}
                    />
                  </li>
                ))}
              </ol>
              <AddItemButton
                label="Create question"
                onClick={() => handleCreate(page)}
                disabled={hasPendingQuestion}
              />
              {pageHasPendingQuestion && (
                <Typography variant="body3" className={styles.createHint}>
                  Save or remove your new question before creating another.
                </Typography>
              )}
            </div>
          );
        })}
        <Button
          className={styles.addPageButton}
          variant="text"
          color="secondary"
          size="extraSmall"
          type="button"
          disabled={hasPendingQuestion}
          onClick={() => handleCreate(nextPage)}
          startIcon={<FontAwesomeV6Icon iconName="plus" />}
        >
          <Typography
            variant="overline2"
            component="span"
            className={styles.pageLabel}
          >
            Add page
          </Typography>
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

        {showIntroScreen && (
          <div className={styles.introScreen}>
            <IntroScreenCard
              customIntroText={customIntroText}
              hasTimeLimit={hasTimeLimit}
              onSave={onSaveQuizConfig}
            />
          </div>
        )}

        {outline}

        {questions.length === 0 && (
          <Button
            className={styles.createButton}
            variant="contained"
            color="primary"
            type="button"
            disabled={isLoading}
            onClick={() => handleCreate(1)}
          >
            + Create question
          </Button>
        )}
      </div>
    </PanelContainer>
  );
};

function questionCountLabel(count: number): string {
  return count === 1 ? '1 question' : `${count} questions`;
}

export default QuizBuilderWorkspace;
