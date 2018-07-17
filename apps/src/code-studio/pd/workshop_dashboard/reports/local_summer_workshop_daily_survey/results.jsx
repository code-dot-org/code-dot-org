import React, {PropTypes} from 'react';
import {Tab, Tabs} from 'react-bootstrap';
import SingleChoiceResponses from '../../components/survey_results/single_choice_responses';
import TextResponses from '../../components/survey_results/text_responses';
import _ from 'lodash';

export default class Results extends React.Component {
  static propTypes = {
    questions: PropTypes.object,
    thisWorkshop: PropTypes.object,
    sessions: PropTypes.arrayOf(PropTypes.string),
    facilitators: PropTypes.object
  };

  state = {
    facilitatorIds: Object.keys(this.props.facilitators)
  };

  /**
   * Render results for either the facilitator specific or general questions
   */
  renderResultsForSessionQuestionSection(section, questions, answers) {
    return _.compact(Object.keys(questions).map((questionId, i) => {
      let question = questions[questionId];

      if (!question || _.isEmpty(answers[questionId])) {
        return null;
      }

      if (['scale', 'singleSelect'].includes(question['answer_type'])) {
        return (
          <SingleChoiceResponses
            question={question['text']}
            answers={answers[questionId]}
            possibleAnswers={question['options']}
            key={i}
            answerType={question['answer_type']}
            otherText={question['other_text']}
          />
        );
      } else if (question['answer_type'] === 'text') {
        return (
          <TextResponses
            question={question['text']}
            answers={answers[questionId]}
            key={i}
          />
        );
      }
    }));
  }

  renderResultsForSession(session) {
    return (
      <div>
        <h3>
          General Questions
        </h3>
        {
          this.renderResultsForSessionQuestionSection(
            'general',
            this.props.questions[session]['general'],
            this.props.thisWorkshop[session]['general']
          )
        }
        {
          !_.isEmpty(this.props.questions[session]['facilitator']) && (
            <div>
              <h3>
                Facilitator Specific Questions
              </h3>
              {
                this.renderResultsForSessionQuestionSection(
                  'facilitator',
                  this.props.questions[session]['facilitator'],
                  this.props.thisWorkshop[session]['facilitator']
                )
              }
            </div>
          )
        }
      </div>
    );
  }

  renderAllSessionsResults() {
    return this.props.sessions.map((session, i) => (
      <Tab eventKey={i + 1} key={i} title={`${session} (${this.props.thisWorkshop[session]['response_count'] || 0})`}>
        <br/>
        {this.renderResultsForSession(session)}
      </Tab>
    ));
  }

  render() {
    return (
      <Tabs id="SurveyTab">
        {this.renderAllSessionsResults()}
      </Tabs>
    );
  }
}
