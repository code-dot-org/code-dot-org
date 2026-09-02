import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  Challenge,
  ChallengeResponse,
  challengeResponseValidator,
  challengeValidator,
  EvaluationStatus,
  ExplanationTypes,
} from '@code-dot-org/lesson-deep-dive';
import {Button as MuiButton, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {FC, useCallback, useEffect, useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';
import {ChallengeTypes} from '@cdo/generated-scripts/sharedConstants';

import VideoChallenge from './VideoChallenge';
import WhiteboardChallenge from './WhiteboardChallenge';

import styles from './challenge-box.module.scss';

interface ChallengeBoxProps {
  lessonId: number;
}

// Terminal evaluation_status values that map to a student-facing error
// message. 'queued' and 'running' are not terminal (polling continues);
// 'success' is terminal but its text comes from student_feedback, not here.
const EVALUATION_ERROR_MESSAGES: Record<string, string> = {
  pii_violation: 'This challenge response contains personal information',
  profanity_violation: 'This challenge response contains profanity',
  failure: 'An error occured during evaluation',
};

const ChallengeBox: FC<ChallengeBoxProps> = ({lessonId}) => {
  const [submitted, setSubmitted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [challengeType, setChallengeType] = useState<string>(
    ChallengeTypes.WHITEBOARD
  );
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

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    params.append('lesson_id', lessonId.toString());
    const query = params.toString();
    HttpClient.fetchJson<Challenge[]>(
      `/challenges?${query}`,
      {},
      challengeValidator
    )
      .then(({value}) => {
        if (cancelled) {
          return;
        }
        const first = value?.[0];
        if (!first) {
          setLoadFailed(true);
          return;
        }
        setChallenge(first);
        if (first.default_modality) {
          setChallengeType(first.default_modality);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadFailed(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  const switchTo = (type: string) => {
    setChallengeType(type);
    setSubmitted(false);
  };

  const switchExplanationType = (type: string) => {
    setIsRecording(false);
    setExplanationType(type);
  };

  const renderInstructions = () => {
    if (challenge) {
      return <p className={styles.instructionsText}>{challenge.question}</p>;
    }
    if (loadFailed) {
      return (
        <p className={styles.instructionsText}>
          We couldn&apos;t load a challenge for this lesson.
        </p>
      );
    }
    return <p className={styles.instructionsText}>Loading challenge…</p>;
  };

  return (
    <div className={styles.topContainer}>
      <div
        className={showConfirmation ? styles.hidden : styles.challengeLayout}
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
                  <Typography variant="body3" className={styles.sidebarHeading}>
                    {evaluationText}
                  </Typography>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.sidebarContent}>
              <div>
                <h3 className={styles.sidebarHeading}>Instructions</h3>
                {renderInstructions()}
              </div>
              {challenge && challengeType === ChallengeTypes.WHITEBOARD && (
                <div className={styles.whiteboardButtonContainer}>
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
                  {explanationType === ExplanationTypes.AUDIO && (
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
                  {explanationType === ExplanationTypes.TEXT && (
                    <textarea
                      id="challenge-explanation"
                      className={styles.textArea}
                      placeholder="Write a paragraph explaining your work"
                      onChange={e => setTextExplanation(e.target.value)}
                      disabled={submitted}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </aside>
        <div className={styles.activityColumn}>
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
            />
          ) : (
            <VideoChallenge
              submitted={submitted}
              submitCallback={handleSubmittedChange}
              challenge={challenge}
              lessonId={lessonId}
              setEvaluationStatus={setEvaluationStatus}
              setChallengeResponseId={setChallengeResponseId}
            />
          )}
          <div className={styles.challengeToggle}>
            <button
              type="button"
              className={
                challengeType === ChallengeTypes.WHITEBOARD
                  ? styles.active
                  : undefined
              }
              onClick={() => switchTo(ChallengeTypes.WHITEBOARD)}
            >
              Whiteboard
            </button>
            <button
              type="button"
              className={
                challengeType === ChallengeTypes.VIDEO
                  ? styles.active
                  : undefined
              }
              onClick={() => switchTo(ChallengeTypes.VIDEO)}
            >
              Video
            </button>
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
