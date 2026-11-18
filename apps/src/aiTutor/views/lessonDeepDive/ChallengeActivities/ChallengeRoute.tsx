import {useApiClient} from '@code-dot-org/core/api';
import {
  Challenge,
  ChallengeBox,
  listChallenges,
} from '@code-dot-org/lesson-deep-dive';
import React, {FC, useCallback, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import {getClientApi} from '@cdo/apps/aichat/api/client';
import {useLessonDeepDiveChallengesEnabled} from '@cdo/apps/aiTutor/hooks/useLessonDeepDiveChallengesEnabled';
import {
  AiChatClientTypes,
  ChallengeTypes,
} from '@cdo/generated-scripts/sharedConstants';

import {STICKER_SECTIONS} from './stickers';
import WhiteboardChallenge from './WhiteboardChallenge';

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
  const api = useApiClient();
  const challengesEnabled = useLessonDeepDiveChallengesEnabled();
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

  const transcribeAudio = useCallback(
    async (audio: Blob) => {
      AichatContextManager.setContext({
        clientType: AiChatClientTypes.LESSON_DEEP_DIVE,
        currentLevelId: null,
        scriptId: null,
        channelId: undefined,
        lessonId,
      });
      const aichatClientApi = await getClientApi();
      return aichatClientApi.transcribeAudio(audio);
    },
    [lessonId]
  );

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
            stickerSections={STICKER_SECTIONS}
          />
        ) : null}
      </div>
    </div>
  );
};

export default ChallengeRoute;
