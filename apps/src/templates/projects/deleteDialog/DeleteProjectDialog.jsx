import Modal from '@code-dot-org/component-library/modal';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import i18n from '@cdo/locale';

import {hideDeleteDialog, deleteProject} from './deleteProjectDialogRedux';

class DeleteProjectDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    projectId: PropTypes.string,
    isDeletePending: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    deleteProject: PropTypes.func.isRequired,
  };

  close = () => this.props.onClose();

  delete = () => this.props.deleteProject(this.props.projectId);

  render() {
    if (!this.props.isOpen) {
      return null;
    }

    return (
      <Modal
        onClose={this.close}
        title={i18n.deleteProject()}
        description={i18n.deleteProjectConfirm()}
        secondaryButtonProps={{
          onClick: this.close,
          children: i18n.dialogCancel(),
          size: 'small',
          type: 'button',
        }}
        primaryButtonProps={{
          onClick: this.delete,
          color: 'error',
          children: this.props.isDeletePending
            ? i18n.deleting()
            : i18n.delete(),
          size: 'small',
          disabled: this.props.isDeletePending,
          className: 'ui-confirm-project-delete-button',
          type: 'button',
        }}
      />
    );
  }
}

export const UnconnectedDeleteProjectDialog = DeleteProjectDialog;

export default connect(
  state => ({
    isOpen: state.deleteDialog.isOpen,
    isDeletePending: state.deleteDialog.isDeletePending,
    projectId: state.deleteDialog.projectId,
  }),
  dispatch => ({
    onClose() {
      dispatch(hideDeleteDialog());
    },
    deleteProject(projectId) {
      return dispatch(deleteProject(projectId));
    },
  })
)(DeleteProjectDialog);
