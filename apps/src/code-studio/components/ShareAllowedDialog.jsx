/* global dashboard */

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
      data_string: type
    },
    {includeUserId: true}
  );
}

function wrapShareClick(handler, type) {
  return function() {
    try {
      recordShare(type);
    } finally {
      handler.apply(this, arguments);
    }
  };
}

function select(event) {
  event.target.select();
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
  button: {
    backgroundColor: color.purple,
    borderWidth: 0,
    color: color.white,
    fontSize: 'larger',
    paddingTop: 12.5,
    paddingBottom: 12.5,
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 8,
    verticalAlign: 'top'
  },
  buttonDisabled: {
    backgroundColor: color.gray,
    borderWidth: 0,
    color: color.white,
    fontSize: 'larger',
    paddingTop: 12.5,
    paddingBottom: 12.5,
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 8,
    verticalAlign: 'top'
  },
  thumbnail: {
    float: 'left',
    marginRight: 10,
    width: 125,
    height: 125,
    overflow: 'hidden',
    borderRadius: 2,
    border: '1px solid rgb(187,187,187)',
    backgroundColor: color.white,
    position: 'relative'
  },
  thumbnailImg: {
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
    i18n: PropTypes.shape({
      t: PropTypes.func.isRequired
    }).isRequired,
    allowExportExpo: PropTypes.bool.isRequired,
    exportApp: PropTypes.func,
    icon: PropTypes.string,
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
    userSharingDisabled: PropTypes.bool
  };

  state = {
    showSendToPhone: false,
    showAdvancedOptions: false,
    exporting: false,
    exportError: null,
    isTwitterAvailable: false,
    isFacebookAvailable: false,
    replayVideoUnavailable: false
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
    }
  }

  replayVideoNotFound = () => {
    this.setState({
      replayVideoUnavailable: true
    });
  };

  sharingDisabled = () =>
    this.props.userSharingDisabled &&
    ['applab', 'gamelab', 'weblab'].includes(this.props.appType);

  close = () => {
    recordShare('close');
    this.props.onClose();
    this.setState({
      replayVideoUnavailable: false
    });
  };

  showSendToPhone = event => {
    this.setState({
      showSendToPhone: true,
      showAdvancedOptions: false
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
      showAdvancedOptions: true
    });
  };

  publish = () => {
    this.props.onShowPublishDialog(this.props.channelId, this.props.appType);
  };

  unpublish = () => {
    this.props.onUnpublish(this.props.channelId);
  };

  render() {
    let image;
    let modalClass = 'modal-content';
    if (this.props.icon) {
      image = <img className="modal-image" src={this.props.icon} />;
    } else {
      modalClass += ' no-modal-icon';
    }

    const artistTwitterHandle =
      SongTitlesToArtistTwitterHandle[this.props.selectedSong];

    const hasThumbnail = !!this.props.thumbnailUrl;
    const thumbnailUrl = hasThumbnail
      ? this.props.thumbnailUrl
      : '/blockly/media/projects/project_default.png';

    const facebookShareUrl =
      'https://www.facebook.com/sharer/sharer.php?u=' +
      encodeURIComponent(this.props.shareUrl);
    const twitterShareUrlDefault =
      'https://twitter.com/intent/tweet?url=' +
      encodeURIComponent(this.props.shareUrl) +
      '&amp;text=Check%20out%20what%20I%20made%20@codeorg' +
      '&amp;hashtags=HourOfCode&amp;related=codeorg';
    // Check out the dance I made featuring @artist on @codeorg! URL #HourOfCode
    const twitterShareUrlDance =
      'https://twitter.com/intent/tweet?url=' +
      '&amp;text=Check%20out%20the%20dance%20I%20made%20featuring%20@' +
      artistTwitterHandle +
      '%20on%20@codeorg!%20' +
      encodeURIComponent(this.props.shareUrl) +
      '&amp;hashtags=HourOfCode&amp;related=codeorg';

    const twitterShareUrl = artistTwitterHandle
      ? twitterShareUrlDance
      : twitterShareUrlDefault;

    const showShareWarning =
      !this.props.canShareSocial &&
      (this.props.appType === 'applab' || this.props.appType === 'gamelab');
    let embedOptions;
    if (this.props.appType === 'applab') {
      embedOptions = {
        // If you change this width and height, make sure to update the
        // #visualizationColumn.wireframeShare css
        iframeHeight: applabConstants.APP_HEIGHT + 140,
        iframeWidth: applabConstants.APP_WIDTH + 32
      };
    } else if (this.props.appType === 'gamelab') {
      embedOptions = {
        // If you change this width and height, make sure to update the
        // #visualizationColumn.wireframeShare css
        iframeHeight: p5labConstants.APP_HEIGHT + 357,
        iframeWidth: p5labConstants.APP_WIDTH + 32
      };
    }
    const {canPrint, canPublish, isPublished} = this.props;
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
              {image}
              <div
                id="project-share"
                className={modalClass}
                style={{position: 'relative'}}
              >
                <p className="dialog-title">
                  {this.props.i18n.t('project.share_title')}
                </p>
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
                <div style={{clear: 'both'}}>
                  <div style={styles.thumbnail}>
                    <img style={styles.thumbnailImg} src={thumbnailUrl} />
                  </div>
                  <div>
                    <p style={{fontSize: 20}}>
                      {this.props.i18n.t('project.share_copy_link')}
                    </p>
                    <input
                      type="text"
                      id="sharing-input"
                      onClick={select}
                      readOnly="true"
                      value={this.props.shareUrl}
                      style={{cursor: 'copy', width: 500}}
                    />
                  </div>
                </div>
                <div className="social-buttons">
                  <a
                    id="sharing-phone"
                    href=""
                    onClick={wrapShareClick(
                      this.showSendToPhone.bind(this),
                      'send-to-phone'
                    )}
                  >
                    <i className="fa fa-mobile-phone" style={{fontSize: 36}} />
                    <span>{i18n.sendToPhone()}</span>
                  </a>
                  {canPublish && !isPublished && (
                    <button
                      type="button"
                      id="share-dialog-publish-button"
                      style={
                        hasThumbnail ? styles.button : styles.buttonDisabled
                      }
                      onClick={wrapShareClick(
                        this.publish.bind(this),
                        'publish'
                      )}
                      disabled={!hasThumbnail}
                      className="no-mc"
                    >
                      {i18n.publish()}
                    </button>
                  )}
                  {canPublish && isPublished && (
                    <PendingButton
                      id="share-dialog-unpublish-button"
                      isPending={this.props.isUnpublishPending}
                      onClick={this.unpublish}
                      pendingText={i18n.unpublishPending()}
                      style={styles.button}
                      text={i18n.unpublish()}
                      className="no-mc"
                    />
                  )}
                  <DownloadReplayVideoButton
                    style={styles.button}
                    onError={this.replayVideoNotFound}
                  />
                  {canPrint && hasThumbnail && (
                    <a
                      href="#"
                      onClick={wrapShareClick(this.print.bind(this), 'print')}
                    >
                      <i className="fa fa-print" style={{fontSize: 26}} />
                      <span>{i18n.print()}</span>
                    </a>
                  )}
                  {/* prevent buttons from overlapping when unpublish is pending */}
                  {this.props.canShareSocial && !this.props.isUnpublishPending && (
                    <span>
                      {this.state.isFacebookAvailable && (
                        <a
                          href={facebookShareUrl}
                          target="_blank"
                          onClick={wrapShareClick(
                            this.props.onClickPopup.bind(this),
                            'facebook'
                          )}
                        >
                          <i className="fa fa-facebook" />
                        </a>
                      )}
                      {this.state.isTwitterAvailable && (
                        <a
                          href={twitterShareUrl}
                          target="_blank"
                          onClick={wrapShareClick(
                            this.props.onClickPopup.bind(this),
                            'twitter'
                          )}
                        >
                          <i className="fa fa-twitter" />
                        </a>
                      )}
                    </span>
                  )}
                </div>
                {this.state.showSendToPhone && (
                  <SendToPhone
                    channelId={this.props.channelId}
                    appType={this.props.appType}
                    isLegacyShare={false}
                    styles={{label: {marginTop: 15, marginBottom: 0}}}
                  />
                )}
                {canPublish && !isPublished && !hasThumbnail && (
                  <div style={{clear: 'both', marginTop: 10}}>
                    <span style={{fontSize: 12}} className="thumbnail-warning">
                      {i18n.thumbnailWarning()}
                    </span>
                  </div>
                )}
                {this.state.replayVideoUnavailable && (
                  <div style={{clear: 'both', marginTop: 10}}>
                    <span style={{fontSize: 12}} className="thumbnail-warning">
                      {i18n.downloadReplayVideoButtonError()}
                    </span>
                  </div>
                )}
                <div style={{clear: 'both', marginTop: 40}}>
                  {(this.props.appType === 'applab' ||
                    this.props.appType === 'gamelab') && (
                    <AdvancedShareOptions
                      allowExportExpo={this.props.allowExportExpo}
                      i18n={this.props.i18n}
                      shareUrl={this.props.shareUrl}
                      exportApp={this.props.exportApp}
                      expanded={this.state.showAdvancedOptions}
                      onExpand={this.showAdvancedOptions}
                      channelId={this.props.channelId}
                      embedOptions={embedOptions}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </BaseDialog>
        <PublishDialog />
      </div>
    );
  }
}

export const UnconnectedShareAllowedDialog = ShareAllowedDialog;

export default connect(
  state => ({
    allowExportExpo: state.pageConstants.allowExportExpo || false,
    exportApp: state.pageConstants.exportApp,
    isOpen: state.shareDialog.isOpen,
    isUnpublishPending: state.shareDialog.isUnpublishPending
  }),
  dispatch => ({
    onClose: () => dispatch(hideShareDialog()),
    onShowPublishDialog(projectId, projectType) {
      dispatch(hideShareDialog());
      dispatch(showPublishDialog(projectId, projectType));
    },
    onUnpublish(projectId) {
      dispatch(unpublishProject(projectId));
    }
  })
)(ShareAllowedDialog);
