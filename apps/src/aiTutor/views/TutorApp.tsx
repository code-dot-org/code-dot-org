import {
  ChallengeGallery,
  TutorGalleryData,
} from '@code-dot-org/lesson-deep-dive';
import React, {FC} from 'react';
import {Navigate, Route, Routes} from 'react-router-dom';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

import {useLessonDeepDiveChallengesEnabled} from '../hooks/useLessonDeepDiveChallengesEnabled';

import ChallengeRoute from './lessonDeepDive/ChallengeActivities/ChallengeRoute';
import LessonDeepDiveContainer from './lessonDeepDive/LessonDeepDiveContainer';
import {LessonDeepDiveData} from './lessonDeepDive/types';

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
  // The gallery events measure teacher review only.
  const isTeacher = !!tutorGalleryData?.is_teacher;

  const handleGalleryViewed = (sectionId: number | null, unitId: number) => {
    if (!isTeacher) return;
    analyticsReporter.sendEvent(EVENTS.TUTOR_PLUS_GALLERY_VIEWED, {
      section_id: sectionId,
      unit_id: unitId,
    });
  };

  const handleVisibilityToggled = (
    sectionId: number | null,
    responseId: number,
    approved: boolean
  ) => {
    if (!isTeacher) return;
    analyticsReporter.sendEvent(EVENTS.TUTOR_PLUS_GALLERY_VISIBILITY_TOGGLED, {
      section_id: sectionId,
      project_id: responseId,
      is_visible: approved,
    });
  };

  const handleReactionAdded = (
    sectionId: number | null,
    responseId: number
  ) => {
    if (!isTeacher) return;
    analyticsReporter.sendEvent(EVENTS.TUTOR_PLUS_GALLERY_REACTION_ADDED, {
      section_id: sectionId,
      project_id: responseId,
    });
  };

  return (
    <Routes>
      <Route index element={<Navigate to={defaultRoute} replace />} />
      {lessonDeepDiveData && (
        <>
          <Route
            path=":screenId"
            element={
              <LessonDeepDiveContainer
                lessonDeepDiveData={lessonDeepDiveData}
              />
            }
          />
          <Route
            path="challenge/:challengeId/:modality"
            element={<ChallengeRoute lessonId={lessonDeepDiveData.lessonId} />}
          />
        </>
      )}
      {tutorGalleryData && challengesEnabled && (
        <Route
          path="gallery"
          element={
            <ChallengeGallery
              tutorGalleryData={tutorGalleryData}
              onViewed={handleGalleryViewed}
              onVisibilityToggled={handleVisibilityToggled}
              onReactionAdded={handleReactionAdded}
            />
          }
        />
      )}
    </Routes>
  );
};

export default TutorApp;
