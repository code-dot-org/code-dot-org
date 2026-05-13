import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Modal from '@code-dot-org/component-library/modal';
import {Button as MuiButton} from '@mui/material';
import Papa from 'papaparse';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import experiments from '@cdo/apps/util/experiments';
import i18n from '@cdo/locale';

import {
  addMultipleAddRows,
  parseAge,
  parseGender,
  parseUsState,
} from './manageStudentsRedux';

import moduleStyles from './addMultipleStudents.module.scss';

class AddMultipleStudents extends Component {
  static propTypes = {
    sectionId: PropTypes.number,
    // Provided by redux
    addMultipleStudents: PropTypes.func.isRequired,
  };

  state = {
    isDialogOpen: false,
    fileName: null,
    selectedFile: null,
    isDragging: false,
  };

  textareaRef = React.createRef();

  openDialog = () => {
    this.setState({isDialogOpen: true});
  };

  closeDialog = () => {
    this.setState({
      isDialogOpen: false,
      fileName: null,
      selectedFile: null,
      isDragging: false,
    });
    if (this.fileInput) {
      this.fileInput.value = '';
    }
  };

  onImportCSV = () => {
    if (this.fileInput) {
      this.fileInput.click();
    }
  };

  removeSelectedFile = () => {
    if (this.fileInput) {
      this.fileInput.value = '';
    }
    this.setState({fileName: null, selectedFile: null});
  };

  onFileUpload = e => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    this.setState({fileName: file.name, selectedFile: file});
  };

  onDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({isDragging: true});
  };

  onDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({isDragging: false});
  };

  onDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({isDragging: false});
    const file = e.dataTransfer.files[0];
    if (!file) {
      return;
    }
    this.setState({fileName: file.name, selectedFile: file});
  };

  parseCsvRows = rows =>
    rows.map(parts => {
      const name = (parts[0] || '').trim();
      const familyName = (parts[1] || '').trim() || null;
      const age = parseAge(parts[2]);
      const gender = parseGender(parts[3]);
      const usState = parseUsState(parts[4]) || null;
      return {name, familyName, age, gender, usState};
    });

  parseBasicRows = value =>
    value.split('\n').map(line => {
      const parts = line.split(',');
      const name = parts[0].trim();
      const familyName = parts.length > 1 ? parts[1].trim() : null;
      return {name, familyName};
    });

  add = () => {
    if (experiments.isEnabled('add-students-csv-import')) {
      if (this.state.selectedFile) {
        Papa.parse(this.state.selectedFile, {
          complete: results => {
            this.props.addMultipleStudents(this.parseCsvRows(results.data));
            this.closeDialog();
          },
          error: () => {
            console.error('CSV parse error');
          },
        });
        return;
      }

      const results = Papa.parse(this.textareaRef.current.value);
      this.props.addMultipleStudents(this.parseCsvRows(results.data));
      this.closeDialog();
      return;
    }

    this.props.addMultipleStudents(
      this.parseBasicRows(this.textareaRef.current.value)
    );
    this.closeDialog();
  };

  renderCsvContent() {
    const textareaClassName = [
      moduleStyles.textarea,
      moduleStyles.csvTextarea,
      this.state.selectedFile && moduleStyles.textareaDisabled,
    ]
      .filter(Boolean)
      .join(' ');
    const dropZoneClassName = [
      moduleStyles.dropZone,
      this.state.isDragging && moduleStyles.dropZoneActive,
      this.state.selectedFile && moduleStyles.dropZoneHasFile,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={moduleStyles.inputRow}>
        <div className={moduleStyles.textareaSection}>
          <label className={moduleStyles.label} htmlFor="students-text-box">
            {i18n.addStudentsTypeLabel()}
          </label>
          <textarea
            id="students-text-box"
            rows="8"
            cols="35"
            ref={this.textareaRef}
            className={textareaClassName}
            disabled={!!this.state.selectedFile}
          />
        </div>
        <div className={moduleStyles.dividerSection} aria-hidden="true">
          <div className={moduleStyles.verticalDivider} />
          <div className={moduleStyles.orLabel}>{i18n.or()}</div>
          <div className={moduleStyles.verticalDivider} />
        </div>
        <div className={moduleStyles.dropSection}>
          <label
            className={moduleStyles.label}
            htmlFor="students-csv-file-input"
          >
            {i18n.addStudentsImportLabel()}
          </label>
          <input
            id="students-csv-file-input"
            type="file"
            accept=".csv"
            ref={input => (this.fileInput = input)}
            className={moduleStyles.hiddenFileInput}
            onChange={this.onFileUpload}
            aria-label={i18n.addStudentsImportLabel()}
          />
          <div
            className={dropZoneClassName}
            onDragOver={this.onDragOver}
            onDragLeave={this.onDragLeave}
            onDrop={this.onDrop}
          >
            {this.state.fileName ? (
              <div className={moduleStyles.fileSelected}>
                <button
                  type="button"
                  className={moduleStyles.fileNameButton}
                  onClick={this.onImportCSV}
                  aria-label={
                    `${this.state.fileName}. ` + i18n.importFromCSVDragBrowse()
                  }
                >
                  <span className={moduleStyles.fileName}>
                    {this.state.fileName}
                  </span>
                </button>
                <button
                  type="button"
                  className={moduleStyles.removeFile}
                  aria-label={`${i18n.dialogRemove()} ${this.state.fileName}`}
                  onClick={this.removeSelectedFile}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={moduleStyles.dropZoneButton}
                onClick={this.onImportCSV}
              >
                {i18n.importFromCSVDragBrowse()}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  renderTextareaContent() {
    return (
      <textarea
        rows="15"
        cols="70"
        ref={this.textareaRef}
        className={moduleStyles.textarea}
        aria-label={i18n.addStudentsMultiple()}
      />
    );
  }

  render() {
    const isCsvImportEnabled = experiments.isEnabled('add-students-csv-import');

    return (
      <>
        <MuiButton
          variant="outlined"
          color="tertiary"
          size="small"
          onClick={this.openDialog}
          type="button"
          startIcon={<FontAwesomeV6Icon iconName="plus" />}
        >
          {i18n.addStudentsMultiple()}
        </MuiButton>
        {this.state.isDialogOpen && (
          <Modal
            className={isCsvImportEnabled ? moduleStyles.modal : undefined}
            title={i18n.addStudentsMultiple()}
            description={
              isCsvImportEnabled
                ? i18n.addStudentsMultipleCSVInstructions()
                : i18n.addStudentsMultipleWithFamilyNameInstructions()
            }
            onClose={this.closeDialog}
            customContent={
              isCsvImportEnabled
                ? this.renderCsvContent()
                : this.renderTextareaContent()
            }
            primaryButtonProps={{
              children: i18n.done(),
              onClick: this.add,
            }}
            secondaryButtonProps={{
              children: i18n.dialogCancel(),
              onClick: this.closeDialog,
            }}
          />
        )}
      </>
    );
  }
}

export default connect(
  state => ({}),
  dispatch => ({
    addMultipleStudents(names) {
      dispatch(addMultipleAddRows(names));
    },
  })
)(AddMultipleStudents);
