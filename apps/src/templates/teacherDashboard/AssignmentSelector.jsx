import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import { assignmentShape } from './shapes';

/**
 * Group our assignments into categories for our dropdown
 */
const groupedAssignments = assignments => (
  _(assignments)
    .values()
    .orderBy(['category_priority', 'category', 'position', 'name'])
    .groupBy('category')
    .value()
  );

/**
 * This component displays a dropdown of courses/scripts, with each of these
 * grouped and ordered appropriately.
 * TODO(bjvanminnen): could use some tests
 */
export default class AssignmentSelector extends Component {
  static propTypes = {
    currentAssignId: PropTypes.string,
    assignments: PropTypes.objectOf(assignmentShape).isRequired,
  };

  getSelectedAssignment() {
    const assignment = this.props.assignments[this.root.value];
    return {
      courseId: assignment ? assignment.courseId : null,
      scriptId: assignment ? assignment.scriptId : null,
    };
  }

  render() {
    const { currentAssignId, assignments, primaryAssignmentIds } = this.props;

    // TODO: test this case
    let primaryAssignIds = primaryAssignmentIds;
    if (currentAssignId && !primaryAssignmentIds.includes(currentAssignId)) {
      primaryAssignIds = [currentAssignId].concat(primaryAssignIds);
    }

    const grouped = groupedAssignments(primaryAssignIds.map(id => assignments[id]));

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
