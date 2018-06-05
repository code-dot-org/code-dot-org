import React, {Component, PropTypes} from 'react';
import StudentAssessmentOverviewTable from './StudentAssessmentOverviewTable';
import { studentAnswerDataPropType } from './assessmentDataShapes';
import {
  getMultipleChoiceStructureForCurrentAssessment,
  getStudentAnswerData,
} from './sectionAssessmentsRedux';
import { connect } from 'react-redux';

class MultipleChoiceByStudentSection extends Component {
  // TODO(caleybrock): define a multipleChoiceStructure PropType
  static propTypes = {
    multipleChoiceStructure: PropTypes.array,
    studentAnswerData: PropTypes.arrayOf(studentAnswerDataPropType),
  };

  render() {
    const {multipleChoiceStructure, studentAnswerData} = this.props;
    return (
      <div>
        <h2>Multiple choice answers by student section</h2>
        {studentAnswerData.map((studentResponse, index) => (
          <div key={index}>
            <h3>{`Student number ${index}`}</h3>
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

export const UnconnectedMultipleChoiceByStudentSection = MultipleChoiceByStudentSection;

export default connect(state => ({
  multipleChoiceStructure: getMultipleChoiceStructureForCurrentAssessment(state),
  studentAnswerData: getStudentAnswerData(state),
}))(MultipleChoiceByStudentSection);
