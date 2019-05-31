import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import BaseDialog from '../../templates/BaseDialog';
import AbuseError from './AbuseError';
import color from '../../util/color';
import {hideExportDialog} from './exportDialogRedux';
import i18n from '@cdo/locale';
import {SignInState} from '../progressRedux';
import firehoseClient from '../../lib/util/firehose';
import exportExpoIconPng from '../../templates/export/expo/icon.png';
import SendToPhone from './SendToPhone';
import project from '../initApp/project';

function recordExport(type) {
  firehoseClient.putRecord(
    {
      study: 'finish-dialog-export',
      study_group: 'v1',
      event: 'project-export',
      project_id: project.getCurrentId(),
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
  actionButtonDisabled: {
    ...baseStyles.button,
    backgroundColor: color.gray,
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
  },
  spinner: {
    fontSize: 24
  },
  expoInput: {
    cursor: 'copy',
    width: 'unset'
  },
  phoneLabel: {
    marginTop: 15,
    marginBottom: 0
  },
  apkUriContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  sendToPhoneButton: {
    ...baseStyles.button,
    backgroundColor: color.purple,
    color: color.white
  },
  sendToPhoneButtonBody: {
    display: 'flex',
    alignItems: 'center'
  },
  sendToPhoneIcon: {
    fontSize: 32,
    width: 30,
    margin: '-8px 0'
  }
};

/**
 * Export Dialog used by projects
 */
class ExportDialog extends React.Component {
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
    userSharingDisabled: PropTypes.bool,
    signInState: PropTypes.oneOf(Object.values(SignInState)),
    isProjectLevel: PropTypes.bool.isRequired
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

  resetExportState() {
    this.setState({
      exporting: false,
      exportError: null,
      expoUri: undefined,
      expoSnackId: undefined,
      iconUri: undefined,
      splashImageUri: undefined,
      showSendToPhone: false,
      apkUri: undefined,
      generatingApk: false,
      apkError: null
    });
  }

  close = () => {
    const {expoUri} = this.state;
    if (expoUri) {
      // If we are re-opened, start at the platform page:
      this.setState({screen: 'platform'});
    } else {
      // If we don't haven't succesfully exported, then clear all export
      // state so we will start again fresh the next time:
      this.resetExportState();
    }
    recordExport('close');
    this.props.onClose();
  };

  onInputSelect = ({target}) => {
    target.select();
  };

  showSendToPhone = () => {
    this.setState({
      showSendToPhone: true
    });
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
    const {expoUri, expoSnackId, iconUri, splashImageUri} = this.state;
    if (expoUri) {
      // We have already have exported to Expo
      return {
        expoUri,
        expoSnackId,
        iconUri,
        splashImageUri
      };
    }
    const {exportApp, projectUpdatedAt} = this.props;
    this.setState({
      exporting: true,
      exportProjectUpdatedAt: projectUpdatedAt
    });
    try {
      const exportResult = await exportApp({
        mode: 'expoPublish'
      });
      this.setState({
        exporting: false,
        exportError: null,
        ...exportResult
      });
      return exportResult;
    } catch (e) {
      this.setState({
        exporting: false,
        exportProjectUpdatedAt: null,
        expoUri: null,
        expoSnackId: null,
        exportError: 'Failed to create app. Please try again later.'
      });
    }
    // In the success case, we already returned, so reaching this point means
    // that we failed to export. In the interest of always returning an object
    // with the same properties (even if they are undefined),
    // return what we retrieved from this.state initially:
    return {
      expoUri,
      expoSnackId,
      iconUri,
      splashImageUri
    };
  }

  async publishAndGenerateApk() {
    const {exportApp} = this.props;

    if (this.state.apkUri) {
      // We have already have generated an APK
      return;
    }

    const {
      expoSnackId,
      iconUri,
      splashImageUri
    } = await this.publishExpoExport();

    if (!expoSnackId) {
      // We failed to generate a snackId
      return;
    }

    this.setState({generatingApk: true});
    try {
      const apkUri = await exportApp({
        mode: 'expoGenerateApk',
        expoSnackId,
        iconUri,
        splashImageUri
      });
      this.setState({
        generatingApk: false,
        apkError: null,
        apkUri
      });
    } catch (e) {
      this.setState({
        generatingApk: false,
        apkError: 'Failed to create Android app. Please try again later.'
      });
    }
  }

  onActionButton = () => {
    const {screen} = this.state;

    switch (screen) {
      case 'intro':
        return this.setState({screen: 'platform'});
      // case 'export':
      //   return this.setState({screen: 'platform'});
      case 'platform':
        return this.setState({screen: 'publish'});
      // return this.setState({screen: 'icon'});
      // case 'icon':
      //   return this.setState({screen: 'publish'});
      case 'publish':
        this.publishAndGenerateApk();
        return this.setState({screen: 'generating'});
      case 'generating':
        return this.close();
      default:
        throw new Error(`ExportDialog: Unexpected screen: ${screen}`);
    }
  };

  renderMainContent() {
    const {screen} = this.state;

    switch (screen) {
      case 'intro':
        return this.renderIntroPage();
      // case 'export':
      //   return this.renderExportPage();
      case 'platform':
        return this.renderPlatformPage();
      // case 'icon':
      //   return this.renderIconPage();
      case 'publish':
        return this.renderPublishPage();
      case 'generating':
        return this.renderGeneratingPage();
      default:
        throw new Error(`ExportDialog: Unexpected screen: ${screen}`);
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
            Exporting will create a mobile app that you can install on your
            phone. You can install that app on your phone and run it without
            opening the Code.org website. If you make changes to your app after
            you export, you will need to export it again.
          </p>
          {/*<p style={styles.p}>
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
          </button>*/}
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
    // TODO: This page should be updated as a transition page to snack.expo.io
    // when iOS IPA export is ready to go
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
            <b>Note: </b>Exporting will take 10-15 minutes. If you change your
            app after you start exporting, those changes will not be included.
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

  renderGeneratingPage() {
    const {
      exporting,
      generatingApk,
      showSendToPhone,
      exportError,
      apkError,
      apkUri = ''
    } = this.state;
    const waiting = exporting || generatingApk;
    const error = exportError || apkError;
    const {appType, channelId} = this.props;
    const titleText = waiting
      ? 'Creating Android Package...'
      : error
      ? 'Error creating Android Package'
      : 'The Android Package was created successfully';
    const headerText = waiting
      ? 'Please wait for about <b>15 minutes</b>.'
      : error || 'Send this link to your device to install the app.';
    return (
      <div>
        <div style={styles.section}>
          <p style={styles.title}>{titleText}</p>
        </div>
        <div style={styles.section}>
          <p style={styles.p} dangerouslySetInnerHTML={{__html: headerText}} />
        </div>
        <div style={styles.section}>
          {waiting && (
            <i style={styles.spinner} className="fa fa-spinner fa-spin" />
          )}
          {!waiting && !error && (
            <div>
              <div style={styles.apkUriContainer}>
                <input
                  type="text"
                  onClick={this.onInputSelect}
                  readOnly="true"
                  value={apkUri}
                  style={styles.expoInput}
                />
              </div>
              <button
                type="button"
                style={styles.sendToPhoneButton}
                onClick={this.showSendToPhone}
              >
                <div style={styles.sendToPhoneButtonBody}>
                  <i
                    className="fa fa-mobile-phone"
                    style={styles.sendToPhoneIcon}
                  />
                  <span>{i18n.sendToPhone()}</span>
                </div>
              </button>
              {showSendToPhone && (
                <SendToPhone
                  channelId={channelId}
                  appType={appType}
                  downloadUrl={apkUri}
                  isLegacyShare={false}
                  styles={{label: styles.phoneLabel}}
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  getActionButtonInfo() {
    const {screen, exporting, generatingApk} = this.state;
    const info = {
      text: 'Next',
      enabled: true
    };
    switch (screen) {
      case 'generating':
        info.text = 'Finish';
        info.enabled = !exporting && !generatingApk;
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
    const {
      canShareSocial,
      hideBackdrop,
      i18n: i18nProp,
      isAbusive,
      isOpen,
      isProjectLevel,
      signInState,
      userSharingDisabled
    } = this.props;

    const needToSignIn =
      !isProjectLevel && signInState !== SignInState.SignedIn;
    const blockExport = userSharingDisabled || needToSignIn;
    const blockText = userSharingDisabled
      ? i18n.sharingBlockedByTeacher()
      : i18n.createAccountToShareDescription();

    const {
      text: actionText,
      enabled: actionEnabled
    } = this.getActionButtonInfo();
    const showShareWarning = !canShareSocial;
    return (
      <div>
        <BaseDialog
          style={styles.modal}
          isOpen={isOpen}
          handleClose={this.close}
          hideBackdrop={hideBackdrop}
        >
          {blockExport && (
            <div style={{position: 'relative'}}>
              <div style={{paddingRight: 10}}>
                <p>{blockText}</p>
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
          {!blockExport && (
            <div>
              <div
                id="project-export"
                className="modal-content no-modal-icon"
                style={{position: 'relative'}}
              >
                <p className="dialog-title">Export your project</p>
                {isAbusive && (
                  <AbuseError
                    i18n={{
                      tos: i18nProp.t('project.abuse.tos'),
                      contact_us: i18nProp.t('project.abuse.contact_us')
                    }}
                    className="alert-error"
                    style={styles.abuseStyle}
                    textStyle={styles.abuseTextStyle}
                  />
                )}
                {showShareWarning && (
                  <p style={styles.shareWarning}>
                    {i18nProp.t('project.share_u13_warning')}
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
                    style={
                      actionEnabled
                        ? styles.actionButton
                        : styles.actionButtonDisabled
                    }
                    onClick={this.onActionButton}
                    disabled={!actionEnabled}
                  >
                    {actionText}
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

export const UnconnectedExportDialog = ExportDialog;

export default connect(
  state => ({
    allowExportExpo: state.pageConstants.allowExportExpo || false,
    exportApp: state.pageConstants.exportApp,
    isOpen: state.exportDialog.isOpen,
    projectUpdatedAt: state.header.projectUpdatedAt,
    signInState: state.progress.signInState
  }),
  dispatch => ({
    onClose: () => dispatch(hideExportDialog())
  })
)(ExportDialog);
