import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button, buttonClasses, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {MutableRefObject, useCallback, useEffect, useState} from 'react';
import {createPortal} from 'react-dom';

import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';

import QuizMetadataList from '../QuizMetadataList';
import {QuizQuestionType} from '../types';

import {
  EMPTY_PAGE_REASON,
  editedQuestionsReason,
  NO_CHANGES_REASON,
  QUIZ_BUILDER_HEADER_ID,
  UNSAVED_QUESTION_REASON,
} from './constants';
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
  quizVersion: MutableRefObject<number | null>;
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
  quizVersion,
  quizTitle,
  showIntroScreen,
  customIntroText,
  timeLimitMinutes,
  allowMultipleAttempts,
  onSaveQuizConfig,
}) => {
  const {
    questions,
    pages,
    isLoading,
    isSavingQuiz,
    error,
    errorQuestionId,
    hasUnsavedLayout,
    addPage,
    addPendingQuestion,
    saveQuestion,
    removeQuestion,
    saveQuiz,
  } = useQuizBuilderQuestions(levelId, quizVersion);
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
  const isEmptyQuiz = pages.length === 0;
  const createDisabledReason = hasPendingQuestion
    ? UNSAVED_QUESTION_REASON
    : undefined;
  const addPageDisabledReason =
    createDisabledReason ??
    (pages.some(page => page.questions.length === 0)
      ? EMPTY_PAGE_REASON
      : undefined);

  const editedCount = [...dirtyIds].filter(
    id => !isPendingQuestionId(id)
  ).length;
  const saveDisabledReason = hasPendingQuestion
    ? UNSAVED_QUESTION_REASON
    : editedCount > 0
    ? editedQuestionsReason(editedCount)
    : !hasUnsavedLayout
    ? NO_CHANGES_REASON
    : undefined;

  const hasUnsavedChanges = hasUnsavedLayout || dirtyIds.size > 0;
  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [hasUnsavedChanges]);

  // Save quiz goes in a slot in the page header (_header.html.haml).
  const [headerSlot] = useState(() =>
    document.getElementById(QUIZ_BUILDER_HEADER_ID)
  );
  const saveButton = (
    <DisabledReason reason={isSavingQuiz ? undefined : saveDisabledReason}>
      <Button
        variant="outlined"
        color="secondary"
        size="extraSmall"
        type="button"
        onClick={() => saveQuiz()}
        disabled={isSavingQuiz}
        startIcon={<FontAwesomeV6Icon iconName="floppy-disk" />}
        {...ariaDisabledProps(isSavingQuiz ? undefined : saveDisabledReason)}
        // After the spread, which sets its own className when disabled.
        className={classNames(
          styles.headerSaveButton,
          saveDisabledReason && !isSavingQuiz && buttonClasses.disabled
        )}
      >
        {isSavingQuiz ? 'Saving…' : 'Save quiz'}
      </Button>
    </DisabledReason>
  );

  const handleCreate = (page: number, type: QuizQuestionType) => {
    setExpandedId(addPendingQuestion(page, type));
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
                  page={page}
                  isExpanded={question.id === expandedId}
                  onExpandedChange={expanded =>
                    setExpandedId(expanded ? question.id : null)
                  }
                  error={question.id === errorQuestionId ? error : null}
                  onSave={saveQuestion}
                  // Until removal offers Remove from quiz or Delete, it deletes
                  // if unused.
                  onRemove={id => removeQuestion(id, {permanently: true})}
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
              onClick={addPage}
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
      {headerSlot && createPortal(saveButton, headerSlot)}
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
