import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';

import TutorTab from '@cdo/apps/aiTutor/views/teacherDashboard/TutorTab';

import ManageStudents from '../../manageStudents/ManageStudents';
import SectionProjectsListWithData from '../../projects/SectionProjectsListWithData';
import SectionAssessments from '../../sectionAssessments/SectionAssessments';
import StandardsReport from '../../sectionProgress/standards/StandardsReport';
import SectionProgressSelector from '../../sectionProgressV2/SectionProgressSelector';
import TextResponses from '../../textResponses/TextResponses';
import EmptySection from '../EmptySection';
import SectionLoginInfo from '../SectionLoginInfo';
import StatsTableWithData from '../StatsTableWithData';
import {TeacherDashboardPath} from '../TeacherDashboardNavigation';

import dashboardStyles from '@cdo/apps/templates/teacherDashboard/teacher-dashboard.module.scss';

interface CourseWithProgress {
  // TODO : fill in
}

interface SectionNavigationRouterProps {
  studioUrlPrefix: string;
  sectionId: number;
  sectionName: string;
  studentCount: number;
  coursesWithProgress: Array<CourseWithProgress>;
  showAITutorTab: boolean;
  sectionProviderName: string;
}

const BASE_URL = `/teacher_dashboard/sections/`;

const applyV1TeacherDashboardWidth = (children: React.ReactNode) => {
  return <div className={dashboardStyles.dashboardPage}>{children}</div>;
};

const SectionNavigationRouter: React.FC<SectionNavigationRouterProps> = ({
  studioUrlPrefix,
  sectionId,
  sectionName,
  studentCount,
  coursesWithProgress,
  showAITutorTab,
  sectionProviderName,
}) => {
  return (
    <BrowserRouter basename={BASE_URL}>
      <Routes>
        <Route
          path="/:sectionId/*"
          element={<div>Main container with sidebar</div>}
        >
          <Routes>
            <Route
              path={TeacherDashboardPath.manageStudents}
              element={applyV1TeacherDashboardWidth(
                <ManageStudents studioUrlPrefix={studioUrlPrefix} />
              )}
            />
            <Route
              path={TeacherDashboardPath.loginInfo}
              element={applyV1TeacherDashboardWidth(
                <SectionLoginInfo
                  studioUrlPrefix={studioUrlPrefix}
                  sectionProviderName={sectionProviderName}
                />
              )}
            />
            <Route
              path={TeacherDashboardPath.standardsReport}
              element={applyV1TeacherDashboardWidth(<StandardsReport />)}
            />
            {studentCount === 0 && (
              <Route
                element={
                  <EmptySection
                    hasStudents={false}
                    hasCurriculumAssigned={true}
                  />
                }
              />
            )}
            <Route
              path={TeacherDashboardPath.projects}
              element={applyV1TeacherDashboardWidth(
                <SectionProjectsListWithData
                  studioUrlPrefix={studioUrlPrefix}
                />
              )}
            />
            <Route
              path={TeacherDashboardPath.stats}
              element={applyV1TeacherDashboardWidth(<StatsTableWithData />)}
            />
            {coursesWithProgress.length === 0 && (
              <Route
                element={
                  <EmptySection
                    hasStudents={true}
                    hasCurriculumAssigned={false}
                  />
                }
              />
            )}
            <Route
              path={TeacherDashboardPath.progress}
              element={<SectionProgressSelector />}
            />
            <Route
              path={TeacherDashboardPath.textResponses}
              element={applyV1TeacherDashboardWidth(<TextResponses />)}
            />
            <Route
              path={TeacherDashboardPath.assessments}
              element={applyV1TeacherDashboardWidth(
                <SectionAssessments sectionName={sectionName} />
              )}
            />
            {showAITutorTab && (
              <Route
                path={TeacherDashboardPath.aiTutorChatMessages}
                element={applyV1TeacherDashboardWidth(
                  <TutorTab sectionId={sectionId} />
                )}
              />
            )}
          </Routes>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default SectionNavigationRouter;
