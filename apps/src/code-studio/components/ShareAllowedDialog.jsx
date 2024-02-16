import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import BaseDialog from '../../templates/BaseDialog';
import AdvancedShareOptions from './AdvancedShareOptions';
import AbuseError from './AbuseError';
import SendToPhone from './SendToPhone';
import color from '../../util/color';
import * as applabConstants from '../../applab/constants';
import * as p5labConstants from '@cdo/apps/p5lab/constants';
import {SongTitlesToArtistTwitterHandle} from '../dancePartySongArtistTags';
import DownloadReplayVideoButton from './DownloadReplayVideoButton';
import {hideShareDialog} from './shareDialogRedux';
import {createHiddenPrintWindow} from '@cdo/apps/utils';
import i18n from '@cdo/locale';
import LibraryCreationDialog from './libraries/LibraryCreationDialog';
import QRCode from 'qrcode.react';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Button from '../../templates/Button';
import defaultThumbnail from '@cdo/static/projects/project_default.png';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

function recordShare(type, appType) {
  if (!window.dashboard) {
    return;
  }
  if (Object.prototype.hasOwnProperty.call(EVENTS, type)) {
    analyticsReporter.sendEvent(type, {
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
    hideBackdrop: BaseDialog.propTypes.hideBackdrop,
    canShareSocial: PropTypes.bool.isRequired,
    userSharingDisabled: PropTypes.bool,
    inRestrictedShareMode: PropTypes.bool,
  };

  state = {
    showSendToPhone: false,
    showAdvancedOptions: false,
    exporting: false,
    exportError: null,
    isTwitterAvailable: false,
    isFacebookAvailable: false,
    replayVideoUnavailable: false,
    hasBeenCopied: false,
    isLoadingAccountAndProjectAge: false,
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
    }
  }

  replayVideoNotFound = () => {
    this.setState({
      replayVideoUnavailable: true,
    });
  };

  sharingDisabled = () =>
    this.props.userSharingDisabled &&
    ['applab', 'gamelab', 'weblab'].includes(this.props.appType);

  close = () => {
    recordShare('SHARING_CLOSE_ESCAPE', this.props.appType);
    this.props.onClose();
    this.setState({
      replayVideoUnavailable: false,
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

  render() {
    const {
      canPrint,
      canShareSocial,
      appType,
      selectedSong,
      shareUrl,
      isOpen,
      hideBackdrop,
      isAbusive,
      onClickPopup,
      exportApp,
      channelId,
    } = this.props;

    const modalClass = 'modal-content no-modal-icon';

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

    return (
      <div>
        <BaseDialog
          style={styles.modal}
          isOpen={isOpen}
          handleClose={this.close}
          hideBackdrop={hideBackdrop}
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
                id="project-share"
                className={modalClass}
                style={{position: 'relative'}}
              >
                <h5 className="dialog-title">{i18n.shareTitle()}</h5>
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
                    className="alert-error"
                    style={styles.abuseStyle}
                    textStyle={styles.abuseTextStyle}
                  />
                )}
                {showShareWarning && (
                  <p style={styles.shareWarning}>{i18n.shareU13Warning()}</p>
                )}
                <div style={{clear: 'both'}}>
                  <div style={styles.thumbnail}>
                    <img
                      style={styles.thumbnailImg}
                      src={thumbnailUrl}
                      alt={i18n.projectThumbnail()}
                    />
                  </div>
                  <div>
                    <Button
                      color={Button.ButtonColor.brandSecondaryDefault}
                      id="sharing-dialog-copy-button"
                      icon="clipboard"
                      style={{
                        ...styles.button,
                        ...styles.copyButton,
                        ...(this.state.hasBeenCopied && styles.copyButtonLight),
                      }}
                      onClick={wrapShareClick(
                        this.copy,
                        'SHARING_LINK_COPY',
                        this.props.appType
                      )}
                      text={i18n.copyLinkToProject()}
                      value={shareUrl}
                    />
                    <DownloadReplayVideoButton
                      style={{...styles.button, marginBottom: 8}}
                      onError={this.replayVideoNotFound}
                    />
                  </div>
                </div>
                <div className="social-buttons" style={{marginTop: 12}}>
                  <Button
                    color={Button.ButtonColor.neutralDark}
                    id="sharing-phone"
                    href=""
                    onClick={wrapShareClick(
                      this.showSendToPhone,
                      'SHARING_LINK_SEND_TO_PHONE',
                      this.props.appType
                    )}
                    style={styles.sendToPhoneButton}
                  >
                    <FontAwesome icon="mobile-phone" style={{fontSize: 36}} />
                    <span style={styles.sendToPhoneSpan}>
                      {i18n.sendToPhone()}
                    </span>
                  </Button>
                  {canPrint && hasThumbnail && (
                    <a href="#" onClick={wrapShareClick(this.print, 'print')}>
                      <FontAwesome icon="print" style={{fontSize: 26}} />
                      <span>{i18n.print()}</span>
                    </a>
                  )}
                  {this.isSocialShareAllowed() && (
                    <span>
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
                          style={styles.socialLink}
                        >
                          <FontAwesome icon="facebook" />
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
                          style={styles.socialLink}
                        >
                          <FontAwesome icon="twitter" />
                        </a>
                      )}
                    </span>
                  )}
                </div>
                {this.state.showSendToPhone && (
                  <div>
                    <div style={styles.sendToPhoneContainer}>
                      <div style={styles.sendToPhoneLeft}>
                        <SendToPhone
                          channelId={channelId}
                          appType={appType}
                          isLegacyShare={false}
                        />
                      </div>
                      <div style={styles.sendToPhoneRight}>
                        <label>{i18n.scanQRCode()}</label>
                        <QRCode value={shareUrl + '?qr=true'} size={90} />
                      </div>
                    </div>
                    <div style={{clear: 'both'}} />
                  </div>
                )}
                <div style={{clear: 'both', marginTop: 40}}>
                  {isDroplet && (
                    <AdvancedShareOptions
                      shareUrl={shareUrl}
                      exportApp={exportApp}
                      expanded={this.state.showAdvancedOptions}
                      onExpand={this.showAdvancedOptions}
                      channelId={channelId}
                      embedOptions={embedOptions}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </BaseDialog>
        <LibraryCreationDialog channelId={channelId} />
      </div>
    );
  }
}

const styles = {
  modal: {
    width: 650,
    marginLeft: -360,
  },
  abuseStyle: {
    border: '1px solid',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  abuseTextStyle: {
    color: '#b94a48',
    fontSize: 14,
  },
  shareWarning: {
    color: color.red,
    fontSize: 13,
    fontWeight: 'bold',
  },
  button: {
    // TODO: [Phase 2] Remove this once we have a new updated button component
    fontSize: 'large',
    height: 45,
    paddingTop: 12.5,
    paddingBottom: 12.5,
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 0,
    marginRight: 16,
    marginBottom: 0,
    marginLeft: 0,
    verticalAlign: 'top',
  },
  buttonDisabled: {
    height: 45,
    fontSize: 'large',
    paddingTop: 12.5,
    paddingBottom: 12.5,
    paddingLeft: 10,
    paddingRight: 5,
    marginTop: 0,
    marginRight: 8,
    marginBottom: 0,
    marginLeft: 0,
    verticalAlign: 'top',
  },
  copyButton: {
    paddingTop: 12.5,
    paddingBottom: 12.5,
    marginLeft: 0,
    marginBottom: 0,
    marginTop: 0,
    marginRight: 16,
    fontSize: 'large',
  },
  copyButtonLight: {
    backgroundColor: color.light_purple,
  },
  thumbnail: {
    float: 'left',
    marginRight: 16,
    width: 125,
    height: 125,
    overflow: 'hidden',
    borderRadius: 2,
    border: '1px solid rgb(187,187,187)',
    backgroundColor: color.white,
    position: 'relative',
  },
  thumbnailImg: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: '100%',
    height: 'auto',
    transform: 'translate(-50%,-50%)',
    msTransform: 'translate(-50%,-50%)',
    WebkitTransform: 'translate(-50%,-50%)',
  },

  sendToPhoneContainer: {
    width: '100%',
    marginTop: 15,
  },
  sendToPhoneButton: {
    margin: 0,
    marginRight: 16,
    fontSize: 'large',
    padding: '0 16px',
    paddingRight: 6,
    height: 45,
  },
  sendToPhoneSpan: {
    padding: 0,
    paddingLeft: 10,
    verticalAlign: 'text-top',
  },
  sendToPhoneLeft: {
    float: 'left',
    width: '70%',
    paddingRight: 20,
    boxSizing: 'border-box',
  },
  sendToPhoneRight: {
    float: 'right',
    width: '30%',
  },
  socialLink: {
    marginRight: 16,
  },
  loadingSpinner: {
    marginRight: 16,
  },
  warningMessageContainer: {
    clear: 'both',
    marginTop: 10,
  },
};

export const UnconnectedShareAllowedDialog = ShareAllowedDialog;

export default connect(
  state => ({
    exportApp: state.pageConstants?.exportApp,
    isOpen: state.shareDialog.isOpen,
    inRestrictedShareMode: state.project.inRestrictedShareMode,
  }),
  dispatch => ({
    onClose: () => dispatch(hideShareDialog()),
  })
)(ShareAllowedDialog);
