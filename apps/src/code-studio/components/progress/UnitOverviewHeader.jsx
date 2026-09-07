import NotificationBanner from '@code-dot-org/component-library/notification-banner';
import {Button as MuiButton, Typography} from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';

import {announcementShape} from '@cdo/apps/code-studio/announcementsRedux';
import PlcHeader from '@cdo/apps/code-studio/plc/header';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import VerifiedResourcesNotification from '@cdo/apps/templates/courseOverview/VerifiedResourcesNotification';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import ParticipantFeedbackNotification from '@cdo/apps/templates/feedback/ParticipantFeedbackNotification';
import ProtectedStatefulDiv from '@cdo/apps/templates/ProtectedStatefulDiv';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {assignmentCourseVersionShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import {selectedSectionSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {
  dismissedRedirectWarning,
  onDismissRedirectWarning,
} from '@cdo/apps/util/dismissVersionRedirect';
import i18n from '@cdo/locale';

import Announcements from './Announcements';

import styles from './unit-overview.module.scss';

const WARNING_ICON = {iconName: 'triangle-exclamation'};

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
    courseId: PropTypes.number,
    versions: PropTypes.objectOf(assignmentCourseVersionShape).isRequired,
    userId: PropTypes.number,
    isOnTeacherDashboard: PropTypes.bool,

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
    demoType: PropTypes.string.isRequired,
    localeCode: PropTypes.string,
    children: PropTypes.node,
  };

  // Local dismissal state. The legacy `sharedComponents/Notification` component
  // tracked this internally; the DSCO `NotificationBanner` we migrated to does
  // not, so we have to hide the banner ourselves on close. Each flag gates one
  // of the warning banners below.
  state = {
    redirectWarningDismissed: false,
    versionWarningDismissed: false,
  };

  componentDidMount() {
    $('#lesson-heading-extras').appendTo(ReactDOM.findDOMNode(this.protected));
  }

  handleDismissRedirectWarning = () => {
    const {courseName, scriptName} = this.props;
    onDismissRedirectWarning(courseName || scriptName);
    this.setState({redirectWarningDismissed: true});
  };

  onDismissVersionWarning = () => {
    const {scriptId, courseId} = this.props;
    // Do nothing when courseId is missing, because UserScript objects now require courseId.
    // This is safe because:
    // 1. all user-facing units are now in courses, so this won't affect any end users
    // 2. units without courses don't have versioning anyway, so we'll never show these warnings
    //    even for internal users.
    if (courseId) {
      // Fire and forget. If this fails, we'll have another chance to
      // succeed the next time the warning is dismissed.
      const url = `/api/v1/user_scripts/course/${courseId}/unit/${scriptId}`;
      $.ajax({
        method: 'PATCH',
        url,
        type: 'json',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({version_warning_dismissed: true}),
      });
    }
    this.setState({versionWarningDismissed: true});
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
      demoType,
      children,
      isOnTeacherDashboard,
    } = this.props;

    const displayVerifiedResourcesWarning =
      viewAs === ViewType.Instructor &&
      !isVerifiedInstructor &&
      hasVerifiedResources &&
      !demoType;

    const displayVersionWarning =
      showRedirectWarning &&
      !dismissedRedirectWarning(courseName || scriptName) &&
      !this.state.redirectWarningDismissed;

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
        {displayVerifiedResourcesWarning && <VerifiedResourcesNotification />}
        {displayVersionWarning && (
          <NotificationBanner
            className={classNames(
              styles.notificationBanner,
              'announcement-notification'
            )}
            variant="warning"
            style="filled"
            icon={WARNING_ICON}
            title={i18n.redirectCourseVersionWarningDetails()}
            onClose={this.handleDismissRedirectWarning}
          />
        )}
        {versionWarningDetails && !this.state.versionWarningDismissed && (
          <NotificationBanner
            className={classNames(
              styles.notificationBanner,
              'announcement-notification'
            )}
            variant="warning"
            style="filled"
            icon={WARNING_ICON}
            title={i18n.wrongCourseVersionWarningNotice()}
            description={versionWarningDetails}
            onClose={this.onDismissVersionWarning}
          />
        )}
        {showHiddenUnitWarning && (
          <NotificationBanner
            className={classNames(
              styles.notificationBanner,
              'announcement-notification'
            )}
            variant="warning"
            style="filled"
            icon={WARNING_ICON}
            title={i18n.hiddenUnitWarningNotice()}
            description={i18n.hiddenUnitWarningDetails()}
            actions={
              <MuiButton
                href="https://support.code.org/hc/en-us/articles/115001479372-Hiding-units-and-lessons-in-Code-org-s-CS-Principles-and-CS-Discoveries-courses"
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                color="secondary"
                size="small"
              >
                {i18n.learnMore()}
              </MuiButton>
            }
          />
        )}
        <div id="lesson">
          <div className={styles.heading}>
            <div className={styles.titleWrapper}>
              <Typography
                variant="h2"
                component="h1"
                className={styles.title}
                id="script-title"
              >
                {unitTitle}
              </Typography>
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
          {!isOnTeacherDashboard && (
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
  demoType: selectedSectionSelector(state)?.demoType,
  localeCode: state.locales.localeCode,
}))(UnitOverviewHeader);
