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

const SCRIPT_OVERVIEW_WIDTH = 1100;

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
    scriptTitle: PropTypes.string.isRequired,
    scriptDescription: PropTypes.string.isRequired,
    betaTitle: PropTypes.string,
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    isSignedIn: PropTypes.bool.isRequired,
    isVerifiedTeacher: PropTypes.bool.isRequired,
    hasVerifiedResources: PropTypes.bool.isRequired,
    showVersionWarning: PropTypes.bool,
  };

  componentDidMount() {
    $('#lesson-heading-extras').appendTo(ReactDOM.findDOMNode(this.protected));
  }

  render() {
    const {
      plcHeaderProps,
      announcements,
      scriptTitle,
      scriptDescription,
      betaTitle,
      viewAs,
      isSignedIn,
      isVerifiedTeacher,
      hasVerifiedResources,
      showVersionWarning,
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
        {showVersionWarning &&
          <Notification
            type={NotificationType.warning}
            notice={i18n.wrongCourseVersionWarningNotice()}
            details={i18n.wrongUnitVersionWarningDetails()}
            dismissible={true}
            width={SCRIPT_OVERVIEW_WIDTH}
          />
        }
        <div id="lesson">
          <div id="heading">
            <h1>
              {scriptTitle}
              {" "}
              {betaTitle &&
                <span className="betatext">{betaTitle}</span>
              }
            </h1>
            <p>
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
  scriptTitle: state.progress.scriptTitle,
  scriptDescription: state.progress.scriptDescription,
  betaTitle: state.progress.betaTitle,
  isSignedIn: state.progress.signInState === SignInState.SignedIn,
  viewAs: state.viewAs,
  isVerifiedTeacher: state.verifiedTeacher.isVerified,
  hasVerifiedResources: state.verifiedTeacher.hasVerifiedResources,
}))(ScriptOverviewHeader);
