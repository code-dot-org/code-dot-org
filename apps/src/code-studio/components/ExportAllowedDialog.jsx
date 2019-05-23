/* global dashboard */

import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import BaseDialog from '../../templates/BaseDialog';
import AbuseError from './AbuseError';
import color from '../../util/color';
import {hideExportDialog} from './exportDialogRedux';
import i18n from '@cdo/locale';
import firehoseClient from '../../lib/util/firehose';
import exportExpoIconPng from '../../templates/export/expo/icon.png';

function recordExport(type) {
  if (!window.dashboard) {
    return;
  }

  firehoseClient.putRecord(
    {
      study: 'finish-dialog-export',
      study_group: 'v1',
      event: 'project-export',
      project_id: dashboard.project && dashboard.project.getCurrentId(),
      data_string: type
    },
    {includeUserId: true}
  );
}

const baseStyles = {
  button: {
    borderWidth: 1,
    borderColor: color.border_gray,
    fontSize: 'larger',
    padding: 10,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 8,
    verticalAlign: 'top'
  },
  section: {
    marginTop: 10
  },
  text: {
    fontSize: 'inherit',
    lineHeight: 'inherit',
    color: 'inherit'
  },
  inlineLabel: {
    display: 'inline-block'
  }
};

const styles = {
  modal: {
    width: 720,
    marginLeft: -360
  },
  abuseStyle: {
    border: '1px solid',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20
  },
  abuseTextStyle: {
    color: '#b94a48',
    fontSize: 14
  },
  shareWarning: {
    color: color.red,
    fontSize: 13,
    fontWeight: 'bold'
  },
  uploadIconButton: {
    ...baseStyles.button,
    backgroundColor: color.default_blue,
    color: color.white
  },
  iosAppStoreButton: {
    ...baseStyles.button,
    backgroundColor: color.purple,
    color: color.white
  },
  androidGooglePlayButton: {
    ...baseStyles.button,
    backgroundColor: color.purple,
    color: color.white
  },
  cancelButton: {
    ...baseStyles.button,
    backgroundColor: color.gray,
    color: color.black
  },
  actionButton: {
    ...baseStyles.button,
    backgroundColor: color.orange,
    color: color.white
  },
  p: {
    ...baseStyles.text
  },
  section: {
    ...baseStyles.section
  },
  buttonRow: {
    ...baseStyles.section,
    display: 'flex',
    justifyContent: 'flex-end'
  },
  title: {
    fontSize: 16
  },
  radioLabel: {
    ...baseStyles.text,
    ...baseStyles.inlineLabel
  },
  radioLabelDisabled: {
    ...baseStyles.text,
    ...baseStyles.inlineLabel,
    color: color.light_gray
  },
  radioInput: {
    height: 18,
    verticalAlign: 'middle'
  },
  icon: {
    marginRight: 10,
    width: 125,
    height: 125,
    overflow: 'hidden',
    borderRadius: 2,
    border: '1px solid rgb(187,187,187)',
    backgroundColor: color.black,
    position: 'relative',
    display: 'inline-block'
  },
  iconImage: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: '100%',
    height: 'auto',
    transform: 'translate(-50%,-50%)',
    msTransform: 'translate(-50%,-50%)',
    WebkitTransform: 'translate(-50%,-50%)'
  }
};

/**
 * Export Dialog used by projects
 */
class ExportAllowedDialog extends React.Component {
  static propTypes = {
    i18n: PropTypes.shape({
      t: PropTypes.func.isRequired
    }).isRequired,
    allowExportExpo: PropTypes.bool.isRequired,
    exportApp: PropTypes.func,
    projectUpdatedAt: PropTypes.string,
    isAbusive: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    channelId: PropTypes.string.isRequired,
    appType: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    hideBackdrop: BaseDialog.propTypes.hideBackdrop,
    canShareSocial: PropTypes.bool.isRequired,
    userSharingDisabled: PropTypes.bool
  };

  state = {
    screen: 'intro'
  };

  componentDidUpdate(prevProps) {
    const {isOpen, projectUpdatedAt} = this.props;
    const {exportProjectUpdatedAt} = this.state;
    if (isOpen && !prevProps.isOpen) {
      recordExport('open');
      if (projectUpdatedAt !== exportProjectUpdatedAt) {
        // The project has changed since we last opened the dialog,
        // reset our export state, so we will need to export again:
        this.resetExportState();
      }
    }
  }

  sharingDisabled() {
    return (
      this.props.userSharingDisabled &&
      ['applab', 'gamelab', 'weblab'].includes(this.props.appType)
    );
  }

  resetExportState() {
    this.setState({
      exporting: false,
      exportError: null,
      expoUri: null,
      expoSnackId: null,
      iconUri: null,
      splashImageUri: null
    });
  }

