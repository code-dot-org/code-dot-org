import React from 'react';
import {Well} from 'react-bootstrap';

const FreeResponseSection = React.createClass({
  propTypes: {
    questions: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    responseData: React.PropTypes.object.isRequired
  },

  renderFacilitatorsAndAnswers(answers) {
    return Object.keys(answers).map((facilitator_name, i) => {
      return (
        <li key={i}>
          {facilitator_name}
          <ul>
            {
              answers[facilitator_name].map((feedback, j) => {
                return (
                  <li key={j}>
                    {feedback}
                  </li>
                );
              })
            }
          </ul>
        </li>
      );
    });
  },

  renderAnswers(answers) {
    return answers.map((answer, i) => {
      return (
        <li key={i}>
          {answer}
        </li>
      );
    });
  },

  render() {
    return (
      <div>
        {
          this.props.questions.map((question, i) => {
            return (
              <Well key={i}>
                <b>
                  {question['text']}
                </b>
                {
                  Array.isArray(this.props.responseData[question['key']]) ?
                    this.renderAnswers(this.props.responseData[question['key']]) :
                    this.renderFacilitatorsAndAnswers(this.props.responseData[question['key']])
                }
              </Well>
            );
          })
        }
      </div>
    );
  }
});

export default FreeResponseSection;
