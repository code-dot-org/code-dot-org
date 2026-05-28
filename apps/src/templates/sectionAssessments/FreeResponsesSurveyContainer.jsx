import Link from '@code-dot-org/component-library/link';
import {Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import i18n from '@cdo/locale';

import {QUESTION_CHARACTER_LIMIT} from './assessmentDataShapes';
import FreeResponsesSurveyTable from './FreeResponsesSurveyTable';
import {
  getSurveyFreeResponseQuestions,
  setQuestionIndex,
} from './sectionAssessmentsRedux';

import moduleStyles from './free-responses-container.module.scss';

const freeResponseQuestionsPropType = PropTypes.shape({
  questionNumber: PropTypes.number,
  questionText: PropTypes.string,
  answers: PropTypes.array,
});

class FreeResponsesSurveyContainer extends Component {
  static propTypes = {
    freeResponsesByQuestion: PropTypes.arrayOf(freeResponseQuestionsPropType),
    openDialog: PropTypes.func.isRequired,
    setQuestionIndex: PropTypes.func.isRequired,
  };

  selectQuestion = index => {
    this.props.setQuestionIndex(index);
    this.props.openDialog();
  };

  render() {
    const {freeResponsesByQuestion} = this.props;
    return (
      <div>
        <Typography variant="h2">
          {i18n.studentFreeResponseAnswers()}
        </Typography>
        {freeResponsesByQuestion.map((question, index) => (
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
            <FreeResponsesSurveyTable freeResponses={question.answers} />
          </div>
        ))}
      </div>
    );
  }
}

export const UnconnectedFreeResponsesSurveyContainer =
  FreeResponsesSurveyContainer;

export default connect(
  state => ({
    freeResponsesByQuestion: getSurveyFreeResponseQuestions(state),
  }),
  dispatch => ({
    setQuestionIndex(questionIndex) {
      dispatch(setQuestionIndex(questionIndex));
    },
  })
)(FreeResponsesSurveyContainer);
