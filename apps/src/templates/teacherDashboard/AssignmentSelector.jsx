import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import { assignmentShape } from './shapes';

export default class AssignmentSelector extends Component {
  static propTypes = {
    courseId: PropTypes.number,
    scriptId: PropTypes.number,
    assignments: PropTypes.arrayOf(assignmentShape).isRequired,
  };

  getSelectedAssignment() {
    const assignment = this.props.assignments[this.root.value];
    return {
      course_id: assignment.course_id,
      script_id: assignment.script_id
    };
  }

  render() {
    const { courseId, scriptId, assignments } = this.props;

    const target = {
      courseId: courseId,
      scriptId: courseId ? null : scriptId
    };

    // TODO: after sections are in redux, currentAssignment can also likely become
    // a redux selector
    // Find an assignment with the appropriate id
    const assignmentIndex = assignments.findIndex(assignment => (
      assignment.courseId === target.courseId && assignment.scriptId === target.scriptId
    ));
    const currentAssignment = assignmentIndex === -1 ? '' : assignmentIndex;

    const grouped = _(assignments)
      .orderBy(['category_priority', 'category', 'position', 'name'])
      .groupBy('category')
      .value();

    return (
      <select
        defaultValue={currentAssignment}
        ref={element => this.root = element}
      >
        <option key="default"/>
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
