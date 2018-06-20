import React, {Component, PropTypes} from 'react';
import { setScriptId, validScriptPropType } from '@cdo/apps/redux/scriptSelectionRedux';
import {
  asyncLoadAssessments,
  getCurrentScriptAssessmentList,
  getMultipleChoiceSurveyResults,
  setAssessmentId,
} from '@cdo/apps/templates/sectionAssessments/sectionAssessmentsRedux';
import {connect} from 'react-redux';
import {h3Style} from "../../lib/ui/Headings";
import i18n from '@cdo/locale';
import ScriptSelector from '@cdo/apps/templates/sectionProgress/ScriptSelector';
import MCAssessmentsOverviewContainer from './MCAssessmentsOverviewContainer';
import MultipleChoiceByStudentContainer from './MultipleChoiceByStudentContainer';
import StudentsMCSummaryContainer from './StudentsMCSummaryContainer';
import FreeResponseBySurveyQuestionContainer from './FreeResponseBySurveyQuestionContainer';
import MultipleChoiceSurveyOverviewTable from './MultipleChoiceSurveyOverviewTable';
import AssessmentSelector from './AssessmentSelector';

const styles = {
  header: {
    marginBottom: 0
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
  };

  onChangeScript = scriptId => {
    const {setScriptId, asyncLoadAssessments, sectionId} = this.props;
    asyncLoadAssessments(sectionId, scriptId).then(() => {
      setScriptId(scriptId);
    });
  };

  render() {
    const {validScripts, scriptId, assessmentList, assessmentId, multipleChoiceSurveyResults} = this.props;

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
        </div>
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
          {/* Assessments */}
          <MCAssessmentsOverviewContainer questionAnswerData={[]} />
          <StudentsMCSummaryContainer />
          <MultipleChoiceByStudentContainer />
          {/* Surveys */}
          {multipleChoiceSurveyResults.length > 0 &&
            <MultipleChoiceSurveyOverviewTable
              multipleChoiceSurveyData={multipleChoiceSurveyResults}
            />
          }
          <FreeResponseBySurveyQuestionContainer />
      </div>
    );
  }
}

export const UnconnectedSectionAssessments = SectionAssessments;

export default connect(state => ({
  sectionId: state.sectionData.section.id,
  isLoading: state.sectionAssessments.isLoading,
  validScripts: state.scriptSelection.validScripts,
  assessmentList: getCurrentScriptAssessmentList(state),
  scriptId: state.scriptSelection.scriptId,
  assessmentId: state.sectionAssessments.assessmentId,
  multipleChoiceSurveyResults: getMultipleChoiceSurveyResults(state),
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
