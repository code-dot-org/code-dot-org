import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';

import TeacherDashboard from '../TeacherDashboard';

interface CoursesWithProgressType {}

interface SectionNavigationRouterProps {
  studioUrlPrefix: string;
  sectionId: number;
  sectionName: string;
  studentCount: number;
  coursesWithProgress: Array<CoursesWithProgressType>;
  showAITutorTab: boolean;
  sectionProviderName: string;
}

const SectionNavigationRouter: React.FC<SectionNavigationRouterProps> = ({
  studioUrlPrefix,
  sectionId,
  sectionName,
  studentCount,
  coursesWithProgress,
  showAITutorTab,
  sectionProviderName,
}) => {
  const baseUrl = `/teacher_dashboard/sections/${sectionId}`;
  return (
    <BrowserRouter basename={baseUrl}>
      <Routes>
        <Route
          path="/*"
          element={
            <TeacherDashboard
              studioUrlPrefix={studioUrlPrefix}
              sectionId={sectionId}
              sectionName={sectionName}
              studentCount={studentCount}
              coursesWithProgress={coursesWithProgress}
              showAITutorTab={showAITutorTab}
              sectionProviderName={sectionProviderName}
            />
          }
        />
        <Route path="/test" element={<div>TESTING</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default SectionNavigationRouter;
