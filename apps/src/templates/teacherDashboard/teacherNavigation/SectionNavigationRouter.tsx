import React from 'react';
import {Routes, Route, Outlet, generatePath, Navigate} from 'react-router-dom';

import TutorTab from '@cdo/apps/aiTutor/views/teacherDashboard/TutorTab';

import ManageStudents from '../../manageStudents/ManageStudents';
import SectionProjectsListWithData from '../../projects/SectionProjectsListWithData';
import SectionAssessments from '../../sectionAssessments/SectionAssessments';
import StandardsReport from '../../sectionProgress/standards/StandardsReport';
import SectionProgressSelector from '../../sectionProgressV2/SectionProgressSelector';
import TeacherNavigationBar from '../../teacherNavigation/TeacherNavigationBar';
import TextResponses from '../../textResponses/TextResponses';
import EmptySection from '../EmptySection';
import SectionLoginInfo from '../SectionLoginInfo';
import StatsTableWithData from '../StatsTableWithData';

import TeacherDashboardHeaderV2 from './TeacherDashboardHeaderV2';
import {
  getSectionRouterPath,
  SECTION_ID_PATH_PART,
  TEACHER_DASHBOARD_PATHS,
} from './TeacherDashboardPaths';

import styles from './section-navigation.module.scss';

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

const applyV1TeacherDashboardWidth = (children: React.ReactNode) => {
  return <div className={styles.widthLockedPage}>{children}</div>;
};

const SectionNavigationRouter: React.FC<SectionNavigationRouterProps> = ({
  studioUrlPrefix,
  sectionId,
  sectionName,
  studentCount,
  anyStudentHasProgress,
  showAITutorTab,
  sectionProviderName,
}) => {
  // const navigate = useNavigate();
  // const location = useLocation();

  // React.useEffect(() => {
  //   // Select a default tab if current path doesn't match one of the paths in our TEACHER_DASHBOARD_PATHS type.
  //   const noMatchingPaths =
  //     _.find(
  //       Object.values(TEACHER_DASHBOARD_PATHS),
  //       path => matchPath(getPath(path), location.pathname) !== null
  //     ) === undefined;

  //   if (noMatchingPaths) {
  //     const nextPath =
  //       studentCount === 0
  //         ? TEACHER_DASHBOARD_PATHS.manageStudents
  //         : TEACHER_DASHBOARD_PATHS.progress;

  //     navigate(generatePath(getPath(nextPath), {sectionId: sectionId}));
  //   }
  // }, [navigate, location, studentCount, sectionId]);

  const renderEmptyStateOrElement = React.useCallback(
    (element: React.ReactNode) => {
      if (studentCount === 0) {
        return (
          <EmptySection hasStudents={false} hasCurriculumAssigned={true} />
        );
      }
      if (!anyStudentHasProgress) {
        return (
          <EmptySection hasStudents={true} hasCurriculumAssigned={false} />
        );
      }
      return element;
    },
    [studentCount, anyStudentHasProgress]
  );
  console.log('lfm', anyStudentHasProgress);
  return (
    <Routes>
      <Route
        element={
          <div className={styles.pageAndSidebar}>
            <TeacherNavigationBar />
            <Outlet />
          </div>
        }
      >
        <Route
          path={`${SECTION_ID_PATH_PART}/`}
          element={
            <div className={styles.pageWithHeader}>
              <TeacherDashboardHeaderV2 />
              <Outlet />
            </div>
          }
        >
          <Route
            element={renderEmptyStateOrElement(
              <Navigate
                to={generatePath(
                  getSectionRouterPath(
                    studentCount === 0
                      ? TEACHER_DASHBOARD_PATHS.manageStudents
                      : TEACHER_DASHBOARD_PATHS.progress
                  ),
                  {sectionId: sectionId}
                )}
                replace={true}
              />
            )}
            path={getSectionRouterPath('/*')}
          />
          <Route
            element={renderEmptyStateOrElement(
              <Navigate
                to={generatePath(
                  getSectionRouterPath(
                    studentCount === 0
                      ? TEACHER_DASHBOARD_PATHS.manageStudents
                      : TEACHER_DASHBOARD_PATHS.progress
                  ),
                  {sectionId: sectionId}
                )}
                replace={true}
              />
            )}
            path={getSectionRouterPath('/')}
          />
          <Route
            path={getSectionRouterPath(TEACHER_DASHBOARD_PATHS.manageStudents)}
            element={applyV1TeacherDashboardWidth(
              <ManageStudents studioUrlPrefix={studioUrlPrefix} />
            )}
          />
          <Route
            path={getSectionRouterPath(TEACHER_DASHBOARD_PATHS.loginInfo)}
            element={applyV1TeacherDashboardWidth(
              <SectionLoginInfo
                studioUrlPrefix={studioUrlPrefix}
                sectionProviderName={sectionProviderName}
              />
            )}
          />
          <Route
            path={getSectionRouterPath(TEACHER_DASHBOARD_PATHS.standardsReport)}
            element={applyV1TeacherDashboardWidth(<StandardsReport />)}
          />
          <Route
            path={getSectionRouterPath(TEACHER_DASHBOARD_PATHS.projects)}
            element={applyV1TeacherDashboardWidth(
              <SectionProjectsListWithData studioUrlPrefix={studioUrlPrefix} />
            )}
          />
          <Route
            path={getSectionRouterPath(TEACHER_DASHBOARD_PATHS.stats)}
            element={applyV1TeacherDashboardWidth(<StatsTableWithData />)}
          />
          <Route
            path={getSectionRouterPath(TEACHER_DASHBOARD_PATHS.progress)}
            element={renderEmptyStateOrElement(<SectionProgressSelector />)}
          />
          <Route
            path={getSectionRouterPath(TEACHER_DASHBOARD_PATHS.textResponses)}
            element={applyV1TeacherDashboardWidth(<TextResponses />)}
          />
          <Route
            path={getSectionRouterPath(TEACHER_DASHBOARD_PATHS.assessments)}
            element={applyV1TeacherDashboardWidth(
              <SectionAssessments sectionName={sectionName} />
            )}
          />
          {showAITutorTab && (
            <Route
              path={getSectionRouterPath(
                TEACHER_DASHBOARD_PATHS.aiTutorChatMessages
              )}
              element={applyV1TeacherDashboardWidth(
                <TutorTab sectionId={sectionId} />
              )}
            />
          )}
        </Route>
      </Route>
    </Routes>
  );
};

export default SectionNavigationRouter;
