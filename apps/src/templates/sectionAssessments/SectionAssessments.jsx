import React, {Component, PropTypes} from 'react';
import { setScriptId, validScriptPropType } from '@cdo/apps/redux/scriptSelectionRedux';
import {
  asyncLoadAssessments,
  getCurrentScriptAssessmentList,
  setAssessmentId,
  isCurrentAssessmentSurvey,
  countSubmissionsForCurrentAssessment,
  getExportableData,
  setStudentId,
} from '@cdo/apps/templates/sectionAssessments/sectionAssessmentsRedux';
import { getStudentList } from '@cdo/apps/redux/sectionDataRedux';
import {connect} from 'react-redux';
import {h3Style} from "../../lib/ui/Headings";
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
import AssessmentSelector from './AssessmentSelector';
import StudentSelector from './StudentSelector';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {CSVLink} from 'react-csv';

const CSV_ASSESSMENT_HEADERS = [
  {label: i18n.name(), key: 'studentName'},
  {label: i18n.stage(), key: 'stage'},
  {label: i18n.timeStamp, key: 'timestamp'},
  {label: i18n.question(), key: 'question'},
  {label: i18n.response(), key: 'response'},
  {label: i18n.correct(), key: 'correct'},
];

const CSV_SURVEY_HEADERS = [
  {label: i18n.stage(), key: 'stage'},
  {label: i18n.question(), key: 'questionNumber'},
  {label: i18n.questionText(), key: 'questionText'},
  {label: i18n.response(), key: 'answer'},
  {label: i18n.count(), key: 'numberAnswered'},
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
    marginRight: 20,
    marginBottom: 20,
  },
  assessmentSelection: {
    float: 'left',
    marginBottom: 10,
  },
  download: {
    marginTop: 10,
  },
  loading: {
    clear: 'both',
  },
  empty: {
    clear: 'both',
  }
};

class SectionAssessments extends Component {
  static propTypes = {
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
    studentList: PropTypes.array,
  };

  state = {
    freeResponseDetailDialogOpen: false,
    multipleChoiceDetailDialogOpen: false,
  };

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

  render() {
    const {validScripts, scriptId, assessmentList, assessmentId,
      isLoading, isCurrentAssessmentSurvey, totalStudentSubmissions,
      exportableData, studentId, studentList} = this.props;

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
          {(!isLoading && assessmentList.length > 0) &&
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
          }
        </div>
        {(!isLoading && assessmentList.length > 0) &&
          <div style={styles.tableContent}>
            {/* Assessments */}
            {!isCurrentAssessmentSurvey &&
              <div>
                <div style={{...h3Style, ...styles.header}}>
                  {i18n.selectStudent()}
                </div>
                <StudentSelector
                  studentList={studentList}
                  studentId={studentId}
                  onChange={this.props.setStudentId}
                />
                {totalStudentSubmissions > 0 &&
                  <div style={styles.download}>
                    <CSVLink
                      filename="assessments.csv"
                      data={exportableData}
                      headers={CSV_ASSESSMENT_HEADERS}
                    >
                      <div>{i18n.downloadAssessmentCSV()}</div>
                    </CSVLink>
                  </div>
                }
                {totalStudentSubmissions <= 0 &&
                  <h3>{i18n.emptyAssessmentSubmissions()}</h3>
                }
                <SubmissionStatusAssessmentsContainer />
                {totalStudentSubmissions > 0 &&
                  <div>
                    <MultipleChoiceAssessmentsOverviewContainer
                      openDialog={this.showMulitpleChoiceDetailDialog}
                    />
                    <MultipleChoiceByStudentContainer />
                    <FreeResponsesAssessmentsContainer
                      openDialog={this.showFreeResponseDetailDialog}
                    />
                  </div>
                }
              </div>
            }
            {/* Surveys */}
            {isCurrentAssessmentSurvey &&
              <div>
                {totalStudentSubmissions > 0 &&
                  <div>
                    <CSVLink
                      filename="surveys.csv"
                      data={exportableData}
                      headers={CSV_SURVEY_HEADERS}
                    >
                      <div>{i18n.downloadAssessmentCSV()}</div>
                    </CSVLink>
                    <MultipleChoiceSurveyOverviewContainer
                      openDialog={this.showMulitpleChoiceDetailDialog}
                    />
                    <FreeResponsesSurveyContainer
                      openDialog={this.showFreeResponseDetailDialog}
                    />
                  </div>
                }
                {totalStudentSubmissions <=0 &&
                  <h3>{i18n.emptySurveyOverviewTable()}</h3>
                }
              </div>
            }
            <FreeResponseDetailsDialog
              isDialogOpen={this.state.freeResponseDetailDialogOpen}
              closeDialog={this.hideFreeResponseDetailDialog}
            />
            <MultipleChoiceDetailsDialog
              isDialogOpen={this.state.multipleChoiceDetailDialogOpen}
              closeDialog={this.hideMultipleChoiceDetailDialog}
            />
          </div>
        }
        {isLoading &&
          <div style={styles.loading}>
            <FontAwesome icon="spinner" className="fa-pulse fa-3x"/>
          </div>
        }
        {(!isLoading && assessmentList.length === 0) &&
          <div style={styles.empty}>
            <h3>
              {i18n.noAssessments()}
            </h3>
          </div>
        }
      </div>
    );
  }
}

export const UnconnectedSectionAssessments = SectionAssessments;

export default connect(state => ({
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
  studentList: getStudentList(state),
}), dispatch => ({
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
  },
}))(SectionAssessments);
