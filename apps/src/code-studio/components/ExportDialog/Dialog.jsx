import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import BaseDialog from '../../../templates/BaseDialog';
import AbuseError from '../AbuseError';
import color from '../../../util/color';
import {
  PLATFORM_ANDROID,
  DEFAULT_PLATFORM
} from '../../../util/exporterConstants';
import {hideExportDialog} from '../exportDialogRedux';
import i18n from '@cdo/locale';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import firehoseClient from '../../../lib/util/firehose';
import project from '../../initApp/project';
import commonStyles from './styles';
import IntroPage from './IntroPage';
import PlatformPage from './PlatformPage';
import IconPage from './IconPage';
import PublishAndroidPage from './PublishAndroidPage';
import PublishIOSPage from './PublishIOSPage';
import GeneratingPage from './GeneratingPage';

const APK_BUILD_STATUS_CHECK_PERIOD = 60000;

function recordExport(type) {
  firehoseClient.putRecord(
    {
      study: 'finish-dialog-export',
      study_group: 'v1',
      event: 'project-export',
      project_id: project.getCurrentId ? project.getCurrentId() : undefined,
      data_string: type
    },
    {includeUserId: true}
  );
}

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
  cancelButton: {
    ...commonStyles.button,
    backgroundColor: color.gray,
    color: color.black
  },
  actionButton: {
    ...commonStyles.button,
    backgroundColor: color.orange,
    color: color.white
  },
  actionButtonDisabled: {
    ...commonStyles.button,
    backgroundColor: color.gray,
    color: color.white
  },
  backButton: {
    ...commonStyles.button,
    backgroundColor: color.gray,
    color: color.black
  },
  backButtonDisabled: {
    ...commonStyles.button,
    backgroundColor: color.gray,
    color: color.white
  },
  buttonRow: {
    ...commonStyles.section,
    display: 'flex',
    justifyContent: 'flex-end'
  }
};

/**
 * Export Dialog used by projects
 *
 * This dialog contains a series of pages in a wizard-like flow to help a student export
 * their applab or gamelab app into a mobile app for Android or iOS.
 *
 * The process requires that we first publish the app to Expo (including a stock React
 * Native wrapper app that hosts a WebView with the student's HTML app files)
 *
 * For Android, we then ask Expo to start building a native Android Package (APK).
 * This process uses Expo's build farm and takes 10-15 minutes (the assets are bundled
 * alongside the React Native app and then Android java code is compiled, packaged, and
 * signed)
 *
 * For iOS, we plan to transition to the Expo web site to ask the student to enter their
 * Apple developer credentials. Expo will then build a native iOS app (IPA) and upload
 * it to TestFlight.
 */
class ExportDialog extends React.Component {
  static propTypes = {
    exportApp: PropTypes.func.isRequired,
    expoGenerateApk: PropTypes.func.isRequired,
    expoCheckApkBuild: PropTypes.func.isRequired,
    expoCancelApkBuild: PropTypes.func.isRequired,
    exportGeneratedProperties: PropTypes.object,
    md5SavedSources: PropTypes.string.isRequired,
    isAbusive: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    appType: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    hideBackdrop: BaseDialog.propTypes.hideBackdrop,
    canShareSocial: PropTypes.bool.isRequired,
    userSharingDisabled: PropTypes.bool,
    signInState: PropTypes.oneOf(Object.values(SignInState)),
    isProjectLevel: PropTypes.bool.isRequired
  };

  state = {
    screen: 'intro',
    platform: DEFAULT_PLATFORM
  };

