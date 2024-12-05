import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';

import {announcementShape} from '@cdo/apps/code-studio/announcementsRedux';
import PlcHeader from '@cdo/apps/code-studio/plc/header';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import Notification, {
  NotificationType,
} from '@cdo/apps/sharedComponents/Notification';
import VerifiedResourcesNotification from '@cdo/apps/templates/courseOverview/VerifiedResourcesNotification';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import ParticipantFeedbackNotification from '@cdo/apps/templates/feedback/ParticipantFeedbackNotification';
import ProtectedStatefulDiv from '@cdo/apps/templates/ProtectedStatefulDiv';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {assignmentCourseVersionShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import {isOnTeacherDashboard} from '@cdo/apps/templates/teacherNavigation/TeacherNavFlagUtils';
import {
  dismissedRedirectWarning,
  onDismissRedirectWarning,
} from '@cdo/apps/util/dismissVersionRedirect';
import i18n from '@cdo/locale';

import Announcements from './Announcements';

import styles from './unit-overview.module.scss';

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
    children: PropTypes.node,
  };

  componentDidMount() {
    $('#lesson-heading-extras').appendTo(ReactDOM.findDOMNode(this.protected));
  }

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
      showHiddenUnitWarning,
      courseName,
      userId,
      isVerifiedInstructor,
      hasVerifiedResources,
      children,
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
            viewAs={viewAs}
            firehoseAnalyticsData={{
              script_id: scriptId,
              user_id: userId,
            }}
          />
        )}
        {userId && <ParticipantFeedbackNotification studentId={userId} />}
        {displayVerifiedResources && <VerifiedResourcesNotification />}
        {displayVersionWarning && (
          <Notification
            type={NotificationType.warning}
            notice=""
            details={i18n.redirectCourseVersionWarningDetails()}
            dismissible={true}
            onDismiss={() => onDismissRedirectWarning(courseName || scriptName)}
          />
        )}
        {versionWarningDetails && (
          <Notification
            type={NotificationType.warning}
            notice={i18n.wrongCourseVersionWarningNotice()}
            details={versionWarningDetails}
            dismissible={true}
            onDismiss={this.onDismissVersionWarning}
          />
        )}
        {showHiddenUnitWarning && (
          <Notification
            type={NotificationType.warning}
            notice={i18n.hiddenUnitWarningNotice()}
            details={i18n.hiddenUnitWarningDetails()}
            dismissible={false}
            buttonText={i18n.learnMore()}
            buttonLink="https://support.code.org/hc/en-us/articles/115001479372-Hiding-units-and-lessons-in-Code-org-s-CS-Principles-and-CS-Discoveries-courses"
          />
        )}
        <div id="lesson">
          <div className={styles.heading}>
            <div className={styles.titleWrapper}>
              <h1 className={styles.title} id="script-title">
                {unitTitle}
              </h1>
            </div>
            {children}
            <div />
            {viewAs === ViewType.Instructor && (
              <SafeMarkdown
                className={styles.description}
                openExternalLinksInNewTab={true}
                markdown={unitDescription}
              />
            )}
            {viewAs === ViewType.Participant && (
              <SafeMarkdown
                className={styles.description}
                openExternalLinksInNewTab={true}
                markdown={unitStudentDescription}
              />
            )}
          </div>
          {!isOnTeacherDashboard() && (
            <ProtectedStatefulDiv ref={element => (this.protected = element)} />
          )}
        </div>
      </div>
    );
  }
}

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
