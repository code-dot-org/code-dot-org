import React from 'react';
import Radium from 'radium';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import ToggleGroup from '@cdo/apps/templates/ToggleGroup';
import progressStyles from './progressStyles';
import color from '../../../color';

// TODO - this enum belongs elsewhere, and use createEnum util
const LockStatus = {
  Locked: 'locked',
  Editable: 'editable',
  Readonly: 'readonly'
};

const styles = {
  main: {
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 20,
    marginRight: 20,
    color: color.charcoal
  },
  title: {
    color: color.teal,
    fontSize: 20,
    fontWeight: 900,
    marginTop: 15,
    marginBottom: 15
  },
  headerRow: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.teal,
    backgroundColor: color.teal,
    padding: 10,
    fontSize: '100%',
    fontFamily: '"Gotham 4r", sans-serif',
    fontWeight: 'bold'
  },
  tableDesc: {
    marginTop: 10,
    marginBottom: 10
  },
  studentTable: {
    width: '100%'
  },
  tableCell: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.light_gray,
    padding: 10
  },
  selectedCell: {
    backgroundColor: color.lightest_teal
  },
  radioCell: {
    textAlign: 'center'
  },
  buttonContainer: {
    textAlign: 'right',
    marginRight: 15
  }
};

const StageLockDialog = React.createClass({
  propTypes: {
    isOpen: React.PropTypes.bool.isRequired,
    handleClose: React.PropTypes.func.isRequired,
    initialLockStatus: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        lockStatus: React.PropTypes.oneOf(Object.values(LockStatus)).isRequired
      })
    ).isRequired
  },

  getInitialState() {
    return {
      lockStatus: this.props.initialLockStatus
    };
  },

  setAllLockStatus(lockStatus) {
    this.setState({
      lockStatus: this.state.lockStatus.map(item => ({
        name: item.name,
        lockStatus
      }))
    });
  },

  allowEditing() {
    this.setAllLockStatus(LockStatus.Editable);
  },

  lockStage() {
    this.setAllLockStatus(LockStatus.Locked);
  },

  showAnswers() {
    this.setAllLockStatus(LockStatus.Readonly);
  },

  handleRadioChange(event) {
    const modifiedIndex = parseInt(event.target.name, 10);
    const value = event.target.value;

    this.setState({
      lockStatus: this.state.lockStatus.map((item, index) => {
        if (index !== modifiedIndex) {
          return item;
        }
        return {
          name: item.name,
          lockStatus: event.target.value
        };
      })
    });
  },

  render() {
    // TODO - i18n
    return (
      <BaseDialog
        isOpen={this.props.isOpen}
        handleClose={this.props.handleClose}
      >
        <div style={styles.main}>
          <div style={styles.title}>Steps to give assessment</div>
          <table>
            <tbody>
              <tr>
                <td>1. "Allow editing" while students should be taking the assessment.</td>
                <td>
                  <button
                    style={progressStyles.orangeButton}
                    onClick={this.allowEditing}
                  >
                    Allow editing
                  </button>
                </td>
              </tr>
              <tr>
                <td>2. Once time is up, "Lock stage" to hide questions.</td>
                <td>
                  <button
                    style={progressStyles.orangeButton}
                    onClick={this.lockStage}
                  >
                    Lock stage
                  </button>
                </td>
              </tr>
              <tr>
                <td>3. "Show answers" to put the assessment into a read-only mode.</td>
                <td>
                  <button
                    style={progressStyles.orangeButton}
                    onClick={this.showAnswers}
                  >
                    Show answers
                  </button>
                </td>
              </tr>
              <tr>
                <td>4. "Re-lock stage" to prevent sharing of answers with other classes/schools.</td>
                <td>
                  <button
                    style={progressStyles.orangeButton}
                    onClick={this.lockStage}
                  >
                    Re-lock stage
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div style={styles.title}>Individual student control</div>
          <div style={styles.tableDesc}>
            Use the table below to control the state for each individual student.
          </div>
          <table style={styles.studentTable}>
            <tbody>
              <tr>
                <th style={styles.headerRow}>Student</th>
                <th style={styles.headerRow}>Locked</th>
                <th style={styles.headerRow}>Editable</th>
                <th style={styles.headerRow}>Answers visible (read-only)</th>
              </tr>
              {this.state.lockStatus.map(({name, lockStatus}, index) => (
                <tr key={index}>
                  <td style={styles.tableCell}>{name}</td>
                  <td
                    style={[
                      styles.tableCell,
                      styles.radioCell,
                      lockStatus === LockStatus.Locked && styles.selectedCell
                    ]}
                  >
                    <input
                      type="radio"
                      name={index}
                      value="locked"
                      checked={lockStatus === LockStatus.Locked}
                      onChange={this.handleRadioChange}
                    />
                  </td>
                  <td
                    style={[
                      styles.tableCell,
                      styles.radioCell,
                      lockStatus === LockStatus.Editable && styles.selectedCell
                    ]}
                  >
                    <input
                      type="radio"
                      name={index}
                      value="editable"
                      checked={lockStatus === LockStatus.Editable}
                      onChange={this.handleRadioChange}
                    />
                  </td>
                  <td
                    style={[
                      styles.tableCell,
                      styles.radioCell,
                      lockStatus === LockStatus.Readonly && styles.selectedCell
                    ]}
                  >
                    <input
                      type="radio"
                      name={index}
                      value="readonly"
                      checked={lockStatus === LockStatus.Readonly}
                      onChange={this.handleRadioChange}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={styles.buttonContainer}>
          <button
            style={progressStyles.baseButton}
            onClick={this.props.handleClose}
          >
            Cancel
          </button>
          <button style={progressStyles.blueButton}>Save</button>
        </div>
      </BaseDialog>
    );
  }
});

export default Radium(StageLockDialog);
