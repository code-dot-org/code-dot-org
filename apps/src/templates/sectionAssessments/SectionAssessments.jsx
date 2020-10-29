import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {
  setScriptId,
  validScriptPropType
} from '@cdo/apps/redux/scriptSelectionRedux';
import {
  asyncLoadAssessments,
  getCurrentScriptAssessmentList,
  setAssessmentId,
  isCurrentAssessmentSurvey,
  countSubmissionsForCurrentAssessment,
  getExportableData,
  setStudentId,
  ASSESSMENT_FEEDBACK_OPTION_ID
} from '@cdo/apps/templates/sectionAssessments/sectionAssessmentsRedux';
import {getStudentList} from '@cdo/apps/redux/sectionDataRedux';
import {connect} from 'react-redux';
import {h3Style} from '../../lib/ui/Headings';
import i18n from '@cdo/locale';
import ScriptSelector from '@cdo/apps/templates/sectionProgress/ScriptSelector';
import MultipleChoiceAssessmentsOverviewContainer from './MultipleChoiceAssessmentsOverviewContainer';
import MultipleChoiceByStudentContainer from './MultipleChoiceByStudentContainer';
import SubmissionStatusAssessmentsContainer from './SubmissionStatusAssessmentsContainer';
import FreeResponsesAssessmentsContainer from './FreeResponsesAssessmentsContainer';
import FreeResponsesSurveyContainer from './FreeResponsesSurveyContainer';
import FreeResponseDetailsDialog from './FreeResponseDetailsDialog';
import MultipleChoiceSurveyOverviewContainer from './MultipleChoiceSurveyOverviewContainer';
import MultipleChoiceDetailsDialog from './MultipleChoiceDetailsDialog';
import MatchAssessmentsOverviewContainer from './MatchAssessmentsOverviewContainer';
import MatchDetailsDialog from './MatchDetailsDialog';
import MatchByStudentContainer from './MatchByStudentContainer';
import AssessmentSelector from './AssessmentSelector';
import StudentSelector from './StudentSelector';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {CSVLink} from 'react-csv';
import FeedbackDownload from './FeedbackDownload';

const CSV_ASSESSMENT_HEADERS = [
  {label: i18n.name(), key: 'studentName'},
  {label: i18n.stage(), key: 'stage'},
  {label: i18n.timeStamp, key: 'timestamp'},
  {label: i18n.question(), key: 'question'},
  {label: i18n.response(), key: 'response'},
  {label: i18n.correct(), key: 'correct'}
];

const CSV_SURVEY_HEADERS = [
  {label: i18n.stage(), key: 'stage'},
  {label: i18n.question(), key: 'questionNumber'},
  {label: i18n.questionText(), key: 'questionText'},
  {label: i18n.response(), key: 'answer'},
  {label: i18n.count(), key: 'numberAnswered'}
];

const styles = {
  header: {
    marginBottom: 0
  },
  tableContent: {
    marginTop: 10,
    clear: 'both'
  },
  selectors: {
    clear: 'both'
  },
  scriptSelection: {
    float: 'left',
    marginRight: 20
  },
  assessmentSelection: {
    float: 'left',
    marginBottom: 10
  },
  download: {
    marginTop: 10
  },
  loading: {
    clear: 'both'
  },
  empty: {
    clear: 'both'
  }
};

class SectionAssessments extends Component {
  static propTypes = {
    sectionName: PropTypes.string.isRequired,
    // provided by redux
    sectionId: PropTypes.number.isRequired,
    isLoading: PropTypes.bool.isRequired,
    validScripts: PropTypes.arrayOf(validScriptPropType).isRequired,
    assessmentList: PropTypes.array.isRequired,
    scriptId: PropTypes.number,
    assessmentId: PropTypes.number,
    setScriptId: PropTypes.func.isRequired,
    setAssessmentId: PropTypes.func.isRequired,
    asyncLoadAssessments: PropTypes.func.isRequired,
    multipleChoiceSurveyResults: PropTypes.array,
    isCurrentAssessmentSurvey: PropTypes.bool,
    totalStudentSubmissions: PropTypes.number,
    exportableData: PropTypes.array,
    studentId: PropTypes.number,
    setStudentId: PropTypes.func,
    studentList: PropTypes.array
  };

  state = {
    freeResponseDetailDialogOpen: false,
    multipleChoiceDetailDialogOpen: false,
    matchDetailDialogOpen: false
  };

  componentWillMount() {
    const {scriptId, asyncLoadAssessments, sectionId} = this.props;
    asyncLoadAssessments(sectionId, scriptId);
  }

  onChangeScript = scriptId => {
    const {setScriptId, asyncLoadAssessments, sectionId} = this.props;
    asyncLoadAssessments(sectionId, scriptId);
    setScriptId(scriptId);
  };

  showFreeResponseDetailDialog = () => {
    this.setState({
      freeResponseDetailDialogOpen: true
    });
  };

  hideFreeResponseDetailDialog = () => {
    this.setState({
      freeResponseDetailDialogOpen: false
    });
  };

  showMulitpleChoiceDetailDialog = () => {
    this.setState({
      multipleChoiceDetailDialogOpen: true
    });
  };

  hideMultipleChoiceDetailDialog = () => {
    this.setState({
      multipleChoiceDetailDialogOpen: false
    });
  };

  showMatchDetailDialog = () => {
    this.setState({
      matchDetailDialogOpen: true
    });
  };

  hideMatchDetailDialog = () => {
    this.setState({
      matchDetailDialogOpen: false
    });
  };

