import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  Challenge,
  ChallengeResponse,
  ChallengeResponseDetail,
  challengeResponseValidator,
  EvaluationStatus,
  ExplanationTypes,
  ProjectDetailsCard,
} from '@code-dot-org/lesson-deep-dive';
import {Button as MuiButton, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';

import HttpClient from '@cdo/apps/util/HttpClient';
import {ChallengeTypes} from '@cdo/generated-scripts/sharedConstants';

import SparklePulse from '../Animations/SparklePulse';

import VideoChallenge from './VideoChallenge';
import WhiteboardChallenge from './WhiteboardChallenge';

import styles from './challenge-box.module.scss';

const CompositionStates = {
  INITIAL: 'initial',
  VIEWING_FEEDBACK: 'viewing',
  ITERATING: 'iterating',
};

interface ChallengeBoxProps {
  lessonId: number;
  challenge: Challenge;
  challengeType: string;
}

// Terminal evaluation_status values that map to a student-facing error
// message. 'queued' and 'running' are not terminal (polling continues);
// 'success' is terminal but its text comes from student_feedback, not here.
const EVALUATION_ERROR_MESSAGES: Record<string, string> = {
  pii_violation:
    "Sorry, I can't write feedback about this because it contains personal information. Please make changes and submit again.",
  profanity_violation:
    "Sorry, I can't write feedback about this because it was flagged by our content moderation policy. Please make changes and submit again.",
  feedback_violation:
    'Sorry, my feedback was flagged by our content moderation policy. Please try submitting again.',
  failure: 'An error occurred during evaluation',
};

const ChallengeBox: FC<ChallengeBoxProps> = ({
  lessonId,
  challenge,
  challengeType,
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [explanationType, setExplanationType] = useState<string | null>(null);
  const [hasRecording, setHasRecording] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [textExplanation, setTextExplanation] = useState('');
  const [evaluationStatus, setEvaluationStatus] = useState(
    EvaluationStatus.NONE
  );
  const [polling, setPolling] = useState(false);
  const [challengeResponseId, setChallengeResponseId] = useState(0);
  const [evaluationText, setEvaluationText] = useState<string | null>(null);
  const [evaluationDatetime, setEvaluationDatetime] = useState<string | null>(
    null
  );
  const [compositionState, setCompositionState] = useState(
    CompositionStates.INITIAL
  );
  const [challengeResponse, setChallengeResponse] =
    useState<ChallengeResponse | null>(null);
  // An evaluation result held back until the waiting animation comes to rest.
  const [pendingOutcome, setPendingOutcome] = useState<{
    response: ChallengeResponse;
    status: string;
    text: string | null;
  } | null>(null);

  // "Submit" lives in the bottom bar, but the work being submitted
  // (the drawing, or the recording) lives in the active modality component.
  // The modality reports whether it can be submitted through
  // onSubmittableChange, and registers its submit/reset handlers on these
  // refs so the top bar can drive them. Submit resolves true once the
  // response is created.
  const [canSubmit, setCanSubmit] = useState(false);
  const submitRef = useRef<(() => Promise<boolean>) | null>(null);
  const resetRef = useRef<(() => void) | null>(null);

  // Video challenges are recordings top to bottom, so the record button
  // always applies; whiteboard challenges only need it for an audio
  // explanation.
  const isRecordable =
    challengeType === ChallengeTypes.VIDEO ||
    explanationType === ExplanationTypes.AUDIO;
  // Video previews return to edit first; audio re-records in one click
  const isVideoPreview =
    challengeType === ChallengeTypes.VIDEO && hasRecording && !isRecording;

  const handleRecordClick = () => {
    if (isVideoPreview) {
      setHasRecording(false);
    } else {
      setIsRecording(!isRecording);
    }
  };

  // Both challenge modalities report submission through this callback; the
  // confirmation dialog is shared here rather than duplicated per modality.
  const handleSubmittedChange = useCallback(
    (value: React.SetStateAction<boolean>) => {
      setSubmitted(prev => {
        const next = typeof value === 'function' ? value(prev) : value;
        if (next && !prev) {
          setShowConfirmation(true);
        }
        return next;
      });
      setPolling(true);
    },
    []
  );

  const formatTimestamp = (isoDate: string) => {
    const date = new Date(isoDate);
    const time = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
    const day = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    return `${time} ${day}`;
  };

  useEffect(() => {
    if (
      polling &&
      evaluationStatus === EvaluationStatus.PENDING &&
      challengeResponseId !== 0
    ) {
      const intervalId = setInterval(() => {
        HttpClient.fetchJson<ChallengeResponse>(
          `/challenge_responses/${challengeResponseId}`,
          {},
          challengeResponseValidator
        )
          .then(response => {
            return response.value;
          })
          .then(value => {
            const status = value.evaluation_status;
            const outcome =
              status === 'success'
                ? {
                    status: EvaluationStatus.SUCCESS,
                    text: value.student_feedback,
                  }
                : status && EVALUATION_ERROR_MESSAGES[status]
                ? {
                    status: EvaluationStatus.ERROR,
                    text: EVALUATION_ERROR_MESSAGES[status],
                  }
                : null;
            // Still queued/running (or an unrecognized status): keep polling.
            if (!outcome) {
              return;
            }
            setPolling(false);
            setPendingOutcome({response: value, ...outcome});
          })
          .catch(error => {
            console.error(error);
          });
      }, 2000);
      return () => clearInterval(intervalId);
    } else if (polling && evaluationStatus !== EvaluationStatus.PENDING) {
      setPolling(false);
      setShowConfirmation(false);
    }
  }, [polling, evaluationStatus, challengeResponseId]);

  const revealOutcome = () => {
    if (!pendingOutcome) {
      return;
    }
    setChallengeResponse(pendingOutcome.response);
    setShowConfirmation(false);
    setEvaluationStatus(pendingOutcome.status);
    setEvaluationText(pendingOutcome.text);
    setEvaluationDatetime(formatTimestamp(pendingOutcome.response.created_at));
    setCompositionState(CompositionStates.VIEWING_FEEDBACK);
    setPendingOutcome(null);
  };

  // "Start over" clears the current attempt: the parent resets the shared
  // submission/feedback state, and the active modality clears its own work
  // (the drawing or the recording) through the registered reset handler.
  const handleStartOver = () => {
    resetRef.current?.();
    setSubmitted(false);
    setShowConfirmation(false);
    setEvaluationStatus(EvaluationStatus.NONE);
    setEvaluationText(null);
    setEvaluationDatetime(null);
    setExplanationType(null);
    setHasRecording(false);
    setIsRecording(false);
    setTextExplanation('');
    setCanSubmit(false);
    setCompositionState(CompositionStates.INITIAL);
    setChallengeResponse(null);
    setPendingOutcome(null);
  };

  const handleIteration = () => {
    setSubmitted(false);
    setShowConfirmation(false);
    setEvaluationStatus(EvaluationStatus.NONE);
    setHasRecording(false);
    setIsRecording(false);
    setCanSubmit(false);
    setCompositionState(CompositionStates.ITERATING);
    setChallengeResponse(null);
  };

  // On failure the modality shows its own error; return to composing.
  const handleSubmitClick = async () => {
    setShowConfirmation(true);
    if (!(await submitRef.current?.())) {
      setShowConfirmation(false);
    }
  };

  const navigate = useNavigate();
  const handleViewGallery = () => navigate('/gallery');

  const switchExplanationType = (type: string) => {
    setIsRecording(false);
    setExplanationType(type);
  };

  return (
    <div className={styles.topContainer}>
      <div
        className={classNames(
          styles.challengeArea,
          showConfirmation && styles.hidden
        )}
        data-theme="Dark"
      >
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTop}>
            <Typography variant="overline2" className={styles.sidebarLabel}>
              {compositionState === CompositionStates.VIEWING_FEEDBACK
                ? 'Feedback'
                : 'Challenge'}
            </Typography>
          </div>
          {showConfirmation ? (
            <div className={styles.waitingDisplay}>
              <SparklePulse
                size={96}
                phase={pendingOutcome ? 'ready' : 'thinking'}
                onStopped={revealOutcome}
              />
              <Typography variant="body3">
                Tutor is writing feedback...
              </Typography>
            </div>
          ) : (
            <div className={styles.sidebarContent}>
              {compositionState !== CompositionStates.VIEWING_FEEDBACK && (
                <div>
                  <Typography
                    variant="overline2"
                    className={styles.sidebarHeading}
                  >
                    Create
                  </Typography>
                  <Typography
                    variant="body3"
                    className={styles.instructionsText}
                  >
                    {compositionState === CompositionStates.INITIAL
                      ? challenge.question
                      : 'Iterate on your project based on the feedback from Tutor.'}
                  </Typography>
                </div>
              )}
              {compositionState !== CompositionStates.INITIAL &&
                evaluationText && (
                  <div className={styles.feedbackContainer}>
                    <div className={styles.feedbackWidget}>
                      <div className={styles.feedbackHeader}>
                        <div className={styles.feedbackAvatar}>
                          <FontAwesomeV6Icon
                            iconFamily="kit"
                            iconStyle="solid"
                            iconName="tutor"
                            className={styles.feedbackAvatarIcon}
                          />
                        </div>
                        <div className={styles.feedbackHeaderContent}>
                          <Typography variant="body3">Tutor</Typography>
                          <Typography variant="body4">
                            {evaluationDatetime}
                          </Typography>
                        </div>
                      </div>
                      <div className={styles.feedbackText}>
                        <Typography
                          variant="body3"
                          className={styles.instructionsText}
                        >
                          {evaluationText}
                        </Typography>
                      </div>
                    </div>
                  </div>
                )}
              {challengeType === ChallengeTypes.WHITEBOARD &&
                compositionState !== CompositionStates.VIEWING_FEEDBACK && (
                  <div className={styles.whiteboardButtonContainer}>
                    {compositionState !==
                      CompositionStates.VIEWING_FEEDBACK && (
                      <div>
                        <Typography
                          variant="overline2"
                          className={styles.sidebarHeading}
                        >
                          Explain
                        </Typography>
                        <Typography
                          variant="body3"
                          className={styles.instructionsText}
                        >
                          {compositionState === CompositionStates.INITIAL
                            ? 'Use audio or text to explain what you created.'
                            : explanationType === ExplanationTypes.TEXT
                            ? 'Write a short explanation of the changes you made'
                            : 'Record yourself explaining the changes you made'}
                        </Typography>
                      </div>
                    )}
                    {compositionState === CompositionStates.INITIAL && (
                      <div className={styles.explanationContainer}>
                        <MuiButton
                          className={classNames([
                            styles.explanationButton,
                            explanationType === ExplanationTypes.AUDIO
                              ? styles.Selected
                              : null,
                          ])}
                          size="medium"
                          color="secondary"
                          startIcon={
                            <FontAwesomeV6Icon
                              iconStyle="solid"
                              iconName="microphone"
                              title="Audio"
                            />
                          }
                          variant="outlined"
                          disabled={submitted}
                          onClick={() =>
                            switchExplanationType(ExplanationTypes.AUDIO)
                          }
                        >
                          Audio
                        </MuiButton>
                        <MuiButton
                          className={classNames([
                            styles.explanationButton,
                            explanationType === ExplanationTypes.TEXT
                              ? styles.Selected
                              : null,
                          ])}
                          size="medium"
                          color="secondary"
                          startIcon={
                            <FontAwesomeV6Icon
                              iconStyle="solid"
                              iconName="pencil"
                              title="Text"
                            />
                          }
                          variant="outlined"
                          disabled={submitted}
                          onClick={() =>
                            switchExplanationType(ExplanationTypes.TEXT)
                          }
                        >
                          Text
                        </MuiButton>
                      </div>
                    )}
                  </div>
                )}
              {compositionState === CompositionStates.VIEWING_FEEDBACK && (
                <MuiButton
                  variant="contained"
                  color="primary"
                  size="medium"
                  className={styles.submitButton}
                  onClick={() => {
                    handleIteration();
                  }}
                >
                  Respond Again
                </MuiButton>
              )}
            </div>
          )}
        </aside>
        <div className={styles.mainColumn}>
          <div className={styles.topBar}>
            {compositionState === CompositionStates.VIEWING_FEEDBACK &&
            evaluationStatus === EvaluationStatus.SUCCESS ? (
              // Review state: once the tutor's feedback is in, the actions
              // turn to browsing the gallery rather than editing this attempt.
              <>
                <MuiButton
                  variant="outlined"
                  color="secondary"
                  size="extraSmall"
                  startIcon={
                    <FontAwesomeV6Icon
                      iconStyle="solid"
                      iconName="gallery-thumbnails"
                    />
                  }
                  onClick={handleViewGallery}
                >
                  View project gallery
                </MuiButton>
                <MuiButton
                  variant="outlined"
                  color="secondary"
                  size="extraSmall"
                  startIcon={
                    <FontAwesomeV6Icon iconStyle="solid" iconName="check" />
                  }
                  onClick={() => navigate('/intervention')}
                  disabled={showConfirmation}
                >
                  I'm done
                </MuiButton>
              </>
            ) : (
              // Compose state: "Submit for feedback" stays visible but is
              // disabled until the active modality reports there is something
              // to submit; "Start over" is always available.
              <>
                <MuiButton
                  variant="outlined"
                  color="secondary"
                  size="extraSmall"
                  startIcon={
                    <FontAwesomeV6Icon
                      iconStyle="solid"
                      iconName="arrow-left"
                    />
                  }
                  onClick={() => navigate('/intervention')}
                >
                  Choose a different challenge
                </MuiButton>
                <MuiButton
                  variant="outlined"
                  color="secondary"
                  size="extraSmall"
                  startIcon={
                    <FontAwesomeV6Icon
                      iconStyle="solid"
                      iconName="arrow-rotate-left"
                    />
                  }
                  onClick={handleStartOver}
                >
                  Start over
                </MuiButton>
              </>
            )}
          </div>
          <div className={styles.activityColumn}>
            <div className={styles.activityRow}>
              <div className={styles.activityColumnTwo}>
                {challengeType === ChallengeTypes.WHITEBOARD ? (
                  <WhiteboardChallenge
                    challengeId={challenge?.id ?? null}
                    submitted={submitted}
                    submitCallback={handleSubmittedChange}
                    isRecording={isRecording}
                    setIsRecording={setIsRecording}
                    hasRecording={hasRecording}
                    setHasRecording={setHasRecording}
                    explanationType={explanationType}
                    lessonId={lessonId}
                    textExplanation={textExplanation}
                    setEvaluationStatus={setEvaluationStatus}
                    setChallengeResponseId={setChallengeResponseId}
                    onSubmittableChange={setCanSubmit}
                    submitRef={submitRef}
                    resetRef={resetRef}
                    starterImageAltText={
                      challenge?.whiteboard_starter_image_alt_text ?? null
                    }
                    starterImageUrl={
                      challenge?.whiteboard_starter_image_url ?? null
                    }
                  />
                ) : (
                  <VideoChallenge
                    submitted={submitted}
                    submitCallback={handleSubmittedChange}
                    isRecording={isRecording}
                    setIsRecording={setIsRecording}
                    hasRecording={hasRecording}
                    setHasRecording={setHasRecording}
                    challenge={challenge}
                    lessonId={lessonId}
                    setEvaluationStatus={setEvaluationStatus}
                    setChallengeResponseId={setChallengeResponseId}
                    onSubmittableChange={setCanSubmit}
                    submitRef={submitRef}
                    resetRef={resetRef}
                  />
                )}
              </div>
              {explanationType === ExplanationTypes.TEXT && (
                <div className={styles.rightSidebar}>
                  <div>
                    <Typography
                      variant="overline2"
                      className={styles.sidebarHeading}
                    >
                      Text explanation
                    </Typography>
                    <Typography
                      variant="body3"
                      className={styles.instructionsText}
                    >
                      {compositionState === CompositionStates.INITIAL
                        ? 'Write a short paragraph explaining your work.'
                        : compositionState ===
                          CompositionStates.VIEWING_FEEDBACK
                        ? textExplanation
                        : 'Edit or add to your explanation to describe the changes you made.'}
                    </Typography>
                  </div>
                  {compositionState !== CompositionStates.VIEWING_FEEDBACK && (
                    <textarea
                      id="challenge-explanation"
                      className={styles.textArea}
                      placeholder="Write your explanation here"
                      onChange={e => setTextExplanation(e.target.value)}
                      disabled={showConfirmation}
                    >
                      {textExplanation}
                    </textarea>
                  )}
                </div>
              )}
            </div>
            {compositionState === CompositionStates.VIEWING_FEEDBACK &&
            challengeResponse ? (
              <ProjectDetailsCard
                detail={
                  {
                    viewer_role: 'owner',
                    question: challenge.question,
                    evaluated_at: evaluationDatetime,
                    evaluation_result: null,
                    rubric: [],
                    ...challengeResponse,
                  } as ChallengeResponseDetail
                }
                unitPosition={1}
              />
            ) : (
              <div className={styles.bottomPanel}>
                {isRecordable && (
                  <MuiButton
                    size="medium"
                    color={isRecording ? 'error' : 'secondary'}
                    startIcon={
                      <FontAwesomeV6Icon
                        iconStyle="solid"
                        iconName={isRecording ? 'square' : 'circle-dot'}
                        title={isRecording ? 'Stop' : 'Record'}
                      />
                    }
                    variant="contained"
                    disabled={showConfirmation}
                    onClick={handleRecordClick}
                  >
                    {isRecording
                      ? 'Stop Recording'
                      : isVideoPreview
                      ? 'Edit and Record Again'
                      : hasRecording
                      ? 'Record Again'
                      : 'Start Recording'}
                  </MuiButton>
                )}
                {(!isRecordable || hasRecording) && (
                  <MuiButton
                    variant="contained"
                    color="primary"
                    size="medium"
                    className={styles.submitButton}
                    disabled={!canSubmit}
                    onClick={handleSubmitClick}
                  >
                    Submit
                  </MuiButton>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeBox;
