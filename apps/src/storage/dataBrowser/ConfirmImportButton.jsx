import Dialog from '../../templates/Dialog';
import PendingButton from '../../templates/PendingButton';
import React from 'react';
import PropTypes from 'prop-types';
import msg from '@cdo/locale';
import dataStyles from './data-styles.module.scss';
import classNames from 'classnames';

const INITIAL_STATE = {
  isConfirmDialogOpen: false,
  isImporting: false,
};

class ConfirmImportButton extends React.Component {
  static propTypes = {
    importCsv: PropTypes.func.isRequired,
    containerStyle: PropTypes.any,
  };

  state = {...INITIAL_STATE};

  handleClose = () => {
    this.setState({isConfirmDialogOpen: false});
    this.importFileInput.value = '';
  };

  handleConfirm = () => {
    this.setState({
      isConfirmDialogOpen: false,
      isImporting: true,
    });
    this.uploadFile();
  };

  uploadFile() {
    const file = this.importFileInput.files[0];
    const reader = new FileReader();
    reader.onload = e => {
      // It is safe to pass a callback to be called by DataTableView, because this component
      // will always live as long as DataTableView.
      this.props.importCsv(e.target.result, this.handleImportComplete);
      // Make sure we get another change event if the same file is selected again.
      this.importFileInput.value = '';
    };
    reader.readAsText(file);
  }

  handleImportComplete = () => this.setState(INITIAL_STATE);

  handleSelectImportFile = () => {
    if (!this.importFileInput.value) {
      return;
    }
    this.setState({isConfirmDialogOpen: true});
  };

  render() {
    return (
      <span
        style={{...{display: 'inline-block'}, ...this.props.containerStyle}}
      >
        <input
          ref={input => (this.importFileInput = input)}
          type="file"
          style={{display: 'none'}}
          accept="text/csv"
          onChange={this.handleSelectImportFile}
        />
        <Dialog
          body={msg.confirmImportOverwrite()}
          cancelText={msg.cancel()}
          confirmText={msg.yes()}
          confirmType="danger"
          isOpen={!!this.state.isConfirmDialogOpen}
          handleClose={this.handleClose}
          onCancel={this.handleClose}
          onConfirm={this.handleConfirm}
          title={msg.confirmImportOverwriteTitle()}
        />
        <PendingButton
          isPending={this.state.isImporting}
          onClick={() => this.importFileInput.click()}
          pendingText={msg.importingWithEllipsis()}
          className={classNames(dataStyles.button, dataStyles.buttonWhite)}
          text={msg.importCSV()}
        />
      </span>
    );
  }
}
export default ConfirmImportButton;
