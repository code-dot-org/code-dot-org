import React, {Component, PropTypes} from 'react';
import FreeResponsesAssessmentsTable from './FreeResponsesAssessmentsTable';
import {freeResponsesDataPropType} from './assessmentDataShapes';
import {
  getAssessmentsFreeResponseResults,
  ALL_STUDENT_FILTER,
  currentStudentHasResponses,
} from './sectionAssessmentsRedux';
import { connect } from 'react-redux';
import i18n from "@cdo/locale";

export const freeResponseSummaryPropType = PropTypes.shape({
  questionText:  PropTypes.string,
  responses: PropTypes.arrayOf(freeResponsesDataPropType),
});

class FreeResponsesAssessmentsContainer extends Component {
  static propTypes= {
    freeResponseQuestions: PropTypes.arrayOf(freeResponseSummaryPropType),
    studentId: PropTypes.number,
    currentStudentHasResponses: PropTypes.bool,
  };

  render() {
    const {freeResponseQuestions, studentId, currentStudentHasResponses} = this.props;
    return (
      <div>
        {(studentId === ALL_STUDENT_FILTER || currentStudentHasResponses) &&
          <div>
            {freeResponseQuestions.length > 0 &&
              <h2>{i18n.studentFreeResponseAnswers()}</h2>
            }
            {freeResponseQuestions.map((question, index) => (
              <div key={index}>
                <h3>{`${question.questionNumber}. ${question.questionText}`}</h3>
                <FreeResponsesAssessmentsTable
                  freeResponses={question.responses}
                />
              </div>
            ))}
          </div>
        }
      </div>
    );
  }
}

export const UnconnectedFreeResponsesAssessmentsContainer = FreeResponsesAssessmentsContainer;

export default connect(state => ({
  freeResponseQuestions: getAssessmentsFreeResponseResults(state),
  studentId: state.sectionAssessments.studentId,
  currentStudentHasResponses: currentStudentHasResponses(state),
}))(FreeResponsesAssessmentsContainer);

