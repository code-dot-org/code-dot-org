import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import { assignmentShape } from './shapes';

/**
 * Group our assignments into categories for our dropdown. Memoize this method
 * as over the course of a session we'll be calling multiple times, always with
 * the same set of assignments
 */
const groupedAssignments = _.memoize(assignments => (
  _(assignments)
    .values()
    .orderBy(['category_priority', 'category', 'position', 'name'])
    .groupBy('category')
    .value()
  ));

/**
 * This component displays a dropdown of courses/scripts, with each of these
 * grouped and ordered appropriately.
 */
export default class AssignmentSelector extends Component {
  static propTypes = {
    currentAssignId: PropTypes.string,
    assignments: PropTypes.objectOf(assignmentShape).isRequired,
  };

  getSelectedAssignment() {
    const assignment = this.props.assignments[this.root.value];
    return {
      courseId: assignment.courseId,
      scriptId: assignment.scriptId
    };
  }

  render() {
    const { currentAssignId, assignments } = this.props;

    const grouped = groupedAssignments(assignments);

    return (
      <select
        defaultValue={currentAssignId}
        ref={element => this.root = element}
      >
        <option key="default" value="-1"/>
        {Object.keys(grouped).map((groupName, index) => (
          <optgroup key={index} label={groupName}>
            {grouped[groupName].map((assignment) => (
              <option
                key={assignment.assignId}
                value={assignment.assignId}
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
