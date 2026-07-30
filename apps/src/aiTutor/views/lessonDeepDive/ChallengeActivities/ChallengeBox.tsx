import Dialog from '@code-dot-org/component-library/dialog';
import React, {FC, useCallback, useEffect, useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';
import {ChallengeTypes} from '@cdo/generated-scripts/sharedConstants';

import {Challenge, challengeValidator} from '../types';

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
    <div className={styles.challengeLayout}>
      <aside className={styles.sidebar}>
        <h3 className={styles.sidebarHeading}>Instructions</h3>
        {renderInstructions()}
      </aside>
      <div className={styles.activityColumn}>
        {challengeType === ChallengeTypes.WHITEBOARD ? (
          <WhiteboardChallenge
            challengeId={challenge?.id ?? null}
            submitted={submitted}
            submitCallback={handleSubmittedChange}
          />
        ) : (
          <VideoChallenge
            submitted={submitted}
            submitCallback={handleSubmittedChange}
            challenge={challenge}
          />
        )}
        {showConfirmation && (
          <Dialog
            title="Response submitted"
            description="Your work has been submitted. Your teacher will review it and share feedback with you."
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
