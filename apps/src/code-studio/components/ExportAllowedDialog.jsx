/* global dashboard */

import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import BaseDialog from '../../templates/BaseDialog';
import AbuseError from './AbuseError';
import SendToPhone from './SendToPhone';
import color from '../../util/color';
import {hideExportDialog} from './exportDialogRedux';
import i18n from '@cdo/locale';
import firehoseClient from '@cdo/apps/lib/util/firehose';

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

function wrapExportClick(handler, type) {
  return function() {
    try {
      recordExport(type);
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
    icon: PropTypes.string,
    shareUrl: PropTypes.string.isRequired, // TODO: remove
    thumbnailUrl: PropTypes.string, // TODO: remove?
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
    showSendToPhone: false,
    showAdvancedOptions: false,
    exporting: false,
    exportError: null
  };

  componentDidUpdate(prevProps) {
    if (this.props.isOpen && !prevProps.isOpen) {
      recordExport('open');
    }
  }

  sharingDisabled = () =>
    this.props.userSharingDisabled &&
    ['applab', 'gamelab', 'weblab'].includes(this.props.appType);

  close = () => {
    recordExport('close');
    this.props.onClose();
  };

  showSendToPhone = event => {
    this.setState({
      showSendToPhone: true,
      showAdvancedOptions: false
    });
    event.preventDefault();
  };

  showAdvancedOptions = () => {
    this.setState({
      showSendToPhone: false,
      showAdvancedOptions: true
    });
  };

  render() {
    let image;
    let modalClass = 'modal-content';
    if (this.props.icon) {
      image = <img className="modal-image" src={this.props.icon} />;
    } else {
      modalClass += ' no-modal-icon';
    }

    const hasThumbnail = !!this.props.thumbnailUrl;
    const thumbnailUrl = hasThumbnail
      ? this.props.thumbnailUrl
      : '/blockly/media/projects/project_default.png';

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
              {image}
              <div
                id="project-export"
                className={modalClass}
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
                    onClick={wrapExportClick(
                      this.showSendToPhone.bind(this),
                      'send-to-phone'
                    )}
                  >
                    <i className="fa fa-mobile-phone" style={{fontSize: 36}} />
                    <span>{i18n.sendToPhone()}</span>
                  </a>
                </div>
                {this.state.showSendToPhone && (
                  <SendToPhone
                    channelId={this.props.channelId}
                    appType={this.props.appType}
                    styles={{label: {marginTop: 15, marginBottom: 0}}}
                  />
                )}
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
    isOpen: state.exportDialog.isOpen
  }),
  dispatch => ({
    onClose: () => dispatch(hideExportDialog())
  })
)(ExportAllowedDialog);
