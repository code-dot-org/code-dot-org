import React, {FC, useEffect, useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import VideoChallenge from './VideoChallenge';
import WhiteboardChallenge from './WhiteboardChallenge';

import styles from './challenge-box.module.scss';

type ChallengeType = 'video' | 'whiteboard';

// Mirrors Challenge#summarize in dashboard/app/models/challenge.rb.
export interface Challenge {
  id: number;
  lesson_id: number;
  question: string;
  default_modality: ChallengeType | null;
  whiteboard_starter_image_alt_text: string | null;
}

interface ChallengeBoxProps {
  lessonId: number;
}

const ChallengeBox: FC<ChallengeBoxProps> = ({lessonId}) => {
  const [submitted, setSubmitted] = useState(false);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [challengeType, setChallengeType] =
    useState<ChallengeType>('whiteboard');

  useEffect(() => {
    let cancelled = false;
    HttpClient.fetchJson<Challenge[]>(`/challenges?lesson_id=${lessonId}`)
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

  const switchTo = (type: ChallengeType) => {
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
        {challengeType === 'whiteboard' ? (
          <WhiteboardChallenge
            challengeId={challenge?.id ?? null}
            submitted={submitted}
            submitCallback={setSubmitted}
          />
        ) : (
          <VideoChallenge submitted={submitted} submitCallback={setSubmitted} />
        )}
        <div className={styles.challengeToggle}>
          <button
            type="button"
            className={
              challengeType === 'whiteboard' ? styles.active : undefined
            }
            onClick={() => switchTo('whiteboard')}
          >
            Whiteboard
          </button>
          <button
            type="button"
            className={challengeType === 'video' ? styles.active : undefined}
            onClick={() => switchTo('video')}
          >
            Video
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeBox;
