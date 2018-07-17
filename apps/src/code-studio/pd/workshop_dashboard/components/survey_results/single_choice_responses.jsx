import React, {PropTypes} from 'react';
import _ from 'lodash';
import {Panel} from 'react-bootstrap';

export default class SingleChoiceResponses extends React.Component {
  static propTypes = {
    question: PropTypes.string.isRequired,
    answers: PropTypes.object.isRequired,
    answerType: PropTypes.string.isRequired,
    possibleAnswers: PropTypes.array.isRequired,
    otherText: PropTypes.string
  };

  render() {
    let totalAnswers = Object.values(this.props.answers).reduce((sum, x) => sum + x, 0);

    // The split is needed for scale questions. The top and bottom responses have text
    // like "1 - not ready / 5 - very ready" and we need to extract the number
    let possibleAnswers = this.props.answerType === 'scale' ? this.props.possibleAnswers.map((x) => x.split(' ')[0]) : this.props.possibleAnswers;
    let otherAnswers = _.difference(Object.keys(this.props.answers), possibleAnswers);

    return (
      <Panel>
        {this.props.question}
        <table>
          <tbody>
          {
            this.props.possibleAnswers.map((possibleAnswer, i) => {
              let answerIndex;

              if (this.props.answerType === 'selectValue') {
                // For selectValue questions, the value is not the text of the response
                // but a numeric value in some range. The hash contains a map of the
                // numeric values to counts, not texts to counts.
                answerIndex = i + 1;
              } else if (this.props.answerType === 'scale') {
                answerIndex = possibleAnswer.split(' ')[0];
              } else {
                answerIndex = possibleAnswer;
              }

              let count = this.props.answers[answerIndex] || 0;
              return (
                <tr key={i}>
                  <td>
                    {
                      (count / totalAnswers)
                        .toLocaleString('en-US', {
                          style: 'percent',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })
                    }
                  </td>
                  <td style={{paddingLeft: '20px'}}>
                    {count}
                  </td>
                  <td style={{paddingLeft: '20px'}}>
                    {possibleAnswer}
                  </td>
                </tr>
              );
            })
          }
          {
            this.props.otherText && (
              <tr>
                <td>
                  {
                    (otherAnswers.length / totalAnswers)
                      .toLocaleString('en-US', {
                        style: 'percent',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })
                  }
                </td>
                <td style={{paddingLeft: '20px'}}>
                  {otherAnswers.length}
                </td>
                <td style={{paddingLeft: '20px'}}>
                  {this.props.otherText}
                </td>
              </tr>
            )
          }
          </tbody>
        </table>
        {
          this.props.otherText && otherAnswers.length > 0 && (
            <div>
              <br/>
              {this.props.otherText}
              <ul>
                {_.compact(otherAnswers).map((answer, i) => (<li key={i}>{answer}</li>))}
              </ul>
            </div>
          )
        }
      </Panel>
    );
  }
}
