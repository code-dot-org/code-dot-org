import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import { assignmentShape } from './shapes';

export default class AssignmentSelector extends Component {
  static propTypes = {
    currentAssignmentIndex: PropTypes.number,
    assignments: PropTypes.arrayOf(assignmentShape).isRequired,
  };

  getSelectedAssignment() {
    const assignment = this.props.assignments[this.root.value];
    return {
      courseId: assignment.courseId,
      scriptId: assignment.scriptId
    };
  }

  render() {
    const { currentAssignmentIndex, assignments } = this.props;

    const grouped = _(assignments)
      .orderBy(['category_priority', 'category', 'position', 'name'])
      .groupBy('category')
      .value();

    return (
      <select
        defaultValue={currentAssignmentIndex}
        ref={element => this.root = element}
      >
        <option key="default" value="-1"/>
        {Object.keys(grouped).map((groupName, index) => (
          <optgroup key={index} label={groupName}>
            {grouped[groupName].map((assignment) => (
              <option
                key={assignment.index}
                value={assignment.index}
              >
                {assignment.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    );
  }
}
