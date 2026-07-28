import Dialog from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Modal from '@code-dot-org/component-library/modal';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import PropTypes from 'prop-types';
import QRCode from 'qrcode.react';
import React from 'react';
import {connect} from 'react-redux';

import {OPEN_ENDED_LEGACY_PROJECT_TYPES} from '@cdo/apps/constants';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import * as p5labConstants from '@cdo/apps/p5lab/constants';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import {createHiddenPrintWindow} from '@cdo/apps/utils';
import i18n from '@cdo/locale';
import defaultThumbnail from '@cdo/static/projects/project_default.png';

import * as applabConstants from '../../applab/constants';
import {SongTitlesToArtistTwitterHandle} from '../dancePartySongArtistTags';

import AbuseError from './AbuseError';
import AdvancedShareOptions from './AdvancedShareOptions';
import LibraryCreationDialog from './libraries/LibraryCreationDialog';
import SendToPhone from './SendToPhone';
import {hideShareDialog} from './shareDialogRedux';

import moduleStyles from './share-allowed-dialog.module.scss';

function recordShare(type, appType) {
  if (!window.dashboard) {
    return;
  }
  if (EVENTS[type]) {
    analyticsReporter.sendEvent(EVENTS[type], {
      lab_type: appType,
      channel_id: dashboard.project && dashboard.project.getCurrentId(),
    });
  }
}

function wrapShareClick(handler, type, appType) {
  return function () {
    try {
      recordShare(type, appType);
    } finally {
      handler.apply(this, arguments);
    }
  };
}

function checkImageReachability(imageUrl, callback) {
  const img = new Image();
  img.onabort = () => callback(false);
  img.onload = () => callback(true);
  img.onerror = () => callback(false);
  img.src =
    imageUrl +
    (imageUrl.indexOf('?') < 0 ? '?' : '&') +
    '__cacheBust=' +
    Math.random();
}

/**
 * Share Dialog used by projects
 */
class ShareAllowedDialog extends React.Component {
  static propTypes = {
    exportApp: PropTypes.func,
    shareUrl: PropTypes.string.isRequired,
    // Only applicable to Dance Party projects, used to Tweet at song artist.
    selectedSong: PropTypes.string,
    thumbnailUrl: PropTypes.string,
    isAbusive: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    canPrint: PropTypes.bool,
    channelId: PropTypes.string.isRequired,
    appType: PropTypes.string.isRequired,
    onClickPopup: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    canShareSocial: PropTypes.bool.isRequired,
    userSharingDisabled: PropTypes.bool,
    inRestrictedShareMode: PropTypes.bool,
    hasPrivacyProfanityViolation: PropTypes.bool,
  };

  state = {
    showSendToPhone: false,
    showAdvancedOptions: false,
    exporting: false,
    exportError: null,
    isTwitterAvailable: false,
    isFacebookAvailable: false,
    hasBeenCopied: false,
    isLoadingAccountAndProjectAge: false,
    showSharingDisallowedDialog: false,
  };

  componentDidMount() {
    if (this.props.canShareSocial) {
      // check if twitter and facebook are actually available
      // and not blocked by network firewall
      checkImageReachability(
        'https://facebook.com/favicon.ico',
        isFacebookAvailable => this.setState({isFacebookAvailable})
      );
      checkImageReachability(
        'https://twitter.com/favicon.ico',
        isTwitterAvailable => this.setState({isTwitterAvailable})
      );
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.isOpen && !prevProps.isOpen) {
      recordShare('SHARING_DIALOG_OPEN', this.props.appType);
      this.setState({hasBeenCopied: false});

      if (this.sharingDisallowedWhileSignedIn()) {
        this.setState({showSharingDisallowedDialog: true});
      }
    }
  }

  sharingDisabled = () =>
    this.props.userSharingDisabled &&
    OPEN_ENDED_LEGACY_PROJECT_TYPES.includes(this.props.appType);

  sharingDisallowedWhileSignedIn = () =>
    this.sharingDisabled() || this.hasPrivacyProfanityViolation();

  hasPrivacyProfanityViolation = () => this.props.hasPrivacyProfanityViolation;

  close = () => {
    recordShare('SHARING_CLOSE_ESCAPE', this.props.appType);
    this.props.onClose();
    this.setState({
      showSharingDisallowedDialog: false,
    });
  };

  showSendToPhone = event => {
    this.setState({
      showSendToPhone: true,
      showAdvancedOptions: false,
    });
    event.preventDefault();
  };

  print = event => {
    event.preventDefault();
    createHiddenPrintWindow(this.props.thumbnailUrl);
  };

  showAdvancedOptions = () => {
    this.setState({
      showSendToPhone: false,
      showAdvancedOptions: true,
    });
  };

