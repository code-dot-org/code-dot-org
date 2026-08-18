import {Typography, Button as MuiButton} from '@mui/material';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {getAppOptionsAuthoringQuizQuestions} from '@cdo/apps/lab2/projects/utils';
import {LabProps, LevelProperties} from '@cdo/apps/lab2/types';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import QuizBuilder from './authoring/QuizBuilder';
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

interface AttemptResult {
  score: number | null;
  maxScore: number | null;
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
  const isAuthoringMode = !!getAppOptionsAuthoringQuizQuestions();
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [responses, setResponses] = useState<
    Record<number, QuestionResponseValue>
  >({});
  const [result, setResult] = useState<AttemptResult | null>(null);
  // Whether POSTing to /quiz_attempts again would start a genuinely new
  // attempt (see QuizAttempt#retakeable?) rather than just returning this
  // one - only meaningful once result is set.
  const [canRetake, setCanRetake] = useState(false);
  // Deadline for the current attempt, from the server (QuizAttempt#expires_at) -
  // null when the quiz has no time limit. Drives the countdown effect below.
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  // Shown before the attempt is created, instead of jumping straight into
  // the quiz - only when there's actually something to show. Set once the
  // initial GET check finds no existing attempt (see the effect below); a
  // resumed or already-submitted attempt skips it entirely.
  const [showIntro, setShowIntro] = useState(false);
  const needsIntroScreen = !!(introText || timeLimitMinutes);
  const isResourcePanelCollapsed = useAppSelector(
    state => state.lab2View.isStandaloneCollapsed
  );
  // Outside authoring mode, Quiz has no top tab content today - the AI
  // Tutor tab isn't built yet (it needs hiddenContextCallback/
  // aiTutorSystemPrompt, neither of which is wired up here), so there's
  // nothing to expand the panel into, and the collapse toggle itself never
  // renders (ResourcePanel hides it when there are no tabs). In authoring
  // mode the Question Bank tab always exists.
  const hasResourcePanelTabs = isAuthoringMode;

  // Creates (or resumes) the attempt - called either immediately on mount
  // (quiz has no intro content to show first) or from the intro screen's
  // Begin Quiz button. Deferring this until Begin Quiz is clicked, when
  // there is an intro screen, matters: started_at should reflect when the
  // student actually begins, not when the page happened to load, since a
  // future time limit is measured from it.
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
          setResult({score: data.score, maxScore: data.maxScore});
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
    // Don't start a student attempt while a levelbuilder is authoring.
    if (isAuthoringMode || !scriptId) {
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
        // P0 allows only one attempt: if this attempt was already
        // submitted (e.g. the student reloaded the page), restore its
        // result instead of showing an editable quiz again. Either way -
        // submitted or mid-quiz - an existing attempt means the student
        // already got past the intro screen, so skip it.
        if (data.submittedAt) {
          setResult({score: data.score, maxScore: data.maxScore});
          setCanRetake(!!data.canRetake);
        } else {
          // only start a countdown for an attempt that isn't already done.
          setExpiresAt(data.expiresAt || null);
        }
      });
  }, [isAuthoringMode, levelId, scriptId, needsIntroScreen, beginAttempt]);

  const setResponse = (questionId: number, value: QuestionResponseValue) =>
    setResponses(prev => ({...prev, [questionId]: value}));

  // P0 scope: multiple choice only - see the filter in the quiz-taking view
  // below.
  const multipleChoiceQuestions = (quizQuestions || []).filter(
    question => question.type === 'MultipleChoiceQuestion'
  );

  // One submit for the whole quiz: post every question's response - even a
  // skipped one, as an empty selection - then finalize the attempt so
  // score/max_score get totaled server-side. Posting skipped questions too
  // matters for max_score: MultipleChoiceQuestion#grade already scores a
  // blank selection as incorrect, but only for questions that actually
  // have a QuizQuestionResponse row - a question skipped entirely would
  // otherwise be missing from the denominator, not just the numerator.
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
    setResult({score: data.score, maxScore: data.maxScore});
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
    <div id="quiz-lab" className={styles.quiz}>
      <ResourcePanel
        className={
          hasResourcePanelTabs && !isResourcePanelCollapsed
            ? styles.resourcePanel
            : styles.resourcePanelCollapsed
        }
        levelProperties={levelProperties}
        isRunning={false}
        hasRun={false}
        hasEdited={Object.keys(responses).length > 0}
        hideAllNavigation
        questionBankContent={
          isAuthoringMode ? (
            <Typography variant="body2">
              Question bank browsing and filtering coming soon.
            </Typography>
          ) : undefined
        }
      />
      <div className={styles.divider} />
      <div className={styles.content}>
        {isAuthoringMode ? (
          <QuizBuilder
            quizId={levelId as number}
            quizTitle={title || name}
            initialQuestions={quizQuestions || []}
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
  );
};

export default Quiz;
