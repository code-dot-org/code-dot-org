import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import ProtectedStatefulDiv from '@cdo/apps/templates/ProtectedStatefulDiv';
import PlcHeader from '@cdo/apps/code-studio/plc/header';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import Announcements from './Announcements';
import {announcementShape} from '@cdo/apps/code-studio/announcementsRedux';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {
  dismissedRedirectWarning,
  onDismissRedirectWarning
} from '@cdo/apps/util/dismissVersionRedirect';
import AssignmentVersionSelector, {
  setRecommendedAndSelectedVersions
} from '@cdo/apps/templates/teacherDashboard/AssignmentVersionSelector';
import {assignmentVersionShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import StudentFeedbackNotification from '@cdo/apps/templates/feedback/StudentFeedbackNotification';
import VerifiedResourcesNotification from '@cdo/apps/templates/courseOverview/VerifiedResourcesNotification';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

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
    versions: PropTypes.arrayOf(assignmentVersionShape).isRequired,
    userId: PropTypes.number,

    // provided by redux
    plcHeaderProps: PropTypes.shape({
      unitName: PropTypes.string.isRequired,
      courseViewPath: PropTypes.string.isRequired
    }),
    announcements: PropTypes.arrayOf(announcementShape),
    scriptId: PropTypes.number.isRequired,
    scriptName: PropTypes.string.isRequired,
    scriptTitle: PropTypes.string.isRequired,
    scriptDescription: PropTypes.string.isRequired,
    scriptStudentDescription: PropTypes.string.isRequired,
    betaTitle: PropTypes.string,
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    isSignedIn: PropTypes.bool.isRequired,
    isVerifiedTeacher: PropTypes.bool.isRequired,
    hasVerifiedResources: PropTypes.bool.isRequired,
    localeEnglishName: PropTypes.string
  };

  componentDidMount() {
    $('#lesson-heading-extras').appendTo(ReactDOM.findDOMNode(this.protected));
  }

  onChangeVersion = versionYear => {
    const script = this.props.versions.find(v => v.year === versionYear);
    if (
      script &&
      script.name.length > 0 &&
      script.name !== this.props.scriptName
    ) {
      const queryParams = window.location.search || '';
      window.location.href = `/s/${script.name}${queryParams}`;
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
      data: JSON.stringify({version_warning_dismissed: true})
    });
  };

  render() {
    const {
      plcHeaderProps,
      scriptId,
      scriptName,
      scriptTitle,
      scriptDescription,
      scriptStudentDescription,
      betaTitle,
      viewAs,
      isSignedIn,
      showCourseUnitVersionWarning,
      showScriptVersionWarning,
      showRedirectWarning,
      versions,
      showHiddenUnitWarning,
      courseName,
      userId,
      isVerifiedTeacher,
      hasVerifiedResources
    } = this.props;

    const displayVerifiedResources =
      viewAs === ViewType.Teacher && !isVerifiedTeacher && hasVerifiedResources;

    const displayVersionWarning =
      showRedirectWarning &&
      !dismissedRedirectWarning(courseName || scriptName);

    let versionWarningDetails;
    if (showCourseUnitVersionWarning) {
      versionWarningDetails = i18n.wrongUnitVersionWarningDetails();
    } else if (showScriptVersionWarning) {
      versionWarningDetails = i18n.wrongCourseVersionWarningDetails();
    }

    // Only display viewable versions in script version dropdown.
    const filteredVersions = versions.filter(version => version.canViewVersion);
    const selectedVersion = filteredVersions.find(
      v => v.name === this.props.scriptName
    );
    setRecommendedAndSelectedVersions(
      filteredVersions,
      this.props.localeEnglishName,
      selectedVersion && selectedVersion.year
    );

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
              user_id: userId
            }}
          />
        )}
        {userId && <StudentFeedbackNotification studentId={userId} />}
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
                {scriptTitle}{' '}
                {betaTitle && <span className="betatext">{betaTitle}</span>}
              </h1>
              {filteredVersions.length > 1 && (
                <AssignmentVersionSelector
                  onChangeVersion={this.onChangeVersion}
                  versions={filteredVersions}
                  rightJustifiedPopupMenu={true}
                />
              )}
            </div>
            {viewAs === ViewType.Teacher && (
              <SafeMarkdown
                style={styles.description}
                openExternalLinksInNewTab={true}
                markdown={scriptDescription}
              />
            )}
            {viewAs === ViewType.Student && (
              <SafeMarkdown
                style={styles.description}
                openExternalLinksInNewTab={true}
                markdown={scriptStudentDescription}
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
    width: '100%'
  },
  titleWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  title: {
    display: 'inline-block'
  },
  versionWrapper: {
    display: 'flex',
    alignItems: 'baseline'
  },
  versionLabel: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 15,
    color: color.charcoal
  },
  versionDropdown: {
    marginBottom: 13
  },
  description: {
    width: 700
  }
};

export const UnconnectedUnitOverviewHeader = UnitOverviewHeader;

export default connect(state => ({
  plcHeaderProps: state.plcHeader,
  announcements: state.announcements || [],
  scriptId: state.progress.scriptId,
  scriptName: state.progress.scriptName,
  scriptTitle: state.progress.scriptTitle,
  scriptDescription: state.progress.scriptDescription,
  scriptStudentDescription: state.progress.scriptStudentDescription,
  betaTitle: state.progress.betaTitle,
  isSignedIn: state.currentUser.signInState === SignInState.SignedIn,
  viewAs: state.viewAs,
  isVerifiedTeacher: state.verifiedTeacher.isVerified,
  hasVerifiedResources: state.verifiedTeacher.hasVerifiedResources,
  localeEnglishName: state.locales.localeEnglishName
}))(UnitOverviewHeader);
