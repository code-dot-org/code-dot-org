import React from 'react';
import {BrowserRouter, Routes, Route, Outlet} from 'react-router-dom';

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
const SECTION_ID_PATH_PART = `/:sectionId`;

const applyV1TeacherDashboardWidth = (children: React.ReactNode) => {
  return <div className={dashboardStyles.dashboardPage}>{children}</div>;
};

const getPath = (pathUrl: string) => `${SECTION_ID_PATH_PART}${pathUrl}`;

const SectionNavigationRouter: React.FC<SectionNavigationRouterProps> = ({
  studioUrlPrefix,
  sectionId,
  sectionName,
  studentCount,
  coursesWithProgress,
  showAITutorTab,
  sectionProviderName,
}) => {
  console.log('lfm', getPath(TeacherDashboardPath.manageStudents));
  return (
    <BrowserRouter basename={BASE_URL}>
      <Routes>
        <Route
          path={`${SECTION_ID_PATH_PART}/`}
          element={
            <div>
              <h1>Main container with sidebar</h1>
              <Outlet />
            </div>
          }
        >
          <Route
            path={getPath(TeacherDashboardPath.manageStudents)}
            element={applyV1TeacherDashboardWidth(
              <ManageStudents studioUrlPrefix={studioUrlPrefix} />
            )}
          />
          <Route
            path={getPath(TeacherDashboardPath.loginInfo)}
            element={applyV1TeacherDashboardWidth(
              <SectionLoginInfo
                studioUrlPrefix={studioUrlPrefix}
                sectionProviderName={sectionProviderName}
              />
            )}
          />
          <Route
            path={getPath(TeacherDashboardPath.standardsReport)}
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
            path={getPath(TeacherDashboardPath.projects)}
            element={applyV1TeacherDashboardWidth(
              <SectionProjectsListWithData studioUrlPrefix={studioUrlPrefix} />
            )}
          />
          <Route
            path={getPath(TeacherDashboardPath.stats)}
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
            path={getPath(TeacherDashboardPath.progress)}
            element={<SectionProgressSelector />}
          />
          <Route
            path={getPath(TeacherDashboardPath.textResponses)}
            element={applyV1TeacherDashboardWidth(<TextResponses />)}
          />
          <Route
            path={getPath(TeacherDashboardPath.assessments)}
            element={applyV1TeacherDashboardWidth(
              <SectionAssessments sectionName={sectionName} />
            )}
          />
          {showAITutorTab && (
            <Route
              path={getPath(TeacherDashboardPath.aiTutorChatMessages)}
              element={applyV1TeacherDashboardWidth(
                <TutorTab sectionId={sectionId} />
              )}
            />
          )}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default SectionNavigationRouter;
