import React, {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {Route, Switch} from 'react-router-dom';
import TeacherDashboardNavigation, {
  TeacherDashboardPath,
} from './TeacherDashboardNavigation';
import TeacherDashboardHeader from './TeacherDashboardHeader';
import StatsTableWithData from './StatsTableWithData';
import SectionProgress from '@cdo/apps/templates/sectionProgress/SectionProgress';
import ManageStudents from '@cdo/apps/templates/manageStudents/ManageStudents';
import SectionProjectsListWithData from '@cdo/apps/templates/projects/SectionProjectsListWithData';
import TextResponses from '@cdo/apps/templates/textResponses/TextResponses';
import SectionAssessments from '@cdo/apps/templates/sectionAssessments/SectionAssessments';
import SectionLoginInfo from '@cdo/apps/templates/teacherDashboard/SectionLoginInfo';
import EmptySection from './EmptySection';
import _ from 'lodash';
import firehoseClient from '../../lib/util/firehose';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import StandardsReport from '../sectionProgress/standards/StandardsReport';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

function TeacherDashboard({
  studioUrlPrefix,
  sectionId,
  sectionName,
  studentCount,
  coursesWithProgress,
  location,
}) {
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
    }, [action, prevLocation]);
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

  return (
    <div>
      {includeHeader && (
        <div>
          {/* TeacherDashboardNavigation must be outside of
            TeacherDashboardHeader. Routing components do not work with
            components using Connect/Redux. Library we could use to fix issue:
            https://github.com/supasate/connected-react-router */}
          <TeacherDashboardHeader />
          <TeacherDashboardNavigation />
        </div>
      )}
      <Switch>
        <Route
          path={TeacherDashboardPath.manageStudents}
          component={props => (
            <ManageStudents studioUrlPrefix={studioUrlPrefix} />
          )}
        />
        <Route
          path={TeacherDashboardPath.loginInfo}
          component={props => (
            <SectionLoginInfo studioUrlPrefix={studioUrlPrefix} />
          )}
        />
        <Route
          path={TeacherDashboardPath.standardsReport}
          component={props => <StandardsReport />}
        />
        {/* Break out of Switch if we have 0 students. Display EmptySection component instead. */}
        {studentCount === 0 && (
          <Route component={props => <EmptySection sectionId={sectionId} />} />
        )}
        <Route
          path={TeacherDashboardPath.projects}
          component={props => (
            <SectionProjectsListWithData studioUrlPrefix={studioUrlPrefix} />
          )}
        />
        <Route
          path={TeacherDashboardPath.stats}
          component={props => <StatsTableWithData />}
        />
        {coursesWithProgress.length === 0 && (
          <Route
            component={() => (
              <div style={styles.text}>
                <SafeMarkdown markdown={i18n.noProgressSection()} />
              </div>
            )}
          />
        )}
        <Route
          path={TeacherDashboardPath.progress}
          component={props => <SectionProgress />}
        />
        <Route
          path={TeacherDashboardPath.textResponses}
          component={props => <TextResponses />}
        />
        <Route
          path={TeacherDashboardPath.assessments}
          component={props => <SectionAssessments sectionName={sectionName} />}
        />
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

  // Provided by React router in parent.
  location: PropTypes.object.isRequired,
};

const styles = {
  text: {
    fontStyle: 'italic',
    textAlign: 'center',
    paddingTop: 10,
  },
};

export default TeacherDashboard;
