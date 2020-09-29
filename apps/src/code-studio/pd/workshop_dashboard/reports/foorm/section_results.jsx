import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import MatrixChoiceResponses from '../../components/survey_results/matrix_choice_responses';
import SingleQuestionChoiceResponses from '../../components/survey_results/single_question_choice_responses';
import TextResponses from '../../components/survey_results/text_responses';

export default class SectionResults extends React.Component {
  static propTypes = {
    section: PropTypes.string.isRequired,
    answers: PropTypes.object.isRequired,
    questions: PropTypes.object.isRequired,
    facilitators: PropTypes.object
  };

  renderQuestionResults(surveyQuestions, questionId, surveyId) {
    const {answers, section, facilitators} = this.props;
    let question = surveyQuestions[questionId];
    let answer = answers[surveyId][questionId];
    if (!answer) {
      return null;
    }

    if (['scale', 'singleSelect', 'multiSelect'].includes(question['type'])) {
      return (
        <SingleQuestionChoiceResponses
          question={question}
          questionId={questionId}
          answer={answer}
          section={section}
          facilitators={facilitators}
        />
      );
    } else if (question['type'] === 'matrix') {
      if (!question['rows']) {
        return null;
      }
      return (
        <MatrixChoiceResponses
          question={question}
          questionId={questionId}
          answer={answer}
          section={section}
          facilitators={facilitators}
        />
      );
    } else if (question['type'] === 'text') {
      return (
        <TextResponses
          question={question['title'] || questionId}
          answers={answer}
          key={questionId}
          facilitators={facilitators}
        />
      );
    }
  }

  render() {
    const {answers, questions} = this.props;
    return (
      <div>
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
