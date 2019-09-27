import React from 'react';
import {Table} from 'react-bootstrap';
import PropTypes from 'prop-types';
import _ from 'lodash';

const questionCategories = [
  'facilitator_effectiveness',
  'teacher_engagement',
  'overall_success'
];

export class SurveyRollupTable extends React.Component {
  static propTypes = {
    rollups: PropTypes.object.isRequired,
    questions: PropTypes.object.isRequired,
    facilitators: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
  }

  /**
   *
   * @param {Array} categories
   * @param {Object} questions
   * @returns {Array}
   */
  createOrderedRows(categories, questions) {
    let orderedRows = [];

    categories.forEach(category => {
      orderedRows.push({
        key: category,
        label: _.startCase(category)
      });

      let question_found = false;
      Object.keys(questions).forEach(question_name => {
        if (question_name.startsWith(category)) {
          question_found = true;
          orderedRows.push({
            key: question_name,
            label: questions[question_name]
          });
        }
      });

      // Don't keep category without any questions
      if (!question_found) {
        orderedRows.pop();
      }
    });

    return orderedRows;
  }

  createColumnLabel(facilitatorId, workshopId, courseName, facilitatorLookup) {
    let label = '';

    if (facilitatorId) {
      let posessiveName = `${facilitatorLookup[facilitatorId]}' ${
        _.endsWith(name, 's') ? '' : 's'
      }`;

      if (workshopId) {
        label = `${posessiveName} average for this workshop`;
      } else {
        label = `Average across all of ${posessiveName} ${courseName} workshops`;
      }
    } else {
      if (workshopId) {
        label = `Average for this workshop`;
      }
    }

    return label;
  }

  createOrderedColumns() {
    return Object.keys(this.props.rollups).map(scenario_key => ({
      key: scenario_key,
      label:
        this.createColumnLabel(
          this.props.rollups[scenario_key].facilitator_id,
          this.props.rollups[scenario_key].workshop_id,
          this.props.rollups[scenario_key].course_name,
          this.props.facilitators
        ) || scenario_key.toString
    }));
  }

  render() {
    let orderedColumns = this.createOrderedColumns();
    let orderedRows = this.createOrderedRows(
      questionCategories,
      this.props.questions
    );

    return (
      <Table bordered>
        <thead>
          {/*Column headers*/}
          <tr>
            <th />
            {orderedColumns.map(column => (
              <td>{column.label}</td>
            ))}
          </tr>
        </thead>
        <tbody>
          {/*First row is response counts*/}
          <tr>
            <td>Response Count</td>
            {orderedColumns.map(column => (
              <td>{this.props.rollups[column.key].response_count}</td>
            ))}
          </tr>

          {/*Next rows are average scores of categories and questions*/}
          {orderedRows.map(row => (
            <tr>
              <td>{row.label}</td>
              {orderedColumns.map(column => (
                <td>{this.props.rollups[column.key].averages[row.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }
}

export default SurveyRollupTable;
