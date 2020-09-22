import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import * as utils from '../../utils';
import {OAuthSectionTypes} from '../../templates/teacherDashboard/shapes';
import {
  importOrUpdateRoster,
  sectionCode,
  sectionProvider,
  sectionName
} from '../../templates/teacherDashboard/teacherSectionsRedux';
import Button from '../../templates/Button';
import firehoseClient from '@cdo/apps/lib/util/firehose';

const PROVIDER_NAME = {
  [OAuthSectionTypes.clever]: i18n.loginTypeClever(),
  [OAuthSectionTypes.google_classroom]: i18n.loginTypeGoogleClassroom()
};

export const READY = 'ready';
export const IN_PROGRESS = 'in-progress';
export const SUCCESS = 'success';
export const FAILURE = 'failure';

/**
 * Button that will re-sync an omniauth section's roster with the third-paty
 * provider. This component owns that logic (along with the redux module).
 * It in turn renders a button component that handles display states.
 */
class SyncOmniAuthSectionControl extends React.Component {
  static propTypes = {
    sectionId: PropTypes.number.isRequired,
    // Provided by Redux
    sectionCode: PropTypes.string,
    sectionName: PropTypes.string,
    sectionProvider: PropTypes.oneOf(Object.values(OAuthSectionTypes)),
    updateRoster: PropTypes.func.isRequired
  };

  state = {
    buttonState: READY
  };

  onClick = () => {
    const {
      sectionId,
      sectionCode,
      sectionName,
      updateRoster,
      sectionProvider
    } = this.props;
    const {buttonState} = this.state;

    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard',
        study_group: 'manage-students',
        event: 'sync-oauth-button-click',
        data_json: JSON.stringify({
          sectionId: sectionId,
          loginType: sectionProvider
        })
      },
      {includeUserId: true}
    );

    if ([IN_PROGRESS, SUCCESS].includes(buttonState)) {
      // Don't acknowledge click events while request is in progress.
      // For now, ignore them on success too - the page reload will take care of it.
      return;
    }

    if (buttonState === FAILURE) {
      // On click after failure, reset the button so the user can try again.
      this.setState({buttonState: READY});
      return;
    }

    // Default case: Button is READY
    this.setState({buttonState: IN_PROGRESS});
    // Section code is the course ID, without the G- or C- prefix.
    const courseId = sectionCode.replace(/^[GC]-/, '');
    updateRoster(courseId, sectionName)
      .then(() => {
        this.setState({buttonState: SUCCESS});
        // While we are embedded in an angular page, reloading is the easiest
        // way to pick up roster changes.  Once everything is React maybe we
        // won't need to do this.
        utils.reload();
      })
      .catch(() => this.setState({buttonState: FAILURE}));
  };

  render() {
    const {sectionProvider} = this.props;
    const {buttonState} = this.state;
    const supportedType = PROVIDER_NAME.hasOwnProperty(sectionProvider);
    if (!supportedType || !sectionCode) {
      // Possibly not loaded yet.
      return null;
    }

    return (
      <SyncOmniAuthSectionButton
        provider={sectionProvider}
        buttonState={buttonState}
        onClick={this.onClick}
      />
    );
  }
}
export const UnconnectedSyncOmniAuthSectionControl = SyncOmniAuthSectionControl;
export default connect(
  (state, props) => ({
    sectionCode: sectionCode(state, props.sectionId),
    sectionName: sectionName(state, props.sectionId),
    sectionProvider: sectionProvider(state, props.sectionId)
  }),
  {
    updateRoster: importOrUpdateRoster
  }
)(SyncOmniAuthSectionControl);

/**
 * Pure view component of the omniauth sync control.
 */
export function SyncOmniAuthSectionButton({provider, buttonState, onClick}) {
  const providerName = PROVIDER_NAME[provider];
  return (
    <Button
      __useDeprecatedTag
      text={buttonText(buttonState, providerName)}
      color={Button.ButtonColor.gray}
      size={Button.ButtonSize.default}
      disabled={buttonState === IN_PROGRESS}
      onClick={onClick}
      {...iconProps(buttonState)}
      style={{float: 'left'}}
    />
  );
}
SyncOmniAuthSectionButton.propTypes = {
  provider: PropTypes.oneOf(Object.values(OAuthSectionTypes)).isRequired,
  buttonState: PropTypes.oneOf([READY, IN_PROGRESS, SUCCESS, FAILURE])
    .isRequired,
  onClick: PropTypes.func
};

function buttonText(buttonState, providerName) {
  if (buttonState === IN_PROGRESS) {
    return i18n.loginTypeSyncButton_inProgress({providerName});
  } else if (buttonState === SUCCESS) {
    return i18n.loginTypeSyncButton_success({providerName});
  } else if (buttonState === FAILURE) {
    return i18n.loginTypeSyncButton_failure({providerName});
  }
  return i18n.loginTypeSyncButton({providerName});
}

function iconProps(buttonState) {
  if (buttonState === IN_PROGRESS) {
    return {
      icon: 'refresh',
      iconClassName: 'fa-spin fa-fw'
    };
  } else if (buttonState === FAILURE) {
    return {
      icon: 'exclamation-circle',
      iconClassName: 'fa-fw'
    };
  }
  return {};
}
