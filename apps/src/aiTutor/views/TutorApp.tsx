import {
  ChallengeGallery,
  TutorGalleryData,
} from '@code-dot-org/lesson-deep-dive';
import React, {FC} from 'react';
import {Navigate, Route, Routes} from 'react-router-dom';

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
          element={<ChallengeGallery tutorGalleryData={tutorGalleryData} />}
        />
      )}
    </Routes>
  );
};

export default TutorApp;
