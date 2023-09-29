import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import {hidePublishDialog, publishProject} from './publishDialogRedux';
import {RestrictedPublishProjectTypes} from '@cdo/apps/util/sharedConstants';
import color from '@cdo/apps/util/color';

class PublishDialog extends Component {
  static propTypes = {
    // from redux state
    isOpen: PropTypes.bool.isRequired,
    isPublishPending: PropTypes.bool.isRequired,
    projectId: PropTypes.string,
    projectType: PropTypes.string,

    // from redux dispatch
    onClose: PropTypes.func.isRequired,
    onConfirmPublish: PropTypes.func.isRequired,

    // specify alternate behavior of onConfirmPublish
    onConfirmPublishOverride: PropTypes.func,

    // specify additional behavior after successful call to onConfirmPublish,
    // if not overridden by onConfirmPublishOverride.
    afterPublish: PropTypes.func,
  };

  state = {
    publishFailedStatus: null,
  };

  confirm = () => {
    this.setState({publishFailedStatus: null});
    if (this.props.onConfirmPublishOverride) {
      this.props.onConfirmPublishOverride();
      return;
    }
    this.props
      .onConfirmPublish(this.props.projectId, this.props.projectType)
      .then(this.props.afterPublish)
      .catch(this.onPublishError);
  };

  close = () => {
    this.setState({publishFailedStatus: null});
    this.props.onClose();
  };

  onPublishError = err => {
    this.setState({publishFailedStatus: err.status});
  };

  getErrorMessage = () => {
    const {publishFailedStatus} = this.state;
    const {projectType} = this.props;
    if (!publishFailedStatus) {
      return null;
    } else if (
      publishFailedStatus === 403 &&
      RestrictedPublishProjectTypes.includes(projectType)
    ) {
      return i18n.publishFailedRestrictedShare();
    } else if (publishFailedStatus === 403) {
      return i18n.publishFailedForbidden();
    } else if (publishFailedStatus === 400 || publishFailedStatus === 401) {
      return i18n.publishFailedNotAllowed();
    } else {
      return i18n.publishFailedError();
    }
  };

  render() {
    const {isOpen, isPublishPending} = this.props;
    const errorMessage = this.getErrorMessage();
    return (
      <BaseDialog
        isOpen={isOpen}
        handleClose={this.close}
        useUpdatedStyles
        style={styles.dialog}
      >
        <h2 className="publish-dialog-title">
          {i18n.publishToPublicGallery()}
        </h2>
        <div style={{marginBottom: 10}}>
          {i18n.publishToPublicGalleryWarning()}
        </div>
        {errorMessage && <div style={styles.error}>{errorMessage}</div>}
        <DialogFooter>
          <Button
            text={i18n.dialogCancel()}
            onClick={this.close}
            color={Button.ButtonColor.gray}
            className="no-mc"
            style={{margin: 0}}
          />
          <Button
            text={i18n.publish()}
            onClick={this.confirm}
            color={Button.ButtonColor.brandSecondaryDefault}
            className="no-mc"
            isPending={isPublishPending}
            pendingText={i18n.publishPending()}
            style={{margin: 0}}
            id="publish-dialog-publish-button"
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
  },
  error: {
    color: color.red,
  },
};

export const UnconnectedPublishDialog = Radium(PublishDialog);

export default connect(
  state => ({
    isOpen: state.publishDialog.isOpen,
    isPublishPending: state.publishDialog.isPublishPending,
    projectId: state.publishDialog.projectId,
    projectType: state.publishDialog.projectType,
  }),
  dispatch => ({
    onClose() {
      dispatch(hidePublishDialog());
    },
    onConfirmPublish(projectId, projectType) {
      return dispatch(publishProject(projectId, projectType));
    },
  })
)(Radium(PublishDialog));
