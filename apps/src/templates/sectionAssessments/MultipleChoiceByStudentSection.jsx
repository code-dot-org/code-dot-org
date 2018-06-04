import React, {Component, PropTypes} from 'react';
import StudentAssessmentOverviewTable from './StudentAssessmentOverviewTable';
import {
  studentAnswerDataPropType,
  questionDataPropType,
} from './assessmentDataShapes';
import {
  getQuestionAnswerData,
  getStudentAnswerData,
} from './sectionAssessmentsRedux';
import { connect } from 'react-redux';

class MultipleChoiceByStudentSection extends Component {
  static PropTypes = {
    questionAnswerData: PropTypes.arrayOf(questionDataPropType),
    studentAnswerData: PropTypes.arrayOf(studentAnswerDataPropType)
  };

  render() {
    return (
      <div>
        <h1>Student Multiple Choice Overview Section</h1>
        <StudentAssessmentOverviewTable
          questionAnswerData={[]}
          studentAnswerData={[]}
        />
      </div>
    );
  }
}

export const UnconnectedMultipleChoiceByStudentSection = MultipleChoiceByStudentSection;

export default connect(state => ({
  questionAnswerData: getQuestionAnswerData(state),
  studentAnswerData: getStudentAnswerData(state),
}))(MultipleChoiceByStudentSection);
