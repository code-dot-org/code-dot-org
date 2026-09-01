import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {FC, useCallback, useEffect, useRef, useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';
import {ChallengeTypes} from '@cdo/generated-scripts/sharedConstants';

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
            setPolling(false);
            setShowConfirmation(false);
            setEvaluationStatus(outcome.status);
            setEvaluationText(outcome.text);
            setEvaluationDatetime(formatTimestamp(value.created_at));
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
          {evaluationText ? (
            <div className={styles.feedbackContainer}>
              <Typography variant="overline3" className={styles.feedbackLabel}>
                Feedback
              </Typography>
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
          ) : (
            <div className={styles.sidebarContent}>
              <div>
                <Typography
                  variant="overline2"
                  className={styles.sidebarHeading}
                >
                  Create
                </Typography>
                <Typography variant="body3" className={styles.instructionsText}>
                  {challenge.question}
                </Typography>
              </div>
              {challengeType === ChallengeTypes.WHITEBOARD && (
                <div className={styles.whiteboardButtonContainer}>
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
                      Use audio or text to explain what you created.
                    </Typography>
                  </div>
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
                </div>
              )}
            </div>
          )}
        </aside>
        <div className={styles.mainColumn}>
          <div className={styles.topBar}>
            {evaluationStatus === EvaluationStatus.SUCCESS ? (
              // Review state: once the tutor's feedback is in, the actions
              // turn to browsing the gallery rather than editing this attempt.
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
                  // disabled={!canSubmit}
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
                      Write a short paragraph explaining your work.
                    </Typography>
                  </div>
                  <textarea
                    id="challenge-explanation"
                    className={styles.textArea}
                    placeholder="Write your explanation here"
                    onChange={e => setTextExplanation(e.target.value)}
                    disabled={submitted}
                  />
                </div>
              )}
            </div>
            <div className={styles.bottomPanel}>
              {isRecordable && (
                <MuiButton
                  size="medium"
                  color={isRecording ? 'error' : 'secondary'}
                  startIcon={
                    <FontAwesomeV6Icon
                      iconStyle="solid"
                      iconName={isRecording ? 'square' : 'circle'}
                      title={isRecording ? 'Stop' : 'Record'}
                    />
                  }
                  variant="contained"
                  disabled={submitted}
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
                  onClick={() => submitRef.current?.()}
                >
                  Submit
                </MuiButton>
              )}
            </div>
          </div>
        </div>
      </div>
      {showConfirmation && (
        <div className={styles.waitingDisplay}>
          <svg width="228" height="216" viewBox="0 0 228 216" fill="none">
            <circle cx="120.262" cy="36.936" r="36.936" fill="#34BD43" />
            <path
              d="M164.802 42.1301C169.245 34.4352 180.352 34.4352 184.795 42.1302L224.529 110.952C228.972 118.647 223.418 128.266 214.533 128.266H135.064C126.179 128.266 120.625 118.647 125.068 110.952L164.802 42.1301Z"
              fill="#4C42CF"
            />
            <path
              d="M53.7485 63.925C51.525 61.5875 48.0796 60.8917 45.1221 62.1559C42.1647 63.4202 40.2868 66.3916 40.4401 69.614L42.9532 124.016L3.54528 161.604C1.20778 163.827 0.511976 167.273 1.7762 170.23C3.04042 173.187 6.01182 175.065 9.23428 174.912L63.6485 172.429L101.266 211.824C103.447 214.144 106.893 214.84 109.85 213.576C112.808 212.312 114.686 209.34 114.532 206.118L112.049 151.704L151.444 114.086C153.765 111.905 154.46 108.459 153.196 105.502C151.932 102.544 148.961 100.667 145.738 100.82L91.3366 103.333L53.7485 63.925Z"
              fill="#0099F3"
            />
          </svg>
          <Typography variant="h5">Tutor is writing feedback...</Typography>
        </div>
      )}
    </div>
  );
};

export default ChallengeBox;
