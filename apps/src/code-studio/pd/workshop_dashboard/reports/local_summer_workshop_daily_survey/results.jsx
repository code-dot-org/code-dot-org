import PropTypes from 'prop-types';
import React from 'react';
import {Tab, Tabs} from 'react-bootstrap';
import ChoiceResponses from '../../components/survey_results/choice_responses';
import SurveyRollupTable from '../../components/survey_results/survey_rollup_table';
import TextResponses from '../../components/survey_results/text_responses';
import _ from 'lodash';

export default class Results extends React.Component {
  static propTypes = {
    questions: PropTypes.object.isRequired,
    thisWorkshop: PropTypes.object.isRequired,
    sessions: PropTypes.arrayOf(PropTypes.string).isRequired,
    courseName: PropTypes.string,
    workshopRollups: PropTypes.object,
    facilitatorRollups: PropTypes.object
  };

  /**
   * Render results for either the facilitator specific or general questions
   */
  renderResultsForSessionQuestionSection(section, questions, answers) {
    return _.compact(
      Object.keys(questions).map((questionId, i) => {
        let question = questions[questionId];

        if (!question || _.isEmpty(answers[questionId])) {
          return null;
        }

        if (
          ['scale', 'singleSelect', 'multiSelect'].includes(
            question['answer_type']
          )
        ) {
          // numRespondents will get either a value (for multiSelect) or undefined.
          const numRespondents = answers[questionId].num_respondents;

          // Make a copy of the answers without the num_respondents field.
          const filteredAnswers = _.omit(
            answers[questionId],
            'num_respondents'
          );

          return (
            <ChoiceResponses
              perFacilitator={section === 'facilitator'}
              numRespondents={numRespondents}
              question={question['text']}
              answers={filteredAnswers}
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
      })
    );
  }

  renderResultsForSession(session) {
    return (
      <div>
        <h3>General Questions</h3>
        {this.renderResultsForSessionQuestionSection(
          'general',
          this.props.questions[session]['general'],
          this.props.thisWorkshop[session]['general']
        )}
        {!_.isEmpty(this.props.questions[session]['facilitator']) && (
          <div>
            <h3>Facilitator Specific Questions</h3>
            {this.renderResultsForSessionQuestionSection(
              'facilitator',
              this.props.questions[session]['facilitator'],
              this.props.thisWorkshop[session]['facilitator']
            )}
          </div>
        )}
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

  renderSurveyRollups() {
    let tabs = [];
    let key = 0;

    if (this.props.workshopRollups) {
      key += 1;
      tabs.push(
        <Tab
          eventKey={this.props.sessions.length + key}
          key={key}
          title="Workshop Rollups"
        >
          <SurveyRollupTable
            courseName={this.props.courseName}
            rollups={this.props.workshopRollups.rollups}
            questions={this.props.workshopRollups.questions}
            facilitators={this.props.workshopRollups.facilitators}
          />
        </Tab>
      );
    }

    if (this.props.facilitatorRollups) {
      key += 1;
      tabs.push(
        <Tab
          eventKey={this.props.sessions.length + key}
          key={key}
          title="Facilitator Rollups"
        >
          <SurveyRollupTable
            courseName={this.props.courseName}
            rollups={this.props.facilitatorRollups.rollups}
            questions={this.props.facilitatorRollups.questions}
            facilitators={this.props.facilitatorRollups.facilitators}
          />
        </Tab>
      );
    }

    return tabs;
  }

  render() {
    return (
      <Tabs id="SurveyTab">
        {this.renderAllSessionsResults()}
        {this.renderSurveyRollups()}
      </Tabs>
    );
  }
}
