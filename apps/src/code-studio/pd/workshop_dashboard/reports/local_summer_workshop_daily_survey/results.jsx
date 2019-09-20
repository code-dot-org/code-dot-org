import PropTypes from 'prop-types';
import React from 'react';
import {Tab, Tabs} from 'react-bootstrap';
import ChoiceResponses from '../../components/survey_results/choice_responses';
import FacilitatorAveragesTable from '../../components/survey_results/facilitator_averages_table';
import TextResponses from '../../components/survey_results/text_responses';
import _ from 'lodash';
import experiments from '@cdo/apps/util/experiments';

export default class Results extends React.Component {
  static propTypes = {
    questions: PropTypes.object.isRequired,
    thisWorkshop: PropTypes.object.isRequired,
    sessions: PropTypes.arrayOf(PropTypes.string).isRequired,
    facilitators: PropTypes.object,
    facilitatorAverages: PropTypes.object,
    facilitatorResponseCounts: PropTypes.object,
    courseName: PropTypes.string.isRequired
  };

  static defaultProps = {
    facilitators: {},
    facilitatorAverages: {},
    facilitatorResponseCounts: {}
  };

  state = {
    facilitatorIds: Object.keys(this.props.facilitators)
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

  renderFacilitatorAverages() {
    return Object.keys(this.props.facilitators).map((facilitator_id, i) => (
      <Tab
        eventKey={this.props.sessions.length + i + 1}
        key={i}
        title={this.props.facilitators[facilitator_id]}
      >
        <FacilitatorAveragesTable
          facilitatorAverages={
            this.props.facilitatorAverages[
              this.props.facilitators[facilitator_id]
            ]
          }
          facilitatorId={parseInt(facilitator_id, 10)}
          facilitatorName={this.props.facilitators[facilitator_id]}
          questions={this.props.facilitatorAverages['questions']}
          courseName={this.props.courseName}
          facilitatorResponseCounts={this.props.facilitatorResponseCounts}
        />
      </Tab>
    ));
  }

  renderSurveyRollups() {
    return [
      <Tab
        eventKey={this.props.sessions.length + 1}
        key={1}
        title="Workshop Rollups"
      />,
      <Tab
        eventKey={this.props.sessions.length + 2}
        key={2}
        title="Facilitator Rollups"
      />
    ];
  }

  render() {
    return (
      <Tabs id="SurveyTab">
        {this.renderAllSessionsResults()}
        {experiments.isEnabled(experiments.ROLLUP_SURVEY_REPORT)
          ? this.renderSurveyRollups()
          : this.renderFacilitatorAverages()}
      </Tabs>
    );
  }
}
