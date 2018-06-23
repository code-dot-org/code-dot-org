import React, {Component, PropTypes} from 'react';
import FreeResponsesSurveyTable from './FreeResponsesSurveyTable';
import {
  getSurveyFreeResponseQuestions,
} from './sectionAssessmentsRedux';
import { connect } from 'react-redux';

const freeResponseQuestionsPropType = PropTypes.shape({
  questionNumber: PropTypes.number,
  questionText: PropTypes.string,
  answers: PropTypes.array,
});

class FreeResponseBySurveyQuestionContainer extends Component {
  static propTypes = {
    freeResponsesByQuestion: PropTypes.arrayOf(freeResponseQuestionsPropType),
  };

  render() {
    const {freeResponsesByQuestion} = this.props;
    return (
      <div>
        <h2>Free response questions for this survey</h2>
        {freeResponsesByQuestion.map((question, index) => (
          <div key={index}>
            <h3>{`${question.questionNumber}. ${question.questionText}`}</h3>
            <FreeResponsesSurveyTable
              freeResponses={question.answers}
            />
          </div>
        ))}
      </div>
    );
  }
}

export const UnconnectedFreeResponseBySurveyQuestionContainer = FreeResponseBySurveyQuestionContainer;

export default connect(state => ({
  freeResponsesByQuestion: getSurveyFreeResponseQuestions(state),
}))(FreeResponseBySurveyQuestionContainer);
