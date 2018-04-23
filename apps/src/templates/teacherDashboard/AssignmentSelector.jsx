import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import i18n from '@cdo/locale';
import { sectionShape, assignmentShape, assignmentGroupShape } from './shapes';
import { assignmentId } from './teacherSectionsRedux';

const styles = {
  secondary: {
    marginTop: 10
  }
};

const noAssignment = assignmentId(null, null);
//Additional valid option in dropdown - no associated course
const decideLater = '__decideLater__';
const isValidAssignment = id => id !== noAssignment && id !== decideLater;

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
    section: sectionShape,
    assignments: PropTypes.objectOf(assignmentShape).isRequired,
    primaryAssignmentIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    assignmentGroups: PropTypes.arrayOf(assignmentGroupShape).isRequired,
    chooseLaterOption: PropTypes.bool,
    dropdownStyle: PropTypes.object,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    const { section } = props;

    let selectedPrimaryId, selectedSecondaryId;
    if (!section) {
      selectedPrimaryId = noAssignment;
      selectedSecondaryId = noAssignment;
    } else if (section.courseId) {
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

    if (isValidAssignment(selectedSecondaryId)) {
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
    let currentSecondaryId;
    if (!section) {
      currentSecondaryId = noAssignment;
    } else {
      currentSecondaryId = assignmentId(null, section.scriptId);
    }

    let selectedPrimaryId = event.target.value;
    const scriptAssignIds = isValidAssignment(selectedPrimaryId)
      ? (assignments[selectedPrimaryId].scriptAssignIds || [])
      : [];

    // If our current secondaryId is in this course, default to that
    const selectedSecondaryId = scriptAssignIds.includes(currentSecondaryId) ?
      currentSecondaryId : noAssignment;

    this.setState({
      selectedPrimaryId,
      selectedSecondaryId
    }, this.reportChange);
  };

  onChangeSecondary = (event) => {
    this.setState({
      selectedSecondaryId: event.target.value
    }, this.reportChange);
  };

  reportChange = () => {
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(this.getSelectedAssignment());
    }
  };

  render() {
    const { assignments, primaryAssignmentIds, dropdownStyle, disabled } = this.props;
    const { selectedPrimaryId, selectedSecondaryId } = this.state;

    let primaryAssignIds = primaryAssignmentIds;
    if (isValidAssignment(selectedPrimaryId) &&
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
          id="uitest-primary-assignment"
          value={selectedPrimaryId}
          onChange={this.onChangePrimary}
          style={dropdownStyle}
          disabled={disabled}
        >
          <option key="default" value={noAssignment}/>
          {this.props.chooseLaterOption &&
            <option key="later" value={decideLater}>
              {i18n.decideLater()}
            </option>
          }
          {Object.keys(grouped).map((groupName, index) => (
            <optgroup key={index} label={groupName}>
              {grouped[groupName].map((assignment) => (
                (assignment !== undefined) &&
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
              id="uitest-secondary-assignment"
              value={selectedSecondaryId}
              onChange={this.onChangeSecondary}
              style={dropdownStyle}
              disabled={disabled}
            >
              <option value={noAssignment}/>
              {secondaryOptions.map(scriptAssignId => (
                assignments[scriptAssignId] && (
                  <option
                    key={scriptAssignId}
                    value={scriptAssignId}
                  >
                    {assignments[scriptAssignId].name}
                  </option>
                )
              ))}
            </select>
          </div>
        )}
      </div>
    );
  }
}
