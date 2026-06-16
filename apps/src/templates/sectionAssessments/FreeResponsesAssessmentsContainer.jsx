import Link from '@code-dot-org/component-library/link';
import {Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import i18n from '@cdo/locale';

import {
  freeResponsesDataPropType,
  QUESTION_CHARACTER_LIMIT,
} from './assessmentDataShapes';
import FreeResponsesAssessmentsTable from './FreeResponsesAssessmentsTable';
import {
  getAssessmentsFreeResponseResults,
  ALL_STUDENT_FILTER,
  currentStudentHasResponses,
  setQuestionIndex,
} from './sectionAssessmentsRedux';

import moduleStyles from './free-responses-container.module.scss';

export const freeResponseSummaryPropType = PropTypes.shape({
  questionText: PropTypes.string,
  responses: PropTypes.arrayOf(freeResponsesDataPropType),
});

class FreeResponsesAssessmentsContainer extends Component {
  static propTypes = {
    freeResponseQuestions: PropTypes.arrayOf(freeResponseSummaryPropType),
    studentId: PropTypes.number,
    currentStudentHasResponses: PropTypes.bool,
    openDialog: PropTypes.func.isRequired,
    setQuestionIndex: PropTypes.func.isRequired,
  };

  selectQuestion = index => {
    this.props.setQuestionIndex(index);
    this.props.openDialog();
  };

  render() {
    const {freeResponseQuestions, studentId, currentStudentHasResponses} =
      this.props;
    return (
      <div>
        {(studentId === ALL_STUDENT_FILTER || currentStudentHasResponses) && (
          <div>
            {freeResponseQuestions.length > 0 && (
              <Typography variant="h2">
                {i18n.studentFreeResponseAnswers()}
              </Typography>
            )}
            {freeResponseQuestions.map((question, index) => (
              <div key={index}>
                <div className={moduleStyles.questionLabel}>
                  <Typography variant="body3">
                    {`${question.questionNumber}. ${question.questionText.slice(
                      0,
                      QUESTION_CHARACTER_LIMIT
                    )}`}
                  </Typography>
                  {question.questionText.length >= QUESTION_CHARACTER_LIMIT && (
                    <Link
                      size="s"
                      onClick={e => {
                        // Link defaults href to "#"; suppress the page-top jump
                        // since this opens a modal rather than navigating.
                        e.preventDefault();
                        this.selectQuestion(question.questionNumber - 1);
                      }}
                    >
                      {i18n.seeFullQuestion()}
                    </Link>
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

export const UnconnectedFreeResponsesAssessmentsContainer =
  FreeResponsesAssessmentsContainer;

export default connect(
  state => ({
    freeResponseQuestions: getAssessmentsFreeResponseResults(state),
    studentId: state.sectionAssessments.studentId,
    currentStudentHasResponses: currentStudentHasResponses(state),
  }),
  dispatch => ({
    setQuestionIndex(questionIndex) {
      dispatch(setQuestionIndex(questionIndex));
    },
  })
)(FreeResponsesAssessmentsContainer);
