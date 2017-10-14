import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import ProtectedStatefulDiv from '@cdo/apps/templates/ProtectedStatefulDiv';
import PlcHeader from '@cdo/apps/code-studio/plc/header';
import { ViewType } from '@cdo/apps/code-studio/viewAsRedux';
import { SignInState } from '@cdo/apps/code-studio/progressRedux';
import Notification, { NotificationType } from '@cdo/apps/templates/Notification';
import i18n from '@cdo/locale';

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
    announcements: PropTypes.arrayOf(
      PropTypes.shape({
        notice: PropTypes.string.isRequired,
        details: PropTypes.string.isRequired,
        link: PropTypes.string.isRequired,
        type: PropTypes.oneOf(Object.values(NotificationType)).isRequired,
      })
    ),
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    isSignedIn: PropTypes.bool.isRequired,
    isVerifiedTeacher: PropTypes.bool.isRequired,
    hasVerifiedResources: PropTypes.bool.isRequired,
  };

  componentDidMount() {
    $('#lesson').appendTo(ReactDOM.findDOMNode(this.protected));
  }

  render() {
    const {
      plcHeaderProps,
      announcements,
      viewAs,
      isSignedIn,
      isVerifiedTeacher,
      hasVerifiedResources,
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
          verifiedResourcesAnnounce.concat(announcements).map((announcement, index) => (
            <Notification
              key={index}
              type={announcement.type}
              notice={announcement.notice}
              details={announcement.details}
              buttonText={i18n.learnMore()}
              buttonLink={announcement.link}
              dismissible={true}
              isRtl={false}
              width={1100}
            />
          ))
        }
        <ProtectedStatefulDiv
          ref={element => this.protected = element}
        />
      </div>
    );
  }
}

export const UnconnectedScriptOverviewHeader = ScriptOverviewHeader;

export default connect(state => ({
  plcHeaderProps: state.plcHeader,
  announcements: state.scriptAnnouncements || [],
  isSignedIn: state.progress.signInState === SignInState.SignedIn,
  viewAs: state.viewAs,
  isVerifiedTeacher: state.verifiedTeacher.isVerified,
  hasVerifiedResources: state.verifiedTeacher.hasVerifiedResources,
}))(ScriptOverviewHeader);