  componentDidUpdate(prevProps) {
    const {isOpen, md5SavedSources} = this.props;
    const {md5PublishSavedSources} = this.state;
    if (isOpen && !prevProps.isOpen) {
      recordExport('open');
      const md5ApkSavedSources = this.getMd5ApkSavedSources();
      const sourcesChangedSinceExport =
        md5ApkSavedSources && md5SavedSources !== md5ApkSavedSources;
      const sourcesChangedThisInstance =
        md5PublishSavedSources && md5SavedSources !== md5PublishSavedSources;
      if (sourcesChangedSinceExport) {
        // Cancel any build that may have started with an older version of this
        // project before this page was reloaded:
        this.cancelIfPreexistingApkBuild();
      }
      if (sourcesChangedThisInstance) {
        // The project has changed since we last published within this dialog,
        // cancel any builds in progress and reset our export state, so we will
        // start all over again:
        this.cancelIfGeneratingAndResetState();
      }
    }
  }

  clearWaitTimer() {
    if (this.waitTimerId) {
      clearTimeout(this.waitTimerId);
      this.waitTimerId = null;
    }
  }

  cancelIfGeneratingAndResetState() {
    const {screen, generatingApk} = this.state;
    if (screen === 'generating' && generatingApk) {
      this.clearWaitTimer();

      const {expoCancelApkBuild, md5SavedSources} = this.props;
      const {expoSnackId, apkBuildId} = this.state;

      expoCancelApkBuild({
        md5SavedSources,
        expoSnackId,
        apkBuildId
      });
    }
    // If we are publishing to expo (state.exporting is true), we don't need
    // to cancel, just resetting our state is good enough.
    this.resetExportState();
  }

  getMd5ApkSavedSources() {
    const {exportGeneratedProperties = {}} = this.props;
    const {android = {}} = exportGeneratedProperties;
    const {md5ApkSavedSources} = android;

    return md5ApkSavedSources;
  }

  //
  // Cancel preexisting builds for this project (the page may have been
  // refreshed while a build was in progress)
  //
  cancelIfPreexistingApkBuild() {
    const {exportGeneratedProperties = {}} = this.props;
    const {android = {}} = exportGeneratedProperties;
    const {md5ApkSavedSources, snackId, apkBuildId, apkUri} = android;

    // If we have an apkBuildId, but not apkUri, there was a build
    // in process that needs to be canceled because Expo will only
    // allow one build to take place at a time
    if (apkBuildId && !apkUri) {
      const {expoCancelApkBuild} = this.props;
      expoCancelApkBuild({
        md5SavedSources: md5ApkSavedSources,
        expoSnackId: snackId,
        apkBuildId
      });
    }
  }

  resetExportState() {
    this.setState({
      screen: 'intro',
      exporting: false,
      exportError: null,
      expoUri: undefined,
      expoSnackId: undefined,
      iconFileUrl: undefined,
      iconUri: undefined,
      md5PublishSavedSources: undefined,
      platform: DEFAULT_PLATFORM,
      splashImageUri: undefined,
      apkUri: undefined,
      generatingApk: false,
      apkError: null
    });
  }

  close = () => {
    recordExport('close');
    this.props.onClose();
  };

  onIconSelected = iconFileUrl => {
    this.setState({
      iconFileUrl
    });
  };

  onPlatformChanged = platform => {
    this.setState({
      platform
    });
  };

