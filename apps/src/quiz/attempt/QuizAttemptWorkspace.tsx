import {Button as MuiButton, Typography} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';

import {
  sendStartedReportIfNotStarted,
  sendSuccessReportForLevel,
} from '@cdo/apps/code-studio/progressRedux';
import {nextLevelId} from '@cdo/apps/code-studio/progressReduxSelectors';
import {navigateToNextLevelOrFinish} from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {AppName} from '@cdo/apps/lab2/types';
import TeacherViewingStudentProjectAlert from '@cdo/apps/lab2/views/alerts/teacherViewingStudentProject';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {QuizQuestionSummary} from '../types';
import {groupByPage, toBool} from '../utils';

import AttemptCard from './AttemptCard';
import IntroCard from './IntroCard';
import MultiChoiceQuestionContainer from './MultiChoiceQuestionContainer';
import PageDivider from './PageDivider';
import QuestionResultCard from './QuestionResultCard';
import QuizFooter from './QuizFooter';
import ResultsCard from './ResultsCard';
import {QuizAttemptData, QuizQuestionResult} from './types';
import useQuizAttempt from './useQuizAttempt';

import styles from './quiz-attempt-workspace.module.scss';

export interface QuizAttemptWorkspaceProps {
  levelId: number;
  appName: AppName;
  // Levelbuilders may leave displayName blank - falls back to this.
  levelName: string;
  // Attempt tracking only applies inside a unit.
  unitId: number | undefined;
  // Set when a teacher picks a student in the teacher panel to view their work.
  viewAsUserId?: number;
  quizQuestions: QuizQuestionSummary[];
  allowMultipleAttempts?: boolean;
  displayName?: string;
  customIntroText?: string;
  timeLimitMinutes?: number;
  showIntroScreen?: boolean;
  showCorrectness?: boolean;
  revealAnswerExplanation?: boolean;
  showQuestionsAfterSubmit?: boolean;
}

const QuizAttemptWorkspace: React.FunctionComponent<
  QuizAttemptWorkspaceProps
