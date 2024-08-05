import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import Button from '@cdo/apps/legacySharedComponents/Button';
import {OAuthSectionTypes} from '@cdo/apps/lib/ui/accounts/constants';
import LtiSectionSyncDialog, {
  LtiSectionSyncResultShape,
} from '@cdo/apps/lib/ui/simpleSignUp/lti/sync/LtiSectionSyncDialog';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import {
  importOrUpdateRoster,
  sectionCode,
  sectionProvider,
  sectionProviderName,
  sectionName,
  ltiSyncResult,
  syncEnabled,
} from '../../templates/teacherDashboard/teacherSectionsRedux';
import * as utils from '../../utils';

import {Heading1} from './Headings';

const SUPPORTED_PROVIDERS = [
  OAuthSectionTypes.clever,
  OAuthSectionTypes.google_classroom,
  SectionLoginType.lti_v1,
];

const SYNC_PROVIDERS = [
  ...Object.values(OAuthSectionTypes),
  SectionLoginType.lti_v1,
];

export const READY = 'ready';
export const IN_PROGRESS = 'in-progress';
export const SUCCESS = 'success';
export const DISABLED = 'disabled';

/**
 * Button that will re-sync an omniauth section's roster with the third-paty
 * provider. This component owns that logic (along with the redux module).
 * It in turn renders a button component that handles display states.
 */
class SyncOmniAuthSectionControl extends React.Component {
  static propTypes = {
    sectionId: PropTypes.number.isRequired,
    studioUrlPrefix: PropTypes.string,
    // Provided by Redux
    sectionCode: PropTypes.string,
    sectionName: PropTypes.string,
    sectionProvider: PropTypes.oneOf(SYNC_PROVIDERS),
    sectionProviderName: PropTypes.string.isRequired,
    updateRoster: PropTypes.func.isRequired,
    ltiSyncResult: LtiSectionSyncResultShape,
    syncEnabled: PropTypes.bool,
  };

  state = {
    buttonState: READY,
    isDialogOpen: false,
    syncFailErrorLog: '',
    isLtiDialogOpen: false,
  };

  onClick = () => {
    const {sectionId, sectionCode, sectionName, updateRoster, sectionProvider} =
      this.props;
    const {buttonState} = this.state;

    firehoseClient.putRecord(
      {
        study: 'teacher-dashboard',
        study_group: 'manage-students',
        event: 'sync-oauth-button-click',
        data_json: JSON.stringify({
          sectionId: sectionId,
          loginType: sectionProvider,
        }),
      },
      {includeUserId: true}
    );

    if ([IN_PROGRESS, SUCCESS, DISABLED].includes(buttonState)) {
      // Don't acknowledge click events while request is in progress.
      // For now, ignore them on success too - the page reload will take care of it.
      return;
    }

    // Default case: Button is READY
    this.setState({buttonState: IN_PROGRESS});
    // Section code is the course ID, without the G- or C- prefix.
    const courseId = sectionCode.replace(/^[GC]-/, '');
    updateRoster(courseId, sectionName)
      .then(() => {
        if (sectionProvider === SectionLoginType.lti_v1) {
          this.setState({isLtiDialogOpen: true, buttonState: SUCCESS});
        } else {
          this.setState({buttonState: SUCCESS});
          // While we are embedded in an angular page, reloading is the easiest
          // way to pick up roster changes.  Once everything is React maybe we
          // won't need to do this.

          utils.reload();
        }
      })
      .catch(sync_error => {
        this.setState({
          syncFailErrorLog: '' + sync_error,
        });
        this.openDialog();
        firehoseClient.putRecord(
          {
            study: 'teacher-dashboard',
            study_group: 'manage-students',
            event: 'sync-oauth-button-error',
            data_json: JSON.stringify({
              sectionId: sectionId,
              loginType: sectionProvider,
              error_message: sync_error,
            }),
          },
          {includeUserId: true}
        );
      });
  };

  openDialog = () => {
    this.setState({isDialogOpen: true});
  };

  closeDialog = () => {
    this.setState({buttonState: READY, isDialogOpen: false});
  };

  onLtiDialogClose = () => {
    utils.reload();
  };

  getButtonState = () => {
    const {syncEnabled, sectionProvider} = this.props;
    if (sectionProvider === SectionLoginType.lti_v1 && !syncEnabled) {
      return DISABLED;
    }
    return this.state.buttonState;
  };

