import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button, buttonClasses, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback, useEffect, useState} from 'react';
import {createPortal} from 'react-dom';

import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';

import QuizMetadataList from '../QuizMetadataList';
import {QuizQuestionType} from '../types';

import {
  editedQuestionsReason,
  INVALID_CONFIG_REASON,
  LAST_PAGE_REASON,
  NO_CHANGES_REASON,
  PAGE_HAS_QUESTIONS_REASON,
  QUESTION_HAS_CHANGES_REASON,
  QUIZ_BUILDER_HEADER_ID,
  QUIZ_LOAD_FAILED_REASON,
  QUIZ_LOADING_REASON,
  UNSAVED_QUESTION_REASON,
} from './constants';
import CreateQuestionDropdown from './CreateQuestionDropdown';
import DisabledReason, {ariaDisabledProps} from './DisabledReason';
import IntroScreenCard from './IntroScreenCard';
import PageMenu from './PageMenu';
import {changedConfigFields, configError, timeLimitError} from './quizConfig';
import QuizPageBlock from './QuizPageBlock';
import QuizQuestionCard from './QuizQuestionCard';
import QuestionMenu from './QuizQuestionCard/QuestionMenu';
import {isPendingQuestionId, QuizConfigurationData} from './types';
import useQuizBuilderQuestions from './useQuizBuilderQuestions';

import styles from './quiz-builder-workspace.module.scss';

interface QuizBuilderWorkspaceProps {
  levelId: number;
  quizTitle: string;
  // The configuration as edited so far, and as last saved.
  config: QuizConfigurationData;
  savedConfig: QuizConfigurationData;
  onConfigChange: (fields: Partial<QuizConfigurationData>) => void;
  // Called after Save quiz with the configuration fields it saved.
  onConfigSaved: (fields: Partial<QuizConfigurationData>) => void;
}

const QuizBuilderWorkspace: React.FunctionComponent<
  QuizBuilderWorkspaceProps
> = ({
  levelId,
  quizTitle,
  config,
  savedConfig,
  onConfigChange,
  onConfigSaved,
}) => {
  const {
    questions,
    pages,
    isLoading,
    hasLoaded,
    isSavingQuiz,
    error,
    errorQuestionId,
    hasUnsavedLayout,
    addPage,
    movePage,
    deletePage,
    moveQuestion,
    moveQuestionToPage,
    addPendingQuestion,
    saveQuestion,
    removeQuestion,
    saveQuiz,
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
  const isEmptyQuiz = pages.length === 0;
  const createDisabledReason = hasPendingQuestion
    ? UNSAVED_QUESTION_REASON
    : undefined;

  const changedConfig = changedConfigFields(savedConfig, config);
  const hasUnsavedConfig = Object.keys(changedConfig).length > 0;
  const editedCount = [...dirtyIds].filter(
    id => !isPendingQuestionId(id)
  ).length;
  const rearrangeDisabledReason = hasPendingQuestion
    ? UNSAVED_QUESTION_REASON
    : editedCount > 0
    ? editedQuestionsReason(editedCount)
    : undefined;
  const saveDisabledReason = isLoading
    ? QUIZ_LOADING_REASON
    : !hasLoaded
    ? QUIZ_LOAD_FAILED_REASON
    : hasPendingQuestion
    ? UNSAVED_QUESTION_REASON
    : editedCount > 0
    ? editedQuestionsReason(editedCount)
    : configError(config)
    ? INVALID_CONFIG_REASON
    : !hasUnsavedLayout && !hasUnsavedConfig
    ? NO_CHANGES_REASON
    : undefined;

  const handleSaveQuiz = async () => {
    // Configuration edited during the save stays unsaved.
    const sentConfig = changedConfig;
    if (await saveQuiz(sentConfig)) {
      onConfigSaved(sentConfig);
    }
  };

  const hasUnsavedChanges =
    hasUnsavedLayout || hasUnsavedConfig || dirtyIds.size > 0;
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
        onClick={handleSaveQuiz}
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
            menu={
              <PageMenu
                page={page}
                canMoveUp={page > 1}
                canMoveDown={page < pages.length}
                deleteDisabledReason={
                  pageQuestions.length > 0
                    ? PAGE_HAS_QUESTIONS_REASON
                    : pages.length === 1
                    ? LAST_PAGE_REASON
                    : undefined
                }
                rearrangeDisabledReason={rearrangeDisabledReason}
                onMove={offset => movePage(page, offset)}
                onAddPage={addPage}
                onDelete={() => deletePage(page)}
              />
            }
          >
            {pageQuestions.map((question, index) => (
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
                  menu={isBusy => (
                    <QuestionMenu
                      isBusy={isBusy}
                      name={`question-menu-${question.id}`}
                      canMoveUp={index > 0}
                      canMoveDown={index < pageQuestions.length - 1}
                      otherPages={pages
                        .map(({page: otherPage}) => otherPage)
                        .filter(otherPage => otherPage !== page)}
                      // Moving to another page remounts the card, which
                      // would lose its draft.
                      moveToPageDisabledReason={
                        !dirtyIds.has(question.id)
                          ? undefined
                          : isPendingQuestionId(question.id)
                          ? UNSAVED_QUESTION_REASON
                          : QUESTION_HAS_CHANGES_REASON
                      }
                      onMove={offset => moveQuestion(question.id, offset)}
                      onMoveToPage={toPage =>
                        moveQuestionToPage(question.id, toPage)
                      }
                      onRemove={() =>
                        removeQuestion(question.id, {permanently: true})
                      }
                    />
                  )}
                />
              </li>
            ))}
          </QuizPageBlock>
        ))}
        <div className={styles.addPageSlot}>
          <Button
            variant="outlined"
            color="secondary"
            size="extraSmall"
            type="button"
            onClick={() => addPage()}
            startIcon={<FontAwesomeV6Icon iconName="plus" />}
          >
            Add page
          </Button>
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
            timeLimitMinutes={
              timeLimitError(config)
                ? undefined
                : config.timeLimitMinutes ?? undefined
            }
            allowMultipleAttempts={config.allowMultipleAttempts}
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
          {config.showIntroScreen && (
            <IntroScreenCard
              customIntroText={config.customIntroText ?? ''}
              savedCustomIntroText={savedConfig.customIntroText ?? ''}
              hasTimeLimit={!!config.timeLimitMinutes}
              onChange={onConfigChange}
            />
          )}
          {outline}
        </section>
      </div>
    </PanelContainer>
  );
};

export default QuizBuilderWorkspace;
