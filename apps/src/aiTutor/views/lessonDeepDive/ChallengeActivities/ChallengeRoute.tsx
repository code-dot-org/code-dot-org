import {Challenge, challengeValidator} from '@code-dot-org/lesson-deep-dive';
import React, {FC, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

import experiments from '@cdo/apps/util/experiments';
import HttpClient from '@cdo/apps/util/HttpClient';
import {ChallengeTypes} from '@cdo/generated-scripts/sharedConstants';

import ChallengeBox from './ChallengeBox';

import styles from '../lesson-deep-dive-container.module.scss';

interface ChallengeRouteProps {
  lessonId: number;
}

const ChallengeRoute: FC<ChallengeRouteProps> = ({lessonId}) => {
  const {challengeId, modality} = useParams<{
    challengeId: string;
    modality: string;
  }>();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    params.append('lesson_id', lessonId.toString());
    HttpClient.fetchJson<Challenge[]>(
      `/challenges?${params}`,
      {},
      challengeValidator
    )
      .then(({value}) => {
        if (cancelled) return;
        const id = parseInt(challengeId ?? '', 10);
        const found = value?.find(c => c.id === id);
        if (found) {
          setChallenge(found);
        } else {
          navigate('/intervention', {replace: true});
        }
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [lessonId, challengeId, navigate]);

  if (
    !experiments.isEnabledAllowingQueryString(
      experiments.LESSON_TUTOR_CHALLENGE
    )
  ) {
    return null;
  }

  const challengeType =
    modality === ChallengeTypes.VIDEO
      ? ChallengeTypes.VIDEO
      : ChallengeTypes.WHITEBOARD;

  return (
    <div className={styles.container} data-theme="Dark">
      <div className={styles.box}>
        {loadFailed ? (
          <p>Couldn&apos;t load this challenge. Try refreshing.</p>
        ) : challenge ? (
          <ChallengeBox
            lessonId={lessonId}
            challenge={challenge}
            challengeType={challengeType}
          />
        ) : null}
      </div>
    </div>
  );
};

export default ChallengeRoute;
