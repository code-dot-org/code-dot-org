import React from 'react';
import Radium from 'radium';
import applabMsg from '@cdo/applab/locale';
import * as dataStyles from './dataStyles';

const styles = {
  importButton: [dataStyles.whiteButton, dataStyles.alignRight],
};

const ConfirmImportButton = React.createClass({
  propTypes: {
    importCsv: React.PropTypes.func.isRequired,
  },

  handleSelectImportFile() {
    if (!this.importFileInput.value) {
      return;
    }
    if (confirm(applabMsg.confirmImportOverwrite())) {
      const file = this.importFileInput.files[0];
      const reader = new FileReader();
      reader.onload = e => {
        this.props.importCsv(e.target.result);
        // Make sure we get another change event if the same file is selected again.
        this.importFileInput.value = "";
      };
      reader.readAsText(file);
    }
  },

  render() {
    return (
      <span>
        <input
          ref={input => this.importFileInput = input}
          type="file"
          style={{display: 'none'}}
          accept="text/csv"
          onChange={this.handleSelectImportFile}
        />
        <button
          onClick={() => this.importFileInput.click()}
          style={styles.importButton}
        >
          Import csv
        </button>
      </span>
    );
  }
});
export default Radium(ConfirmImportButton);
