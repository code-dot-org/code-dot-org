import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import ProtectedStatefulDiv from '@cdo/apps/templates/ProtectedStatefulDiv';
import PlcHeader from '@cdo/apps/code-studio/plc/header';
import { ViewType } from '@cdo/apps/code-studio/viewAsRedux';
import { SignInState } from '@cdo/apps/code-studio/progressRedux';
import ScriptAnnouncements from './ScriptAnnouncements';
import { announcementShape } from '@cdo/apps/code-studio/scriptAnnouncementsRedux';
import Notification, { NotificationType } from '@cdo/apps/templates/Notification';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';

const SCRIPT_OVERVIEW_WIDTH = 1100;

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
    fontFamily: '"Gotham 5r", sans-serif',
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

/**
 * This component takes some of the HAML generated content on the script overview
 * page, and moves it under our React root. This is done so that we can have React
 * content above and below this.
 * Long term, instead of generating the DOM elements in haml, we should pass the
 * client the data and have React generate the DOM. Doing so should not be super
 * difficult in this case
 */
class ScriptOverviewHeader extends Component {
  static propTypes = {
    plcHeaderProps: PropTypes.shape({
      unitName: PropTypes.string.isRequired,
      courseViewPath: PropTypes.string.isRequired,
    }),
    announcements: PropTypes.arrayOf(announcementShape),
    scriptId: PropTypes.number.isRequired,
    scriptName: PropTypes.string.isRequired,
    scriptTitle: PropTypes.string.isRequired,
    scriptDescription: PropTypes.string.isRequired,
    betaTitle: PropTypes.string,
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    isSignedIn: PropTypes.bool.isRequired,
    isVerifiedTeacher: PropTypes.bool.isRequired,
    hasVerifiedResources: PropTypes.bool.isRequired,
    showCourseUnitVersionWarning: PropTypes.bool,
    showScriptVersionWarning: PropTypes.bool,
    versions: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      version_year: PropTypes.string.isRequired,
      version_title: PropTypes.string.isRequired,
    })).isRequired,
    showHiddenUnitWarning: PropTypes.bool,
  };

  componentDidMount() {
    $('#lesson-heading-extras').appendTo(ReactDOM.findDOMNode(this.protected));
  }

  onChangeVersion = event => {
    const scriptName = event.target.value;
    if (scriptName !== this.props.scriptName) {
      window.location.href = `/s/${scriptName}`;
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
      announcements,
      scriptName,
      scriptTitle,
      scriptDescription,
      betaTitle,
      viewAs,
      isSignedIn,
      isVerifiedTeacher,
      hasVerifiedResources,
      showCourseUnitVersionWarning,
      showScriptVersionWarning,
      versions,
      showHiddenUnitWarning,
    } = this.props;

    let verifiedResourcesAnnounce = [];
    if (!isVerifiedTeacher && hasVerifiedResources) {
      verifiedResourcesAnnounce.push({
        notice: i18n.verifiedResourcesNotice(),
        details: i18n.verifiedResourcesDetails(),
        link: "https://support.code.org/hc/en-us/articles/115001550131",
        type: NotificationType.information,
      });
    }

    let versionWarningDetails;
    if (showCourseUnitVersionWarning) {
      versionWarningDetails = i18n.wrongUnitVersionWarningDetails();
    } else if (showScriptVersionWarning) {
      versionWarningDetails = i18n.wrongCourseVersionWarningDetails();
    }

    return (
      <div>
        {plcHeaderProps &&
          <PlcHeader
            unit_name={plcHeaderProps.unitName}
            course_view_path={plcHeaderProps.courseViewPath}
          />
        }
        {viewAs === ViewType.Teacher && isSignedIn &&
          <ScriptAnnouncements
            announcements={verifiedResourcesAnnounce.concat(announcements)}
            width={SCRIPT_OVERVIEW_WIDTH}
          />
        }
        {versionWarningDetails &&
          <Notification
            type={NotificationType.warning}
            notice={i18n.wrongCourseVersionWarningNotice()}
            details={versionWarningDetails}
            dismissible={true}
            width={SCRIPT_OVERVIEW_WIDTH}
            onDismiss={this.onDismissVersionWarning}
          />
        }
        {showHiddenUnitWarning &&
          <Notification
            type={NotificationType.warning}
            notice={i18n.hiddenUnitWarningNotice()}
            details={i18n.hiddenUnitWarningDetails()}
            dismissible={false}
            width={SCRIPT_OVERVIEW_WIDTH}
            buttonText={i18n.learnMore()}
            buttonLink="https://support.code.org/hc/en-us/articles/115001479372-Hiding-units-and-lessons-in-Code-org-s-CS-Principles-and-CS-Discoveries-courses"
          />
        }
        <div id="lesson">
          <div id="heading" style={styles.heading}>
            <div style={styles.titleWrapper}>
              <h1 style={styles.title} id="script-title">
                {scriptTitle}
                {" "}
                {betaTitle &&
                <span className="betatext">{betaTitle}</span>
                }
              </h1>
              {versions.length > 1 &&
                <span style={styles.versionWrapper}>
                  <span style={styles.versionLabel}>{i18n.courseOverviewVersionLabel()}</span>&nbsp;
                  <select
                    onChange={this.onChangeVersion}
                    value={scriptName}
                    style={styles.versionDropdown}
                    id="version-selector"
                  >
                    {versions.map(version => (
                      <option key={version.name} value={version.name}>
                        {version.version_year}
                      </option>
                    ))}
                  </select>
                </span>
              }
            </div>
            <p style={styles.description}>
              {scriptDescription}
            </p>
          </div>
          <ProtectedStatefulDiv
            ref={element => this.protected = element}
          />
        </div>
      </div>
    );
  }
}

export const UnconnectedScriptOverviewHeader = ScriptOverviewHeader;

export default connect(state => ({
  plcHeaderProps: state.plcHeader,
  announcements: state.scriptAnnouncements || [],
  scriptId: state.progress.scriptId,
  scriptName: state.progress.scriptName,
  scriptTitle: state.progress.scriptTitle,
  scriptDescription: state.progress.scriptDescription,
  betaTitle: state.progress.betaTitle,
  isSignedIn: state.progress.signInState === SignInState.SignedIn,
  viewAs: state.viewAs,
  isVerifiedTeacher: state.verifiedTeacher.isVerified,
  hasVerifiedResources: state.verifiedTeacher.hasVerifiedResources,
}))(ScriptOverviewHeader);
