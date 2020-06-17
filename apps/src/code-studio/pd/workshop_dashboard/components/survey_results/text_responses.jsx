import PropTypes from 'prop-types';
import React from 'react';
import {Well} from 'react-bootstrap';
import _ from 'lodash';
import he from 'he';

export default class TextResponses extends React.Component {
  static propTypes = {
    question: PropTypes.string.isRequired,
    answers: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
      .isRequired,
    showAverage: PropTypes.bool,
    facilitators: PropTypes.object
  };

  renderResponseBullets() {
    if (Array.isArray(this.props.answers)) {
      let answers = this.props.answers.map((answer, i) =>
        this.renderBullet(answer, i)
      );

      if (this.props.showAverage) {
        let average = this.computeAverageForAnswers(this.props.answers);
        answers.unshift(
          <li key={Object.keys(this.props.answers).length}>
            Average: {average}
          </li>
        );
      }

      return answers;
    } else {
      return Object.keys(this.props.answers).map((facilitator_name, i) => {
        let answers = this.props.answers[facilitator_name].map((feedback, j) =>
          this.renderBullet(feedback, j)
        );
        if (this.props.showAverage) {
          let average = this.computeAverageForAnswers(
            this.props.answers[facilitator_name]
          );
          answers.unshift(
            <li key={Object.keys(this.props.answers[facilitator_name]).length}>
              Average: {average}
            </li>
          );
        }

        return (
          <li key={i}>
            {this.props.facilitators &&
            this.props.facilitators[facilitator_name]
              ? this.props.facilitators[facilitator_name]
              : facilitator_name}
            <ul>{answers}</ul>
          </li>
        );
      });
    }
  }

  computeAverageForAnswers(answers) {
    let numericAnswers = answers.filter(answer => !isNaN(Number(answer)));

    return (
      numericAnswers.reduce((sum, answer) => {
        let x = parseInt(answer);
        if (x > 0) {
          return sum + x;
        } else {
          return sum;
        }
      }, 0) / numericAnswers.length
    ).toFixed(2);
  }

  renderBullet(text, key) {
    const trimmedText = _.trim(he.decode(text));
    if (trimmedText) {
      return <li key={key}>{trimmedText}</li>;
    }
  }

  render() {
    return (
      <Well>
        <b>{this.props.question}</b>
        {this.renderResponseBullets()}
      </Well>
    );
  }
}
