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
        <h2>{i18n.studentFreeResponseAnswers()}</h2>
        {freeResponsesByQuestion.map((question, index) => (
          <div key={index}>
            <div style={styles.text}>
              {`${question.questionNumber}. ${question.questionText.slice(
                0,
                QUESTION_CHARACTER_LIMIT
              )}`}
              {question.questionText.length >= QUESTION_CHARACTER_LIMIT && (
                <button
                  type="button"
                  onClick={() => {
                    this.selectQuestion(question.questionNumber - 1);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    font: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  <span>{i18n.seeFullQuestion()}</span>
                </button>
              )}
            </div>
            <FreeResponsesSurveyTable freeResponses={question.answers} />
          </div>
        ))}
      </div>
    );
  }
}

const styles = {
  text: {
    font: 10,
    paddingTop: 20,
    paddingBottom: 20,
  },
};

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
