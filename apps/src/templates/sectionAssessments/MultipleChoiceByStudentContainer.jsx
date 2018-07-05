import React, {Component, PropTypes} from 'react';
import SingleStudentAssessmentsMCTable from './SingleStudentAssessmentsMCTable';
import { studentWithResponsesPropType, multipleChoiceQuestionPropType } from './assessmentDataShapes';
import {
  getMultipleChoiceStructureForCurrentAssessment,
  getStudentMCResponsesForCurrentAssessment,
  ALL_STUDENT_FILTER,
} from './sectionAssessmentsRedux';
import i18n from "@cdo/locale";
import { connect } from 'react-redux';

class MultipleChoiceByStudentContainer extends Component {
  static propTypes = {
    multipleChoiceStructure: PropTypes.arrayOf(multipleChoiceQuestionPropType),
    studentAnswerData: studentWithResponsesPropType,
    studentId: PropTypes.number,
  };

  render() {
    const {multipleChoiceStructure, studentAnswerData, studentId} = this.props;
    return (
      <div>
        {studentId !== ALL_STUDENT_FILTER &&
          <div>
              <h2>{i18n.multipleChoiceStudentOverview({studentName: studentAnswerData.name})}</h2>
              <SingleStudentAssessmentsMCTable
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
}))(MultipleChoiceByStudentContainer);
