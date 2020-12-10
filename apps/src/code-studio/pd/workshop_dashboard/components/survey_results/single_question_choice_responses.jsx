// This component renders a survey answer that consists of one question
// Ex. checkbox or radio button question

import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import ChoiceResponses from './choice_responses.jsx';

export default class SingleQuestionChoiceResponses extends React.Component {
  static propTypes = {
    answer: PropTypes.object.isRequired,
    question: PropTypes.object.isRequired,
    section: PropTypes.string.isRequired,
    questionId: PropTypes.string.isRequired,
    facilitators: PropTypes.object
  };

  render() {
    const {section, answer, question, questionId, facilitators} = this.props;
    // numRespondents will get either a value (for multiSelect) or undefined.
    const numRespondents = answer.num_respondents;

    // Make a copy of the answers without the num_respondents and other_answers fields.
    const filteredAnswers = _.omit(answer, [
      'num_respondents',
      'other_answers'
    ]);
    let possibleAnswersMap = question['choices'];

    return (
      <ChoiceResponses
        perFacilitator={section === 'facilitator'}
        numRespondents={numRespondents}
        question={question['title'] || questionId}
        answers={filteredAnswers}
        possibleAnswers={Object.keys(possibleAnswersMap)}
        possibleAnswersMap={possibleAnswersMap}
        answerType={question['type']}
        otherText={question['other_text']}
        otherAnswers={answer['other_answers']}
        key={questionId}
        facilitators={facilitators}
      />
    );
  }
}
