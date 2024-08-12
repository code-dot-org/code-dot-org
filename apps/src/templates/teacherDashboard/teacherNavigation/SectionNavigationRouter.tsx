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

import SectionNavigablePageHeader from './TeacherDashboardHeaderV2';
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
              <SectionNavigablePageHeader />
              <Outlet />
            </div>
          }
        >
          <Route
            path={getSectionRouterPath('/')}
            element={
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
            }
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
            element={renderEmptyStateOrElement(
              applyV1TeacherDashboardWidth(<StandardsReport />)
            )}
          />
          <Route
            path={getSectionRouterPath(TEACHER_DASHBOARD_PATHS.projects)}
            element={renderEmptyStateOrElement(
              applyV1TeacherDashboardWidth(
                <SectionProjectsListWithData
                  studioUrlPrefix={studioUrlPrefix}
                />
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
    </Routes>
  );
};

export default SectionNavigationRouter;
