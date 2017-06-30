import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import { assignmentShape } from './shapes';
import { assignmentId } from './teacherSectionsRedux';

const styles = {
  secondary: {
    marginTop: 10
  }
};

const noAssignment = assignmentId(null, null);

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
    currentPrimaryId: PropTypes.string,
    currentSecondaryId: PropTypes.string,
    assignments: PropTypes.objectOf(assignmentShape).isRequired,
    primaryAssignmentIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      selectedPrimaryId: props.currentPrimaryId,
      selectedSecondaryId: props.currentSecondaryId,
    };
  }

  getSelectedAssignment() {
    const assignment = this.props.assignments[this.state.selectedPrimaryId];
    return {
      courseId: assignment ? assignment.courseId : null,
      scriptId: assignment ? assignment.scriptId : null,
    };
  }

  onChangePrimary = (event) => {
    const { currentSecondaryId, assignments } = this.props;

    let selectedPrimaryId = event.target.value;
    const scriptAssignIds = assignments[selectedPrimaryId].scriptAssignIds || [];
    // If our current secondaryId is in this course, default to that

    const selectedSecondaryId = scriptAssignIds.includes(currentSecondaryId) ?
      currentSecondaryId : noAssignment;

    this.setState({
      selectedPrimaryId,
      selectedSecondaryId
    });
  };

  onChangeSecondary = (event) => {
    this.setState({
      selectedSecondaryId: event.target.value
    });
  };

  render() {
    const { assignments, primaryAssignmentIds } = this.props;
    const { selectedPrimaryId, selectedSecondaryId } = this.state;

    // TODO: test this case
    let primaryAssignIds = primaryAssignmentIds;
    if (selectedPrimaryId !== noAssignment &&
        !primaryAssignmentIds.includes(selectedPrimaryId)) {
      primaryAssignIds = [selectedPrimaryId].concat(primaryAssignIds);
    }

    const grouped = groupedAssignments(primaryAssignIds.map(id => assignments[id]));
    let secondaryOptions;
    const primaryAssignment = assignments[selectedPrimaryId];
    if (primaryAssignment) {
      secondaryOptions = primaryAssignment.scriptAssignIds;
    }

    return (
      <div>
        <select
          value={selectedPrimaryId}
          onChange={this.onChangePrimary}
        >
          <option key="default" value={noAssignment}/>
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
        {secondaryOptions && (
          <div style={styles.secondary}>
            <div>Select current unit:</div>
            <select
              value={selectedSecondaryId}
              onChange={this.onChangeSecondary}
            >
              <option value={noAssignment}/>
              {secondaryOptions.map(scriptAssignId => (
                <option
                  key={scriptAssignId}
                  value={scriptAssignId}
                >
                  {assignments[scriptAssignId].name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  }
}