  close = () => {
    const {expoUri} = this.state;
    if (expoUri) {
      this.setState({screen: 'intro'});
    } else {
      // If we don't haven't succesfully exported, then clear all export
      // state so we will start again fresh the next time:
      this.resetExportState();
    }
    recordExport('close');
    this.props.onClose();
  };

  onInstallExpoIOS = () => {
    window.open(
      'https://itunes.apple.com/app/apple-store/id982107779',
      '_blank'
    );
  };

  onInstallExpoAndroid = () => {
    window.open(
      'https://play.google.com/store/apps/details?id=host.exp.exponent&referrer=www',
      '_blank'
    );
  };

  async publishExpoExport() {
    const {expoUri} = this.state;
    if (expoUri) {
      return;
    }
    const {exportApp, projectUpdatedAt} = this.props;
    this.setState({
      exporting: true,
      exportProjectUpdatedAt: projectUpdatedAt
    });
    try {
      const {expoUri, expoSnackId, iconUri, splashImageUri} = await exportApp({
        mode: 'expoPublish'
      });
      this.setState({
        exporting: false,
        exportError: null,
        expoUri,
        expoSnackId,
        iconUri,
        splashImageUri
      });
    } catch (e) {
      this.setState({
        exporting: false,
        exportProjectUpdatedAt: null,
        expoUri: null,
        expoSnackId: null,
        exportError:
          'Failed to publish project to Expo. Please try again later.'
      });
    }
  }

  onActionButton = () => {
    const {screen} = this.state;

    switch (screen) {
      case 'intro':
        this.publishExpoExport();
        return this.setState({screen: 'export'});
      case 'export':
        return this.setState({screen: 'platform'});
      case 'platform':
        return this.setState({screen: 'icon'});
      case 'icon':
        return this.setState({screen: 'publish'});
      case 'publish':
        return this.setState({screen: 'waiting'});
      case 'waiting':
        return this.close();
      default:
        throw new Error(`ExportAllowedDialog: Unexpected screen: ${screen}`);
    }
  };

  renderMainContent() {
    const {screen} = this.state;

    switch (screen) {
      case 'intro':
        return this.renderIntroPage();
      case 'export':
        return this.renderExportPage();
      case 'platform':
        return this.renderPlatformPage();
      case 'icon':
        return this.renderIconPage();
      case 'publish':
        return this.renderPublishPage();
      case 'waiting':
        return this.renderWaitingPage();
      default:
        throw new Error(`ExportAllowedDialog: Unexpected screen: ${screen}`);
    }
  }

  renderIntroPage() {
    return (
      <div>
        <div style={styles.section}>
          <p style={styles.title}>
            Code Studio can export your project as a mobile app for iOS or
            Android
          </p>
        </div>
        <div style={styles.section}>
          <p style={styles.p}>
            The first step is to install the Expo app on your mobile device so
            you can test your project within the Expo app.
          </p>
          <button
            type="button"
            style={styles.iosAppStoreButton}
            onClick={this.onInstallExpoIOS}
          >
            iOS Expo App
          </button>
          <button
            type="button"
            style={styles.androidGooglePlayButton}
            onClick={this.onInstallExpoAndroid}
          >
            Android Expo App
          </button>
        </div>
      </div>
    );
  }

  renderExportPage() {
    const {
      exporting,
      exportError,
      expoUri,
      expoSnackId,
      iconUri,
      splashImageUri
    } = this.state;
    return (
      <div>
        <div style={styles.section}>
          <p style={styles.title}>Preview your project in the Expo app</p>
        </div>
        <div style={styles.section}>
          <p style={styles.p}>TBD.</p>
          <p style={styles.p}>{`exporting: ${exporting}`}</p>
          <p style={styles.p}>{`exportError: ${exportError}`}</p>
          <p style={styles.p}>{`expoUri: ${expoUri}`}</p>
          <p style={styles.p}>{`expoSnackId: ${expoSnackId}`}</p>
          <p style={styles.p}>{`iconUri: ${iconUri}`}</p>
          <p style={styles.p}>{`splashImageUri: ${splashImageUri}`}</p>
        </div>
      </div>
    );
  }

