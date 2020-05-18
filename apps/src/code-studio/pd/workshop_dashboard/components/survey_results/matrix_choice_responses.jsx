// This component renders a survey answer for a matrix question
// It will split the matrix into individual questions and display them with
// the title "matrix title -> question title"

import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import ChoiceResponses from './choice_responses.jsx';

export default class MatrixChoiceResponses extends React.Component {
  static propTypes = {
    answer: PropTypes.object.isRequired,
    question: PropTypes.object.isRequired,
    section: PropTypes.string.isRequired,
    questionId: PropTypes.string.isRequired,
    facilitators: PropTypes.object
  };

  // facilitator responses are in form {facilitator1: {question1: <answer>,...}, facilitator2: {...}}
  // Extract out facilitator answers for a given question id and return in the format
  // {facilitator1: answer, facilitator2: answer}
  getFacilitatorAnswers(innerQuestionId) {
    const {answer} = this.props;
    let facilitatorAnswers = {};
    for (const facilitatorId in answer) {
      if (answer[facilitatorId][innerQuestionId]) {
        facilitatorAnswers[facilitatorId] =
          answer[facilitatorId][innerQuestionId];
      }
    }
    return facilitatorAnswers;
  }

  render() {
    const {section, answer, question, questionId, facilitators} = this.props;

    return (
      <div>
        {_.compact(
          Object.keys(question['rows']).map(innerQuestionId => {
            // innerAnswer is answer for innerQuestionId (question for this row)
            let innerAnswer = null;
            if (section === 'facilitator') {
              innerAnswer = this.getFacilitatorAnswers(innerQuestionId);
            } else {
              innerAnswer = answer[innerQuestionId];
            }

            if (!innerAnswer || _.isEmpty(innerAnswer)) {
              return null;
            }
            const numRespondents = answer.num_respondents;
            let possibleAnswersMap = question['columns'];
            let parsedQuestionName = `${question['title']} -> ${
              question['rows'][innerQuestionId]
            }`;
            return (
              <ChoiceResponses
                perFacilitator={section === 'facilitator'}
                numRespondents={numRespondents}
                question={parsedQuestionName}
                answers={innerAnswer}
                possibleAnswers={Object.keys(possibleAnswersMap)}
                possibleAnswersMap={possibleAnswersMap}
                key={`${questionId}-${innerQuestionId}`}
                answerType={'singleSelect'}
                facilitators={facilitators}
              />
            );
          })
        )}
      </div>
    );
  }
}
