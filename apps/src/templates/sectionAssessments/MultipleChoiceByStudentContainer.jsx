import React, {Component, PropTypes} from 'react';
import MultipleChoiceByStudentTable from './MultipleChoiceByStudentTable';
import { studentWithResponsesPropType, multipleChoiceQuestionPropType } from './assessmentDataShapes';
import {
  getMultipleChoiceStructureForCurrentAssessment,
  getStudentMCResponsesForCurrentAssessment,
  ALL_STUDENT_FILTER,
  currentStudentHasResponses,
} from './sectionAssessmentsRedux';
import i18n from "@cdo/locale";
import { connect } from 'react-redux';

class MultipleChoiceByStudentContainer extends Component {
  static propTypes = {
    multipleChoiceStructure: PropTypes.arrayOf(multipleChoiceQuestionPropType),
    studentAnswerData: studentWithResponsesPropType,
    studentId: PropTypes.number,
    currentStudentHasResponses: PropTypes.bool,
  };

  render() {
    const {multipleChoiceStructure, studentAnswerData, studentId, currentStudentHasResponses} = this.props;
    return (
      <div>
        {(studentId !== ALL_STUDENT_FILTER && currentStudentHasResponses) &&
          <div>
              <h2>{i18n.multipleChoiceStudentOverview({studentName: studentAnswerData.name})}</h2>
              <MultipleChoiceByStudentTable
                questionAnswerData={multipleChoiceStructure}
                studentAnswerData={studentAnswerData}
              />
          </div>
        }
      </div>
    );
  }
}

export const UnconnectedMultipleChoiceByStudentContainer = MultipleChoiceByStudentContainer;

export default connect(state => ({
  multipleChoiceStructure: getMultipleChoiceStructureForCurrentAssessment(state),
  studentAnswerData: getStudentMCResponsesForCurrentAssessment(state),
  studentId: state.sectionAssessments.studentId,
  currentStudentHasResponses: currentStudentHasResponses(state),
}))(MultipleChoiceByStudentContainer);
