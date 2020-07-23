import color from '../../../util/color';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {
  projectUpdatedStatuses as statuses,
  retryProjectSave
} from '../../headerRedux';
import BaseDialog from '../../../templates/BaseDialog';
import DialogFooter from '../../../templates/teacherDashboard/DialogFooter';
import Button from '../../../templates/Button';

const styles = {
  dialog: {
    color: color.default_text,
    fontSize: 15,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20
  }
};

export class UnconnectedRetryProjectSaveDialog extends Component {
  static propTypes = {
    projectUpdatedStatus: PropTypes.oneOf(Object.values(statuses)),
    isOpen: PropTypes.bool,
    onTryAgain: PropTypes.func.isRequired
  };

  handleClick = () => {
    if (this.props.projectUpdatedStatus !== statuses.saving) {
      this.props.onTryAgain();
    }
  };

  render() {
    const isSavePending = this.props.projectUpdatedStatus === statuses.saving;
    return (
      <BaseDialog
        isOpen={this.props.isOpen}
        uncloseable={true}
        hideCloseButton={true}
        style={styles.dialog}
        useUpdatedStyles
      >
        <h2 className="retry-save-title">
          {i18n.retryProjectSaveDialogHeader()}
        </h2>
        <div style={{marginBottom: 10}}>
          {i18n.retryProjectSaveDialogBody()}
        </div>
        <DialogFooter rightAlign={true}>
          <Button
            __useDeprecatedTag
            text={i18n.retryProjectSaveDialogButton()}
            onClick={this.handleClick}
            color={Button.ButtonColor.orange}
            className="no-mc"
            isPending={isSavePending}
            pendingText={i18n.retryProjectSavePending()}
            id="try-again-save-button"
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}

export default connect(
  state => ({
    projectUpdatedStatus: state.header.projectUpdatedStatus,
    isOpen: state.header.showTryAgainDialog
  }),
  dispatch => ({
    onTryAgain() {
      dispatch(retryProjectSave());
    }
  })
)(UnconnectedRetryProjectSaveDialog);
