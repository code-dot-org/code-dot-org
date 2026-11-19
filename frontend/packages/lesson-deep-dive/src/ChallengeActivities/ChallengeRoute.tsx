import {type ComponentType, type FC, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

import {useApiClient} from '@code-dot-org/core/api';
import {ChallengeTypes} from '@code-dot-org/shared-constants';

import {listChallenges} from '../api';
import {type Challenge, type StickerSection} from '../types';

import ChallengeBox, {type WhiteboardChallengeProps} from './ChallengeBox';

import styles from '../lesson-deep-dive-container.module.scss';

interface ChallengeRouteProps {
  lessonId: number;
  challengesEnabled: boolean;
  WhiteboardChallenge: ComponentType<WhiteboardChallengeProps>;
  transcribeAudio: (audio: Blob) => Promise<string>;
  stickerSections: StickerSection[];
}

const ChallengeRoute: FC<ChallengeRouteProps> = ({
  lessonId,
  challengesEnabled,
  WhiteboardChallenge,
  transcribeAudio,
  stickerSections,
}) => {
  const {challengeId, modality} = useParams<{
    challengeId: string;
    modality: string;
  }>();
  const navigate = useNavigate();
  const api = useApiClient();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listChallenges(api.transport, lessonId)
      .then(challenges => {
        if (cancelled) return;
        const id = parseInt(challengeId ?? '', 10);
        const found = challenges.find(c => c.id === id);
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
  }, [api, lessonId, challengeId, navigate]);

  if (!challengesEnabled) {
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
            WhiteboardChallenge={WhiteboardChallenge}
            transcribeAudio={transcribeAudio}
            stickerSections={stickerSections}
          />
        ) : null}
      </div>
    </div>
  );
};

export default ChallengeRoute;
