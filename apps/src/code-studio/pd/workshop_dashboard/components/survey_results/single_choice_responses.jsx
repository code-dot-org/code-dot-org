import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import {Panel} from 'react-bootstrap';

export default class SingleChoiceResponses extends React.Component {
  static propTypes = {
    question: PropTypes.string.isRequired,
    answers: PropTypes.object.isRequired,
    perFacilitator: PropTypes.bool,
    answerType: PropTypes.string.isRequired,
    possibleAnswers: PropTypes.array.isRequired,
    otherText: PropTypes.string
  };

  getTotalAnswers() {
    if (this.props.perFacilitator) {
      return Object.values(this.props.answers).reduce((sum, answers) => {
        return sum + Object.values(answers).reduce((subSum, x) => subSum + x, 0);
      }, 0);
    } else {
      return Object.values(this.props.answers).reduce((sum, x) => sum + x, 0);
    }
  }

  getAnswerIndex(possibleAnswer, i) {
    if (this.props.answerType === 'selectValue') {
      // For selectValue questions, the value is not the text of the response
      // but a numeric value in some range. The hash contains a map of the
      // numeric values to counts, not texts to counts.
      return i + 1;
    } else if (this.props.answerType === 'scale') {
      return possibleAnswer.split(' ')[0];
    } else {
      return possibleAnswer;
    }
  }

  formatPercentage(percentage) {
    return percentage.toLocaleString('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  renderSingleAnswerCounts() {
    return this.props.possibleAnswers.map((possibleAnswer, i) => {
      let count = this.props.answers[this.getAnswerIndex(possibleAnswer, i)] || 0;

      return (
        <tr key={i}>
          <td>
            {this.formatPercentage(count / this.getTotalAnswers())}
          </td>
          <td style={{paddingLeft: '20px'}}>
            {count}
          </td>
          <td style={{paddingLeft: '20px'}}>
            {possibleAnswer}
          </td>
        </tr>
      );
    });
  }

  renderPerFacilitatorAnswerCounts() {
    const facilitatorNames = Object.keys(this.props.answers);
    const showTotalCount = facilitatorNames.length > 1;
    const totalCountsPerFacilitator = facilitatorNames.map(name => {
        return Object.values(this.props.answers[name]).reduce((sum, count) => sum + count, 0);
    });

    const headerRow = (
      <tr key="header">
        <td></td>
        {facilitatorNames.map((name, i) => <td colSpan={2} style={{paddingLeft: '20px'}} key={i}>{name}</td>)}
        {showTotalCount && <td colSpan={2} style={{paddingLeft: '20px'}}>Total Responses</td>}
      </tr>
    );

    const contentRows = this.props.possibleAnswers.map((possibleAnswer, i) => {
      const countsByFacilitator = facilitatorNames.map(name => {
        return this.props.answers[name][this.getAnswerIndex(possibleAnswer, i)] || 0;
      });
      const totalCount = countsByFacilitator.reduce((sum, count) => sum + count, 0);

      return (
        <tr key={i}>
          <td>{possibleAnswer}</td>
          {countsByFacilitator.map((count, j) => ([
            <td style={{ paddingLeft: '20px' }} key={`${j}.count`}>
              {count}
            </td>,
            <td style={{ paddingLeft: '4px' }} key ={`${j}.percentage`}>
              {`(${this.formatPercentage(count / totalCountsPerFacilitator[j])})`}
            </td>
          ]))}
          {showTotalCount && <td style={{paddingLeft: '20px'}}>
            {totalCount}
          </td>}
          {showTotalCount && <td style={{ paddingLeft: '4px' }}>
            {`(${this.formatPercentage(totalCount / this.getTotalAnswers())})`}
          </td>}
        </tr>
      );
    });

    return [headerRow].concat(contentRows);
  }

  render() {
    // The split is needed for scale questions. The top and bottom responses have text
    // like "1 - not ready / 5 - very ready" and we need to extract the number
    let possibleAnswers = this.props.answerType === 'scale' ? this.props.possibleAnswers.map((x) => x.split(' ')[0]) : this.props.possibleAnswers;
    let otherAnswers;
    if (this.props.perFacilitator) {
      let givenAnswers = Object.values(this.props.answers).reduce((set, answers) => {
        return new Set(Object.keys(answers).concat(...set.values()));
      }, new Set());
      otherAnswers = _.difference(givenAnswers, possibleAnswers);
    } else {
      otherAnswers = _.difference(Object.keys(this.props.answers), possibleAnswers);
    }

    return (
      <Panel>
        {this.props.question}
        <table style={{marginTop: '1em'}}>
          <tbody>
          {this.props.perFacilitator ? this.renderPerFacilitatorAnswerCounts() : this.renderSingleAnswerCounts()}
          {
            this.props.otherText && (
              <tr>
                <td>
                  {this.formatPercentage(otherAnswers.length / this.getTotalAnswers())}
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