> = ({
  appName,
  levelId,
  levelName,
  unitId,
  viewAsUserId,
  quizQuestions,
  allowMultipleAttempts,
  displayName,
  customIntroText,
  timeLimitMinutes,
  showIntroScreen,
  showCorrectness,
  revealAnswerExplanation,
  showQuestionsAfterSubmit,
}) => {
  const dispatch = useAppDispatch();
  const {
    attempt,
    isLoading,
    error,
    beginAttempt,
    finishAttempt,
    submitQuestionResponse,
  } = useQuizAttempt({
    levelId,
    unitId,
    userId: viewAsUserId,
  });
  const isViewingStudent = viewAsUserId !== undefined;
  const hasNextLevel = useAppSelector(
    state => nextLevelId(state) !== undefined
  );

  // currentPageNumber is a 1-based position into this list, not a raw page value.
  const pageNumbers = Array.from(new Set(quizQuestions.map(q => q.page))).sort(
    (a, b) => a - b
  );
  const totalPages = pageNumbers.length || 1;
  // TODO: Add support for other question types.
  const mcQuestions = quizQuestions.filter(
    question => question.type === 'MultipleChoiceQuestion'
  );
  let resultQuestionNumber = 0;
  const resultPages = groupByPage(mcQuestions).map(({page, questions}) => {
    const firstQuestionNumber = resultQuestionNumber + 1;
    resultQuestionNumber += questions.length;
    return {
      page,
      questions,
      firstQuestionNumber,
      lastQuestionNumber: resultQuestionNumber,
    };
  });
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [selectedChoicesByQuestionId, setSelectedChoicesByQuestionId] =
    useState<Record<number, string>>({});
  // Retake goes back through the intro screen rather than starting a new
  // attempt immediately.
  const [isRetakeIntroOpen, setIsRetakeIntroOpen] = useState(false);
  // One chained promise per question, so a rapid second pick waits for the
  // first write to settle instead of racing it, and finishAttempt can wait
  // for all of them before the server locks the attempt.
  const pendingWritesByQuestionIdRef = useRef<Record<number, Promise<unknown>>>(
    {}
  );
  // The finish-time success report, so Next level can wait for it.
  const pendingReportRef = useRef<Promise<unknown>>(Promise.resolve());

  const questionsRef = useRef<HTMLDivElement>(null);
  const submittedRef = useRef<HTMLDivElement>(null);
  // Quiz views stay mounted across same-lab navigation, so a begin/finish
  // request can resolve after a different level is already current.
  // Gate progress reporting on this level instead.
  const currentLevelKeyRef = useRef(levelId);
  useEffect(() => {
    currentLevelKeyRef.current = levelId;
  }, [levelId]);
  const introRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selectedChoices: Record<number, string> = {};
    for (const result of attempt?.questionResultsInProgress ?? []) {
      selectedChoices[result.quizQuestionId] = result.selectedChoiceId;
    }
    setSelectedChoicesByQuestionId(selectedChoices);
    setCurrentPageNumber(1);
    setIsRetakeIntroOpen(false);
    pendingWritesByQuestionIdRef.current = {};
  }, [attempt?.id, attempt?.questionResultsInProgress]);

  const isAttemptInProgress =
    !isLoading && !!unitId && !!attempt && !attempt.submittedAt;
  const isIntroOpen =
    toBool(showIntroScreen) &&
    (!attempt || (!!attempt.submittedAt && isRetakeIntroOpen));
  // Also true when attempt is null, not just undefined - a quiz with no
  // intro screen tries to start the attempt automatically, and that can
  // fail too.
  const didInitialCheckForAttemptFail = !attempt && !!error;
  const hasNoAttemptYet = attempt === null;

  // Covers both the very first intro screen and Retake reopening it - either
  // way, the button that led here is gone, so hand focus to the heading.
  useEffect(() => {
    if (isIntroOpen) {
      introRef.current?.querySelector<HTMLElement>('h2')?.focus();
    }
  }, [isIntroOpen]);

  // Focus on the new page's heading when navigating to a new page.
  useEffect(() => {
    questionsRef.current?.querySelector<HTMLElement>('h2')?.focus();
  }, [currentPageNumber, isAttemptInProgress]);

  // Focus the heading first, like introRef - not a button, so the result
  // gets announced before a screen reader user reaches Try again/Next level.
  useEffect(() => {
    if (!attempt?.submittedAt) {
      return;
    }
    submittedRef.current?.querySelector<HTMLElement>('[tabindex]')?.focus();
  }, [attempt?.submittedAt]);

  const handleBeginAttempt = async () => {
    const requestLevelId = levelId;
    try {
      await beginAttempt();
      if (currentLevelKeyRef.current === requestLevelId) {
        dispatch(sendStartedReportIfNotStarted(appName));
      }
    } catch {
      // Already recorded as a user-facing error in useQuizAttempt.
    }
  };

  const handleFinishAttempt = async () => {
    // Send the student's current answers with submit, so grading is based
    // on what they see on screen rather than whatever autosave last landed.
    const responsesByQuestionId = Object.fromEntries(
      Object.entries(selectedChoicesByQuestionId).map(
        ([questionId, choiceId]) => [questionId, {selectedChoiceId: choiceId}]
      )
    );
    // Targets the level the attempt was for, not whichever quiz is current
    // by the time this resolves.
    const requestLevelId = levelId;
    try {
      await finishAttempt(responsesByQuestionId);
      pendingReportRef.current = Promise.resolve(
        dispatch(sendSuccessReportForLevel(requestLevelId.toString(), appName))
      );
    } catch {
      // Already recorded as a user-facing error in useQuizAttempt.
    }
  };

  const handleRetake = () => {
    if (showIntroScreen) {
      setIsRetakeIntroOpen(true);
    } else {
      handleBeginAttempt();
    }
  };

  const handleNextLevel = async () => {
    await pendingReportRef.current;
    dispatch(navigateToNextLevelOrFinish());
  };

  // A quiz with no intro screen has no click-through step - start the
  // attempt automatically once the initial check finds there isn't one yet.
  // Never for a teacher viewing a student: it would start the teacher's own attempt.
  useEffect(() => {
    if (
      !isLoading &&
      !!unitId &&
      !isViewingStudent &&
      hasNoAttemptYet &&
      !showIntroScreen
    ) {
      beginAttempt().catch(() => {
        // Already recorded as a user-facing error in useQuizAttempt.
      });
    }
  }, [
    isLoading,
    unitId,
    isViewingStudent,
    hasNoAttemptYet,
    showIntroScreen,
    beginAttempt,
  ]);

  const handleSelectChoice = (questionId: number, choiceId: string) => {
    const previousChoiceId = selectedChoicesByQuestionId[questionId];
    setSelectedChoicesByQuestionId(prev => ({...prev, [questionId]: choiceId}));

    // Chain onto this question's own pending write, if any, so writes for
    // the same question reach the server in the order they were made.
    const previousWrite =
      pendingWritesByQuestionIdRef.current[questionId] ?? Promise.resolve();
    const thisWrite = previousWrite
      .catch(() => {
        // An earlier write's failure shouldn't stop this one from sending.
      })
      .then(() =>
        submitQuestionResponse(questionId, {selectedChoiceId: choiceId})
      )
      .catch(() => {
        // Already recorded as a user-facing error in useQuizAttempt. Only
        // roll back if nothing newer has been picked since this write
        // started - a later choice landing after this failure must stand.
        setSelectedChoicesByQuestionId(prev => {
          if (prev[questionId] !== choiceId) {
            return prev;
          }
          const next = {...prev};
          if (previousChoiceId === undefined) {
            delete next[questionId];
          } else {
            next[questionId] = previousChoiceId;
          }
          return next;
        });
      });
    pendingWritesByQuestionIdRef.current[questionId] = thisWrite;
  };

  const handleNext = async () => {
    if (currentPageNumber >= totalPages) {
      // Every answer must reach the server before it locks the attempt -
      // otherwise a still-in-flight write loses the race and is recorded
      // as skipped.
      await Promise.allSettled(
        Object.values(pendingWritesByQuestionIdRef.current)
      );
      await handleFinishAttempt();
    } else {
      setCurrentPageNumber(currentPageNumber + 1);
    }
  };

  const renderQuestionResults = (results: QuizQuestionResult[]) =>
    resultPages.map(
      (
        {page, questions, firstQuestionNumber, lastQuestionNumber},
        pageIndex
      ) => (
        <React.Fragment key={page}>
          {resultPages.length > 1 && (
            <PageDivider
              pageNumber={pageIndex + 1}
              totalPages={resultPages.length}
              firstQuestionNumber={firstQuestionNumber}
              lastQuestionNumber={lastQuestionNumber}
            />
          )}
          {questions.map((question, indexInPage) => {
            const result = results.find(r => r.quizQuestionId === question.id);
            return (
              result && (
                <QuestionResultCard
                  key={question.id}
                  question={question}
                  questionLabel={
                    mcQuestions.length > 1
                      ? `Question ${firstQuestionNumber + indexInPage} of ${
                          mcQuestions.length
                        }`
                      : undefined
                  }
                  result={result}
                  revealAnswerExplanation={
                    isViewingStudent || toBool(revealAnswerExplanation)
                  }
                />
              )
            );
          })}
        </React.Fragment>
      )
    );

  return (
    <div className={styles.attemptWorkspace}>
      {isViewingStudent && (
        <TeacherViewingStudentProjectAlert
          inWorkspaceContainer
          getAlertText={studentName =>
            getTeacherViewAlertText(attempt, isLoading, studentName)
          }
          type={attempt && !attempt.submittedAt ? 'warning' : 'info'}
        />
      )}
      <div className={styles.attemptBody}>
        {error && (
          <Typography variant="body3" color="error" role="alert">
            {error}
          </Typography>
        )}
        {isLoading ? (
          <Typography variant="body2">Loading…</Typography>
        ) : !unitId ? (
          // Reachable via /levels/:id, which levelbuilder uses to preview
          // a level outside any unit.
          <Typography variant="body2">
            Quiz attempts are not allowed on a standalone level.
          </Typography>
        ) : isViewingStudent && !attempt?.submittedAt ? (
          <div className={styles.questions}>
            {/* A student who hasn't started (attempt is null) shows teacher every question unanswered. */}
            {attempt !== undefined &&
              renderQuestionResults(
                mcQuestions.map(question => ({
                  quizQuestionId: question.id,
                  selectedChoiceId:
                    attempt?.questionResultsInProgress?.find(
                      r => r.quizQuestionId === question.id
                    )?.selectedChoiceId ?? null,
                  correct: null,
                  explanation: null,
                  correctChoiceId: null,
                }))
              )}
          </div>
        ) : isIntroOpen ? (
          <div className={styles.questions} ref={introRef}>
            <IntroCard
              title={displayName || levelName}
              introText={customIntroText}
              questionCount={quizQuestions.length}
              timeLimitMinutes={timeLimitMinutes}
              allowMultipleAttempts={toBool(allowMultipleAttempts)}
              onBegin={handleBeginAttempt}
            />
          </div>
        ) : !attempt ? (
          // No intro screen to click through - the effect begins the attempt automatically.
          didInitialCheckForAttemptFail ? (
            <MuiButton
              variant="contained"
              color="primary"
              size="medium"
              type="button"
              onClick={handleBeginAttempt}
            >
              Begin Quiz
            </MuiButton>
          ) : (
            <Typography variant="body2">Loading…</Typography>
          )
        ) : attempt.submittedAt ? (
          <div className={styles.questions} ref={submittedRef}>
            <ResultsCard
              title={displayName || levelName}
              showCorrectness={isViewingStudent || toBool(showCorrectness)}
              score={attempt.score}
              maxScore={attempt.maxScore}
              attemptNumber={attempt.attemptNumber}
              allowMultipleAttempts={toBool(allowMultipleAttempts)}
              canRetake={!isViewingStudent && attempt.canRetake}
              submittedAt={attempt.submittedAt}
              onTryAgain={handleRetake}
              hasNextLevel={hasNextLevel}
              onNextLevel={handleNextLevel}
            />
            {(isViewingStudent || toBool(showQuestionsAfterSubmit)) &&
              renderQuestionResults(attempt.questionResults ?? [])}
          </div>
        ) : (
          <div className={styles.questions} ref={questionsRef}>
            {currentPageNumber === 1 && !showIntroScreen && (
              <AttemptCard title={displayName || levelName} />
            )}
            {quizQuestions
              .filter(
                question => question.page === pageNumbers[currentPageNumber - 1]
              )
              // Only MultipleChoiceQuestion has a container built so far.
              .filter(question => question.type === 'MultipleChoiceQuestion')
              .map(question => (
                <MultiChoiceQuestionContainer
                  key={question.id}
                  question={question}
                  questionLabel={
                    quizQuestions.length > 1
                      ? `Question ${
                          quizQuestions.findIndex(q => q.id === question.id) + 1
                        } of ${quizQuestions.length}`
                      : undefined
                  }
                  selectedChoiceId={
                    selectedChoicesByQuestionId[question.id] ?? null
                  }
                  onSelectChoice={choiceId =>
                    handleSelectChoice(question.id, choiceId)
                  }
                />
              ))}
          </div>
        )}
      </div>
      {isAttemptInProgress && !isViewingStudent && (
        <QuizFooter
          currentPageNumber={currentPageNumber}
          totalPages={totalPages}
          onNavigateToPage={setCurrentPageNumber}
          onNext={handleNext}
          finishButtonLabel={allowMultipleAttempts ? 'Finish' : 'Submit'}
        />
      )}
    </div>
  );
};

// attempt is undefined while loading, after a failed load, and on a
// standalone level; only the first is reported as loading.
function getTeacherViewAlertText(
  attempt: QuizAttemptData | null | undefined,
  isLoading: boolean,
  studentName: string | undefined
): React.ReactElement {
  if (attempt === undefined && isLoading) {
    return (
      <>
        Loading <strong>{studentName ?? 'student'}'s</strong> quiz...
      </>
    );
  }
  if (attempt === null) {
    return (
      <>
        <strong>{studentName ?? 'This student'}</strong> hasn't started this
        level.
      </>
    );
  }
  if (attempt && !attempt.submittedAt) {
    return (
      <>
        <strong>{studentName ?? 'This student'}</strong> is still working on
        this assessment.
      </>
    );
  }
  return (
    <>
      You are viewing <strong>{studentName ?? 'this student'}'s</strong> work in
      read only mode.
    </>
  );
}

export default QuizAttemptWorkspace;
