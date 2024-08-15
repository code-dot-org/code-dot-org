import React from 'react';
import {
  Route,
  Outlet,
  generatePath,
  Navigate,
  createRoutesFromElements,
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';

import TutorTab from '@cdo/apps/aiTutor/views/teacherDashboard/TutorTab';

import ManageStudents from '../manageStudents/ManageStudents';
import SectionProjectsListWithData from '../projects/SectionProjectsListWithData';
import SectionAssessments from '../sectionAssessments/SectionAssessments';
import StandardsReport from '../sectionProgress/standards/StandardsReport';
import SectionProgressSelector from '../sectionProgressV2/SectionProgressSelector';
import EmptySection from '../teacherDashboard/EmptySection';
import SectionLoginInfo from '../teacherDashboard/SectionLoginInfo';
import StatsTableWithData from '../teacherDashboard/StatsTableWithData';
import TextResponses from '../textResponses/TextResponses';

import PageHeader from './PageHeader';
import {
  getSectionRouterPath,
  SECTION_ID_PATH_PART,
  TEACHER_DASHBOARD_PATHS,
} from './TeacherDashboardPaths';
import TeacherNavigationBar from './TeacherNavigationBar';

import styles from './teacher-navigation.module.scss';

interface TeacherNavigationRouterProps {
  studioUrlPrefix: string;
  sectionId: number;
  sectionName: string;
  studentCount: number;
  anyStudentHasProgress: boolean;
  showAITutorTab: boolean;
  sectionProviderName: string;
}

export const TEACHER_NAVIGATION_BASE_URL = `/teacher_dashboard/sections/`;

const applyV1TeacherDashboardWidth = (children: React.ReactNode) => {
  return <div className={styles.widthLockedPage}>{children}</div>;
};

const TeacherNavigationRouter: React.FC<TeacherNavigationRouterProps> = ({
  studioUrlPrefix,
  sectionId,
  sectionName,
  studentCount,
  anyStudentHasProgress,
  showAITutorTab,
  sectionProviderName,
}) => {
  const renderEmptyStateOrElement = React.useCallback(
    (element: React.ReactNode) => {
      if (studentCount === 0 || !anyStudentHasProgress) {
        return (
          <EmptySection
            hasStudents={studentCount !== 0}
            hasCurriculumAssigned={!anyStudentHasProgress}
          />
        );
      }
      return element;
    },
    [studentCount, anyStudentHasProgress]
  );

  const redirectToDefaultPath = React.useMemo(
    () => (
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
    ),
    [sectionId, studentCount]
  );

  const routes = (
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
            <PageHeader />
            <Outlet />
          </div>
        }
        loader={async () => {
          console.log('loading');
          return null;
        }}
      >
        <Route path={''} element={redirectToDefaultPath} />
        <Route path={'*'} element={redirectToDefaultPath} />
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
          element={renderEmptyStateOrElement(
            applyV1TeacherDashboardWidth(<StandardsReport />)
          )}
        />
        <Route
          path={getSectionRouterPath(TEACHER_DASHBOARD_PATHS.projects)}
          element={renderEmptyStateOrElement(
            applyV1TeacherDashboardWidth(
              <SectionProjectsListWithData studioUrlPrefix={studioUrlPrefix} />
            )
          )}
        />
        <Route
          path={getSectionRouterPath(TEACHER_DASHBOARD_PATHS.stats)}
          element={renderEmptyStateOrElement(
            applyV1TeacherDashboardWidth(<StatsTableWithData />)
          )}
        />
        <Route
          path={getSectionRouterPath(TEACHER_DASHBOARD_PATHS.progress)}
          element={renderEmptyStateOrElement(
            renderEmptyStateOrElement(<SectionProgressSelector />)
          )}
        />
        <Route
          path={getSectionRouterPath(TEACHER_DASHBOARD_PATHS.textResponses)}
          element={renderEmptyStateOrElement(
            applyV1TeacherDashboardWidth(<TextResponses />)
          )}
        />
        <Route
          path={getSectionRouterPath(TEACHER_DASHBOARD_PATHS.assessments)}
          element={renderEmptyStateOrElement(
            applyV1TeacherDashboardWidth(
              <SectionAssessments sectionName={sectionName} />
            )
          )}
        />
        {showAITutorTab && (
          <Route
            path={getSectionRouterPath(
              TEACHER_DASHBOARD_PATHS.aiTutorChatMessages
            )}
            element={renderEmptyStateOrElement(
              applyV1TeacherDashboardWidth(<TutorTab sectionId={sectionId} />)
            )}
          />
        )}
      </Route>
    </Route>
  );

  return (
    <RouterProvider
      router={createBrowserRouter(createRoutesFromElements(routes), {
        basename: TEACHER_NAVIGATION_BASE_URL,
      })}
    />
  );
};

export default TeacherNavigationRouter;
