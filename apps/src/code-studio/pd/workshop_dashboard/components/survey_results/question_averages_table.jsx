import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

export default class QuestionAveragesTable extends React.Component {
  static propTypes = {
    questions: PropTypes.arrayOf(PropTypes.object).isRequired,
    thisWorkshopData: PropTypes.object.isRequired,
    allMyWorkshopsData: PropTypes.object.isRequired,
    allWorkshopsData: PropTypes.object.isRequired,
    facilitatorNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    facilitatorBreakdown: PropTypes.bool.isRequired,
    workshopType: PropTypes.string.isRequired,
  };

  renderHeaderRow() {
    let facilitatorColumnHeaders;

    if (this.props.facilitatorBreakdown) {
      facilitatorColumnHeaders = this.props.facilitatorNames.map(
        (facilitator, i) => {
          return <th key={i}>{facilitator}</th>;
        }
      );
    }

    return (
      <thead>
        <tr>
          <th />
          <th>This workshop</th>
          {facilitatorColumnHeaders}
          <th>All my {this.props.workshopType}</th>
          <th>All workshops</th>
        </tr>
      </thead>
    );
  }

  renderRow(row, i) {
    let scoreCells;
    let thisWorkshopData = this.props.thisWorkshopData[row['key']];

    if (
      this.props.facilitatorBreakdown &&
      typeof thisWorkshopData === 'object'
    ) {
      // If thisWorkshopData is an object, that means it's the facilitator breakdown for
      // facilitator specific questions. So the numbers belong under facilitator names
      // and the "this workshop column" is intentionally left blank
      scoreCells = this.props.facilitatorNames.map(facilitator_name => {
        return (
          <td key={facilitator_name}>
            {this.renderScore(row, thisWorkshopData[facilitator_name])}
          </td>
        );
      });

      scoreCells.unshift(<td key="this workshop" />);
    } else {
      scoreCells = [<td key={0}>{this.renderScore(row, thisWorkshopData)}</td>];

      if (this.props.facilitatorBreakdown) {
        _.times(this.props.facilitatorNames.length, i => {
          scoreCells.push(<td key={i + 1} />);
        });
      }
    }

    return (
      <tr key={i}>
        <td>{row['text']}</td>
        {scoreCells}
        <td>
          {this.renderScore(row, this.props.allMyWorkshopsData[row['key']])}
        </td>
        <td>
          {this.renderScore(row, this.props.allWorkshopsData[row['key']])}
        </td>
      </tr>
    );
  }

  renderScore(row, score) {
    if (score && row['score_base']) {
      return `${score} / ${row['score_base']}`;
    } else {
      return score || '';
    }
  }

  render() {
    return (
      <table className="table table-bordered" style={{width: 'auto'}}>
        {this.renderHeaderRow()}
        <tbody>
          {this.props.questions.map((row, i) => {
            return this.renderRow(row, i);
          })}
        </tbody>
      </table>
    );
  }
}
