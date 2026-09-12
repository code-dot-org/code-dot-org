import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Modal from '@code-dot-org/component-library/modal';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
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

const csvTemplate = () =>
  `${i18n.addStudentsMultipleCSVFormat()}\n` +
  'Ada,Lovelace,18,female,CA\n' +
  'Alan,Turing,21+,M,ny\n' +
  'Sam,Taylor,,non-binary,fl\n' +
  'Alex,,13,preferred term not listed,GA\n';

const CSV_IMPORT_OPTIONAL_FIELDS = [
  {name: 'age', columnIndex: 2, parse: parseAge},
  {name: 'gender', columnIndex: 3, parse: parseGender},
  {name: 'state', columnIndex: 4, parse: parseUsState},
];

const hasCsvValue = raw => !!(raw && raw.toString().trim());

export const isHeaderRow = parts => {
  const normalizedParts = parts.map(part => (part || '').trim().toLowerCase());

  return (
    normalizedParts[0] === 'display name' &&
    normalizedParts[1] === 'family name' &&
    normalizedParts[2] === 'age' &&
    normalizedParts[3] === 'gender' &&
    normalizedParts[4] === 'state'
  );
};

export const parseStudentsCsv = rows => {
  const students = [];
  const invalidRows = new Set();

  rows.forEach((parts, index) => {
    if (index === 0 && isHeaderRow(parts)) {
      return;
    }

    const name = (parts[0] || '').trim();
    const familyName = (parts[1] || '').trim() || null;
    const age = parseAge(parts.length > 2 ? parts[2] : '');
    const gender = parseGender(parts[3]);
    const usState = parseUsState(parts[4]) || null;

    if (name) {
      CSV_IMPORT_OPTIONAL_FIELDS.forEach(field => {
        const rawValue = parts[field.columnIndex];
        if (hasCsvValue(rawValue) && !field.parse(rawValue)) {
          invalidRows.add(index + 1);
        }
      });
    }

    students.push({name, familyName, age, gender, usState});
  });

  return {
    students,
    warning:
      invalidRows.size > 0
        ? {
            rowCount: invalidRows.size,
          }
        : null,
  };
};

class AddMultipleStudents extends Component {
  static propTypes = {
    sectionId: PropTypes.number,
    disabled: PropTypes.bool,
    onCsvImportWarning: PropTypes.func,
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

  addCsvRows = rows => {
    const {students, warning} = parseStudentsCsv(rows);
    this.props.addMultipleStudents(students);
    if (this.props.onCsvImportWarning) {
      this.props.onCsvImportWarning(warning);
    }
  };

  parseBasicRows = value =>
    value.split('\n').map(line => {
      const parts = line.split(',');
      const name = parts[0].trim();
      const familyName = parts.length > 1 ? parts[1].trim() : null;
      return {name, familyName};
    });

  renderCsvDescription() {
    return (
      <div id="dsco-dialog-description">
        <MuiTypography variant="body2" gutterBottom>
          {i18n.addStudentsMultipleCSVInstructions()}{' '}
          <code className={moduleStyles.csvFormat}>
            {i18n.addStudentsMultipleCSVFormat()}
          </code>
        </MuiTypography>

        <MuiTypography variant="body2" gutterBottom>
          {i18n.addStudentsMultipleCSVOnlyDisplayNameRequired()}
        </MuiTypography>
      </div>
    );
  }

  renderModalContent() {
    if (experiments.isEnabled('add-students-csv-import')) {
      return (
        <>
          {this.renderCsvDescription()}
          {this.renderCsvContent()}
        </>
      );
    }

    return this.renderTextareaContent();
  }

  add = () => {
    if (experiments.isEnabled('add-students-csv-import')) {
      if (this.state.selectedFile) {
        Papa.parse(this.state.selectedFile, {
          complete: results => {
            this.addCsvRows(results.data);
            this.closeDialog();
          },
          error: () => {
            console.error('CSV parse error');
          },
        });
        return;
      }

      const results = Papa.parse(this.textareaRef.current.value);
      this.addCsvRows(results.data);
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
            placeholder="Ada,Lovelace,18,female,CA"
          />
        </div>
        <div className={moduleStyles.dividerSection} aria-hidden="true">
          <div className={moduleStyles.verticalDivider} />
          <div className={moduleStyles.orLabel}>{i18n.or()}</div>
          <div className={moduleStyles.verticalDivider} />
        </div>
        <div className={moduleStyles.dropSection}>
          <div className={moduleStyles.importHeader}>
            <label
              className={moduleStyles.label}
              htmlFor="students-csv-file-input"
            >
              {i18n.addStudentsImportLabel()}
            </label>
            <a
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(
                csvTemplate()
              )}`}
              download="students_template.csv"
              className={moduleStyles.templateLink}
            >
              {i18n.downloadCSVTemplate()}
            </a>
          </div>
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
          disabled={this.props.disabled}
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
                ? undefined
                : i18n.addStudentsMultipleWithFamilyNameInstructions()
            }
            onClose={this.closeDialog}
            customContent={this.renderModalContent()}
            primaryButtonProps={{
              children: i18n.addStudents(),
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
