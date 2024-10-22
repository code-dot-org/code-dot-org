import React from 'react';
import {useSelector} from 'react-redux';
import {
  Route,
  Outlet,
  createRoutesFromElements,
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';

import TutorTab from '@cdo/apps/aiTutor/views/teacherDashboard/TutorTab';
import TeacherUnitOverview from '@cdo/apps/code-studio/components/progress/TeacherUnitOverview';

import TeacherCourseOverview from '../courseOverview/TeacherCourseOverview';
import ManageStudents from '../manageStudents/ManageStudents';
import SectionProjectsListWithData from '../projects/SectionProjectsListWithData';
import SectionAssessments from '../sectionAssessments/SectionAssessments';
import StandardsReport from '../sectionProgress/standards/StandardsReport';
import SectionProgressSelector from '../sectionProgressV2/SectionProgressSelector';
import SectionsSetUpContainer from '../sectionsRefresh/SectionsSetUpContainer';
import SectionLoginInfo from '../teacherDashboard/SectionLoginInfo';
import StatsTableWithData from '../teacherDashboard/StatsTableWithData';
import {sectionProviderName} from '../teacherDashboard/teacherSectionsReduxSelectors';
import TextResponses from '../textResponses/TextResponses';

import ElementOrEmptyPage from './ElementOrEmptyPage';
import LessonMaterialsContainer, {
  lessonMaterialsLoader,
} from './lessonMaterials/LessonMaterialsContainer';
import PageHeader from './PageHeader';
import {asyncLoadSelectedSection} from './selectedSectionLoader';
import TeacherNavigationBar from './TeacherNavigationBar';
import {
  SPECIFIC_SECTION_BASE_URL,
  TEACHER_NAVIGATION_BASE_URL,
  TEACHER_NAVIGATION_PATHS,
  TEACHER_NAVIGATION_SECTIONS_URL,
} from './TeacherNavigationPaths';
import UnitCalendar from './UnitCalendar';

import styles from './teacher-navigation.module.scss';

interface TeacherNavigationRouterProps {
  studioUrlPrefix: string;
  showAITutorTab: boolean;
}

export interface Section {
  id: number;
  rosterProviderName: string;
  anyStudentHasProgress: boolean;
  name: string;
  courseVersionName: string;
  courseOfferingId: number;
  unitId: number;
  unitName: string;
  courseDisplayName: string;
  courseId: number;
}

const applyV1TeacherDashboardWidth = (children: React.ReactNode) => {
  return <div className={styles.widthLockedPage}>{children}</div>;
};

const TeacherNavigationRouter: React.FC<TeacherNavigationRouterProps> = ({
  studioUrlPrefix,
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

  const anyStudentHasProgress = React.useMemo(
    () => (selectedSection ? selectedSection.anyStudentHasProgress : true),
    [selectedSection]
  );

  const studentCount = useSelector(
    (state: {teacherSections: {selectedStudents: object[]}}) =>
      state.teacherSections.selectedStudents.length
  );
  const providerName = useSelector(
    (state: {
      teacherSections: {
        section: {[id: number]: Section};
        selectedSectionId: number;
      };
    }) => sectionProviderName(state, state.teacherSections.selectedSectionId)
  );

  const routes = React.useMemo(
    () => (
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
              console.log('lfm params.sectionId', params.sectionId);
              await asyncLoadSelectedSection(params.sectionId);
            }
            return null;
          }}
        >
          {/* <Route
          exact
            path={''}
            element={
              <Navigate to={TEACHER_NAVIGATION_PATHS.progress} replace={true} />
            }
          />
          <Route
            path={'*'}
            element={
              <Navigate to={TEACHER_NAVIGATION_PATHS.progress} replace={true} />
            }
          /> */}
          <Route
            path={TEACHER_NAVIGATION_PATHS.roster}
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
                element={<SectionProgressSelector isInV1Navigaton={false} />}
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
                  <SectionAssessments
                    sectionName={selectedSection?.name || ''}
                  />
                )}
              />
            }
          />
          <Route
            path={TEACHER_NAVIGATION_PATHS.lessonMaterials}
            loader={lessonMaterialsLoader}
            element={
              <ElementOrEmptyPage
                showNoStudents={studentCount === 0}
                showNoUnitAssigned={!selectedSection?.unitId}
                courseName={selectedSection?.courseDisplayName}
                showNoCurriculumAssigned={!anyStudentHasProgress}
                element={<LessonMaterialsContainer />}
              />
            }
          />
          <Route
            path={TEACHER_NAVIGATION_PATHS.calendar}
            element={
              <ElementOrEmptyPage
                showNoStudents={studentCount === 0}
                showNoCurriculumAssigned={!anyStudentHasProgress}
                element={applyV1TeacherDashboardWidth(<UnitCalendar />)}
              />
            }
          />
          <Route
            path={TEACHER_NAVIGATION_PATHS.courseOverview}
            element={
              <ElementOrEmptyPage
                showNoStudents={false}
                showNoCurriculumAssigned={
                  !!selectedSection &&
                  !selectedSection.courseVersionName &&
                  !selectedSection.courseOfferingId
                }
                element={applyV1TeacherDashboardWidth(
                  <TeacherCourseOverview />
                )}
              />
            }
          />
          <Route
            path={TEACHER_NAVIGATION_PATHS.unitOverview}
            element={applyV1TeacherDashboardWidth(
              <TeacherUnitOverview key={sectionId} />
            )}
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
        {/* /manage_students is the legacy url for /roster. Redirect to /roster so that old bookmarks continue to work */}
        <Route
          path={'manage_students'}
          element={
            <Navigate
              to={'../' + TEACHER_NAVIGATION_PATHS.roster}
              replace={true}
            />
          }
        />
      </Route>
    ),
    [
      sectionId,
      studentCount,
      providerName,
      anyStudentHasProgress,
      showAITutorTab,
      selectedSection,
      studioUrlPrefix,
    ]
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
