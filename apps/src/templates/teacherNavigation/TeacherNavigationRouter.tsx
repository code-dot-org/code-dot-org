import React from 'react';
import {
  Route,
  Outlet,
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
import SectionLoginInfo from '../teacherDashboard/SectionLoginInfo';
import StatsTableWithData from '../teacherDashboard/StatsTableWithData';
import TextResponses from '../textResponses/TextResponses';

import DefaultTeacherNavRedirect from './DefaultTeacherNavRedirect';
import EmptySection from './EmptySection';
import PageHeader from './PageHeader';
import TeacherNavigationBar from './TeacherNavigationBar';
import {
  SECTION_ID_PATH_PART,
  TEACHER_NAVIGATION_PATHS,
} from './TeacherNavigationPaths';

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
        <Route
          path={''}
          element={
            <DefaultTeacherNavRedirect
              sectionId={sectionId}
              studentCount={studentCount}
            />
          }
        />
        <Route
          path={'*'}
          element={
            <DefaultTeacherNavRedirect
              sectionId={sectionId}
              studentCount={studentCount}
            />
          }
        />
        <Route
          path={TEACHER_NAVIGATION_PATHS.manageStudents}
          element={applyV1TeacherDashboardWidth(
            <ManageStudents studioUrlPrefix={studioUrlPrefix} />
          )}
        />
        <Route
          path={TEACHER_NAVIGATION_PATHS.loginInfo}
          element={applyV1TeacherDashboardWidth(
            <SectionLoginInfo
              studioUrlPrefix={studioUrlPrefix}
              sectionProviderName={sectionProviderName}
            />
          )}
        />
        <Route
          path={TEACHER_NAVIGATION_PATHS.standardsReport}
          element={
            <EmptySection
              showNoStudents={studentCount === 0}
              showNoCurriculumAssigned={!anyStudentHasProgress}
              element={applyV1TeacherDashboardWidth(<StandardsReport />)}
            />
          }
        />
        <Route
          path={TEACHER_NAVIGATION_PATHS.projects}
          element={
            <EmptySection
              showNoStudents={studentCount === 0}
              // Don't show no curriculum assigned error for projects tab.
              showNoCurriculumAssigned={false}
              element={applyV1TeacherDashboardWidth(
                <SectionProjectsListWithData
                  studioUrlPrefix={studioUrlPrefix}
                />
              )}
            />
          }
        />
        <Route
          path={TEACHER_NAVIGATION_PATHS.stats}
          element={
            <EmptySection
              showNoStudents={studentCount === 0}
              showNoCurriculumAssigned={!anyStudentHasProgress}
              element={applyV1TeacherDashboardWidth(<StatsTableWithData />)}
            />
          }
        />
        <Route
          path={TEACHER_NAVIGATION_PATHS.progress}
          element={
            <EmptySection
              showNoStudents={studentCount === 0}
              showNoCurriculumAssigned={!anyStudentHasProgress}
              element={<SectionProgressSelector />}
            />
          }
        />
        <Route
          path={TEACHER_NAVIGATION_PATHS.textResponses}
          element={
            <EmptySection
              showNoStudents={studentCount === 0}
              showNoCurriculumAssigned={!anyStudentHasProgress}
              element={applyV1TeacherDashboardWidth(<TextResponses />)}
            />
          }
        />
        <Route
          path={TEACHER_NAVIGATION_PATHS.assessments}
          element={
            <EmptySection
              showNoStudents={studentCount === 0}
              showNoCurriculumAssigned={!anyStudentHasProgress}
              element={applyV1TeacherDashboardWidth(
                <SectionAssessments sectionName={sectionName} />
              )}
            />
          }
        />
        {showAITutorTab && (
          <Route
            path={TEACHER_NAVIGATION_PATHS.aiTutorChatMessages}
            element={
              <EmptySection
                showNoStudents={studentCount === 0}
                showNoCurriculumAssigned={!anyStudentHasProgress}
                element={applyV1TeacherDashboardWidth(
                  <TutorTab sectionId={sectionId} />
                )}
              />
            }
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
