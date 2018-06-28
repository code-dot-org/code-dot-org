import React, {Component, PropTypes} from 'react';
import SingleStudentAssessmentsMCTable from './SingleStudentAssessmentsMCTable';
import { studentWithResponsesPropType, multipleChoiceQuestionPropType } from './assessmentDataShapes';
import {
  getMultipleChoiceStructureForCurrentAssessment,
  getStudentMCResponsesForCurrentAssessment,
} from './sectionAssessmentsRedux';
import i18n from "@cdo/locale";
import { connect } from 'react-redux';

class MultipleChoiceByStudentContainer extends Component {
  static propTypes = {
    multipleChoiceStructure: PropTypes.arrayOf(multipleChoiceQuestionPropType),
    studentAnswerData: PropTypes.arrayOf(studentWithResponsesPropType),
  };

  render() {
    const {multipleChoiceStructure, studentAnswerData} = this.props;
    return (
      <div>
        {studentAnswerData.map((studentResponse, index) => (
          <div key={index}>
            <h2>{i18n.multipleChoiceStudentOverview({studentName: studentResponse.name})}</h2>
            <SingleStudentAssessmentsMCTable
              questionAnswerData={multipleChoiceStructure}
              studentAnswerData={studentResponse}
            />
          </div>
        ))}
      </div>
    );
  }
}

export const UnconnectedMultipleChoiceByStudentContainer = MultipleChoiceByStudentContainer;

export default connect(state => ({
  multipleChoiceStructure: getMultipleChoiceStructureForCurrentAssessment(state),
  studentAnswerData: getStudentMCResponsesForCurrentAssessment(state),
}))(MultipleChoiceByStudentContainer);
