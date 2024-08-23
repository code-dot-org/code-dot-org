import React from 'react';
import {useSelector} from 'react-redux';
import {
  Route,
  Outlet,
  createRoutesFromElements,
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';

import TutorTab from '@cdo/apps/aiTutor/views/teacherDashboard/TutorTab';
import TemporaryBlankPage from '@cdo/apps/templates/teacherDashboard/teacherNavigation/TemporaryBlankPage';

import ManageStudents from '../manageStudents/ManageStudents';
import SectionProjectsListWithData from '../projects/SectionProjectsListWithData';
import SectionAssessments from '../sectionAssessments/SectionAssessments';
import StandardsReport from '../sectionProgress/standards/StandardsReport';
import SectionProgressSelector from '../sectionProgressV2/SectionProgressSelector';
import SectionsSetUpContainer from '../sectionsRefresh/SectionsSetUpContainer';
import SectionLoginInfo from '../teacherDashboard/SectionLoginInfo';
import StatsTableWithData from '../teacherDashboard/StatsTableWithData';
import {sectionProviderName} from '../teacherDashboard/teacherSectionsRedux';
import TextResponses from '../textResponses/TextResponses';

import DefaultTeacherNavRedirect from './DefaultTeacherNavRedirect';
import ElementOrEmptyPage from './ElementOrEmptyPage';
import PageHeader from './PageHeader';
import {asyncLoadSelectedSection} from './selectedSectionLoader';
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
  anyStudentHasProgress: boolean;
  showAITutorTab: boolean;
}

interface Section {
  id: number;
  rosterProviderName: string;
  anyStudentHasProgress: boolean;
  name: string;
}

const applyV1TeacherDashboardWidth = (children: React.ReactNode) => {
  return <div className={styles.widthLockedPage}>{children}</div>;
};

const TeacherNavigationRouter: React.FC<TeacherNavigationRouterProps> = ({
  studioUrlPrefix,
  anyStudentHasProgress,
  showAITutorTab,
}) => {
  const sectionId = useSelector(
    (state: {teacherSections: {selectedSectionId: number}}) =>
      state.teacherSections.selectedSectionId
  );

  const selectedSection = useSelector(
    (state: {
      teacherSections: {
        selectedSectionId: number | null;
        sections: {[id: number]: Section};
      };
    }) =>
      state.teacherSections.selectedSectionId
        ? state.teacherSections.sections[
            state.teacherSections.selectedSectionId
          ]
        : null
  );

  const sectionName = useSelector(
    (state: {teacherSections: {selectedSectionName: string}}) =>
      state.teacherSections.selectedSectionName
  );

  const studentCount = useSelector(
    (state: {teacherSections: {selectedStudents: object[]}}) =>
      state.teacherSections.selectedStudents.length
  );
  const providerName = useSelector(
    (state: {
      teacherSections: {
        section: {[id: number]: {rosterProviderName: string}};
        selectedSectionId: number;
      };
    }) => sectionProviderName(state, state.teacherSections.selectedSectionId)
  );

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
          if (params.sectionId) {
            await asyncLoadSelectedSection(params.sectionId);
          }
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
              sectionProviderName={providerName}
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
        <Route
          path={TEACHER_NAVIGATION_PATHS.lessonMaterials}
          element={
            <ElementOrEmptyPage
              showNoStudents={studentCount === 0}
              showNoCurriculumAssigned={!anyStudentHasProgress}
              element={applyV1TeacherDashboardWidth(<TemporaryBlankPage />)}
            />
          }
        />
        <Route
          path={TEACHER_NAVIGATION_PATHS.calendar}
          element={
            <ElementOrEmptyPage
              showNoStudents={studentCount === 0}
              showNoCurriculumAssigned={!anyStudentHasProgress}
              element={applyV1TeacherDashboardWidth(<TemporaryBlankPage />)}
            />
          }
        />
        <Route
          path={TEACHER_NAVIGATION_PATHS.courseOverview}
          element={
            <ElementOrEmptyPage
              showNoStudents={studentCount === 0}
              showNoCurriculumAssigned={!anyStudentHasProgress}
              element={applyV1TeacherDashboardWidth(<TemporaryBlankPage />)}
            />
          }
        />
        <Route
          path={TEACHER_NAVIGATION_PATHS.unitOverview}
          element={
            <ElementOrEmptyPage
              showNoStudents={studentCount === 0}
              showNoCurriculumAssigned={!anyStudentHasProgress}
              element={applyV1TeacherDashboardWidth(<TemporaryBlankPage />)}
            />
          }
        />
        <Route
          path={TEACHER_NAVIGATION_PATHS.settings}
          element={applyV1TeacherDashboardWidth(
            <SectionsSetUpContainer
              isUsersFirstSection={false}
              sectionToBeEdited={selectedSection}
            />
          )}
        />
        {showAITutorTab && (
          <Route
            path={TEACHER_NAVIGATION_PATHS.aiTutorChatMessages}
            element={
              <ElementOrEmptyPage
                showNoStudents={studentCount === 0}
                showNoCurriculumAssigned={!anyStudentHasProgress}
                element={applyV1TeacherDashboardWidth(
                  <TutorTab sectionId={sectionId || 0} />
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
