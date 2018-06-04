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
  static propTypes = {
    questionAnswerData: PropTypes.arrayOf(questionDataPropType),
    studentAnswerData: studentAnswerDataPropType,
  };

  render() {
    const {questionAnswerData, studentAnswerData} = this.props;
    return (
      <div>
        <h1>Student Multiple Choice Overview Section</h1>
        <StudentAssessmentOverviewTable
          questionAnswerData={questionAnswerData}
          studentAnswerData={studentAnswerData}
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
