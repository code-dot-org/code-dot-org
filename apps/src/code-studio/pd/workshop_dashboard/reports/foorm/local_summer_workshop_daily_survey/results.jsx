import PropTypes from 'prop-types';
import React from 'react';
import {Tab, Tabs} from 'react-bootstrap';
import ChoiceResponses from '../../../components/survey_results/choice_responses';
import TextResponses from '../../../components/survey_results/text_responses';
import _ from 'lodash';

export default class Results extends React.Component {
  static propTypes = {
    questions: PropTypes.object.isRequired,
    thisWorkshop: PropTypes.object.isRequired,
    sessions: PropTypes.arrayOf(PropTypes.string).isRequired,
    courseName: PropTypes.string
    // workshopRollups: PropTypes.object,
    // facilitatorRollups: PropTypes.object
  };

  /**
   * Render results for either the facilitator specific or general questions
   * section: name of section
   * questions: all questions, keyed by survey name
   * answers: hash of {survey_name : {answers hash}}
   */
  renderResultsForSessionQuestionSection(section, questions, answers) {
    return _.compact(
      Object.keys(answers).map((surveyId, i) => {
        let surveyQuestions = questions[surveyId];
        if (!surveyQuestions) {
          return null;
        }

        Object.keys(answers[surveyId]).map((questionId, j) => {
          let question = surveyQuestions[questionId];
          if (!question) {
            return null;
          }

          let answer = answers[surveyId][questionId];
          if (
            ['scale', 'singleSelect', 'multiSelect'].includes(question['type'])
          ) {
            // numRespondents will get either a value (for multiSelect) or undefined.
            const numRespondents = answer.num_respondents;

            // Make a copy of the answers without the num_respondents field.
            const filteredAnswers = _.omit(answer, 'num_respondents');

            return (
              <ChoiceResponses
                perFacilitator={section === 'facilitator'}
                numRespondents={numRespondents}
                question={question['title']}
                answers={filteredAnswers}
                possibleAnswers={question['choices']}
                key={i * j}
                answerType={question['type']}
                /*otherText={question['other_text']}*/
              />
            );
          } else if (question['type'] === 'text') {
            return (
              <TextResponses
                question={question['text']}
                answers={answer}
                key={i}
              />
            );
          }
        });
      })
    );
  }

  renderResultsForSession(session) {
    return (
      <div>
        <h3>General Questions</h3>
        {this.renderResultsForSessionQuestionSection(
          'general',
          this.props.questions,
          this.props.thisWorkshop[session]
        )}
        {/* {!_.isEmpty(this.props.questions[session]['facilitator']) && (
          <div>
            <h3>Facilitator Specific Questions</h3>
            {this.renderResultsForSessionQuestionSection(
              'facilitator',
              this.props.questions[session]['facilitator'],
              this.props.thisWorkshop[session]['facilitator']
            )}
          </div>
        )} */}
      </div>
    );
  }

  renderAllSessionsResults() {
    return this.props.sessions.map((session, i) => (
      <Tab
        eventKey={i + 1}
        key={i}
        title={`${session} (${this.props.thisWorkshop[session][
          'response_count'
        ] || 0})`}
      >
        <br />
        {this.renderResultsForSession(session)}
      </Tab>
    ));
  }

  // renderSurveyRollups() {
  //   let tabs = [];
  //   let key = 0;

  //   if (this.props.workshopRollups) {
  //     key += 1;
  //     tabs.push(
  //       <Tab
  //         eventKey={this.props.sessions.length + key}
  //         key={key}
  //         title="Workshop Rollups"
  //       >
  //         <SurveyRollupTable
  //           courseName={this.props.courseName}
  //           rollups={this.props.workshopRollups.rollups}
  //           questions={this.props.workshopRollups.questions}
  //           facilitators={this.props.workshopRollups.facilitators}
  //         />
  //       </Tab>
  //     );
  //   }

  //   if (this.props.facilitatorRollups) {
  //     key += 1;
  //     tabs.push(
  //       <Tab
  //         eventKey={this.props.sessions.length + key}
  //         key={key}
  //         title="Facilitator Rollups"
  //       >
  //         <SurveyRollupTable
  //           courseName={this.props.courseName}
  //           rollups={this.props.facilitatorRollups.rollups}
  //           questions={this.props.facilitatorRollups.questions}
  //           facilitators={this.props.facilitatorRollups.facilitators}
  //         />
  //       </Tab>
  //     );
  //   }

  //   return tabs;
  // }

  render() {
    return (
      <Tabs id="SurveyTab">
        {this.renderAllSessionsResults()}
        {/*this.renderSurveyRollups()*/}
      </Tabs>
    );
  }
}
