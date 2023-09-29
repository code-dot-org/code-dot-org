import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import BaseDialog from '../../templates/BaseDialog';
import PendingButton from '../../templates/PendingButton';
import AdvancedShareOptions from './AdvancedShareOptions';
import AbuseError from './AbuseError';
import SendToPhone from './SendToPhone';
import color from '../../util/color';
import * as applabConstants from '../../applab/constants';
import * as p5labConstants from '@cdo/apps/p5lab/constants';
import {SongTitlesToArtistTwitterHandle} from '../dancePartySongArtistTags';
import {hideShareDialog, unpublishProject} from './shareDialogRedux';
import DownloadReplayVideoButton from './DownloadReplayVideoButton';
import {showPublishDialog} from '../../templates/projects/publishDialog/publishDialogRedux';
import PublishDialog from '../../templates/projects/publishDialog/PublishDialog';
import {createHiddenPrintWindow} from '@cdo/apps/utils';
import i18n from '@cdo/locale';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import LibraryCreationDialog from './libraries/LibraryCreationDialog';
import QRCode from 'qrcode.react';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Button from '../../templates/Button';
import defaultThumbnail from '@cdo/static/projects/project_default.png';

function recordShare(type) {
  if (!window.dashboard) {
    return;
  }

  firehoseClient.putRecord(
    {
      study: 'finish-dialog-share',
      study_group: 'v1',
      event: 'project-share',
      project_id: dashboard.project && dashboard.project.getCurrentId(),
      data_string: type,
    },
    {includeUserId: true}
  );
}

function wrapShareClick(handler, type) {
  return function () {
    try {
      recordShare(type);
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
    canPublish: PropTypes.bool.isRequired,
    isPublished: PropTypes.bool.isRequired,
    isUnpublishPending: PropTypes.bool.isRequired,
    channelId: PropTypes.string.isRequired,
    appType: PropTypes.string.isRequired,
    onClickPopup: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onShowPublishDialog: PropTypes.func.isRequired,
    onUnpublish: PropTypes.func.isRequired,
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
      recordShare('open');
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
    recordShare('close');
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

  publish = () => {
    this.props.onShowPublishDialog(this.props.channelId, this.props.appType);
  };

  unpublish = () => {
    this.props.onUnpublish(this.props.channelId);
  };

  // Copy to clipboard.
  copy = () => {
    copyToClipboard(this.props.shareUrl, () =>
      this.setState({hasBeenCopied: true})
    );
  };

  render() {
    const {
      canPrint,
      canPublish,
      isPublished,
      inRestrictedShareMode,
      canShareSocial,
      appType,
      selectedSong,
      shareUrl,
      isOpen,
      hideBackdrop,
      isAbusive,
      isUnpublishPending,
      onClickPopup,
      exportApp,
      channelId,
    } = this.props;

    // inRestrictedShareMode overrides canPublish and canShareSocial
    const publishAllowed = canPublish && !inRestrictedShareMode;
    const socialShareAllowed = canShareSocial && !inRestrictedShareMode;
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
                    <img style={styles.thumbnailImg} src={thumbnailUrl} />
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
                      onClick={wrapShareClick(this.copy, 'copy')}
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
                      'send-to-phone'
                    )}
                    style={styles.sendToPhoneButton}
                  >
                    <FontAwesome icon="mobile-phone" style={{fontSize: 36}} />
                    <span style={styles.sendToPhoneSpan}>
                      {i18n.sendToPhone()}
                    </span>
                  </Button>

                  {publishAllowed && !isPublished && (
                    <Button
                      type="button"
                      color={Button.ButtonColor.neutralDark}
                      id="share-dialog-publish-button"
                      style={
                        hasThumbnail ? styles.button : styles.buttonDisabled
                      }
                      onClick={wrapShareClick(this.publish, 'publish')}
                      disabled={!hasThumbnail}
                      className="no-mc"
                    >
                      <span>{i18n.publish()}</span>
                    </Button>
                  )}
                  {publishAllowed && isPublished && (
                    <PendingButton
                      id="share-dialog-unpublish-button"
                      isPending={isUnpublishPending}
                      onClick={this.unpublish}
                      pendingText={i18n.unpublishPending()}
                      style={styles.button}
                      text={i18n.unpublish()}
                      className="no-mc"
                    />
                  )}

                  {canPrint && hasThumbnail && (
                    <a href="#" onClick={wrapShareClick(this.print, 'print')}>
                      <FontAwesome icon="print" style={{fontSize: 26}} />
                      <span>{i18n.print()}</span>
                    </a>
                  )}
                  {/* prevent buttons from overlapping when unpublish is pending */}
                  {socialShareAllowed && !isUnpublishPending && (
                    <span>
                      {this.state.isFacebookAvailable && (
                        <a
                          href={facebookShareUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={wrapShareClick(
                            onClickPopup.bind(this),
                            'facebook'
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
                            'twitter'
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
                {publishAllowed && !isPublished && !hasThumbnail && (
                  <div style={{clear: 'both', marginTop: 10}}>
                    <span
                      style={styles.thumbnailWarning}
                      className="thumbnail-warning"
                    >
                      {i18n.thumbnailWarning()}
                    </span>
                  </div>
                )}
                {inRestrictedShareMode && (
                  <div style={{clear: 'both', marginTop: 10}}>
                    <span
                      style={styles.thumbnailWarning}
                      className="thumbnail-warning"
                    >
                      {i18n.restrictedShareInfo()}
                    </span>
                  </div>
                )}
                {this.state.replayVideoUnavailable && (
                  <div style={{clear: 'both', marginTop: 10}}>
                    <span
                      style={styles.thumbnailWarning}
                      className="thumbnail-warning"
                    >
                      {i18n.downloadReplayVideoButtonError()}
                    </span>
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
        <PublishDialog />
        <LibraryCreationDialog channelId={channelId} />
      </div>
    );
  }
}

const styles = {
  modal: {
    width: 720,
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
  thumbnailWarning: {
    fontSize: 12,
    fontFamily: "'Gotham 7r', sans-serif",
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
};

export const UnconnectedShareAllowedDialog = ShareAllowedDialog;

export default connect(
  state => ({
    exportApp: state.pageConstants?.exportApp,
    isOpen: state.shareDialog.isOpen,
    isUnpublishPending: state.shareDialog.isUnpublishPending,
    inRestrictedShareMode: state.project.inRestrictedShareMode,
  }),
  dispatch => ({
    onClose: () => dispatch(hideShareDialog()),
    onShowPublishDialog(projectId, projectType) {
      dispatch(hideShareDialog());
      dispatch(showPublishDialog(projectId, projectType));
    },
    onUnpublish(projectId) {
      dispatch(unpublishProject(projectId));
    },
  })
)(ShareAllowedDialog);
