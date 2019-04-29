import PropTypes from 'prop-types';
import React, {Component} from 'react';
import MatchByStudentTable from './MatchByStudentTable';
import {
  studentWithResponsesPropType,
  multipleChoiceQuestionPropType
} from './assessmentDataShapes';
import {
  getMultipleChoiceStructureForCurrentAssessment,
  getStudentMCResponsesForCurrentAssessment,
  ALL_STUDENT_FILTER,
  currentStudentHasResponses
} from './sectionAssessmentsRedux';
import i18n from '@cdo/locale';
import {connect} from 'react-redux';

class MatchByStudentContainer extends Component {
  static propTypes = {
    multipleChoiceStructure: PropTypes.arrayOf(multipleChoiceQuestionPropType),
    studentAnswerData: studentWithResponsesPropType,
    studentId: PropTypes.number,
    currentStudentHasResponses: PropTypes.bool
  };

  render() {
    const {
      multipleChoiceStructure,
      studentAnswerData,
      studentId,
      currentStudentHasResponses
    } = this.props;
    return (
      <div>
        {studentId !== ALL_STUDENT_FILTER && currentStudentHasResponses && (
          <div>
            <h2>
              {i18n.matchStudentOverview({
                studentName: studentAnswerData.name
              })}
            </h2>
            <MatchByStudentTable
              questionAnswerData={multipleChoiceStructure}
              studentAnswerData={studentAnswerData}
            />
          </div>
        )}
      </div>
    );
  }
}

export const UnconnectedMatchByStudentContainer = MatchByStudentContainer;

export default connect(state => ({
  multipleChoiceStructure: getMultipleChoiceStructureForCurrentAssessment(
    state
  ),
  studentAnswerData: getStudentMCResponsesForCurrentAssessment(state),
  studentId: state.sectionAssessments.studentId,
  currentStudentHasResponses: currentStudentHasResponses(state)
}))(MatchByStudentContainer);
