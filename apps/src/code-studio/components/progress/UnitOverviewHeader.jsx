import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';

import {announcementShape} from '@cdo/apps/code-studio/announcementsRedux';
import PlcHeader from '@cdo/apps/code-studio/plc/header';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import fontConstants from '@cdo/apps/fontConstants';
import VerifiedResourcesNotification from '@cdo/apps/templates/courseOverview/VerifiedResourcesNotification';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import ParticipantFeedbackNotification from '@cdo/apps/templates/feedback/ParticipantFeedbackNotification';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';
import ProtectedStatefulDiv from '@cdo/apps/templates/ProtectedStatefulDiv';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import AssignmentVersionSelector from '@cdo/apps/templates/teacherDashboard/AssignmentVersionSelector';
import {assignmentCourseVersionShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import color from '@cdo/apps/util/color';
import {
  dismissedRedirectWarning,
  onDismissRedirectWarning,
} from '@cdo/apps/util/dismissVersionRedirect';
import i18n from '@cdo/locale';

import Announcements from './Announcements';

const SCRIPT_OVERVIEW_WIDTH = 1100;

/**
 * This component takes some of the HAML generated content on the script overview
 * page, and moves it under our React root. This is done so that we can have React
 * content above and below this.
 * Long term, instead of generating the DOM elements in haml, we should pass the
 * client the data and have React generate the DOM. Doing so should not be super
 * difficult in this case
 */
class UnitOverviewHeader extends Component {
  static propTypes = {
    showCourseUnitVersionWarning: PropTypes.bool,
    showScriptVersionWarning: PropTypes.bool,
    showRedirectWarning: PropTypes.bool,
    showHiddenUnitWarning: PropTypes.bool,
    courseName: PropTypes.string,
    versions: PropTypes.objectOf(assignmentCourseVersionShape).isRequired,
    userId: PropTypes.number,

    // provided by redux
    plcHeaderProps: PropTypes.shape({
      unitName: PropTypes.string.isRequired,
      courseViewPath: PropTypes.string.isRequired,
    }),
    announcements: PropTypes.arrayOf(announcementShape),
    courseVersionId: PropTypes.number.isRequired,
    scriptId: PropTypes.number.isRequired,
    scriptName: PropTypes.string.isRequired,
    unitTitle: PropTypes.string.isRequired,
    unitDescription: PropTypes.string.isRequired,
    unitStudentDescription: PropTypes.string.isRequired,
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    isSignedIn: PropTypes.bool.isRequired,
    isVerifiedInstructor: PropTypes.bool.isRequired,
    hasVerifiedResources: PropTypes.bool.isRequired,
    localeCode: PropTypes.string,
  };

  componentDidMount() {
    $('#lesson-heading-extras').appendTo(ReactDOM.findDOMNode(this.protected));
  }

  onChangeVersion = versionId => {
    const version = this.props.versions[versionId];
    if (versionId !== this.props.courseVersionId && version) {
      const queryParams = window.location.search || '';
      window.location.href = `${version.path}${queryParams}`;
    }
  };

  onDismissVersionWarning = () => {
    // Fire and forget. If this fails, we'll have another chance to
    // succeed the next time the warning is dismissed.
    $.ajax({
      method: 'PATCH',
      url: `/api/v1/user_scripts/${this.props.scriptId}`,
      type: 'json',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify({version_warning_dismissed: true}),
    });
  };

  render() {
    const {
      plcHeaderProps,
      scriptId,
      scriptName,
      unitTitle,
      unitDescription,
      unitStudentDescription,
      viewAs,
      isSignedIn,
      showCourseUnitVersionWarning,
      showScriptVersionWarning,
      showRedirectWarning,
      versions,
      showHiddenUnitWarning,
      courseName,
      userId,
      isVerifiedInstructor,
      hasVerifiedResources,
    } = this.props;

    const displayVerifiedResources =
      viewAs === ViewType.Instructor &&
      !isVerifiedInstructor &&
      hasVerifiedResources;

    const displayVersionWarning =
      showRedirectWarning &&
      !dismissedRedirectWarning(courseName || scriptName);

    let versionWarningDetails;
    if (showCourseUnitVersionWarning) {
      versionWarningDetails = i18n.wrongUnitVersionWarningDetails();
    } else if (showScriptVersionWarning) {
      versionWarningDetails = i18n.wrongCourseVersionWarningDetails();
    }

    return (
      <div>
        {plcHeaderProps && (
          <PlcHeader
            unit_name={plcHeaderProps.unitName}
            course_view_path={plcHeaderProps.courseViewPath}
          />
        )}
        {isSignedIn && (
          <Announcements
            announcements={this.props.announcements}
            width={SCRIPT_OVERVIEW_WIDTH}
            viewAs={viewAs}
            firehoseAnalyticsData={{
              script_id: scriptId,
              user_id: userId,
            }}
          />
        )}
        {userId && <ParticipantFeedbackNotification studentId={userId} />}
        {displayVerifiedResources && (
          <VerifiedResourcesNotification width={SCRIPT_OVERVIEW_WIDTH} />
        )}
        {displayVersionWarning && (
          <Notification
            type={NotificationType.warning}
            notice=""
            details={i18n.redirectCourseVersionWarningDetails()}
            dismissible={true}
            width={SCRIPT_OVERVIEW_WIDTH}
            onDismiss={() => onDismissRedirectWarning(courseName || scriptName)}
          />
        )}
        {versionWarningDetails && (
          <Notification
            type={NotificationType.warning}
            notice={i18n.wrongCourseVersionWarningNotice()}
            details={versionWarningDetails}
            dismissible={true}
            width={SCRIPT_OVERVIEW_WIDTH}
            onDismiss={this.onDismissVersionWarning}
          />
        )}
        {showHiddenUnitWarning && (
          <Notification
            type={NotificationType.warning}
            notice={i18n.hiddenUnitWarningNotice()}
            details={i18n.hiddenUnitWarningDetails()}
            dismissible={false}
            width={SCRIPT_OVERVIEW_WIDTH}
            buttonText={i18n.learnMore()}
            buttonLink="https://support.code.org/hc/en-us/articles/115001479372-Hiding-units-and-lessons-in-Code-org-s-CS-Principles-and-CS-Discoveries-courses"
          />
        )}
        <div id="lesson">
          <div id="heading" style={styles.heading}>
            <div style={styles.titleWrapper}>
              <h1 style={styles.title} id="script-title">
                {unitTitle}
              </h1>
              {Object.values(versions).length > 1 && (
                <AssignmentVersionSelector
                  onChangeVersion={this.onChangeVersion}
                  courseVersions={versions}
                  rightJustifiedPopupMenu={true}
                  selectedCourseVersionId={this.props.courseVersionId}
                />
              )}
            </div>
            {viewAs === ViewType.Instructor && (
              <SafeMarkdown
                style={styles.description}
                openExternalLinksInNewTab={true}
                markdown={unitDescription}
              />
            )}
            {viewAs === ViewType.Participant && (
              <SafeMarkdown
                style={styles.description}
                openExternalLinksInNewTab={true}
                markdown={unitStudentDescription}
              />
            )}
          </div>
          <ProtectedStatefulDiv ref={element => (this.protected = element)} />
        </div>
      </div>
    );
  }
}

const styles = {
  heading: {
    width: '100%',
  },
  titleWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    display: 'inline-block',
  },
  versionWrapper: {
    display: 'flex',
    alignItems: 'baseline',
  },
  versionLabel: {
    ...fontConstants['main-font-semi-bold'],
    fontSize: 15,
    color: color.charcoal,
  },
  versionDropdown: {
    marginBottom: 13,
  },
  description: {
    width: 700,
  },
};

export const UnconnectedUnitOverviewHeader = UnitOverviewHeader;

export default connect(state => ({
  plcHeaderProps: state.plcHeader,
  announcements: state.announcements || [],
  courseVersionId: state.progress.courseVersionId,
  scriptId: state.progress.scriptId,
  scriptName: state.progress.scriptName,
  unitTitle: state.progress.unitTitle,
  unitDescription: state.progress.unitDescription,
  unitStudentDescription: state.progress.unitStudentDescription,
  isSignedIn: state.currentUser.signInState === SignInState.SignedIn,
  viewAs: state.viewAs,
  isVerifiedInstructor: state.verifiedInstructor.isVerified,
  hasVerifiedResources: state.verifiedInstructor.hasVerifiedResources,
  localeCode: state.locales.localeCode,
}))(UnitOverviewHeader);
