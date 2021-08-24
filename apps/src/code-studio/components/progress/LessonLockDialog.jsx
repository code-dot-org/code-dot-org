import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import {connect} from 'react-redux';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import progressStyles from './progressStyles';
import {LockStatus, saveLockDialog} from '../../lessonLockRedux';
import color from '../../../util/color';
import commonMsg from '@cdo/locale';
import SectionSelector from './SectionSelector';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';

class LessonLockDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    initialLockStatus: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        lockStatus: PropTypes.oneOf(Object.values(LockStatus)).isRequired
      })
    ),
    selectedSectionId: PropTypes.string.isRequired,
    saving: PropTypes.bool.isRequired,
    saveDialog: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      lockStatus: props.initialLockStatus
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.saving) {
      return;
    }
    this.setState({
      lockStatus: nextProps.initialLockStatus
    });
  }

  setAllLockStatus(lockStatus) {
    this.setState({
      lockStatus: this.state.lockStatus.map(item =>
        Object.assign({}, item, {
          lockStatus
        })
      )
    });
  }

  allowEditing = () => this.setAllLockStatus(LockStatus.Editable);

  lockLesson = () => this.setAllLockStatus(LockStatus.Locked);

  showAnswers = () => this.setAllLockStatus(LockStatus.ReadonlyAnswers);

  viewSection = () => {
    const assessmentsUrl = teacherDashboardUrl(
      this.props.selectedSectionId,
      '/assessments'
    );
    window.open(assessmentsUrl, '_blank');
  };

  handleRadioChange = event => {
    const modifiedIndex = parseInt(event.target.name, 10);
    const value = event.target.value;

    // Do this in a setTimeout so that the event has time to finish processing
    // (i.e. so that checkbox is updated) before we call setState and rerender
    setTimeout(() => {
      this.setState({
        lockStatus: this.state.lockStatus.map((item, index) => {
          if (index !== modifiedIndex) {
            return item;
          }
          return Object.assign({}, item, {
            lockStatus: value
          });
        })
      });
    }, 0);
  };

  handleSave = () => {
    this.props.saveDialog(this.props.selectedSectionId, this.state.lockStatus);
  };

  render() {
    const responsiveHeight = {
      maxHeight: window.innerHeight * 0.8 - 100
    };
    const hasSelectedSection = this.props.selectedSectionId !== '';
    const hiddenUnlessSelectedSection = hasSelectedSection ? {} : styles.hidden;
    return (
      <BaseDialog
        isOpen={this.props.isOpen}
        handleClose={this.props.handleClose}
      >
        <div style={[styles.main, responsiveHeight]}>
          <div>
            <span style={styles.title}>{commonMsg.assessmentSteps()}</span>
            <SectionSelector
              style={{marginLeft: 10}}
              requireSelection={hasSelectedSection}
            />
          </div>
          <table style={hiddenUnlessSelectedSection}>
            <tbody>
              <tr>
                <td>1. {commonMsg.allowEditingInstructions()}</td>
                <td>
                  <button
                    type="button"
                    style={progressStyles.orangeButton}
                    onClick={this.allowEditing}
                  >
                    {commonMsg.allowEditing()}
                  </button>
                </td>
              </tr>
              <tr>
                <td>2. {commonMsg.lockStageInstructions()}</td>
                <td>
                  <button
                    type="button"
                    style={progressStyles.orangeButton}
                    onClick={this.lockLesson}
                  >
                    {commonMsg.lockStage()}
                  </button>
                </td>
              </tr>
              <tr>
                <td>3. {commonMsg.showAnswersInstructions()}</td>
                <td>
                  <button
                    type="button"
                    style={progressStyles.orangeButton}
                    onClick={this.showAnswers}
                  >
                    {commonMsg.showAnswers()}
                  </button>
                </td>
              </tr>
              <tr>
                <td>4. {commonMsg.relockStageInstructions()}</td>
                <td>
                  <button
                    type="button"
                    style={progressStyles.orangeButton}
                    onClick={this.lockLesson}
                  >
                    {commonMsg.relockStage()}
                  </button>
                </td>
              </tr>
              <tr>
                <td>5. {commonMsg.reviewResponses()}</td>
                <td>
                  <button
                    type="button"
                    style={progressStyles.whiteButton}
                    onClick={this.viewSection}
                  >
                    {commonMsg.viewSection()}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div style={[styles.descriptionText, hiddenUnlessSelectedSection]}>
            {commonMsg.autolock()}
          </div>
          <div style={[styles.title, hiddenUnlessSelectedSection]}>
            {commonMsg.studentControl()}
          </div>
          <div style={[styles.descriptionText, hiddenUnlessSelectedSection]}>
            {commonMsg.studentLockStateInstructions()}
          </div>
          <table style={[styles.studentTable, hiddenUnlessSelectedSection]}>
            <thead>
              <tr>
                <th style={styles.headerRow}>{commonMsg.student()}</th>
                <th style={styles.headerRow}>{commonMsg.locked()}</th>
                <th style={styles.headerRow}>{commonMsg.editable()}</th>
                <th style={styles.headerRow}>{commonMsg.answersVisible()}</th>
              </tr>
            </thead>
            <tbody>
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
                      value={LockStatus.Locked}
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
                      value={LockStatus.Editable}
                      checked={lockStatus === LockStatus.Editable}
                      onChange={this.handleRadioChange}
                    />
                  </td>
                  <td
                    style={[
                      styles.tableCell,
                      styles.radioCell,
                      lockStatus === LockStatus.ReadonlyAnswers &&
                        styles.selectedCell
                    ]}
                  >
                    <input
                      type="radio"
                      name={index}
                      value={LockStatus.ReadonlyAnswers}
                      checked={lockStatus === LockStatus.ReadonlyAnswers}
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
            type="button"
            style={progressStyles.baseButton}
            onClick={this.props.handleClose}
          >
            {commonMsg.dialogCancel()}
          </button>
          <button
            type="button"
            style={[progressStyles.blueButton, hiddenUnlessSelectedSection]}
            onClick={this.handleSave}
            disabled={this.props.saving}
          >
            {this.props.saving ? commonMsg.saving() : commonMsg.save()}
          </button>
        </div>
      </BaseDialog>
    );
  }
}

const styles = {
  main: {
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 20,
    marginRight: 20,
    color: color.charcoal,
    whiteSpace: 'normal',
    // maxHeight provided in render method based on window size
    overflowY: 'scroll',
    textAlign: 'left'
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
  descriptionText: {
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
  },
  hidden: {
    display: 'none'
  }
};

export const UnconnectedLessonLockDialog = Radium(LessonLockDialog);
export default connect(
  state => ({
    initialLockStatus: state.lessonLock.lockStatus,
    isOpen: !!state.lessonLock.lockDialogLessonId,
    saving: state.lessonLock.saving,
    selectedSectionId: state.teacherSections.selectedSectionId.toString()
  }),
  dispatch => ({
    saveDialog(sectionId, lockStatus) {
      dispatch(saveLockDialog(sectionId, lockStatus));
    }
  })
)(UnconnectedLessonLockDialog);