  renderPlatformPage() {
    return (
      <div>
        <div style={styles.section}>
          <p style={styles.title}>Choose your platform</p>
        </div>
        <div style={styles.section}>
          <div>
            <input
              style={styles.radioInput}
              type="radio"
              id="radioAndroid"
              readOnly
              checked
            />
            <label htmlFor="radioAndroid" style={styles.radioLabel}>
              I have an Android device
            </label>
          </div>
          <div>
            <input
              style={styles.radioInput}
              type="radio"
              id="radioIOS"
              disabled
            />
            <label htmlFor="radioIOS" style={styles.radioLabelDisabled}>
              I have an iOS device (currently not supported)
            </label>
          </div>
        </div>
        <div style={styles.section}>
          <p style={styles.p}>
            <b>Note: </b>Exporting will take 10-15 minutes. Any changes made
            during the export process will not be included.
          </p>
        </div>
      </div>
    );
  }

  renderIconPage() {
    return (
      <div>
        <div style={styles.section}>
          <p style={styles.title}>Upload your App icon</p>
        </div>
        <div style={styles.section}>
          <div style={styles.icon}>
            <img style={styles.iconImage} src={exportExpoIconPng} />
          </div>
          <button
            type="button"
            style={styles.uploadIconButton}
            onClick={this.onUploadIcon}
          >
            Upload another image
          </button>
        </div>
      </div>
    );
  }

  renderPublishPage() {
    return (
      <div>
        <div style={styles.section}>
          <p style={styles.title}>Create Android Package</p>
        </div>
        <div style={styles.section}>
          <p style={styles.p}>
            An Android Package (APK) is a package of code and other files that
            can be installed as an app on an Android device.
          </p>
          <p style={styles.p}>
            <b>Note: </b>After you click "Create", it will take about 10-15
            minutes to create the package.
          </p>
        </div>
      </div>
    );
  }

  renderWaitingPage() {
    return (
      <div>
        <div style={styles.section}>
          <p style={styles.title}>Creating Android Package...</p>
        </div>
        <div style={styles.section}>
          <p style={styles.p}>
            Please wait for about <b>15 minutes</b>.
          </p>
        </div>
      </div>
    );
  }

  getActionButtonInfo() {
    const {screen, exporting} = this.state;
    const info = {
      text: 'Next',
      enabled: true
    };
    switch (screen) {
      case 'waiting':
        info.text = 'Finish';
        break;
      case 'export':
        info.enabled = !exporting;
        break;
      case 'publish':
        info.text = 'Create';
        break;
    }
    return info;
  }

  render() {
    const actionButtonInfo = this.getActionButtonInfo();
    const showShareWarning =
      !this.props.canShareSocial &&
      (this.props.appType === 'applab' || this.props.appType === 'gamelab');
    return (
      <div>
        <BaseDialog
          style={styles.modal}
          isOpen={this.props.isOpen}
          handleClose={this.close}
          hideBackdrop={this.props.hideBackdrop}
        >
          {this.sharingDisabled() && (
            <div style={{position: 'relative'}}>
              <div style={{paddingRight: 10}}>
                <p>{i18n.sharingBlockedByTeacher()}</p>
              </div>
              <div style={{clear: 'both', height: 40}}>
                <button
                  type="button"
                  id="continue-button"
                  style={{position: 'absolute', right: 0, bottom: 0, margin: 0}}
                  onClick={this.close}
                >
                  {i18n.dialogOK()}
                </button>
              </div>
            </div>
          )}
          {!this.sharingDisabled() && (
            <div>
              <div
                id="project-export"
                className="modal-content no-modal-icon"
                style={{position: 'relative'}}
              >
                <p className="dialog-title">Export your project</p>
                {this.props.isAbusive && (
                  <AbuseError
                    i18n={{
                      tos: this.props.i18n.t('project.abuse.tos'),
                      contact_us: this.props.i18n.t('project.abuse.contact_us')
                    }}
                    className="alert-error"
                    style={styles.abuseStyle}
                    textStyle={styles.abuseTextStyle}
                  />
                )}
                {showShareWarning && (
                  <p style={styles.shareWarning}>
                    {this.props.i18n.t('project.share_u13_warning')}
                  </p>
                )}
                {this.renderMainContent()}
                <div style={styles.buttonRow}>
                  <button
                    type="button"
                    style={styles.cancelButton}
                    onClick={this.close}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    style={styles.actionButton}
                    onClick={this.onActionButton}
                    disabled={!actionButtonInfo.enabled}
                  >
                    {actionButtonInfo.text}
                  </button>
                </div>
              </div>
            </div>
          )}
        </BaseDialog>
      </div>
    );
  }
}

export const UnconnectedExportAllowedDialog = ExportAllowedDialog;

export default connect(
  state => ({
    allowExportExpo: state.pageConstants.allowExportExpo || false,
    exportApp: state.pageConstants.exportApp,
    isOpen: state.exportDialog.isOpen,
    projectUpdatedAt: state.header.projectUpdatedAt
  }),
  dispatch => ({
    onClose: () => dispatch(hideExportDialog())
  })
)(ExportAllowedDialog);
