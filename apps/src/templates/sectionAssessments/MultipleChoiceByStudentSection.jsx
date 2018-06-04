import React, {Component, PropTypes} from 'react';
import StudentAssessmentOverviewTable from './StudentAssessmentOverviewTable';
import { studentAnswerDataPropType } from './assessmentDataShapes';
import {
  getQuestionAnswerData,
  getStudentAnswerData,
} from './sectionAssessmentsRedux';
import { connect } from 'react-redux';

class MultipleChoiceByStudentSection extends Component {
  static propTypes = {
    questionAnswerData: PropTypes.array,
    studentAnswerData: studentAnswerDataPropType,
  };

  render() {
    const {questionAnswerData, studentAnswerData} = this.props;
    return (
      <div>
        <h2>Multiple choice answers by student section</h2>
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
