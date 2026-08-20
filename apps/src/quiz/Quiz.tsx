import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import {Typography, Button as MuiButton} from '@mui/material';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useResizable} from 'react-resizable-layout';

import {getAppOptionsBuildingQuizQuestions} from '@cdo/apps/lab2/projects/utils';
import {LabProps, LevelProperties} from '@cdo/apps/lab2/types';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import QuizBuilder, {QuizQuestionData} from './builder/QuizBuilder';
import QuizQuestionBank from './builder/QuizQuestionBank';
import QuizIntro from './QuizIntro';
import QuizQuestion, {QuizQuestionSummary} from './QuizQuestion';

import styles from './quiz-view.module.scss';

interface QuizLevelProperties extends LevelProperties {
  scriptId?: number;
  quizQuestions?: QuizQuestionSummary[];
  title?: string;
  introText?: string;
  timeLimitMinutes?: number;
}

// Present once this attempt is submitted - selectedChoiceId is always
// included then, so a reload can restore/highlight what was picked;
// correct is null unless the quiz's show_correctness setting allows it,
// and explanation is additionally gated by reveal_answer_explanation. See
// QuizAttempt#question_results.
interface QuestionResultData {
  quizQuestionId: number;
  selectedChoiceId: string;
  correct: boolean | null;
  explanation?: string;
}

interface AttemptResult {
  score: number | null;
  maxScore: number | null;
  questionResults?: QuestionResultData[];
}

// A single question's in-progress answer: a chosen choice id. P0 is
// multiple choice only for now - see the filter in the quiz-taking view
// below; this will need to widen again (e.g. string | string[]) once
// MultipleSelectQuestion/FreeResponseQuestion come back.
type QuestionResponseValue = string;

// Shapes response_data to match what MultipleChoiceQuestion#grade expects.
const buildResponseData = (value: QuestionResponseValue | undefined) => ({
  selectedChoiceId: value || '',
});

// Rebuilds local `responses` state from a submitted attempt's
// questionResults, so a reload (or the initial GET check finding an
// already-submitted attempt) restores/highlights what was actually
// selected instead of showing every question blank.
const responsesFromQuestionResults = (
  questionResults: QuestionResultData[] | undefined
): Record<number, QuestionResponseValue> =>
  Object.fromEntries(
    (questionResults || []).map(r => [r.quizQuestionId, r.selectedChoiceId])
  );

// Floor for the resource panel's drag-resizable width, in px - also its
// starting width. Collapsing it entirely (to the icon rail) is a separate,
// pre-existing toggle unrelated to this floor.
const RESOURCE_PANEL_MIN_WIDTH = 350;

const formatRemainingTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const Quiz: React.FunctionComponent<LabProps> = ({levelProperties}) => {
  const {
    id: levelId,
    name,
    title,
    scriptId,
    quizQuestions,
    introText,
    timeLimitMinutes,
  } = levelProperties as QuizLevelProperties;
  // Whether this page load is the build_quiz_questions route at all (a
  // levelbuilder capability, fixed for the whole page load).
  const isBuilderMode = !!getAppOptionsBuildingQuizQuestions();
  // Build/Preview toggle - only reachable at all when isBuilderMode.
  const [viewMode, setViewMode] = useState<'build' | 'preview'>('build');
  const isBuilderView = isBuilderMode && viewMode === 'build';
  const [questions, setQuestions] = useState<QuizQuestionData[]>(
    quizQuestions || []
  );
  // Ids permanently deleted (destroy_quiz_question, not detach_quiz_question)
  // via QuizBuilder's remove flow this session - passed to QuizQuestionBank
  // so a bank result list fetched before the delete doesn't keep offering a
  // now-nonexistent question. Detached-only removals don't need this: the
  // question still exists in the bank, so attachedQuestionIds (derived from
  // `questions` below) already flips its button back to "Add" on its own.
  const [destroyedQuestionIds, setDestroyedQuestionIds] = useState<number[]>(
    []
  );
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [responses, setResponses] = useState<
    Record<number, QuestionResponseValue>
  >({});
  const [result, setResult] = useState<AttemptResult | null>(null);
  // Whether POSTing to /quiz_attempts again would start a genuinely new
  // attempt rather than just returning this one - only meaningful once result is set.
  const [canRetake, setCanRetake] = useState(false);
  // Deadline for the current attempt, from the server.
  // null when the quiz has no time limit. Drives the countdown effect below.
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  // Shown before the attempt is created.
  const [showIntro, setShowIntro] = useState(false);
  const needsIntroScreen = !!(introText || timeLimitMinutes);
  const isResourcePanelCollapsed = useAppSelector(
    state => state.lab2View.isStandaloneCollapsed
  );
  const hasResourcePanelTabs = isBuilderMode;
  const isResourcePanelExpanded =
    hasResourcePanelTabs && !isResourcePanelCollapsed;
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    position: resourcePanelWidth,
    separatorProps: resourcePanelSeparatorProps,
    isDragging: isResizingResourcePanel,
  } = useResizable({
    axis: 'x',
    containerRef,
    initial: RESOURCE_PANEL_MIN_WIDTH,
    min: RESOURCE_PANEL_MIN_WIDTH,
    disabled: !isResourcePanelExpanded,
  });

  // Creates (or resumes) the attempt - called either immediately on mount
  // (quiz has no intro content to show first) or from the intro screen's
  // Begin Quiz button.
  const beginAttempt = useCallback(() => {
    HttpClient.post(
      '/quiz_attempts',
      JSON.stringify({levelId, scriptId}),
      true,
      {'Content-Type': 'application/json'}
    )
      .then(response => response.json())
      .then(data => {
        setAttemptId(data.id);
        if (data.submittedAt) {
          setResult({
            score: data.score,
            maxScore: data.maxScore,
            questionResults: data.questionResults || undefined,
          });
          setResponses(responsesFromQuestionResults(data.questionResults));
          setCanRetake(!!data.canRetake);
        } else {
          // Only start a countdown for an attempt that isn't already done.
          setExpiresAt(data.expiresAt || null);
        }
        setShowIntro(false);
      });
  }, [levelId, scriptId]);

  // Starts a fresh attempt on top of an already-submitted one - only ever
  // called when canRetake is true, so #create (see beginAttempt) will mint
  // attempt_number + 1 rather than just handing back the finished one.
  const retakeQuiz = () => {
    setResult(null);
    setResponses({});
    setCanRetake(false);
    beginAttempt();
  };

  useEffect(() => {
    // Don't start a student attempt while the Build view is showing.
    if (isBuilderView || !scriptId) {
      return;
    }
    // Check-only - never creates an attempt as a side effect of loading
    // the page (see beginAttempt above for why that matters).
    HttpClient.get(`/quiz_attempts?levelId=${levelId}&scriptId=${scriptId}`)
      .then(response => response.json())
      .then(data => {
        if (!data) {
          // No attempt yet: show the intro screen first if there's
          // anything for it to show, otherwise start immediately - same
          // as this quiz behaved before the intro screen existed.
          if (needsIntroScreen) {
            setShowIntro(true);
          } else {
            beginAttempt();
          }
          return;
        }
        setAttemptId(data.id);
        if (data.submittedAt) {
          setResult({
            score: data.score,
            maxScore: data.maxScore,
            questionResults: data.questionResults || undefined,
          });
          setResponses(responsesFromQuestionResults(data.questionResults));
          setCanRetake(!!data.canRetake);
        } else {
          // only start a countdown for an attempt that isn't already done.
          setExpiresAt(data.expiresAt || null);
        }
      });
  }, [isBuilderView, levelId, scriptId, needsIntroScreen, beginAttempt]);

  const setResponse = (questionId: number, value: QuestionResponseValue) =>
    setResponses(prev => ({...prev, [questionId]: value}));

  // P0 scope: multiple choice only - see the filter in the quiz-taking view
  // below.
  const multipleChoiceQuestions = (quizQuestions || []).filter(
    question => question.type === 'MultipleChoiceQuestion'
  );

  // Only for correctness display (green/red + Correct/Incorrect label) -
  // filters out entries where correct is null, i.e. show_correctness is
  // off, so QuizQuestion never renders that styling in that case.
  // Restoring which choice was actually selected is handled separately,
  // via `responses` (see responsesFromQuestionResults), so it still works
  // even when show_correctness is off.
  const questionResultsById = new Map(
    (result?.questionResults || [])
      .filter(
        (r): r is QuestionResultData & {correct: boolean} => r.correct !== null
      )
      .map(r => [r.quizQuestionId, r])
  );

  const submitQuiz = async () => {
    if (!attemptId) {
      return;
    }

    await Promise.all(
      multipleChoiceQuestions.map(question =>
        HttpClient.post(
          '/quiz_question_responses',
          JSON.stringify({
            quizAttemptId: attemptId,
            quizQuestionId: question.id,
            responseData: buildResponseData(responses[question.id]),
          }),
          true,
          {'Content-Type': 'application/json'}
        )
      )
    );

    const finalizeResponse = await HttpClient.put(
      `/quiz_attempts/${attemptId}`,
      JSON.stringify({}),
      true,
      {'Content-Type': 'application/json'}
    );
    const data = await finalizeResponse.json();
    setResult({
      score: data.score,
      maxScore: data.maxScore,
      questionResults: data.questionResults || undefined,
    });
    setResponses(responsesFromQuestionResults(data.questionResults));
    setCanRetake(!!data.canRetake);
  };

  // Kept up to date every render so the countdown effect below always
  // calls the freshest submitQuiz (latest responses/attemptId) even though
  // the effect itself only re-runs when expiresAt/result change - without
  // this, auto-submit could fire with answers captured from whenever the
  // effect happened to last run instead of what's actually on screen.
  const submitQuizRef = useRef(submitQuiz);
  submitQuizRef.current = submitQuiz;

  // Auto-submits once the deadline passes. The real enforcement is
  // server-side (QuizQuestionResponsesController#create rejects writes
  // after expiry regardless) - this is what makes that happen without the
  // student needing to click Submit themselves.
  useEffect(() => {
    if (!expiresAt || result) {
      setRemainingSeconds(null);
      return;
    }
    const deadline = new Date(expiresAt).getTime();
    let hasAutoSubmitted = false;
    const tick = () => {
      const secondsLeft = Math.max(
        Math.round((deadline - Date.now()) / 1000),
        0
      );
      setRemainingSeconds(secondsLeft);
      if (secondsLeft <= 0 && !hasAutoSubmitted) {
        hasAutoSubmitted = true;
        submitQuizRef.current();
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, result]);

  return (
    <div id="quiz-lab" className={styles.quiz} ref={containerRef}>
      <div
        className={
          isResourcePanelExpanded
            ? styles.resourcePanel
            : styles.resourcePanelCollapsed
        }
        style={
          isResourcePanelExpanded ? {width: resourcePanelWidth} : undefined
        }
      >
        <ResourcePanel
          levelProperties={levelProperties}
          isRunning={false}
          hasRun={false}
          hasEdited={Object.keys(responses).length > 0}
          hideAllNavigation
          questionBankContent={
            isBuilderMode ? (
              <QuizQuestionBank
                quizId={levelId as number}
                attachedQuestionIds={questions.map(question => question.id)}
                excludedQuestionIds={destroyedQuestionIds}
                onAttach={question => setQuestions(prev => [...prev, question])}
              />
            ) : undefined
          }
        />
      </div>
      {isResourcePanelExpanded ? (
        <ResizeBar
          isVertical
          isDragging={isResizingResourcePanel}
          separatorProps={resourcePanelSeparatorProps}
        />
      ) : (
        <div className={styles.divider} />
      )}
      <div className={styles.content}>
        {isBuilderMode && (
          <div className={styles.buildPreviewToggleBar}>
            <SegmentedButtons
              size="xs"
              selectedButtonValue={viewMode}
              onChange={value => setViewMode(value as 'build' | 'preview')}
              buttons={[
                {label: 'Build', value: 'build'},
                {label: 'Preview', value: 'preview'},
              ]}
            />
            <Typography
              component="h2"
              variant="overline2"
              className={styles.buildPreviewToggleTitle}
            >
              Workspace
            </Typography>
            <div />
          </div>
        )}
        <div className={styles.contentInner}>
          {isBuilderView ? (
            <QuizBuilder
              quizId={levelId as number}
              quizTitle={title || name}
              questions={questions}
              setQuestions={setQuestions}
              onQuestionDestroyed={questionId =>
                setDestroyedQuestionIds(prev => [...prev, questionId])
              }
            />
          ) : showIntro ? (
            <QuizIntro
              quizTitle={title || name}
              introText={introText}
              questionCount={multipleChoiceQuestions.length}
              timeLimitMinutes={timeLimitMinutes}
              onBegin={beginAttempt}
            />
          ) : (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <Typography variant="h2">{title || name}</Typography>
                {!scriptId && (
                  <Typography variant="body3">
                    Preview outside a script has no attempt tracking.
                  </Typography>
                )}
                {remainingSeconds !== null && (
                  <Typography variant="body2">
                    Time remaining: {formatRemainingTime(remainingSeconds)}
                  </Typography>
                )}
              </div>
              <ol className={styles.questionList}>
                {multipleChoiceQuestions.map((question, index) => (
                  <QuizQuestion
                    key={question.id}
                    question={question}
                    index={index}
                    total={multipleChoiceQuestions.length}
                    selectedChoiceId={responses[question.id]}
                    disabled={!!result}
                    result={questionResultsById.get(question.id)}
                    onSelectChoice={choiceId =>
                      setResponse(question.id, choiceId)
                    }
                  />
                ))}
              </ol>
              <div className={styles.cardFooter}>
                <MuiButton
                  variant="contained"
                  color="primary"
                  size="medium"
                  type="button"
                  disabled={!attemptId || (!!result && !canRetake)}
                  onClick={() =>
                    result && canRetake ? retakeQuiz() : submitQuiz()
                  }
                >
                  {result && canRetake ? 'Retake Quiz' : 'Submit Quiz'}
                </MuiButton>
                {result && (
                  <Typography variant="h5">
                    Final score: {result.score} / {result.maxScore}
                  </Typography>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