  // Copy to clipboard.
  copy = () => {
    copyToClipboard(this.props.shareUrl, () =>
      this.setState({hasBeenCopied: true})
    );
  };

  // inRestrictedShareMode overrides canShareSocial
  isSocialShareAllowed = () =>
    this.props.canShareSocial && !this.props.inRestrictedShareMode;

  getWarningText = () => {
    if (this.props.inRestrictedShareMode) {
      return i18n.restrictedShareInfo();
    }

    if (!this.props.thumbnailUrl) {
      return i18n.thumbnailWarning();
    }
  };
  render() {
    const {
      canPrint,
      canShareSocial,
      appType,
      selectedSong,
      shareUrl,
      isOpen,
      isAbusive,
      onClickPopup,
      exportApp,
      channelId,
    } = this.props;

    const isDroplet = appType === 'applab' || appType === 'gamelab';
    const artistTwitterHandle = SongTitlesToArtistTwitterHandle[selectedSong];

    const hasThumbnail = !!this.props.thumbnailUrl;
    const thumbnailUrl = hasThumbnail
      ? this.props.thumbnailUrl
      : defaultThumbnail;

    const facebookShareUrl =
      'https://www.facebook.com/sharer/sharer.php?u=' +
      encodeURIComponent(shareUrl);

    const tweetText = artistTwitterHandle
      ? `Check out the dance I made featuring @${artistTwitterHandle} on @codeorg!`
      : 'Check out what I made on @codeorg!';
    const hashtags =
      artistTwitterHandle === 'Coldplay'
        ? ['codeplay', 'HourOfCode']
        : ['HourOfCode'];
    const comma = '%2C';
    const twitterShareUrl =
      'https://twitter.com/intent/tweet?text=' +
      encodeURIComponent(tweetText) +
      '&url=' +
      encodeURIComponent(shareUrl) +
      `&hashtags=${hashtags.join(comma)}` +
      '&related=codeorg';

    const showShareWarning = !canShareSocial && isDroplet;
    let embedOptions;
    if (appType === 'applab') {
      embedOptions = {
        // If you change this width and height, make sure to update the
        // #visualizationColumn.wireframeShare css
        iframeHeight: applabConstants.APP_HEIGHT + 140,
        // Extra 32 pixels added to account for phone frame
        // Extra 40 pixels added to account for left and right padding divs (20 px each side)
        iframeWidth: applabConstants.APP_WIDTH + 32 + 40,
      };
    } else if (appType === 'gamelab') {
      embedOptions = {
        // If you change this width and height, make sure to update the
        // #visualizationColumn.wireframeShare css
        iframeHeight: p5labConstants.APP_HEIGHT + 357,
        // Extra 40 pixels added to account for left and right padding divs (20 px each side)
        iframeWidth: p5labConstants.APP_WIDTH + 40,
      };
    }

    const warningText = this.getWarningText();

    return (
      <>
        {this.sharingDisallowedWhileSignedIn() &&
          this.state.showSharingDisallowedDialog && (
            <Dialog
              title={
                this.sharingDisabled()
                  ? i18n.sharingDisabledTitle()
                  : 'Sharing is not allowed'
              }
              description={
                this.sharingDisabled()
                  ? i18n.sharingBlockedByTeacherOpenEndedProjects()
                  : 'This project is unable to be shared because it contains content that is flagged. Please update your project or contact support@code.org if you believe this is an error.'
              }
              primaryButtonProps={{
                onClick: this.close,
                children: i18n.ok(),
                id: 'uitest-sharing-disabled-button',
              }}
            />
          )}
        {!this.sharingDisallowedWhileSignedIn() && isOpen && (
          <Modal
            className={moduleStyles.modal}
            title={i18n.shareTitle()}
            onClose={this.close}
            closeLabel={i18n.closeDialog()}
            primaryButtonProps={{
              onClick: this.close,
              children: i18n.done(),
            }}
            customContent={
              <div
                id="dsco-dialog-description"
                className={moduleStyles.content}
              >
                <div id="project-share" className={moduleStyles.content}>
                  {isAbusive && (
                    <AbuseError
                      i18n={{
                        tos: i18n.tosLong({url: 'http://code.org/tos'}),
                        contact_us: i18n.contactUs({
                          url: `https://support.code.org/hc/en-us/requests/new?&description=${encodeURIComponent(
                            `Abuse error for project at url: ${shareUrl}`
                          )}`,
                        }),
                      }}
                      className={moduleStyles.abuseError}
                    />
                  )}
                  {showShareWarning && (
                    <MuiTypography
                      variant="body4"
                      className={moduleStyles.shareWarning}
                      style={{color: 'var(--text-error-primary)'}}
                    >
                      {i18n.shareU13Warning()}
                    </MuiTypography>
                  )}
                  <div className={moduleStyles.thumbnailRow}>
                    <div className={moduleStyles.thumbnail}>
                      <img
                        className={moduleStyles.thumbnailImg}
                        src={thumbnailUrl}
                        alt={i18n.projectThumbnail()}
                      />
                    </div>
                    <div className={moduleStyles.actionsColumn}>
                      <MuiButton
                        variant="contained"
                        color="primary"
                        size="medium"
                        loadingPosition="start"
                        id="sharing-dialog-copy-button"
                        onClick={wrapShareClick(
                          this.copy,
                          'SHARING_LINK_COPY',
                          this.props.appType
                        )}
                        type="button"
                        value={shareUrl}
                        startIcon={<FontAwesomeV6Icon iconName="copy" />}
                      >
                        {i18n.copyLinkToProject()}
                      </MuiButton>
                      <MuiButton
                        variant="outlined"
                        color="secondary"
                        size="medium"
                        loadingPosition="start"
                        id="sharing-phone"
                        onClick={wrapShareClick(
                          this.showSendToPhone,
                          'SHARING_LINK_SEND_TO_PHONE',
                          this.props.appType
                        )}
                        type="button"
                        startIcon={
                          <FontAwesomeV6Icon iconName="mobile-screen" />
                        }
                      >
                        {i18n.sendToPhone()}
                      </MuiButton>
                      {canPrint && hasThumbnail && (
                        <MuiButton
                          variant="outlined"
                          color="secondary"
                          size="medium"
                          loadingPosition="start"
                          onClick={wrapShareClick(this.print, 'print')}
                          type="button"
                          startIcon={<FontAwesomeV6Icon iconName="print" />}
                        >
                          {i18n.print()}
                        </MuiButton>
                      )}
                      {this.isSocialShareAllowed() && (
                        <div className={moduleStyles.socialLinks}>
                          {this.state.isFacebookAvailable && (
                            <a
                              href={facebookShareUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={wrapShareClick(
                                onClickPopup.bind(this),
                                'SHARING_FB',
                                this.props.appType
                              )}
                              className={moduleStyles.socialLink}
                            >
                              <FontAwesome
                                icon="facebook-f"
                                iconStyle="brands"
                              />
                            </a>
                          )}
                          {this.state.isTwitterAvailable && (
                            <a
                              href={twitterShareUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={wrapShareClick(
                                onClickPopup.bind(this),
                                'SHARING_TWITTER',
                                this.props.appType
                              )}
                              className={moduleStyles.socialLink}
                            >
                              <FontAwesome
                                icon="x-twitter"
                                iconStyle="brands"
                              />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {warningText && (
                    <MuiTypography
                      variant="body4"
                      className={moduleStyles.thumbnailWarning}
                    >
                      {warningText}
                    </MuiTypography>
                  )}
                  {this.state.showSendToPhone && (
                    <div className={moduleStyles.sendToPhoneContainer}>
                      <div className={moduleStyles.sendToPhoneLeft}>
                        <SendToPhone
                          channelId={channelId}
                          appType={appType}
                          isLegacyShare={false}
                        />
                      </div>
                      <div className={moduleStyles.sendToPhoneRight}>
                        <MuiTypography variant="body3" component="label">
                          {i18n.scanQRCode()}
                        </MuiTypography>
                        <QRCode value={shareUrl + '?qr=true'} size={90} />
                      </div>
                    </div>
                  )}
                  {isDroplet && (
                    <AdvancedShareOptions
                      shareUrl={shareUrl}
                      exportApp={exportApp}
                      expanded={this.state.showAdvancedOptions}
                      onExpand={this.showAdvancedOptions}
                      channelId={channelId}
                      embedOptions={embedOptions}
                      appType={this.props.appType}
                    />
                  )}
                </div>
              </div>
            }
          />
        )}
        <LibraryCreationDialog channelId={channelId} />
      </>
    );
  }
}

export const UnconnectedShareAllowedDialog = ShareAllowedDialog;

export default connect(
  state => ({
    exportApp: state.pageConstants?.exportApp,
    isOpen: state.shareDialog.isOpen,
    inRestrictedShareMode: state.project.inRestrictedShareMode,
    showSharingDisallowedDialog: state.shareDialog.showSharingDisallowedDialog,
    hasPrivacyProfanityViolation: state.project.hasPrivacyProfanityViolation,
  }),
  dispatch => ({
    onClose: () => dispatch(hideShareDialog()),
  })
)(ShareAllowedDialog);
