import Dialog from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import React, {FC, useCallback, useEffect, useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';
import {ChallengeTypes} from '@cdo/generated-scripts/sharedConstants';

import {Challenge, challengeValidator, ExplanationTypes} from '../types';

import VideoChallenge from './VideoChallenge';
import WhiteboardChallenge from './WhiteboardChallenge';

import styles from './challenge-box.module.scss';

interface ChallengeBoxProps {
  lessonId: number;
}

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
    },
    []
  );

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
    <div className={styles.challengeLayout} data-theme="Dark">
      <aside className={styles.sidebar}>
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
                onClick={() => switchExplanationType(ExplanationTypes.AUDIO)}
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
                onClick={() => switchExplanationType(ExplanationTypes.TEXT)}
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
                id="reflection-success"
                className={styles.textArea}
                placeholder="Optional"
                onChange={e => setTextExplanation(e.target.value)}
                disabled={submitted}
              />
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
          />
        ) : (
          <VideoChallenge
            submitted={submitted}
            submitCallback={handleSubmittedChange}
            challenge={challenge}
            lessonId={lessonId}
          />
        )}
        {showConfirmation && (
          <Dialog
            title="Response submitted"
            description="Your work has been submitted. Check back soon to see feedback on your work."
            onClose={() => setShowConfirmation(false)}
            primaryButtonProps={{
              children: 'OK',
              size: 'small',
              onClick: () => setShowConfirmation(false),
            }}
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
              challengeType === ChallengeTypes.VIDEO ? styles.active : undefined
            }
            onClick={() => switchTo(ChallengeTypes.VIDEO)}
          >
            Video
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeBox;
