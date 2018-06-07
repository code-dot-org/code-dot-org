import React, {Component, PropTypes} from 'react';
import StudentAssessmentOverviewTable from './StudentAssessmentOverviewTable';
import { studentAnswerDataPropType, questionStructurePropType } from './assessmentDataShapes';
import {
  getMultipleChoiceStructureForCurrentAssessment,
  getStudentMCResponsesForCurrentAssessment,
} from './sectionAssessmentsRedux';
import { connect } from 'react-redux';

class MultipleChoiceByStudentContainer extends Component {
  static propTypes = {
    multipleChoiceStructure: PropTypes.arrayOf(questionStructurePropType),
    studentAnswerData: PropTypes.arrayOf(studentAnswerDataPropType),
  };

  render() {
    const {multipleChoiceStructure, studentAnswerData} = this.props;
    return (
      <div>
        <h2>Multiple choice answers by student section</h2>
        {studentAnswerData.map((studentResponse, index) => (
          <div key={index}>
            {/* TODO(caleybrock): update to use heading from spec */}
            <h3>{`Here is how ${studentResponse.name} responded`}</h3>
            <StudentAssessmentOverviewTable
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
