import {
  ChallengeGallery,
  ChallengeRoute,
  LessonDeepDiveContainer,
  LessonDeepDiveData,
  TutorGalleryData,
} from '@code-dot-org/lesson-deep-dive';
import React, {FC, useCallback} from 'react';
import {Navigate, Route, Routes} from 'react-router-dom';

import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import {getClientApi} from '@cdo/apps/aichat/api/client';
import TutorVideo from '@cdo/apps/jsonVideo/TutorVideo';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import experiments from '@cdo/apps/util/experiments';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import {useLessonDeepDiveChallengesEnabled} from '../hooks/useLessonDeepDiveChallengesEnabled';

import {STICKER_SECTIONS} from './lessonDeepDive/ChallengeActivities/stickers';
import WhiteboardChallenge from './lessonDeepDive/ChallengeActivities/WhiteboardChallenge';
import TutorChat from './lessonDeepDive/ReviewModalities/TutorChat';
import TutorFeedback from './lessonDeepDive/SkillsCheck/TutorFeedback';

interface TutorAppProps {
  lessonDeepDiveData: LessonDeepDiveData | null;
  tutorGalleryData: TutorGalleryData | null;
}

const TutorApp: FC<TutorAppProps> = ({
  lessonDeepDiveData,
  tutorGalleryData,
}) => {
  const defaultRoute = lessonDeepDiveData ? 'welcome' : 'gallery';
  const challengesEnabled = useLessonDeepDiveChallengesEnabled();
  const userId = useAppSelector(state => state.currentUser.userId);
  const lessonId = lessonDeepDiveData?.lessonId;
  const lessonName = lessonDeepDiveData?.lessonName;

  const reportModalityClick = useCallback(
    (modality: string) =>
      analyticsReporter.sendEvent(
        EVENTS.AI_TUTOR_LESSON_DEEP_DIVE_MODALITY_CLICKED,
        {modality, lessonId, lessonName, userId}
      ),
    [lessonId, lessonName, userId]
  );

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

  return (
    <Routes>
      <Route index element={<Navigate to={defaultRoute} replace />} />
      {lessonDeepDiveData && (
        <>
          <Route
            path=":screenId"
            element={
              experiments.isEnabledAllowingQueryString(
                experiments.LESSON_TUTOR
              ) && (
                <LessonDeepDiveContainer
                  lessonDeepDiveData={lessonDeepDiveData}
                  challengesEnabled={challengesEnabled}
                  VideoPlayer={TutorVideo}
                  TutorChat={TutorChat}
                  TutorFeedback={TutorFeedback}
                  onModalitySelected={reportModalityClick}
                />
              )
            }
          />
          <Route
            path="challenge/:challengeId/:modality"
            element={
              <ChallengeRoute
                lessonId={lessonDeepDiveData.lessonId}
                challengesEnabled={challengesEnabled}
                WhiteboardChallenge={WhiteboardChallenge}
                transcribeAudio={transcribeAudio}
                stickerSections={STICKER_SECTIONS}
              />
            }
          />
        </>
      )}
      {tutorGalleryData && challengesEnabled && (
        <Route
          path="gallery"
          element={<ChallengeGallery tutorGalleryData={tutorGalleryData} />}
        />
      )}
    </Routes>
  );
};

export default TutorApp;
