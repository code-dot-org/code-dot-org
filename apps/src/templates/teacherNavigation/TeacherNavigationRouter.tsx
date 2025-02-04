import React, {useEffect, useRef} from 'react';
import {useDispatch} from 'react-redux';
import {
  Route,
  Outlet,
  createRoutesFromElements,
  createBrowserRouter,
  RouterProvider,
  Navigate,
  useLocation,
  generatePath,
  useParams,
} from 'react-router-dom';

import TutorTab from '@cdo/apps/aiTutor/views/teacherDashboard/TutorTab';
import TeacherUnitOverview from '@cdo/apps/code-studio/components/progress/TeacherUnitOverview';
import GlobalEditionWrapper from '@cdo/apps/templates/GlobalEditionWrapper';
import {sectionDoesNotHaveNewData} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import TeacherCourseOverview from '../courseOverview/TeacherCourseOverview';
import ManageStudents from '../manageStudents/ManageStudents';
import SectionProjectsListWithData from '../projects/SectionProjectsListWithData';
import SectionAssessments from '../sectionAssessments/SectionAssessments';
import StandardsReport from '../sectionProgress/standards/StandardsReport';
import SectionProgressSelector from '../sectionProgressV2/SectionProgressSelector';
import SectionLoginInfo from '../teacherDashboard/SectionLoginInfo';
import StatsTableWithData from '../teacherDashboard/StatsTableWithData';
import {
  sectionProviderName,
  selectedSectionSelector,
} from '../teacherDashboard/teacherSectionsReduxSelectors';
import TextResponses from '../textResponses/TextResponses';

import DashboardSectionSettings from './DashboardSectionSettings';
import ElementOrEmptyPage from './ElementOrEmptyPage';
import LessonMaterialsContainer from './lessonMaterials/LessonMaterialsContainer';
import PageLayout from './PageLayout';
import {asyncLoadSelectedSection} from './selectedSectionLoader';
import TeacherNavigationBar from './TeacherNavigationBar';
import {
  LABELED_TEACHER_NAVIGATION_PATHS,
  SPECIFIC_SECTION_BASE_URL,
  TEACHER_NAVIGATION_BASE_URL,
  TEACHER_NAVIGATION_PATHS,
  TEACHER_NAVIGATION_SECTIONS_URL,
} from './TeacherNavigationPaths';
import UnitCalendar from './UnitCalendar';

import styles from './teacher-navigation.module.scss';

// This component doesn't render anything but rather tracks
// if new data needs to be reloaded.
const PathChangeHandler: React.FC<{needsReload: boolean}> = ({needsReload}) => {
  const dispatch = useDispatch();
  const urlSectionId = useParams().sectionId;

  const location = useLocation();
  const previousLocation = useRef(location.pathname);

  useEffect(() => {
    if (needsReload && previousLocation.current !== location.pathname) {
      asyncLoadSelectedSection(urlSectionId ? urlSectionId : '0', true);
      dispatch(sectionDoesNotHaveNewData());
    }
    previousLocation.current = location.pathname;
  }, [needsReload, location.pathname, urlSectionId, dispatch]);

  return null;
};

interface TeacherNavigationRouterProps {
  studioUrlPrefix: string;
  showAITutorTab: boolean;
}

const applyV1TeacherDashboardWidth = (children: React.ReactNode) => {
  return <div className={styles.widthLockedPage}>{children}</div>;
};

const TeacherNavigationRouter: React.FC<TeacherNavigationRouterProps> = ({
  studioUrlPrefix,
  showAITutorTab,
}) => {
  const sectionId = useAppSelector(
    state => state.teacherSections.selectedSectionId
  );
  const selectedSection = useAppSelector(selectedSectionSelector);

  const anyStudentHasProgress = React.useMemo(
    () => (selectedSection ? selectedSection.anyStudentHasProgress : true),
    [selectedSection]
  );

  const studentCount = useAppSelector(
    state => state.teacherSections.selectedStudents.length
  );

  const needsReload = useAppSelector(
    state => state.teacherSections.needsReload
  );

  const providerName = useAppSelector(state =>
    sectionProviderName(state, state.teacherSections.selectedSectionId)
  );

  const routes = React.useMemo(
    () => (
      <Route
        path={TEACHER_NAVIGATION_SECTIONS_URL}
        element={
          <>
            <PathChangeHandler
              needsReload={needsReload ? needsReload : false}
            />
            <div className={styles.pageAndSidebar}>
              <TeacherNavigationBar />
              <Outlet />
            </div>
          </>
        }
      >
        <Route path={SPECIFIC_SECTION_BASE_URL} element={<PageLayout />}>
          <Route
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
          />
          <Route
            path={TEACHER_NAVIGATION_PATHS.roster}
            element={<ManageStudents studioUrlPrefix={studioUrlPrefix} />}
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
                element={
                  <GlobalEditionWrapper
                    component={SectionProgressSelector}
                    componentId="SectionProgressSelector"
                    props={{
                      isInV1Navigaton: false,
                    }}
                  />
                }
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
            element={
              <LessonMaterialsContainer
                showNoCurriculumAssigned={
                  !!selectedSection &&
                  !selectedSection.courseVersionName &&
                  !selectedSection.courseOfferingId
                }
              />
            }
          />
          <Route
            path={TEACHER_NAVIGATION_PATHS.calendar}
            element={<UnitCalendar />}
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
                element={<TeacherCourseOverview />}
              />
            }
          />
          <Route
            path={TEACHER_NAVIGATION_PATHS.unitOverview}
            element={<TeacherUnitOverview />}
          />
          <Route
            path={TEACHER_NAVIGATION_PATHS.settings}
            element={
              <DashboardSectionSettings
                redirectUrl={
                  '/teacher_dashboard' +
                  generatePath(
                    LABELED_TEACHER_NAVIGATION_PATHS.progress.absoluteUrl,
                    {sectionId: sectionId}
                  )
                }
              />
            }
          />
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
    ),
    [
      needsReload,
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
