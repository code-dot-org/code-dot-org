import React, {Component, PropTypes} from 'react';
import { setScriptId, validScriptPropType } from '@cdo/apps/redux/scriptSelectionRedux';
import {
  asyncLoadAssessments,
  getCurrentScriptAssessmentList,
  setAssessmentId,
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
    asyncLoadAssessments(sectionId, scriptId);
    setScriptId(scriptId);
  };

  render() {
    const {validScripts, scriptId, assessmentList, assessmentId, isLoading} = this.props;

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
          <div>
            {/* Assessments */}
            <MCAssessmentsOverviewContainer />
            <StudentsMCSummaryContainer />
            <MultipleChoiceByStudentContainer />
            <FreeResponsesAssessmentsContainer />
            {/* Surveys */}
            <MCSurveyOverviewContainer />
            <FreeResponseBySurveyQuestionContainer />
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
