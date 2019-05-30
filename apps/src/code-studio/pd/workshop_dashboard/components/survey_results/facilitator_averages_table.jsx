import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {Table} from 'react-bootstrap';
import _ from 'lodash';
import {COURSE_CSF} from '../../workshopConstants';
import {
  PermissionPropType,
  WorkshopAdmin,
  ProgramManager,
  Organizer
} from '../../permission';

const questionOrder = {
  facilitator_effectiveness: [
    'overallHow',
    'duringYour',
    'forThis54',
    'howInteresting55',
    'howOften56',
    'howComfortable',
    'howOften'
  ],
  teacher_engagement: ['pleaseRate120_0', 'pleaseRate120_1', 'pleaseRate120_2'],
  overall_success: [
    'iFeel133',
    'regardingThe_2',
    'pleaseRate_2',
    'iWould',
    'pleaseRate_3'
  ]
};

export class FacilitatorAveragesTable extends React.Component {
  static propTypes = {
    facilitatorAverages: PropTypes.object.isRequired,
    facilitatorId: PropTypes.number.isRequired,
    facilitatorName: PropTypes.string.isRequired,
    questions: PropTypes.object.isRequired,
    courseName: PropTypes.string.isRequired,
    facilitatorResponseCounts: PropTypes.object.isRequired,
    permission: PermissionPropType.isRequired
  };

  constructor(props) {
    super(props);

    this.questionDenominator = {
      facilitator_effectiveness: 7,
      teacher_engagement: props.courseName === COURSE_CSF ? 5 : 7,
      overall_success: 7
    };
  }

  relatedWorkshopDescriptor(possessiveName) {
    if (this.props.permission.has(WorkshopAdmin)) {
      return `${possessiveName} average for this workshop`;
    } else if (this.props.permission.has(ProgramManager)) {
      return `Average for all your regional partner's ${
        this.props.courseName
      } workshops since June 2018`;
    } else if (this.props.permission.has(Organizer)) {
      return `${possessiveName} average for all ${
        this.props.courseName
      } workshops
        organized since June 2018`;
    } else {
      return `${possessiveName} average for all ${
        this.props.courseName
      } workshops
        facilitated since June 2018`;
    }
  }

  renderAverage(displayNumber, category) {
    if (displayNumber) {
      return `${displayNumber.toFixed(2)} / ${
        this.questionDenominator[category]
      }`;
    } else {
      return '-';
    }
  }

  render() {
    const possessiveName = `${this.props.facilitatorName}'${
      _.endsWith(this.props.facilitatorName, 's') ? '' : 's'
    }`;

    return (
      <Table bordered>
        <thead>
          <tr>
            <th />
            <th>{possessiveName} average for this workshop</th>
            <th>{this.relatedWorkshopDescriptor(possessiveName)}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Total responses</td>
            <td>
              {
                this.props.facilitatorResponseCounts['this_workshop'][
                  this.props.facilitatorId
                ]
              }
            </td>
            <td>
              {
                this.props.facilitatorResponseCounts['all_my_workshops'][
                  this.props.facilitatorId
                ]
              }
            </td>
          </tr>
          {Object.keys(questionOrder).map(category => {
            return [
              <tr style={{borderTop: 'solid'}}>
                <td>{_.startCase(category)}</td>
                <td>
                  {this.renderAverage(
                    (this.props.facilitatorAverages[category] || {})[
                      'this_workshop'
                    ],
                    category
                  )}
                </td>
                <td>
                  {this.renderAverage(
                    (this.props.facilitatorAverages[category] || {})[
                      'all_my_workshops'
                    ],
                    category
                  )}
                </td>
              </tr>,
              questionOrder[category].map((question, i) => (
                <tr key={i}>
                  <td style={{paddingLeft: '30px'}}>
                    {this.props.questions[question]}
                  </td>
                  <td>
                    {this.renderAverage(
                      (this.props.facilitatorAverages[question] || {})[
                        'this_workshop'
                      ],
                      category
                    )}
                  </td>
                  <td>
                    {this.renderAverage(
                      (this.props.facilitatorAverages[question] || {})[
                        'all_my_workshops'
                      ],
                      category
                    )}
                  </td>
                </tr>
              ))
            ];
          })}
        </tbody>
      </Table>
    );
  }
}

export default connect(state => ({
  permission: state.workshopDashboard.permission
}))(FacilitatorAveragesTable);
