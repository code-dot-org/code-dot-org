import _ from 'lodash';
import React from 'react';
import {
  Routes,
  Route,
  Outlet,
  useNavigate,
  useLocation,
  generatePath,
  matchPath,
} from 'react-router-dom';

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

import {TEACHER_DASHBOARD_PATHS} from './TeacherDashboardPaths';

import dashboardStyles from '@cdo/apps/templates/teacherDashboard/teacher-dashboard.module.scss';

interface SectionNavigationRouterProps {
  studioUrlPrefix: string;
  sectionId: number;
  sectionName: string;
  studentCount: number;
  anyStudentHasProgress: boolean;
  showAITutorTab: boolean;
  sectionProviderName: string;
}

export const SECTION_NAVIGATION_BARE_URL = `/teacher_dashboard/sections/`;
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
  anyStudentHasProgress,
  showAITutorTab,
  sectionProviderName,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    // Select a default tab if current path doesn't match one of the paths in our TEACHER_DASHBOARD_PATHS type.
    const noMatchingPaths =
      _.find(
        Object.values(TEACHER_DASHBOARD_PATHS),
        path => matchPath(getPath(path), location.pathname) !== null
      ) === undefined;

    if (noMatchingPaths) {
      const nextPath =
        studentCount === 0
          ? TEACHER_DASHBOARD_PATHS.manageStudents
          : TEACHER_DASHBOARD_PATHS.progress;

      navigate(generatePath(getPath(nextPath), {sectionId: sectionId}));
    }
  }, [navigate, location, studentCount, sectionId]);

  return (
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
          path={getPath(TEACHER_DASHBOARD_PATHS.manageStudents)}
          element={applyV1TeacherDashboardWidth(
            <ManageStudents studioUrlPrefix={studioUrlPrefix} />
          )}
        />
        <Route
          path={getPath(TEACHER_DASHBOARD_PATHS.loginInfo)}
          element={applyV1TeacherDashboardWidth(
            <SectionLoginInfo
              studioUrlPrefix={studioUrlPrefix}
              sectionProviderName={sectionProviderName}
            />
          )}
        />
        <Route
          path={getPath(TEACHER_DASHBOARD_PATHS.standardsReport)}
          element={applyV1TeacherDashboardWidth(<StandardsReport />)}
        />
        {studentCount === 0 && (
          <Route
            element={
              <EmptySection hasStudents={false} hasCurriculumAssigned={true} />
            }
          />
        )}
        <Route
          path={getPath(TEACHER_DASHBOARD_PATHS.projects)}
          element={applyV1TeacherDashboardWidth(
            <SectionProjectsListWithData studioUrlPrefix={studioUrlPrefix} />
          )}
        />
        <Route
          path={getPath(TEACHER_DASHBOARD_PATHS.stats)}
          element={applyV1TeacherDashboardWidth(<StatsTableWithData />)}
        />
        {!anyStudentHasProgress && (
          <Route
            element={
              <EmptySection hasStudents={true} hasCurriculumAssigned={false} />
            }
          />
        )}
        <Route
          path={getPath(TEACHER_DASHBOARD_PATHS.progress)}
          element={<SectionProgressSelector />}
        />
        <Route
          path={getPath(TEACHER_DASHBOARD_PATHS.textResponses)}
          element={applyV1TeacherDashboardWidth(<TextResponses />)}
        />
        <Route
          path={getPath(TEACHER_DASHBOARD_PATHS.assessments)}
          element={applyV1TeacherDashboardWidth(
            <SectionAssessments sectionName={sectionName} />
          )}
        />
        {showAITutorTab && (
          <Route
            path={getPath(TEACHER_DASHBOARD_PATHS.aiTutorChatMessages)}
            element={applyV1TeacherDashboardWidth(
              <TutorTab sectionId={sectionId} />
            )}
          />
        )}
      </Route>
    </Routes>
  );
};

export default SectionNavigationRouter;
