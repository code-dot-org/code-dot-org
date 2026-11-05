import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button, Typography} from '@mui/material';
import React, {useCallback, useMemo, useState} from 'react';

import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';

import QuizMetadataList from '../QuizMetadataList';
import {QuizQuestionType} from '../types';
import {groupByPage} from '../utils';

import {EMPTY_PAGE_REASON, UNSAVED_QUESTION_REASON} from './constants';
import CreateQuestionDropdown from './CreateQuestionDropdown';
import DisabledReason, {ariaDisabledProps} from './DisabledReason';
import IntroScreenCard from './IntroScreenCard';
import {QuizConfigurationData} from './QuizConfigurationPanel';
import QuizPageBlock from './QuizPageBlock';
import QuizQuestionCard from './QuizQuestionCard';
import {isPendingQuestionId} from './types';
import useQuizBuilderQuestions from './useQuizBuilderQuestions';

import styles from './quiz-builder-workspace.module.scss';

interface QuizBuilderWorkspaceProps {
  levelId: number;
  quizTitle: string;
  showIntroScreen: boolean;
  customIntroText: string;
  timeLimitMinutes?: number;
  allowMultipleAttempts: boolean;
  onSaveQuizConfig: (fields: Partial<QuizConfigurationData>) => Promise<void>;
}

const QuizBuilderWorkspace: React.FunctionComponent<
  QuizBuilderWorkspaceProps
> = ({
  levelId,
  quizTitle,
  showIntroScreen,
  customIntroText,
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
  const [dirtyIds, setDirtyIds] = useState<ReadonlySet<number>>(new Set());
  const setQuestionDirty = useCallback((id: number, isDirty: boolean) => {
    setDirtyIds(prev => {
      if (prev.has(id) === isDirty) {
        return prev;
      }
      const next = new Set(prev);
      if (isDirty) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);
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
  const isEmptyQuiz = questions.length === 0 && addedEmptyPage === null;
  const createDisabledReason = hasPendingQuestion
    ? UNSAVED_QUESTION_REASON
    : undefined;
  const addPageDisabledReason =
    createDisabledReason ??
    (addedEmptyPage !== null ? EMPTY_PAGE_REASON : undefined);

  const handleCreate = (page: number, type: QuizQuestionType) => {
    setExpandedId(addPendingQuestion(page, type));
    if (page === addedEmptyPage) {
      setAddedEmptyPage(null);
    }
  };

  let outline: React.ReactNode;
  if (isLoading) {
    outline = <Typography variant="body2">Loading questions…</Typography>;
  } else if (isEmptyQuiz) {
    outline = (
      <div className={styles.emptyQuiz}>
        <span className={styles.emptyQuizIcon} aria-hidden>
          <FontAwesomeV6Icon iconName="clipboard-question" iconStyle="solid" />
        </span>
        <Typography
          variant="body1"
          component="h2"
          className={styles.emptyQuizTitle}
        >
          This quiz is empty
        </Typography>
        <Typography
          variant="body3"
          component="p"
          className={styles.emptyQuizBody}
        >
          Start by creating a new question.
        </Typography>
        <CreateQuestionDropdown
          name="create-question-empty"
          onCreate={type => handleCreate(1, type)}
        />
      </div>
    );
  } else {
    const nextPage = pages[pages.length - 1].page + 1;
    outline = (
      <>
        {pages.map(({page, questions: pageQuestions}) => (
          <QuizPageBlock
            key={page}
            page={page}
            questionCount={pageQuestions.length}
            onCreate={type => handleCreate(page, type)}
            createDisabledReason={createDisabledReason}
            hasUnsavedQuestion={pageQuestions.some(question =>
              dirtyIds.has(question.id)
            )}
          >
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
                  onDirtyChange={setQuestionDirty}
                />
              </li>
            ))}
          </QuizPageBlock>
        ))}
        <div className={styles.addPageSlot}>
          <DisabledReason reason={addPageDisabledReason}>
            <Button
              variant="outlined"
              color="secondary"
              size="extraSmall"
              type="button"
              onClick={() => setAddedEmptyPage(nextPage)}
              startIcon={<FontAwesomeV6Icon iconName="plus" />}
              {...ariaDisabledProps(addPageDisabledReason)}
            >
              Add page
            </Button>
          </DisabledReason>
        </div>
      </>
    );
  }

  return (
    <PanelContainer id="quiz-workspace" headerContent="Workspace">
      <div className={styles.workspace}>
        <header className={styles.header}>
          <Typography variant="h2" component="h1" className={styles.title}>
            {quizTitle || 'Untitled quiz'}
          </Typography>
          <QuizMetadataList
            questionCount={questions.length}
            timeLimitMinutes={timeLimitMinutes}
            allowMultipleAttempts={allowMultipleAttempts}
            iconClassName={styles.metaIcon}
          />
        </header>

        {/* A question-specific error shows on that question's card instead - see error prop below. */}
        {error && errorQuestionId === null && (
          <Typography variant="body2" color="error" role="alert">
            {error}
          </Typography>
        )}

        <section className={styles.outline} aria-label="Quiz outline">
          {showIntroScreen && (
            <IntroScreenCard
              customIntroText={customIntroText}
              hasTimeLimit={!!timeLimitMinutes}
              onSave={onSaveQuizConfig}
            />
          )}
          {outline}
        </section>
      </div>
    </PanelContainer>
  );
};

export default QuizBuilderWorkspace;
