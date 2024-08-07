import React from 'react';
import {
  Routes,
  Route,
  Outlet,
  useNavigate,
  useLocation,
  generatePath,
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
import {TeacherDashboardPath} from '../TeacherDashboardNavigation';

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
    // Select a default tab if current path doesn't match one of the paths in our TeacherDashboardPath type.
    const emptyOrInvalidPath = !Object.values(TeacherDashboardPath).includes(
      location.pathname
    );
    if (emptyOrInvalidPath) {
      const nextPath =
        studentCount === 0
          ? TeacherDashboardPath.manageStudents
          : TeacherDashboardPath.progress;

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
              <EmptySection hasStudents={false} hasCurriculumAssigned={true} />
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
        {!anyStudentHasProgress && (
          <Route
            element={
              <EmptySection hasStudents={true} hasCurriculumAssigned={false} />
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
  );
};

export default SectionNavigationRouter;
