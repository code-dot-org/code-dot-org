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
    'facilitator_effectiveness_0',
    'facilitator_effectiveness_1',
    'facilitator_effectiveness_2',
    'facilitator_effectiveness_3',
    'facilitator_effectiveness_4',
    'facilitator_effectiveness_5'
  ],
  teacher_engagement: [
    'teacher_engagement_0',
    'teacher_engagement_1',
    'teacher_engagement_2',
    'teacher_engagement_3'
  ],
  overall_success: [
    'overall_success_0',
    'overall_success_1',
    'overall_success_2',
    'overall_success_3',
    'overall_success_4'
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
              {JSON.stringify(
                this.props.facilitatorResponseCounts['this_workshop'][
                  this.props.facilitatorId
                ]
              )}
            </td>
            <td>
              {JSON.stringify(
                this.props.facilitatorResponseCounts['all_my_workshops'][
                  this.props.facilitatorId
                ]
              )}
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
                    {this.props.questions[question] &&
                      this.props.questions[question].replace(
                        '{facilitatorName}',
                        this.props.facilitatorName
                      )}
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
