import {TutorGalleryData} from '@code-dot-org/lesson-deep-dive';
import React, {FC} from 'react';
import {Navigate, Route, Routes, useNavigate} from 'react-router-dom';

import ChallengeGallery from './gallery/ChallengeGallery';
import ClassProjectGallery from './gallery/ClassProjectGallery';
import GalleryViewSwitcher, {GalleryView} from './gallery/GalleryViewSwitcher';
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
  const navigate = useNavigate();
  const defaultRoute = lessonDeepDiveData ? 'welcome' : 'gallery';
  const viewSwitcher = (view: GalleryView) => (
    <GalleryViewSwitcher
      view={view}
      onChange={next =>
        navigate(next === 'projects' ? '/gallery/projects' : '/gallery')
      }
    />
  );

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
      {tutorGalleryData && (
        <>
          <Route
            path="gallery"
            element={
              <ChallengeGallery
                tutorGalleryData={tutorGalleryData}
                viewSwitcher={viewSwitcher('challenges')}
              />
            }
          />
          <Route
            path="gallery/projects"
            element={
              <ClassProjectGallery
                tutorGalleryData={tutorGalleryData}
                viewSwitcher={viewSwitcher('projects')}
              />
            }
          />
        </>
      )}
    </Routes>
  );
};

export default TutorApp;
