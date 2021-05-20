import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {setShowSharingColumn, editAll} from './manageStudentsRedux';
import {connect} from 'react-redux';
import Button from '../Button';
import i18n from '@cdo/locale';
import BaseDialog from '../BaseDialog';
import DialogFooter from '../teacherDashboard/DialogFooter';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

class ControlProjectSharingDialog extends Component {
  static propTypes = {
    isDialogOpen: PropTypes.bool.isRequired,
    closeDialog: PropTypes.func,
    showSharingColumn: PropTypes.func,
    editAll: PropTypes.func
  };

  state = {
    isDialogOpen: this.props.isDialogOpen
  };

  handleShowSharingClick = () => {
    this.props.showSharingColumn();
    this.props.editAll();
  };

  render() {
    return (
      <div>
        <BaseDialog
          useUpdatedStyles
          isOpen={this.props.isDialogOpen}
          style={styles.dialog}
          uncloseable
        >
          <h2>{i18n.projectSharingDialogHeader()}</h2>
          <div>
            <SafeMarkdown markdown={i18n.projectSharingDialogInstructions()} />
          </div>
          <DialogFooter>
            <Button
              __useDeprecatedTag
              text={i18n.dialogCancel()}
              onClick={this.props.closeDialog}
              color={Button.ButtonColor.gray}
            />
            <Button
              __useDeprecatedTag
              text={i18n.projectSharingDialogButton()}
              onClick={this.handleShowSharingClick}
              color={Button.ButtonColor.orange}
            />
          </DialogFooter>
        </BaseDialog>
      </div>
    );
  }
}

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20
  }
};

export const UnconnectedControlProjectSharingDialog = ControlProjectSharingDialog;

export default connect(
  state => ({}),
  dispatch => ({
    showSharingColumn() {
      dispatch(setShowSharingColumn(true));
    },
    editAll() {
      dispatch(editAll());
    }
  })
)(ControlProjectSharingDialog);
