import React from 'react';
import {connect} from 'react-redux';
import {
  Route,
  Outlet,
  createRoutesFromElements,
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';

import TutorTab from '@cdo/apps/aiTutor/views/teacherDashboard/TutorTab';
import {setScriptId} from '@cdo/apps/redux/unitSelectionRedux';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

import ManageStudents from '../manageStudents/ManageStudents';
import {
  setLoginType,
  setShowSharingColumn,
} from '../manageStudents/manageStudentsRedux';
import SectionProjectsListWithData from '../projects/SectionProjectsListWithData';
import SectionAssessments from '../sectionAssessments/SectionAssessments';
import StandardsReport from '../sectionProgress/standards/StandardsReport';
import SectionProgressSelector from '../sectionProgressV2/SectionProgressSelector';
import SectionLoginInfo from '../teacherDashboard/SectionLoginInfo';
import StatsTableWithData from '../teacherDashboard/StatsTableWithData';
import {
  selectSection,
  setRosterProvider,
  setRosterProviderName,
  setStudentsForCurrentSection,
} from '../teacherDashboard/teacherSectionsRedux';
import TextResponses from '../textResponses/TextResponses';

import DefaultTeacherNavRedirect from './DefaultTeacherNavRedirect';
import ElementOrEmptyPage from './ElementOrEmptyPage';
import PageHeader from './PageHeader';
import TeacherNavigationBar from './TeacherNavigationBar';
import {
  SPECIFIC_SECTION_BASE_URL,
  TEACHER_NAVIGATION_BASE_URL,
  TEACHER_NAVIGATION_PATHS,
  TEACHER_NAVIGATION_SECTIONS_URL,
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
  selectSection: (selectedSectionId: number) => void;
  setScriptId: (scriptId: number) => void;
  setStudentsForCurrentSection: (
    sectionId: number,
    students: {
      id: number;
      name: string;
    }[]
  ) => void;
  setShowSharingColumn: (showSharingColumn: boolean) => void;
  setLoginType: (loginType: string) => void;
  setRosterProvider: (rosterProvider: string) => void;
  setRosterProviderName: (rosterProviderName: string) => void;
}

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
  selectSection,
  setScriptId,
  setStudentsForCurrentSection,
  setShowSharingColumn,
  setLoginType,
  setRosterProvider,
  setRosterProviderName,
}) => {
  const routes = (
    <Route
      path={TEACHER_NAVIGATION_SECTIONS_URL}
      element={
        <div className={styles.pageAndSidebar}>
          <TeacherNavigationBar />
          <Outlet />
        </div>
      }
    >
      <Route
        path={SPECIFIC_SECTION_BASE_URL}
        element={
          <div className={styles.pageWithHeader}>
            <PageHeader />
            <Outlet />
          </div>
        }
        loader={async ({params}) => {
          const response = await fetch(
            `/dashboardapi/section/${params.sectionId}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': await getAuthenticityToken(),
              },
            }
          );
          response.json().then(selectedSection => {
            console.log('lfm', selectedSection);

            selectSection(selectedSection.id);

            setStudentsForCurrentSection(
              selectedSection.id,
              selectedSection.students
            );
            // Default the scriptId to the script assigned to the section
            const defaultScriptId = selectedSection.script
              ? selectedSection.script.id
              : null;
            if (defaultScriptId) {
              setScriptId(defaultScriptId);
            }

            if (
              !selectedSection.sharing_disabled &&
              selectedSection.script.project_sharing
            ) {
              setShowSharingColumn(true);
            }
            setLoginType(selectedSection.login_type);
            setRosterProvider(selectedSection.login_type);
            setRosterProviderName(selectedSection.login_type_name);
          });
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
            <ElementOrEmptyPage
              showNoStudents={studentCount === 0}
              showNoCurriculumAssigned={!anyStudentHasProgress}
              element={applyV1TeacherDashboardWidth(<StandardsReport />)}
            />
          }
        />
        <Route
          path={TEACHER_NAVIGATION_PATHS.projects}
          element={
            <ElementOrEmptyPage
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
            <ElementOrEmptyPage
              showNoStudents={studentCount === 0}
              showNoCurriculumAssigned={!anyStudentHasProgress}
              element={applyV1TeacherDashboardWidth(<StatsTableWithData />)}
            />
          }
        />
        <Route
          path={TEACHER_NAVIGATION_PATHS.progress}
          element={
            <ElementOrEmptyPage
              showNoStudents={studentCount === 0}
              showNoCurriculumAssigned={!anyStudentHasProgress}
              element={<SectionProgressSelector />}
            />
          }
        />
        <Route
          path={TEACHER_NAVIGATION_PATHS.textResponses}
          element={
            <ElementOrEmptyPage
              showNoStudents={studentCount === 0}
              showNoCurriculumAssigned={!anyStudentHasProgress}
              element={applyV1TeacherDashboardWidth(<TextResponses />)}
            />
          }
        />
        <Route
          path={TEACHER_NAVIGATION_PATHS.assessments}
          element={
            <ElementOrEmptyPage
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
              <ElementOrEmptyPage
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

export default connect(
  state => ({}),
  dispatch => ({
    selectSection(selectedSectionId: number) {
      dispatch(selectSection(selectedSectionId));
    },
    setScriptId(scriptId: number) {
      console.log('lfm', scriptId);
      dispatch(setScriptId(scriptId));
    },
    setStudentsForCurrentSection(
      id: number,
      students: {id: number; name: string}[]
    ) {
      dispatch(setStudentsForCurrentSection(id, students));
    },
    setShowSharingColumn(showSharingColumn: boolean) {
      dispatch(setShowSharingColumn(showSharingColumn));
    },
    setLoginType(loginType: string) {
      dispatch(setLoginType(loginType));
    },
    setRosterProvider(rosterProvider: string) {
      dispatch(setRosterProvider(rosterProvider));
    },
    setRosterProviderName(rosterProviderName: string) {
      dispatch(setRosterProviderName(rosterProviderName));
    },
  })
)(TeacherNavigationRouter);
