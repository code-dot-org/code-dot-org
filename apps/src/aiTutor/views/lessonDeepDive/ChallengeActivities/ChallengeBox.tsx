import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {FC, useCallback, useEffect, useRef, useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';
import {ChallengeTypes} from '@cdo/generated-scripts/sharedConstants';

import ProjectDetailsCard from '../../gallery/ProjectDetailsCard';
import {ChallengeResponseDetail} from '../../gallery/types';
import {
  Challenge,
  ChallengeResponse,
  challengeResponseValidator,
  EvaluationStatus,
  ExplanationTypes,
} from '../types';

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
  challengeSetCallback: (
    pickedChallenge: Challenge | null,
    pickedChallengeType: string | null
  ) => void;
}

// Terminal evaluation_status values that map to a student-facing error
// message. 'queued' and 'running' are not terminal (polling continues);
// 'success' is terminal but its text comes from student_feedback, not here.
const EVALUATION_ERROR_MESSAGES: Record<string, string> = {
  pii_violation: 'This challenge response contains personal information',
  profanity_violation: 'This challenge response contains profanity',
  failure: 'An error occured during evaluation',
};

const ChallengeBox: FC<ChallengeBoxProps> = ({
  lessonId,
  challenge,
  challengeType,
  challengeSetCallback,
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

  // "Submit" lives in the bottom bar, but the work being submitted
  // (the drawing, or the recording) lives in the active modality component.
  // The modality reports whether it can be submitted through
  // onSubmittableChange, and registers its submit/reset handlers on these
  // refs so the top bar can drive them.
  const [canSubmit, setCanSubmit] = useState(false);
  const submitRef = useRef<(() => void | Promise<void>) | null>(null);
  const resetRef = useRef<(() => void) | null>(null);

  // Video challenges are recordings top to bottom, so the record button
  // always applies; whiteboard challenges only need it for an audio
  // explanation.
  const isRecordable =
    challengeType === ChallengeTypes.VIDEO ||
    explanationType === ExplanationTypes.AUDIO;

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
            console.log(response);
            return response.value;
          })
          .then(value => {
            console.log(value);
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
            setChallengeResponse(value);
            setPolling(false);
            setShowConfirmation(false);
            setEvaluationStatus(outcome.status);
            setEvaluationText(outcome.text);
            setEvaluationDatetime(formatTimestamp(value.created_at));
            setCompositionState(CompositionStates.VIEWING_FEEDBACK);
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

  // The gallery is a sibling Rails page one segment below the current tutor
  // page: .../lessons/<n>/tutor -> .../lessons/<n>/tutor/gallery.
  const handleViewGallery = () => {
    const base = window.location.pathname.replace(/\/$/, '');
    window.location.href = `${base}/gallery`;
  };

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
              <svg width="81" height="77" viewBox="0 0 81 77" fill="none">
                <circle cx="42.7176" cy="13.12" r="13.12" fill="#34BD43" />
                <path
                  d="M58.5385 14.9649C60.1166 12.2316 64.0619 12.2316 65.6399 14.9649L79.754 39.4111C81.332 42.1445 79.3594 45.5611 76.2033 45.5611H47.9752C44.8191 45.5611 42.8464 42.1445 44.4245 39.4111L58.5385 14.9649Z"
                  fill="#4C42CF"
                />
                <path
                  d="M19.0937 22.7066C18.3039 21.8763 17.08 21.6292 16.0295 22.0782C14.979 22.5273 14.312 23.5828 14.3665 24.7274L15.2591 44.0513L1.26111 57.4029C0.430805 58.1927 0.183651 59.4165 0.632714 60.467C1.08178 61.5175 2.13724 62.1846 3.28188 62.1301L22.6103 61.248L35.9724 75.2415C36.7472 76.0658 37.971 76.3129 39.0215 75.8639C40.072 75.4148 40.7391 74.3594 40.6846 73.2147L39.8025 53.8863L53.796 40.5242C54.6203 39.7494 54.8674 38.5256 54.4184 37.4751C53.9693 36.4246 52.9138 35.7575 51.7692 35.812L32.4453 36.7046L19.0937 22.7066Z"
                  fill="#0099F3"
                />
              </svg>
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
                        <div className={styles.feedbackIconBG}>
                          <FontAwesomeV6Icon
                            iconStyle="solid"
                            iconName="sparkle"
                            title="Audio"
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
                          color="tertiary"
                          startIcon={
                            <FontAwesomeV6Icon
                              iconStyle="solid"
                              iconName="microphone"
                              title="Audio"
                            />
                          }
                          variant={
                            explanationType === ExplanationTypes.AUDIO
                              ? 'outlined'
                              : 'contained'
                          }
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
                          color="tertiary"
                          startIcon={
                            <FontAwesomeV6Icon
                              iconStyle="solid"
                              iconName="pencil"
                              title="Text"
                            />
                          }
                          variant={
                            explanationType === ExplanationTypes.TEXT
                              ? 'outlined'
                              : 'contained'
                          }
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
                  onClick={() => {
                    challengeSetCallback(null, null);
                  }}
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
                  variant="contained"
                  color="primary"
                  size="extraSmall"
                  className={styles.submitButton}
                  startIcon={
                    <FontAwesomeV6Icon
                      iconStyle="solid"
                      iconName="arrow-left"
                    />
                  }
                  onClick={() => {
                    challengeSetCallback(null, null);
                  }}
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
                    onClick={() => setIsRecording(!isRecording)}
                  >
                    {isRecording
                      ? 'Stop Recording'
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
                    onClick={() => {
                      setShowConfirmation(true);
                      submitRef.current?.();
                    }}
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
