import React from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import ToggleGroup from '@cdo/apps/templates/ToggleGroup';
import progressStyles from './progressStyles';
import color from '../../../color';
import commonMsg from '@cdo/locale';

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
    return (
      <BaseDialog
        isOpen={this.props.isOpen}
        handleClose={this.props.handleClose}
      >
        <div style={styles.main}>
          <div style={styles.title}>{commonMsg.assessmentSteps()}</div>
          <table>
            <tbody>
              <tr>
                <td>{commonMsg.allowEditingInstructions()}</td>
                <td>
                  <button
                    style={progressStyles.orangeButton}
                    onClick={this.allowEditing}
                  >
                    {commonMsg.allowEditing()}
                  </button>
                </td>
              </tr>
              <tr>
                <td>{commonMsg.lockStageInstructions()}</td>
                <td>
                  <button
                    style={progressStyles.orangeButton}
                    onClick={this.lockStage}
                  >
                    {commonMsg.lockStage()}
                  </button>
                </td>
              </tr>
              <tr>
                <td>{commonMsg.showAnswersInstructions()}</td>
                <td>
                  <button
                    style={progressStyles.orangeButton}
                    onClick={this.showAnswers}
                  >
                    {commonMsg.showAnswers()}
                  </button>
                </td>
              </tr>
              <tr>
                <td>{commonMsg.relockStageInstructions()}</td>
                <td>
                  <button
                    style={progressStyles.orangeButton}
                    onClick={this.lockStage}
                  >
                    {commonMsg.relockStage()}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div style={styles.title}>{commonMsg.studentControl()}</div>
          <div style={styles.tableDesc}>
            {commonMsg.studentLockStateInstructions()}
          </div>
          <table style={styles.studentTable}>
            <tbody>
              <tr>
                <th style={styles.headerRow}>{commonMsg.student()}</th>
                <th style={styles.headerRow}>{commonMsg.locked()}</th>
                <th style={styles.headerRow}>{commonMsg.editable()}</th>
                <th style={styles.headerRow}>{commonMsg.answersVisible()}</th>
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
            {commonMsg.dialogCancel()}
          </button>
          <button style={progressStyles.blueButton}>
            {commonMsg.save()}
          </button>
        </div>
      </BaseDialog>
    );
  }
});

export default connect(state => {
  const initialLockStatus = [
    {
      name: 'Farrah',
      lockStatus: 'locked'
    },
    {
      name: 'George',
      lockStatus: 'editable'
    }
  ];

  return {
    initialLockStatus,
    isOpen: !!state.teacherPanel.lockDialogStageId
  };
})(Radium(StageLockDialog));
