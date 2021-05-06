import PropTypes from 'prop-types';
import React, {Component} from 'react';
import FreeResponsesAssessmentsTable from './FreeResponsesAssessmentsTable';
import {
  freeResponsesDataPropType,
  QUESTION_CHARACTER_LIMIT
} from './assessmentDataShapes';
import {
  getAssessmentsFreeResponseResults,
  ALL_STUDENT_FILTER,
  currentStudentHasResponses,
  setQuestionIndex
} from './sectionAssessmentsRedux';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';

export const freeResponseSummaryPropType = PropTypes.shape({
  questionText: PropTypes.string,
  responses: PropTypes.arrayOf(freeResponsesDataPropType)
});

class FreeResponsesAssessmentsContainer extends Component {
  static propTypes = {
    freeResponseQuestions: PropTypes.arrayOf(freeResponseSummaryPropType),
    studentId: PropTypes.number,
    currentStudentHasResponses: PropTypes.bool,
    openDialog: PropTypes.func.isRequired,
    setQuestionIndex: PropTypes.func.isRequired
  };

  selectQuestion = index => {
    this.props.setQuestionIndex(index);
    this.props.openDialog();
  };

  render() {
    const {
      freeResponseQuestions,
      studentId,
      currentStudentHasResponses
    } = this.props;
    return (
      <div>
        {(studentId === ALL_STUDENT_FILTER || currentStudentHasResponses) && (
          <div>
            {freeResponseQuestions.length > 0 && (
              <h2>{i18n.studentFreeResponseAnswers()}</h2>
            )}
            {freeResponseQuestions.map((question, index) => (
              <div key={index}>
                <div style={styles.text}>
                  {`${question.questionNumber}. ${question.questionText.slice(
                    0,
                    QUESTION_CHARACTER_LIMIT
                  )}`}
                  {question.questionText.length >= QUESTION_CHARACTER_LIMIT && (
                    <a
                      onClick={() => {
                        this.selectQuestion(question.questionNumber - 1);
                      }}
                    >
                      <span>{i18n.seeFullQuestion()}</span>
                    </a>
                  )}
                </div>
                <FreeResponsesAssessmentsTable
                  freeResponses={question.responses}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  text: {
    font: 10,
    paddingTop: 20,
    paddingBottom: 20
  }
};

export const UnconnectedFreeResponsesAssessmentsContainer = FreeResponsesAssessmentsContainer;

export default connect(
  state => ({
    freeResponseQuestions: getAssessmentsFreeResponseResults(state),
    studentId: state.sectionAssessments.studentId,
    currentStudentHasResponses: currentStudentHasResponses(state)
  }),
  dispatch => ({
    setQuestionIndex(questionIndex) {
      dispatch(setQuestionIndex(questionIndex));
    }
  })
)(FreeResponsesAssessmentsContainer);
