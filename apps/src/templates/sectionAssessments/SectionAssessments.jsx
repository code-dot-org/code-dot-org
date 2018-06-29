import React, {Component, PropTypes} from 'react';
import { setScriptId, validScriptPropType } from '@cdo/apps/redux/scriptSelectionRedux';
import {
  asyncLoadAssessments,
  getCurrentScriptAssessmentList,
  setAssessmentId,
  isCurrentAssessmentSurvey,
  countSubmissionsForCurrentAssessment,
  getExportableData,
} from '@cdo/apps/templates/sectionAssessments/sectionAssessmentsRedux';
import {connect} from 'react-redux';
import {h3Style} from "../../lib/ui/Headings";
import i18n from '@cdo/locale';
import ScriptSelector from '@cdo/apps/templates/sectionProgress/ScriptSelector';
import MCAssessmentsOverviewContainer from './MCAssessmentsOverviewContainer';
import MultipleChoiceByStudentContainer from './MultipleChoiceByStudentContainer';
import StudentsMCSummaryContainer from './StudentsMCSummaryContainer';
import FreeResponsesAssessmentsContainer from './FreeResponsesAssessmentsContainer';
import FreeResponseBySurveyQuestionContainer from './FreeResponseBySurveyQuestionContainer';
import MCSurveyOverviewContainer from './MCSurveyOverviewContainer';
import AssessmentSelector from './AssessmentSelector';
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
  {label: i18n.question(), key: 'questionText'},
  {label: i18n.response(), key: 'answer'},
  {label: i18n.count(), key: 'numberAnswered'},
];

const styles = {
  header: {
    marginBottom: 0
  },
  tableContent: {
    marginTop: 10
  },
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
  };

  onChangeScript = scriptId => {
    const {setScriptId, asyncLoadAssessments, sectionId} = this.props;
    asyncLoadAssessments(sectionId, scriptId);
    setScriptId(scriptId);
  };

  render() {
    const {validScripts, scriptId, assessmentList, assessmentId,
      isLoading, isCurrentAssessmentSurvey, totalStudentSubmissions, exportableData} = this.props;

    return (
      <div>
        <div>
          <div style={{...h3Style, ...styles.header}}>
            {i18n.selectACourse()}
          </div>
          <ScriptSelector
            validScripts={validScripts}
            scriptId={scriptId}
            onChange={this.onChangeScript}
          />
          {!isLoading &&
            <div>
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
        {!isLoading &&
          <div style={styles.tableContent}>
            {/* Assessments */}
            {!isCurrentAssessmentSurvey &&
              <div>
                {totalStudentSubmissions > 0 &&
                  <div>
                    <CSVLink
                      filename="assessments.csv"
                      data={exportableData}
                      headers={CSV_ASSESSMENT_HEADERS}
                    >
                      <div>{i18n.downloadAssessmentCSV()}</div>
                    </CSVLink>
                    <MCAssessmentsOverviewContainer />
                    <StudentsMCSummaryContainer />
                    <MultipleChoiceByStudentContainer />
                    <FreeResponsesAssessmentsContainer />
                  </div>
                }
                {totalStudentSubmissions <= 0 &&
                  <h3>{i18n.emptyAssessmentSubmissions()}</h3>
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
                    <MCSurveyOverviewContainer />
                    <FreeResponseBySurveyQuestionContainer />
                  </div>
                }
                {totalStudentSubmissions <=0 &&
                  <h3>{i18n.emptySurveyOverviewTable()}</h3>
                }
              </div>
            }
          </div>
        }
        {isLoading &&
          <FontAwesome icon="spinner" className="fa-pulse fa-3x"/>
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
}))(SectionAssessments);