  render() {
    const {
      sectionName,
      validScripts,
      scriptId,
      assessmentList,
      assessmentId,
      isLoading,
      isCurrentAssessmentSurvey,
      totalStudentSubmissions,
      exportableData,
      studentId,
      studentList
    } = this.props;

    const isCurrentAssessmentFeedbackOption =
      this.props.assessmentId === ASSESSMENT_FEEDBACK_OPTION_ID;

    return (
      <div>
        <div style={styles.selectors}>
          <div style={styles.scriptSelection}>
            <div style={{...h3Style, ...styles.header}}>
              {i18n.selectACourse()}
            </div>
            <ScriptSelector
              validScripts={validScripts}
              scriptId={scriptId}
              onChange={this.onChangeScript}
            />
          </div>
          {!isLoading && assessmentList.length > 0 && (
            <div style={styles.assessmentSelection}>
              <div style={{...h3Style, ...styles.header}}>
                {i18n.selectAssessment()}
              </div>
              <AssessmentSelector
                assessmentList={assessmentList}
                assessmentId={assessmentId}
                onChange={this.props.setAssessmentId}
              />
            </div>
          )}
        </div>
        {!isLoading && assessmentList.length > 0 && (
          <div style={styles.tableContent}>
            {/* Assessments */}
            {!isCurrentAssessmentSurvey && !isCurrentAssessmentFeedbackOption && (
              <div>
                <div style={{...h3Style, ...styles.header}}>
                  {i18n.selectStudent()}
                </div>
                <StudentSelector
                  studentList={studentList}
                  studentId={studentId}
                  onChange={this.props.setStudentId}
                />
                {totalStudentSubmissions > 0 && (
                  <div style={styles.download}>
                    <CSVLink
                      filename="assessments.csv"
                      data={exportableData}
                      headers={CSV_ASSESSMENT_HEADERS}
                    >
                      <div>{i18n.downloadAssessmentCSV()}</div>
                    </CSVLink>
                  </div>
                )}
                {totalStudentSubmissions <= 0 && (
                  <div>{i18n.emptyAssessmentSubmissions()}</div>
                )}
                <SubmissionStatusAssessmentsContainer />
                {totalStudentSubmissions > 0 && (
                  <div>
                    <MultipleChoiceAssessmentsOverviewContainer
                      openDialog={this.showMulitpleChoiceDetailDialog}
                    />
                    <MultipleChoiceByStudentContainer />
                    <MatchAssessmentsOverviewContainer
                      openDialog={this.showMatchDetailDialog}
                    />
                    <MatchByStudentContainer
                      openDialog={this.showMatchDetailDialog}
                    />
                    <FreeResponsesAssessmentsContainer
                      openDialog={this.showFreeResponseDetailDialog}
                    />
                  </div>
                )}
              </div>
            )}
            {/* Feedback Download */}
            {isCurrentAssessmentFeedbackOption && (
              <FeedbackDownload sectionName={sectionName} />
            )}
            {/* Surveys */}
            {isCurrentAssessmentSurvey && (
              <div>
                {totalStudentSubmissions > 0 && (
                  <div>
                    <CSVLink
                      filename="surveys.csv"
                      data={exportableData}
                      headers={CSV_SURVEY_HEADERS}
                    >
                      <div>{i18n.downloadAssessmentCSV()}</div>
                    </CSVLink>
                    <MultipleChoiceSurveyOverviewContainer />
                    <FreeResponsesSurveyContainer
                      openDialog={this.showFreeResponseDetailDialog}
                    />
                  </div>
                )}
                {totalStudentSubmissions <= 0 && (
                  <div>{i18n.emptySurveyOverviewTable()}</div>
                )}
              </div>
            )}
            <FreeResponseDetailsDialog
              isDialogOpen={this.state.freeResponseDetailDialogOpen}
              closeDialog={this.hideFreeResponseDetailDialog}
            />
            <MultipleChoiceDetailsDialog
              isDialogOpen={this.state.multipleChoiceDetailDialogOpen}
              closeDialog={this.hideMultipleChoiceDetailDialog}
            />
            <MatchDetailsDialog
              isDialogOpen={this.state.matchDetailDialogOpen}
              closeDialog={this.hideMatchDetailDialog}
            />
          </div>
        )}
        {isLoading && (
          <div style={styles.loading}>
            <FontAwesome icon="spinner" className="fa-pulse fa-3x" />
          </div>
        )}
        {!isLoading && assessmentList.length === 0 && (
          <div style={styles.empty}>{i18n.noAssessments()}</div>
        )}
      </div>
    );
  }
}

export const UnconnectedSectionAssessments = SectionAssessments;

export default connect(
  state => ({
    sectionId: state.sectionData.section.id,
    isLoading: !!state.sectionAssessments.isLoading,
    validScripts: state.scriptSelection.validScripts,
    assessmentList: getCurrentScriptAssessmentList(state),
    scriptId: state.scriptSelection.scriptId,
    assessmentId: state.sectionAssessments.assessmentId,
    isCurrentAssessmentSurvey: isCurrentAssessmentSurvey(state),
    totalStudentSubmissions: countSubmissionsForCurrentAssessment(state),
    exportableData: getExportableData(state),
    studentId: state.sectionAssessments.studentId,
    studentList: getStudentList(state)
  }),
  dispatch => ({
    setScriptId(scriptId) {
      dispatch(setScriptId(scriptId));
    },
    asyncLoadAssessments(sectionId, scriptId) {
      return dispatch(asyncLoadAssessments(sectionId, scriptId));
    },
    setAssessmentId(assessmentId) {
      dispatch(setAssessmentId(assessmentId));
    },
    setStudentId(studentId) {
      dispatch(setStudentId(studentId));
    }
  })
)(SectionAssessments);