  async publishExpoExport() {
    const {
      expoUri,
      expoSnackId,
      iconFileUrl,
      iconUri,
      splashImageUri
    } = this.state;
    if (expoUri) {
      // We have already have exported to Expo
      return {
        expoUri,
        expoSnackId,
        iconUri,
        splashImageUri
      };
    }
    const {exportApp, md5SavedSources} = this.props;
    this.setState({
      exporting: true,
      md5PublishSavedSources: md5SavedSources
    });
    try {
      recordExport('publishToExpo');
      const exportResult = await exportApp({
        mode: 'expoPublish',
        iconFileUrl
      });
      const {exporting} = this.state;
      if (!exporting) {
        // The user has canceled (resetExportState() was called)
        // Simply return an empty object and don't modify state
        // or return the exportResult:
        return {};
      }
      this.setState({
        exporting: false,
        exportError: null,
        ...exportResult
      });
      return exportResult;
    } catch (e) {
      const hasDataAPIsError = e.message.includes('hasDataAPIs');
      const exportError = hasDataAPIsError
        ? 'This project uses data APIs. Exporting this type of app is not supported during the Beta period.'
        : 'Failed to create app. Please try again later.';
      recordExport(
        hasDataAPIsError ? 'publishBlockedDueToDataAPIs' : 'publishToExpoError'
      );
      this.setState({
        exporting: false,
        md5PublishSavedSources: null,
        expoUri: null,
        expoSnackId: null,
        exportError
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
    const {expoGenerateApk, md5SavedSources} = this.props;
    const {apkUri} = this.state;

    if (apkUri) {
      // We have already have generated an APK
      return;
    }

    const {
      expoSnackId,
      iconUri,
      splashImageUri
    } = await this.publishExpoExport();

    if (!expoSnackId) {
      // We failed to generate a snackId, simply return
      // (publishExpoExport() will have set exportError in state as needed)
      return;
    }

    recordExport('generateApk');
    this.setState({generatingApk: true});
    try {
      const apkBuildId = await expoGenerateApk({
        md5SavedSources,
        expoSnackId,
        iconUri,
        splashImageUri
      });
      this.setState({apkBuildId});
      return this.waitForApkBuild(apkBuildId, expoSnackId);
    } catch (e) {
      recordExport('generateApkError');
      this.setState({
        generatingApk: false,
        apkError: 'Failed to create Android app. Please try again later.',
        apkUri: null,
        apkBuildId: null
      });
    }
  }

  visitExpoSite() {
    const {expoSnackId} = this.state;
    if (!expoSnackId) {
      return;
    }
    // TODO: use new URL format once snack-web has been updated for this flow
    // TODO: pass iconUri and splashImageUri to expo.io
    window.open(`https://snack.expo.io/${expoSnackId}`, '_blank');
  }

  checkForApkBuild(apkBuildId, expoSnackId) {
    const {expoCheckApkBuild, md5SavedSources} = this.props;

    return expoCheckApkBuild({
      md5SavedSources,
      expoSnackId,
      apkBuildId
    });
  }

  async waitForApkBuild(apkBuildId, expoSnackId) {
    this.clearWaitTimer();

    try {
      const apkUri = await this.checkForApkBuild(apkBuildId, expoSnackId);
      const {generatingApk} = this.state;
      if (!generatingApk) {
        // Build was canceled while we were checking on the status
        return;
      }
      if (apkUri) {
        recordExport('generateApkSuccess');
        this.setState({
          generatingApk: false,
          apkError: null,
          apkUri
        });
      } else {
        // Check status again...
        // NOTE: we don't timeout automatically
        this.waitTimerId = setTimeout(() => {
          this.waitTimerId = null;
          this.waitForApkBuild(apkBuildId, expoSnackId);
        }, APK_BUILD_STATUS_CHECK_PERIOD);
      }
    } catch (e) {
      recordExport('generateApkError');
      this.setState({
        generatingApk: false,
        apkError: 'Failed to create Android app. Please try again later.',
        apkUri: null,
        apkBuildId: null
      });
    }
  }

  //
  // Return properties related to the last saved APK build as long as the
  // project's md5SavedSources hash matches
  //
  getValidPreviousApkInfo() {
    const {exportGeneratedProperties = {}, md5SavedSources} = this.props;
    const {android = {}} = exportGeneratedProperties;
    const {md5ApkSavedSources, ...apkInfo} = android;

    if (md5ApkSavedSources && md5SavedSources === md5ApkSavedSources) {
      return apkInfo;
    }
    return {};
  }

  //
  // Generates an APK - or monitors an existing APK build in progress
  // Returns: Promise
  //
  generateApkAsNeeded() {
    const {
      apkUri,
      apkBuildId,
      snackId: expoSnackId
    } = this.getValidPreviousApkInfo();
    const {md5SavedSources} = this.props;
    if (apkUri) {
      // The previous build completed, no need to generate a new one.
      // Set up state to match a completed export:
      this.setState({
        apkUri,
        apkBuildId,
        expoSnackId,
        md5PublishSavedSources: md5SavedSources
      });
      return Promise.resolve();
    } else if (apkBuildId) {
      // The previous build was in progress, resume monitoring that build.
      // Set up state to match an export in progress:
      this.setState({
        generatingApk: true,
        apkUri: null,
        apkBuildId,
        expoSnackId,
        md5PublishSavedSources: md5SavedSources
      });
      return this.waitForApkBuild(apkBuildId, expoSnackId);
    } else {
      // There is no previous build that matches the current sources,
      // so publish and generate a new build:
      return this.publishAndGenerateApk();
    }
  }

  onActionButton = () => {
    const {screen, platform} = this.state;

    switch (screen) {
      case 'intro':
        recordExport('platformScreen');
        this.setState({screen: 'platform'});
        break;
      case 'platform':
        recordExport('iconScreen');
        this.setState({screen: 'icon'});
        break;
      case 'icon': {
        const nextScreen =
          platform === PLATFORM_ANDROID ? 'publishAndroid' : 'publishIOS';
        recordExport(`${nextScreen}Screen`);
        this.setState({screen: nextScreen});
        break;
      }
      case 'publishAndroid':
        this.generateApkAsNeeded();
        recordExport('generatingScreen');
        this.setState({screen: 'generating'});
        break;
      case 'publishIOS':
        this.publishExpoExport();
        recordExport('generatingScreen');
        this.setState({screen: 'generating'});
        break;
      case 'generating':
        if (this.isPublishingForIOSWithoutError()) {
          recordExport('navigateToExpo');
          this.visitExpoSite();
        }
        this.close();
        break;
      default:
        throw new Error(`ExportDialog: Unexpected screen: ${screen}`);
    }
  };

  onBackButton = () => {
    const {platform, screen} = this.state;

    switch (screen) {
      case 'intro':
        break;
      case 'platform':
        this.setState({screen: 'intro'});
        break;
      case 'icon':
        this.setState({screen: 'platform'});
        break;
      case 'publishAndroid':
      case 'publishIOS':
        this.setState({screen: 'icon'});
        break;
      case 'generating':
        this.setState({
          screen:
            platform === PLATFORM_ANDROID ? 'publishAndroid' : 'publishIOS'
        });
        break;
      default:
        throw new Error(`ExportDialog: Unexpected screen: ${screen}`);
    }
  };

  onCancelButton = () => {
    // If an operation is in progress, cancel and reset back the
    // beginning as part of the close operation:
    const {exporting} = this.state;
    if (exporting) {
      this.resetExportState();
    }
    this.cancelIfGeneratingAndResetState();
    this.close();
  };

  renderMainContent() {
    const {screen, iconFileUrl, platform} = this.state;

    switch (screen) {
      case 'intro':
        return <IntroPage />;
      case 'platform':
        return (
          <PlatformPage
            platform={platform}
            onPlatformChanged={this.onPlatformChanged}
          />
        );
      case 'icon':
        return (
          <IconPage
            iconFileUrl={iconFileUrl}
            onIconSelected={this.onIconSelected}
          />
        );
      case 'publishAndroid':
        return <PublishAndroidPage />;
      case 'publishIOS':
        return <PublishIOSPage />;
      case 'generating': {
        const {appType} = this.props;
        const {exportError, apkError, apkUri} = this.state;
        return (
          <GeneratingPage
            appType={appType}
            platform={platform}
            isGenerating={this.isGenerating()}
            exportError={exportError}
            apkError={apkError}
            apkUri={apkUri}
          />
        );
      }
      default:
        throw new Error(`ExportDialog: Unexpected screen: ${screen}`);
    }
  }

  isGenerating() {
    const {screen, exporting, generatingApk} = this.state;
    return screen === 'generating' && !!(exporting || generatingApk);
  }

  isPublishingForIOSWithoutError() {
    const {platform, exportError} = this.state;
    return platform === 'ios' && !exportError;
  }

  getActionButtonInfo() {
    const {screen} = this.state;
    const info = {
      text: 'Next',
      enabled: true
    };
    switch (screen) {
      case 'generating':
        info.text = this.isPublishingForIOSWithoutError()
          ? 'Continue with Expo.io'
          : 'Finish';
        info.enabled = !this.isGenerating();
        break;
      case 'publishAndroid':
        info.text = 'Create';
        break;
    }
    return info;
  }

  backButtonEnabled() {
    const {screen, exporting, generatingApk} = this.state;
    switch (screen) {
      case 'intro':
        return false;
      case 'generating':
        return !exporting && !generatingApk;
      default:
        return true;
    }
  }

  renderBlocked() {
    const {userSharingDisabled} = this.props;

    // NOTE: this uses the i18n that we import, not the i18n passed as a prop
    const blockText = userSharingDisabled
      ? i18n.sharingBlockedByTeacher()
      : i18n.createAccountToShareDescription();

    return (
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
    );
  }

  renderWrappedInBaseDialog(children) {
    const {hideBackdrop, isOpen} = this.props;

    return (
      <div>
        <BaseDialog
          style={styles.modal}
          isOpen={isOpen}
          handleClose={this.close}
          hideBackdrop={hideBackdrop}
        >
          {children}
        </BaseDialog>
      </div>
    );
  }

  render() {
    const {
      canShareSocial,
      isAbusive,
      isProjectLevel,
      signInState,
      userSharingDisabled
    } = this.props;
    const {screen} = this.state;

    const needToSignIn =
      !isProjectLevel && signInState !== SignInState.SignedIn;
    const blockExport = userSharingDisabled || needToSignIn;

    if (blockExport) {
      return this.renderWrappedInBaseDialog(this.renderBlocked());
    }

    const {
      text: actionText,
      enabled: actionEnabled
    } = this.getActionButtonInfo();
    const backVisible = screen !== 'intro';
    const cancelVisible = this.isGenerating();
    const backEnabled = this.backButtonEnabled();
    const showShareWarning = !canShareSocial;

    return this.renderWrappedInBaseDialog(
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
                tos: i18n.tosLong({url: 'http://code.org/tos'}),
                contact_us: i18n.contactUs({url: 'https://code.org/contact'})
              }}
              className="alert-error"
              style={styles.abuseStyle}
              textStyle={styles.abuseTextStyle}
            />
          )}
          {showShareWarning && (
            <p style={styles.shareWarning}>{i18n.shareU13Warning()}</p>
          )}
          {this.renderMainContent()}
          <div style={styles.buttonRow}>
            {cancelVisible && (
              <button
                type="button"
                style={styles.cancelButton}
                onClick={this.onCancelButton}
              >
                Cancel Package Creation
              </button>
            )}
            {backVisible && (
              <button
                type="button"
                style={
                  backEnabled ? styles.backButton : styles.backButtonDisabled
                }
                onClick={this.onBackButton}
                disabled={!backEnabled}
              >
                Back
              </button>
            )}
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
    );
  }
}

export const UnconnectedExportDialog = ExportDialog;

export default connect(
  state => ({
    exportApp: state.pageConstants.exportApp,
    expoGenerateApk: state.pageConstants.expoGenerateApk,
    expoCheckApkBuild: state.pageConstants.expoCheckApkBuild,
    expoCancelApkBuild: state.pageConstants.expoCancelApkBuild,
    isOpen: state.exportDialog.isOpen,
    exportGeneratedProperties: state.exportDialog.exportGeneratedProperties,
    signInState: state.currentUser.signInState
  }),
  dispatch => ({
    onClose: () => dispatch(hideExportDialog())
  })
)(ExportDialog);
