import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button, Typography, buttonClasses, Tooltip} from '@mui/material';
import React, {useMemo, useState} from 'react';

import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';

import {QuizQuestionType} from '../types';
import {groupByPage} from '../utils';

import {EMPTY_PAGE_REASON, UNSAVED_QUESTION_REASON} from './constants';
import CreateQuestionDropdown from './CreateQuestionDropdown';
import IntroScreenCard from './IntroScreenCard';
import {QuizConfigurationData} from './QuizConfigurationPanel';
import QuizPageBlock, {OutlineTick, questionCountLabel} from './QuizPageBlock';
import {isPendingQuestionId} from './types';
import useQuizBuilderQuestions from './useQuizBuilderQuestions';

import styles from './quiz-builder-workspace.module.scss';

interface QuizBuilderWorkspaceProps {
  levelId: number;
  quizTitle: string;
  showIntroScreen: boolean;
  customIntroText: string;
  hasTimeLimit: boolean;
  timeLimitMinutes?: number;
  allowMultipleAttempts: boolean;
  onSaveQuizConfig: (fields: Partial<QuizConfigurationData>) => Promise<void>;
}

function timeLimitLabel(minutes: number): string {
  return minutes === 1 ? '1 minute' : `${minutes} minutes`;
}

function attemptsLabel(allowMultipleAttempts: boolean): string {
  return allowMultipleAttempts ? 'Unlimited attempts' : '1 attempt';
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
  timeLimitMinutes,
  allowMultipleAttempts,
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
  // Pages aren't stored separately - each question's placement has a page number.
  // "Add page" keeps the new, still-empty page in local state until a question is created on it.
  const [addedEmptyPage, setAddedEmptyPage] = useState<number | null>(null);
  const pages = useMemo(() => {
    const pagesWithQuestions = groupByPage(questions);
    return addedEmptyPage === null
      ? pagesWithQuestions
      : [...pagesWithQuestions, {page: addedEmptyPage, questions: []}];
  }, [questions, addedEmptyPage]);
  // A single page of questions stays flat. An empty page, or a second page, uses page cards.
  const showPageChrome =
    pages.length > 1 || pages.some(group => group.questions.length === 0);
  const isEmptyQuiz = questions.length === 0 && addedEmptyPage === null;
  const createDisabledReason = hasPendingQuestion
    ? UNSAVED_QUESTION_REASON
    : undefined;
  const addPageDisabledReason =
    addedEmptyPage !== null ? EMPTY_PAGE_REASON : undefined;

  const handleCreate = (page: number, type: QuizQuestionType) => {
    setExpandedId(addPendingQuestion(page, type));
    if (page === addedEmptyPage) {
      setAddedEmptyPage(null);
    }
  };

  const renderAddPage = (nextPage: number) => (
    <div className={styles.addPageSlot}>
      <Tooltip
        describeChild
        title={addPageDisabledReason ?? ''}
        enterDelay={0}
        enterNextDelay={0}
      >
        <span>
          <Button
            variant="outlined"
            color="secondary"
            size="extraSmall"
            type="button"
            aria-disabled={!!addPageDisabledReason}
            className={
              addPageDisabledReason ? buttonClasses.disabled : undefined
            }
            onClick={() => {
              if (addPageDisabledReason) {
                return;
              }
              setAddedEmptyPage(nextPage);
            }}
            startIcon={<FontAwesomeV6Icon iconName="plus" />}
          >
            Add page
          </Button>
        </span>
      </Tooltip>
    </div>
  );

  const renderEmptyQuiz = () => (
    <div
      className={styles.emptyQuiz}
      role="region"
      aria-labelledby="quiz-empty-title"
      aria-describedby="quiz-empty-hint"
    >
      <Typography
        variant="h6"
        component="h2"
        id="quiz-empty-title"
        className={styles.emptyQuizTitle}
      >
        This quiz is empty
      </Typography>
      <Typography
        variant="body3"
        component="p"
        id="quiz-empty-hint"
        className={styles.emptyQuizBody}
      >
        Start by creating a new question or adding a page.
      </Typography>
      <div className={styles.emptyQuizActions}>
        <CreateQuestionDropdown
          name="create-question-empty"
          onCreate={type => handleCreate(1, type)}
          disabled={isLoading}
        />
        <Button
          variant="outlined"
          color="secondary"
          size="extraSmall"
          type="button"
          disabled={isLoading}
          onClick={() => setAddedEmptyPage(1)}
          startIcon={<FontAwesomeV6Icon iconName="plus" />}
        >
          New page
        </Button>
      </div>
    </div>
  );

  let outlineBody: React.ReactNode;
  if (isLoading) {
    outlineBody = <Typography variant="body2">Loading questions…</Typography>;
  } else if (isEmptyQuiz) {
    outlineBody = (
      <>
        {showIntroScreen && <OutlineTick size="block" />}
        {renderEmptyQuiz()}
      </>
    );
  } else {
    const nextPage = pages[pages.length - 1].page + 1;
    outlineBody = (
      <>
        {pages.map(({page, questions: pageQuestions}, pageIndex) => (
          <React.Fragment key={page}>
            {(showIntroScreen || pageIndex > 0) && <OutlineTick size="block" />}
            <QuizPageBlock
              page={page}
              questions={pageQuestions}
              chrome={showPageChrome}
              expandedId={expandedId}
              onExpandedChange={(questionId, expanded) =>
                setExpandedId(expanded ? questionId : null)
              }
              error={error}
              errorQuestionId={errorQuestionId}
              onSave={saveQuestion}
              onRemove={removeQuestion}
              onCreate={type => handleCreate(page, type)}
              createDisabledReason={createDisabledReason}
              onDismiss={
                page === addedEmptyPage
                  ? () => setAddedEmptyPage(null)
                  : undefined
              }
            />
          </React.Fragment>
        ))}
        <OutlineTick size="block" />
        {renderAddPage(nextPage)}
      </>
    );
  }

  return (
    <PanelContainer id="quiz-workspace" headerContent="Workspace">
      <div className={styles.workspace}>
        <div className={styles.inner}>
          <header className={styles.header}>
            <Typography variant="h2" component="h1" className={styles.title}>
              {quizTitle || 'Untitled quiz'}
            </Typography>
            <ul className={styles.metaRow} aria-label="Quiz details">
              <li className={styles.metaItem}>
                <FontAwesomeV6Icon
                  iconName="circle-question"
                  className={styles.metaIcon}
                  aria-hidden
                />
                <Typography variant="body3" component="span">
                  {questionCountLabel(questions.length)}
                </Typography>
              </li>
              {!!timeLimitMinutes && (
                <li className={styles.metaItem}>
                  <FontAwesomeV6Icon
                    iconName="clock"
                    className={styles.metaIcon}
                    aria-hidden
                  />
                  <Typography variant="body3" component="span">
                    {timeLimitLabel(timeLimitMinutes)}
                  </Typography>
                </li>
              )}
              <li className={styles.metaItem}>
                <FontAwesomeV6Icon
                  iconName={
                    allowMultipleAttempts ? 'infinity' : 'bullseye-arrow'
                  }
                  className={styles.metaIcon}
                  aria-hidden
                />
                <Typography variant="body3" component="span">
                  {attemptsLabel(allowMultipleAttempts)}
                </Typography>
              </li>
            </ul>
          </header>

          {error && errorQuestionId === null && (
            <Typography variant="body2" color="error" role="alert">
              {error}
            </Typography>
          )}

          <section className={styles.outline} aria-label="Quiz outline">
            {showIntroScreen && (
              <IntroScreenCard
                customIntroText={customIntroText}
                hasTimeLimit={hasTimeLimit}
                onSave={onSaveQuizConfig}
              />
            )}
            {outlineBody}
          </section>
        </div>
      </div>
    </PanelContainer>
  );
};

export default QuizBuilderWorkspace;
