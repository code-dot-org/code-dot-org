import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import Button from '@cdo/apps/templates/Button';
// import i18n from '@cdo/locale';
import {hideProjectInfoDialog} from './projectInfoDialogRedux';

class ProjectInfoDialog extends Component {
  static propTypes = {
    // from redux state
    isOpen: PropTypes.bool.isRequired,

    // from redux dispatch
    onClose: PropTypes.func.isRequired,
  };

  close = () => {
    this.props.onClose();
  };

  render() {
    const {isOpen} = this.props;
    return (
      <BaseDialog
        isOpen={isOpen}
        handleClose={this.close}
        useUpdatedStyles
        style={styles.dialog}
      >
        <h3 className="project-info-dialog-title">Project Info</h3>
        <p>
          Congratulations! This project was selected to be a featured project or
          an exemplar project!
        </p>
        <DialogFooter>
          <Button
            text={'Close'}
            onClick={this.close}
            color={Button.ButtonColor.gray}
            className="no-mc"
            style={{margin: 0}}
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
};

export const UnconnectedProjectInfoDialog = ProjectInfoDialog;

export default connect(
  state => ({
    isOpen: state.projectInfoDialog.isOpen,
  }),
  dispatch => ({
    onClose() {
      dispatch(hideProjectInfoDialog());
    },
  })
)(ProjectInfoDialog);
