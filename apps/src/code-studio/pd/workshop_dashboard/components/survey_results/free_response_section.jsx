import PropTypes from 'prop-types';
import React from 'react';
import {Well} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import _ from 'lodash';

export default class FreeResponseSection extends React.Component {
  static propTypes = {
    questions: PropTypes.arrayOf(PropTypes.object).isRequired,
    responseData: PropTypes.object.isRequired,
  };

  renderFacilitatorsAndAnswers(answers) {
    return Object.keys(answers).map((facilitator_name, i) => {
      return (
        <li key={i}>
          {facilitator_name}
          <ul>
            {answers[facilitator_name].map((feedback, j) =>
              this.renderBullet(feedback, j)
            )}
          </ul>
        </li>
      );
    });
  }

  renderAnswers(answers) {
    return answers.map((answer, i) => this.renderBullet(answer, i));
  }

  renderBullet(text, key) {
    const trimmedText = _.trim(text);
    if (trimmedText) {
      return <li key={key}>{trimmedText}</li>;
    }
  }

  renderResponseSection(responses) {
    if (responses) {
      if (Array.isArray(responses)) {
        return this.renderAnswers(responses);
      } else {
        return this.renderFacilitatorsAndAnswers(responses);
      }
    }
  }

  render() {
    return (
      <div>
        {this.props.questions.map((question, i) => {
          return (
            <Well key={i}>
              <b>{question['text']}</b>
              {this.renderResponseSection(
                this.props.responseData[question.key]
              )}
            </Well>
          );
        })}
      </div>
    );
  }
}
