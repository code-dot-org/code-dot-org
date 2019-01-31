import React, {PropTypes} from 'react';
import {Table} from 'react-bootstrap';
import _ from 'lodash';

const questionOrder = {
  facilitator_effectiveness: [
    'overallHow',
    'duringYour',
    'forThis54',
    'howInteresting55',
    'howOften56',
    'howComfortable',
    'howOften',
  ],
  teacher_engagement: [
    'pleaseRate120_0',
    'pleaseRate120_1',
    'pleaseRate120_2',
  ],
  overall_success: [
    'iFeel133',
    'regardingThe_2',
    'pleaseRate_2',
    'iWould',
    'pleaseRate_3'
  ]
};

const questionDenominator = {
  facilitator_effectiveness: 5,
  teacher_engagement: 5,
  overall_success: 6
};

export default class FacilitatorAveragesTable extends React.Component {
  static propTypes = {
    facilitatorAverages: PropTypes.object.isRequired,
    facilitatorId: PropTypes.number.isRequired,
    facilitatorName: PropTypes.string.isRequired,
    questions: PropTypes.object.isRequired,
    courseName: PropTypes.string.isRequired,
    facilitatorResponseCounts: PropTypes.object.isRequired
  };

  renderAverage(displayNumber, category) {
    if (displayNumber) {
      return `${displayNumber.toFixed(2)} / ${questionDenominator[category]}`;
    } else {
      return '-';
    }
  }

  render() {
    const possessiveName = `${this.props.facilitatorName}'${_.endsWith(this.props.facilitatorName, 's') ? '' : 's'}`;

    return (
      <Table bordered>
        <thead>
          <tr>
            <th/>
            <th>
              {possessiveName} average for this workshop
            </th>
            <th>
              {possessiveName} average for all {this.props.courseName} workshops since June 2018
            </th>
          </tr>
        </thead>
        <tbody>
        <tr>
          <td>
            Total responses
          </td>
          <td>
            {this.props.facilitatorResponseCounts['this_workshop'][this.props.facilitatorId]}
          </td>
          <td>
            {this.props.facilitatorResponseCounts['all_my_workshops'][this.props.facilitatorId]}
          </td>
        </tr>
          {
            Object.keys(questionOrder).map((category) => {
              return [
                (
                  <tr style={{borderTop: 'solid'}}>
                    <td>
                      {_.startCase(category)}
                    </td>
                    <td>
                      {this.renderAverage((this.props.facilitatorAverages[category] || {})['this_workshop'], category)}
                    </td>
                    <td>
                      {this.renderAverage((this.props.facilitatorAverages[category] || {})['all_my_workshops'], category)}
                    </td>
                  </tr>
                ),
                questionOrder[category].map((question, i) => (
                  <tr key={i}>
                    <td style={{paddingLeft: '30px'}}>
                      {this.props.questions[question]}
                    </td>
                    <td>
                      {this.renderAverage((this.props.facilitatorAverages[question] || {})['this_workshop'], category)}
                    </td>
                    <td>
                      {this.renderAverage((this.props.facilitatorAverages[question] || {})['all_my_workshops'], category)}
                    </td>
                  </tr>
                ))
              ];
            })
          }
        </tbody>
      </Table>
    );
  }
}
