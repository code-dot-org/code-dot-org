import React, {Component, PropTypes} from 'react';
import { setScriptId, validScriptPropType } from '@cdo/apps/redux/scriptSelectionRedux';
import {
  asyncLoadAssessments,
  getAssessmentsForCurrentScript,
  getAssessmentList,
  setAssessmentId,
} from '@cdo/apps/templates/sectionAssessments/sectionAssessmentsRedux';
import {connect} from 'react-redux';
import {h3Style} from "../../lib/ui/Headings";
import i18n from '@cdo/locale';
import ScriptSelector from '@cdo/apps/templates/sectionProgress/ScriptSelector';
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
    assessments: PropTypes.object,
    isLoadingAssessments: PropTypes.bool.isRequired,
    validScripts: PropTypes.arrayOf(validScriptPropType).isRequired,
    assessmentList: PropTypes.array.isRequired,
    scriptId: PropTypes.number,
    assessmentId: PropTypes.number,
    setScriptId: PropTypes.func.isRequired,
    setAssessmentId: PropTypes.func.isRequired,
    asyncLoadAssessments: PropTypes.func.isRequired
  };

  onChangeScript = scriptId => {
    const {setScriptId, asyncLoadAssessments, sectionId} = this.props;
    asyncLoadAssessments(sectionId, scriptId).then(() => {
      setScriptId(scriptId);
    });
  };

  render() {
    const {validScripts, scriptId, assessmentList, assessmentId} = this.props;

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
            Select an assessment or survey
          </div>
          <AssessmentSelector
            assessmentList={assessmentList}
            assessmentId={assessmentId}
            onChange={this.props.setAssessmentId}
          />
        </div>
        <div>
          This is a list of the questions for the assessments we get back.
          <br />
          <div>
          </div>
        </div>
      </div>
    );
  }
}

export const UnconnectedSectionAssessments = SectionAssessments;

export default connect(state => ({
  sectionId: state.sectionData.section.id,
  assessments: getAssessmentsForCurrentScript(state),
  isLoadingAssessments: state.sectionAssessments.isLoadingAssessments,
  validScripts: state.scriptSelection.validScripts,
  assessmentList: getAssessmentList(state),
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
