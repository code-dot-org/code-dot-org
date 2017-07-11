import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import { sectionShape, assignmentShape } from './shapes';
import { assignmentId } from './teacherSectionsRedux';
import experiments from '@cdo/apps/util/experiments';

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
 */
export default class AssignmentSelector extends Component {
  static propTypes = {
    section: sectionShape.isRequired,
    assignments: PropTypes.objectOf(assignmentShape).isRequired,
    primaryAssignmentIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

  constructor(props) {
    super(props);

    const { section } = props;

    let selectedPrimaryId, selectedSecondaryId;
    if (section.courseId) {
      selectedPrimaryId = assignmentId(section.courseId, null);
      selectedSecondaryId = assignmentId(null, section.scriptId);
    } else {
      selectedPrimaryId = assignmentId(null, section.scriptId);
      selectedSecondaryId = noAssignment;
    }

    this.state = {
      selectedPrimaryId,
      selectedSecondaryId,
    };
  }

  getSelectedAssignment() {
    const { selectedPrimaryId, selectedSecondaryId } = this.state;
    const primary = this.props.assignments[selectedPrimaryId];

    if (selectedSecondaryId !== noAssignment) {
      // If we have a secondary, that implies that (a) our primary is a course
      // and (b) our secondary is a script
      const secondary = this.props.assignments[selectedSecondaryId];
      return {
        courseId: primary.courseId,
        scriptId: secondary.scriptId
      };
    } else {
      // If we don't have a secondary, primary could be course, script, or null
      return {
        courseId: primary ? primary.courseId : null,
        scriptId: primary ? primary.scriptId : null,
      };
    }
  }

  onChangePrimary = (event) => {
    const { assignments, section } = this.props;
    const currentSecondaryId = assignmentId(null, section.scriptId);

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

    let primaryAssignIds = primaryAssignmentIds;
    if (selectedPrimaryId !== noAssignment &&
        !primaryAssignmentIds.includes(selectedPrimaryId)) {
      primaryAssignIds = [selectedPrimaryId].concat(primaryAssignIds);
    }

    const sectionFocusExperiment = experiments.isEnabled('sectionFocus');

    const grouped = groupedAssignments(primaryAssignIds.map(id => assignments[id]));
    let secondaryOptions;
    const primaryAssignment = assignments[selectedPrimaryId];
    if (primaryAssignment && sectionFocusExperiment) {
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
