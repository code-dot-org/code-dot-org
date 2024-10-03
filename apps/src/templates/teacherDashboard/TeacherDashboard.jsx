import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {useEffect, useRef} from 'react';
import {Route, Routes, useLocation} from 'react-router-dom';

import TutorTab from '@cdo/apps/aiTutor/views/teacherDashboard/TutorTab';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import ManageStudents from '@cdo/apps/templates/manageStudents/ManageStudents';
import SectionProjectsListWithData from '@cdo/apps/templates/projects/SectionProjectsListWithData';
import SectionAssessments from '@cdo/apps/templates/sectionAssessments/SectionAssessments';
import SectionLoginInfo from '@cdo/apps/templates/teacherDashboard/SectionLoginInfo';
import TextResponses from '@cdo/apps/templates/textResponses/TextResponses';

import firehoseClient from '../../metrics/firehose';
import StandardsReport from '../sectionProgress/standards/StandardsReport';
import SectionProgressSelector from '../sectionProgressV2/SectionProgressSelector';

import EmptySectionV1 from './EmptySectionV1';
import StatsTableWithData from './StatsTableWithData';
import TeacherDashboardHeader from './TeacherDashboardHeader';
import TeacherDashboardNavigation, {
  TEACHER_DASHBOARD_PATHS,
} from './TeacherDashboardNavigation';

import dashboardStyles from '@cdo/apps/templates/teacherDashboard/teacher-dashboard.module.scss';

const applyV1TeacherDashboardWidth = children => {
  return <div className={dashboardStyles.dashboardPage}>{children}</div>;
};

function TeacherDashboard({
  studioUrlPrefix,
  sectionId,
  sectionName,
  studentCount,
  anyStudentHasProgress,
  showAITutorTab,
  sectionProviderName,
}) {
  let location = useLocation();

  const usePrevious = value => {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });

    return ref.current;
  };

  const useLocationChange = action => {
    const prevLocation = usePrevious(location);
    useEffect(() => {
      if (prevLocation) {
        action(location, prevLocation);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prevLocation]);
  };

  useLocationChange((location, prevLocation) => {
    const previousTab = _.last(_.split(prevLocation.pathname, '/'));
    const newTab = _.last(_.split(location.pathname, '/'));
    // Log if we switched tabs in the teacher dashboard
    firehoseClient.putRecord(
      {
        study: 'teacher_dashboard_actions',
        study_group: previousTab,
        event: 'click_new_tab',
        data_json: JSON.stringify({
          section_id: sectionId,
          new_tab: newTab,
        }),
      },
      {includeUserId: true}
    );
    if (newTab === 'progress') {
      analyticsReporter.sendEvent(EVENTS.PROGRESS_VIEWED, {
        sectionId: sectionId,
      });
    }
  });

  // Select a default tab if current path doesn't match one of the paths in our TEACHER_DASHBOARD_PATHS type.
  const emptyOrInvalidPath = !Object.values(TEACHER_DASHBOARD_PATHS).includes(
    location.pathname
  );
  if (emptyOrInvalidPath && studentCount === 0) {
    // Default to the Manage Students tab if section has 0 students.
    location.pathname = TEACHER_DASHBOARD_PATHS.manageStudents;
  } else if (emptyOrInvalidPath) {
    // Default to the Progress tab if section otherwise.
    location.pathname = TEACHER_DASHBOARD_PATHS.progress;
  }

  // Include header components unless we are on the /login_info or /standards_report page.
  const includeHeader =
    location.pathname !== TEACHER_DASHBOARD_PATHS.loginInfo &&
    location.pathname !== TEACHER_DASHBOARD_PATHS.standardsReport &&
    location.pathname !== TEACHER_DASHBOARD_PATHS.navTestV2;

  return (
    <div>
      {includeHeader && (
        <div>
          {/* TeacherDashboardNavigation must be outside of
            TeacherDashboardHeader. Routing components do not work with
            components using Connect/Redux. Library we could use to fix issue:
            https://github.com/supasate/connected-react-router */}
          <TeacherDashboardHeader />
          <TeacherDashboardNavigation showAITutorTab={showAITutorTab} />
        </div>
      )}
      <Routes>
        <Route
          path={TEACHER_DASHBOARD_PATHS.manageStudents}
          element={applyV1TeacherDashboardWidth(
            <ManageStudents studioUrlPrefix={studioUrlPrefix} />
          )}
        />
        <Route
          path={TEACHER_DASHBOARD_PATHS.loginInfo}
          element={applyV1TeacherDashboardWidth(
            <SectionLoginInfo
              studioUrlPrefix={studioUrlPrefix}
              sectionProviderName={sectionProviderName}
            />
          )}
        />
        <Route
          path={TEACHER_DASHBOARD_PATHS.standardsReport}
          element={
            <EmptySectionV1
              hasStudents={studentCount > 0}
              hasCurriculumAssigned={anyStudentHasProgress}
              element={applyV1TeacherDashboardWidth(<StandardsReport />)}
            />
          }
        />
        <Route
          path={TEACHER_DASHBOARD_PATHS.projects}
          element={
            <EmptySectionV1
              hasStudents={studentCount > 0}
              // Don't show no curriculum assigned error for projects tab.
              hasCurriculumAssigned={true}
              element={applyV1TeacherDashboardWidth(
                <SectionProjectsListWithData
                  studioUrlPrefix={studioUrlPrefix}
                />
              )}
            />
          }
        />
        <Route
          path={TEACHER_DASHBOARD_PATHS.stats}
          element={
            <EmptySectionV1
              hasStudents={studentCount > 0}
              hasCurriculumAssigned={anyStudentHasProgress}
              element={applyV1TeacherDashboardWidth(<StatsTableWithData />)}
            />
          }
        />
        <Route
          path={TEACHER_DASHBOARD_PATHS.progress}
          element={
            <EmptySectionV1
              hasStudents={studentCount > 0}
              hasCurriculumAssigned={anyStudentHasProgress}
              element={<SectionProgressSelector isInV1Navigaton={true} />}
              showProgressPageHeader={true}
            />
          }
        />
        <Route
          path={TEACHER_DASHBOARD_PATHS.textResponses}
          element={
            <EmptySectionV1
              hasStudents={studentCount > 0}
              hasCurriculumAssigned={anyStudentHasProgress}
              element={applyV1TeacherDashboardWidth(<TextResponses />)}
            />
          }
        />
        <Route
          path={TEACHER_DASHBOARD_PATHS.assessments}
          element={
            <EmptySectionV1
              hasStudents={studentCount > 0}
              hasCurriculumAssigned={anyStudentHasProgress}
              element={applyV1TeacherDashboardWidth(
                <SectionAssessments sectionName={sectionName} />
              )}
            />
          }
        />
        {showAITutorTab && (
          <Route
            path={TEACHER_DASHBOARD_PATHS.aiTutorChatMessages}
            element={
              <EmptySectionV1
                hasStudents={studentCount > 0}
                hasCurriculumAssigned={anyStudentHasProgress}
                element={applyV1TeacherDashboardWidth(
                  <TutorTab sectionId={sectionId} />
                )}
              />
            }
          />
        )}
      </Routes>
    </div>
  );
}

TeacherDashboard.propTypes = {
  studioUrlPrefix: PropTypes.string.isRequired,
  sectionId: PropTypes.number.isRequired,
  sectionName: PropTypes.string.isRequired,
  studentCount: PropTypes.number.isRequired,
  anyStudentHasProgress: PropTypes.bool.isRequired,
  showAITutorTab: PropTypes.bool,
  sectionProviderName: PropTypes.string,
};

export default TeacherDashboard;
