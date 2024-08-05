import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {useEffect, useRef} from 'react';
import {Route, Switch, useLocation} from 'react-router-dom';

import TutorTab from '@cdo/apps/aiTutor/views/teacherDashboard/TutorTab';
import DCDO from '@cdo/apps/dcdo';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import ManageStudents from '@cdo/apps/templates/manageStudents/ManageStudents';
import SectionProjectsListWithData from '@cdo/apps/templates/projects/SectionProjectsListWithData';
import SectionAssessments from '@cdo/apps/templates/sectionAssessments/SectionAssessments';
import SectionLoginInfo from '@cdo/apps/templates/teacherDashboard/SectionLoginInfo';
import TextResponses from '@cdo/apps/templates/textResponses/TextResponses';
import experiments from '@cdo/apps/util/experiments';
import i18n from '@cdo/locale';

import {Heading1} from '../../lib/ui/Headings';
import firehoseClient from '../../lib/util/firehose';
import StandardsReport from '../sectionProgress/standards/StandardsReport';
import SectionProgressSelector from '../sectionProgressV2/SectionProgressSelector';
import TeacherNavigationBar from '../teacherNavigation/TeacherNavigationBar';

import EmptySection from './EmptySection';
import StatsTableWithData from './StatsTableWithData';
import TeacherDashboardHeader from './TeacherDashboardHeader';
import TeacherDashboardNavigation, {
  TeacherDashboardPath,
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
  coursesWithProgress,
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

  const teacherNavV2Enabled =
    DCDO.get('teacher-local-nav-v2', false) ||
    experiments.isEnabled(experiments.TEACHER_LOCAL_NAV_V2);

  // Select a default tab if current path doesn't match one of the paths in our TeacherDashboardPath type.
  const emptyOrInvalidPath = !Object.values(TeacherDashboardPath).includes(
    location.pathname
  );
  if (emptyOrInvalidPath && studentCount === 0) {
    // Default to the Manage Students tab if section has 0 students.
    location.pathname = TeacherDashboardPath.manageStudents;
  } else if (emptyOrInvalidPath) {
    // Default to the Progress tab if section otherwise.
    location.pathname = TeacherDashboardPath.progress;
  }

  // Include header components unless we are on the /login_info or /standards_report page.
  const includeHeader =
    location.pathname !== TeacherDashboardPath.loginInfo &&
    location.pathname !== TeacherDashboardPath.standardsReport;

  const generateEmptySectionGraphic = (hasStudents, hasCurriculumAssigned) => {
    return (
      <div className={dashboardStyles.emptyClassroomDiv}>
        {location.pathname === TeacherDashboardPath.progress && (
          <div>
            <Heading1>{i18n.progress()}</Heading1>
            <EmptySection
              className={dashboardStyles.emptyClassroomProgress}
              hasStudents={hasStudents}
              hasCurriculumAssigned={hasCurriculumAssigned}
            />
          </div>
        )}
        {location.pathname !== TeacherDashboardPath.progress && (
          <EmptySection
            className={dashboardStyles.emptyClassroom}
            hasStudents={hasStudents}
            hasCurriculumAssigned={hasCurriculumAssigned}
          />
        )}
      </div>
    );
  };

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
      <Switch>
        <Route path={TeacherDashboardPath.manageStudents}>
          {applyV1TeacherDashboardWidth(
            <ManageStudents studioUrlPrefix={studioUrlPrefix} />
          )}
        </Route>
        <Route path={TeacherDashboardPath.loginInfo}>
          {applyV1TeacherDashboardWidth(
            <SectionLoginInfo
              studioUrlPrefix={studioUrlPrefix}
              sectionProviderName={sectionProviderName}
            />
          )}
        </Route>
        <Route path={TeacherDashboardPath.standardsReport}>
          {applyV1TeacherDashboardWidth(<StandardsReport />)}
        </Route>
        {studentCount === 0 && (
          <Route>{generateEmptySectionGraphic(false, true)}</Route>
        )}
        <Route path={TeacherDashboardPath.projects}>
          {applyV1TeacherDashboardWidth(
            <SectionProjectsListWithData studioUrlPrefix={studioUrlPrefix} />
          )}
        </Route>
        <Route path={TeacherDashboardPath.stats}>
          {applyV1TeacherDashboardWidth(<StatsTableWithData />)}
        </Route>
        {coursesWithProgress.length === 0 && (
          <Route>{generateEmptySectionGraphic(true, false)}</Route>
        )}
        <Route path={TeacherDashboardPath.progress}>
          <SectionProgressSelector />
        </Route>
        <Route path={TeacherDashboardPath.textResponses}>
          {applyV1TeacherDashboardWidth(<TextResponses />)}
        </Route>
        <Route path={TeacherDashboardPath.assessments}>
          {applyV1TeacherDashboardWidth(
            <SectionAssessments sectionName={sectionName} />
          )}
        </Route>
        {teacherNavV2Enabled && (
          <Route
            path={TeacherDashboardPath.navigation}
            component={props => (
              <div className={dashboardStyles.pageContainer}>
                <TeacherNavigationBar />
                <div className={dashboardStyles.content}>
                  <SectionProgressSelector />
                </div>
              </div>
            )}
          />
        )}
        {showAITutorTab && (
          <Route path={TeacherDashboardPath.aiTutorChatMessages}>
            {applyV1TeacherDashboardWidth(<TutorTab sectionId={sectionId} />)}
          </Route>
        )}
      </Switch>
    </div>
  );
}

TeacherDashboard.propTypes = {
  studioUrlPrefix: PropTypes.string.isRequired,
  sectionId: PropTypes.number.isRequired,
  sectionName: PropTypes.string.isRequired,
  studentCount: PropTypes.number.isRequired,
  coursesWithProgress: PropTypes.array.isRequired,
  showAITutorTab: PropTypes.bool,
  sectionProviderName: PropTypes.string,
};

export default TeacherDashboard;
