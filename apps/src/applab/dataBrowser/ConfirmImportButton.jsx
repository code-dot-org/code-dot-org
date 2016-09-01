import Dialog from '../../templates/Dialog';
import React from 'react';
import Radium from 'radium';
import applabMsg from '@cdo/applab/locale';
import * as dataStyles from './dataStyles';

const ConfirmImportButton = React.createClass({
  propTypes: {
    importCsv: React.PropTypes.func.isRequired,
    containerStyle: React.PropTypes.any,
  },

  getInitialState() {
    return {
      isConfirmDialogOpen: false
    };
  },

  handleClose() {
    this.setState({isConfirmDialogOpen: false});
    this.importFileInput.value = "";
  },

  handleConfirm() {
    this.setState({isConfirmDialogOpen: false});
    this.uploadFile();
  },

  uploadFile() {
    const file = this.importFileInput.files[0];
    const reader = new FileReader();
    reader.onload = e => {
      this.props.importCsv(e.target.result);
      // Make sure we get another change event if the same file is selected again.
      this.importFileInput.value = "";
    };
    reader.readAsText(file);
  },

  handleSelectImportFile() {
    if (!this.importFileInput.value) {
      return;
    }
    this.setState({isConfirmDialogOpen: true});
  },

  render() {
    return (
      <span style={[{display: 'inline-block'}, this.props.containerStyle]}>
        <input
          ref={input => this.importFileInput = input}
          type="file"
          style={{display: 'none'}}
          accept="text/csv"
          onChange={this.handleSelectImportFile}
        />
        <Dialog
          body={applabMsg.confirmImportOverwrite()}
          cancelText="Cancel"
          confirmText="Overwrite"
          confirmType="danger"
          isOpen={!!this.state.isConfirmDialogOpen}
          handleClose={this.handleClose}
          onCancel={this.handleClose}
          onConfirm={this.handleConfirm}
          title="Overwrite existing data"
        />
        <button
          onClick={() => this.importFileInput.click()}
          style={dataStyles.whiteButton}
        >
          Import csv
        </button>
      </span>
    );
  }
});
export default Radium(ConfirmImportButton);