  render() {
    const {sectionProvider, sectionProviderName, sectionCode, ltiSyncResult} =
      this.props;
    const buttonState = this.getButtonState();
    const isLtiDialogOpen = this.state;
    const supportedType = SUPPORTED_PROVIDERS.includes(sectionProvider);
    if (!supportedType || !sectionCode) {
      // Possibly not loaded yet.
      return null;
    }

    return (
      <div>
        <SyncOmniAuthSectionButton
          provider={sectionProvider}
          providerName={sectionProviderName}
          buttonState={buttonState}
          onClick={this.onClick}
        />
        {ltiSyncResult && isLtiDialogOpen && (
          <LtiSectionSyncDialog
            isOpen={isLtiDialogOpen}
            syncResult={ltiSyncResult}
            onClose={this.onLtiDialogClose}
            lmsName={sectionProviderName}
          />
        )}
        <BaseDialog
          useUpdatedStyles
          isOpen={this.state.isDialogOpen}
          style={styles.dialog}
          handleClose={this.closeDialog}
        >
          <Heading1>{i18n.loginTypeSyncButtonDialogHeader()}</Heading1>
          <p>{i18n.loginTypeSyncButtonDialogHeaderSub()}</p>
          <div style={styles.scroll}>
            <pre>
              <code>{this.state.syncFailErrorLog}</code>
            </pre>
          </div>
          <div style={styles.needHelpMessage}>
            <SafeMarkdown
              markdown={i18n.loginTypeSyncButtonDialogTroubleshooting({
                syncFailureSupportArticle:
                  'https://support.code.org/hc/en-us/articles/6496495212557',
              })}
            />
          </div>
          <div style={styles.closeButton}>
            <Button
              __useDeprecatedTag
              text={i18n.closeDialog()}
              onClick={this.closeDialog}
              color={Button.ButtonColor.gray}
            />
          </div>
        </BaseDialog>
      </div>
    );
  }
}
export const UnconnectedSyncOmniAuthSectionControl = SyncOmniAuthSectionControl;
export default connect(
  (state, props) => ({
    sectionCode: sectionCode(state, props.sectionId),
    sectionName: sectionName(state, props.sectionId),
    sectionProvider: sectionProvider(state, props.sectionId),
    sectionProviderName: sectionProviderName(state, props.sectionId),
    ltiSyncResult: ltiSyncResult(state),
    syncEnabled: syncEnabled(state, props.sectionId),
  }),
  {
    updateRoster: importOrUpdateRoster,
  }
)(SyncOmniAuthSectionControl);

/**
 * Pure view component of the omniauth sync control.
 */
export function SyncOmniAuthSectionButton({
  provider,
  providerName,
  buttonState,
  onClick,
}) {
  return (
    <Button
      __useDeprecatedTag
      text={buttonText(buttonState, provider, providerName)}
      color={Button.ButtonColor.gray}
      size={Button.ButtonSize.default}
      disabled={[IN_PROGRESS, DISABLED].includes(buttonState)}
      onClick={onClick}
      {...iconProps(buttonState)}
      style={{float: 'left'}}
      title={
        buttonState === DISABLED
          ? i18n.ltiSectionSyncButtonDisabledAltText()
          : undefined
      }
      aria-label={
        buttonState === DISABLED
          ? i18n.ltiSectionSyncButtonDisabledAltText()
          : undefined
      }
    />
  );
}
SyncOmniAuthSectionButton.propTypes = {
  provider: PropTypes.oneOf(SYNC_PROVIDERS).isRequired,
  providerName: PropTypes.string.isRequired,
  buttonState: PropTypes.oneOf([READY, IN_PROGRESS, SUCCESS, DISABLED])
    .isRequired,
  onClick: PropTypes.func,
};

function buttonText(buttonState, provider, providerName) {
  if (buttonState === IN_PROGRESS) {
    return i18n.loginTypeSyncButton_inProgress({providerName});
  } else if (buttonState === SUCCESS) {
    return i18n.loginTypeSyncButton_success({providerName});
  }
  if (provider === SectionLoginType.lti_v1) {
    return i18n.loginTypeSyncButtonLti({providerName});
  } else {
    return i18n.loginTypeSyncButton({providerName});
  }
}

function iconProps(buttonState) {
  if (buttonState === IN_PROGRESS) {
    return {
      icon: 'refresh',
      iconClassName: 'fa-spin fa-fw',
    };
  }
  return {};
}

const styles = {
  dialog: {
    padding: '10px 20px 20px 20px',
    maxHeight: '500px',
  },
  scroll: {
    overflowX: 'hidden',
    overflowY: 'auto',
    maxHeight: '200px',
    paddingTop: '10px',
  },
  needHelpMessage: {
    paddingTop: '20px',
  },
  closeButton: {
    paddingTop: '20px',
  },
};
