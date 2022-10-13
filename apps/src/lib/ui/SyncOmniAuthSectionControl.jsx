import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import * as utils from '../../utils';
import {OAuthSectionTypes} from '@cdo/apps/lib/ui/accounts/constants';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import {Heading1} from './Headings';
import {
  importOrUpdateRoster,
  sectionCode,
  sectionProvider,
  sectionName
} from '../../templates/teacherDashboard/teacherSectionsRedux';
import Button from '../../templates/Button';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import firehoseClient from '@cdo/apps/lib/util/firehose';

const PROVIDER_NAME = {
  [OAuthSectionTypes.clever]: i18n.loginTypeClever(),
  [OAuthSectionTypes.google_classroom]: i18n.loginTypeGoogleClassroom()
};

export const READY = 'ready';
export const IN_PROGRESS = 'in-progress';
export const SUCCESS = 'success';

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
    buttonState: READY,
    isDialogOpen: false,
    syncFailErrorLog: ''
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
      .catch(sync_error => {
        this.setState({
          syncFailErrorLog: '' + sync_error
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
              error_message: sync_error
            })
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

  render() {
    const {sectionProvider, sectionCode} = this.props;
    const {buttonState} = this.state;
    const supportedType = PROVIDER_NAME.hasOwnProperty(sectionProvider);
    if (!supportedType || !sectionCode) {
      // Possibly not loaded yet.
      return null;
    }

    return (
      <div>
        <SyncOmniAuthSectionButton
          provider={sectionProvider}
          buttonState={buttonState}
          onClick={this.onClick}
        />
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
                  'https://support.code.org/hc/en-us/articles/6496495212557'
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
  buttonState: PropTypes.oneOf([READY, IN_PROGRESS, SUCCESS]).isRequired,
  onClick: PropTypes.func
};

function buttonText(buttonState, providerName) {
  if (buttonState === IN_PROGRESS) {
    return i18n.loginTypeSyncButton_inProgress({providerName});
  } else if (buttonState === SUCCESS) {
    return i18n.loginTypeSyncButton_success({providerName});
  }
  return i18n.loginTypeSyncButton({providerName});
}

function iconProps(buttonState) {
  if (buttonState === IN_PROGRESS) {
    return {
      icon: 'refresh',
      iconClassName: 'fa-spin fa-fw'
    };
  }
  return {};
}

const styles = {
  dialog: {
    padding: '10px 20px 20px 20px',
    maxHeight: '500px'
  },
  scroll: {
    overflowX: 'hidden',
    overflowY: 'auto',
    maxHeight: '200px',
    paddingTop: '10px'
  },
  needHelpMessage: {
    paddingTop: '20px'
  },
  closeButton: {
    paddingTop: '20px'
  }
};
