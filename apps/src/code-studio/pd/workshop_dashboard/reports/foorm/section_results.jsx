import PropTypes from 'prop-types';
import React from 'react';
import ChoiceResponses from '../../components/survey_results/choice_responses';
import TextResponses from '../../components/survey_results/text_responses';
import _ from 'lodash';

export default class SectionResults extends React.Component {
  static propTypes = {
    section: PropTypes.string.isRequired,
    answers: PropTypes.object.isRequired,
    questions: PropTypes.object.isRequired
  };

  renderQuestionResults(surveyQuestions, questionId, surveyId) {
    const {answers, section} = this.props;
    let question = surveyQuestions[questionId];
    let answer = answers[surveyId][questionId];
    if (!answer) {
      return null;
    }

    if (['scale', 'singleSelect', 'multiSelect'].includes(question['type'])) {
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
        />
      );
    } else if (question['type'] === 'matrix') {
      // render choice response per question inside matrix
      if (!question['rows']) {
        return null;
      }
      return Object.keys(question['rows']).map(innerQuestionId => {
        const innerAnswer = answer[innerQuestionId];
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
            answerType={'singleSelect'}
          />
        );
      });
    } else if (question['type'] === 'text') {
      return (
        <TextResponses
          question={question['title'] || questionId}
          answers={answer}
        />
      );
    }
  }

  render() {
    const {answers, questions} = this.props;
    return (
      <div>
        <h3>General Questions</h3>
        {_.compact(
          Object.keys(answers).map(surveyId => {
            let surveyQuestions = questions[surveyId];
            if (!surveyQuestions) {
              return null;
            }

            return _.compact(
              Object.keys(surveyQuestions).map(questionId => {
                return this.renderQuestionResults(
                  surveyQuestions,
                  questionId,
                  surveyId
                );
              })
            );
          })
        )}
      </div>
    );
  }
}
