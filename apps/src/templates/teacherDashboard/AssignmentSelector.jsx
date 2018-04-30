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
 * Group our assignment groups by category for our dropdown
 */
const categorizeAssignmentGroups = assignmentGroups => (
  _(assignmentGroups)
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

  getVersionYears = baseName => {
    if (!baseName) {
      return [];
    }
    return _.values(this.props.assignments)
      .filter(assignment => assignment.base_name === baseName)
      .map(assignment => assignment.version_year)
      .sort()
      .reverse();
  };

  constructor(props) {
    super(props);

    const { section, assignments } = props;

    let selectedBaseName, selectedVersionYear, selectedPrimaryId, selectedSecondaryId;
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

    if (selectedPrimaryId !== noAssignment) {
      const primaryAssignment = assignments[selectedPrimaryId];
      selectedBaseName = primaryAssignment.base_name;
      selectedVersionYear = primaryAssignment.version_year;
    }

    this.state = {
      selectedBaseName,
      selectedVersionYear,
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
  onChangeBaseName = event => {
    const baseName = event.target.value;
    const versionYears = this.getVersionYears(baseName);
    this.setPrimary(baseName, versionYears[0]);
  };

  onChangeVersionYear = event => {
    const { selectedBaseName } = this.state;
    const versionYear = event.target.value;
    this.setPrimary(selectedBaseName, versionYear);
  };

  getSelectedPrimaryId(selectedBaseName, selectedVersionYear) {
    const primaryAssignment = _.values(this.props.assignments).find(assignment => (
      assignment.base_name === selectedBaseName &&
      assignment.version_year === selectedVersionYear
    ));

    if (!primaryAssignment) {
      return noAssignment;
    }

    return assignmentId(primaryAssignment.courseId, primaryAssignment.scriptId);
  }

  setPrimary = (selectedBaseName, selectedVersionYear) => {

    const selectedPrimaryId = this.getSelectedPrimaryId(selectedBaseName, selectedVersionYear);

    const { assignments, section } = this.props;
    let currentSecondaryId;
    if (!section) {
      currentSecondaryId = noAssignment;
    } else {
      currentSecondaryId = assignmentId(null, section.scriptId);
    }

    const scriptAssignIds = isValidAssignment(selectedPrimaryId)
      ? (assignments[selectedPrimaryId].scriptAssignIds || [])
      : [];

    // If our current secondaryId is in this course, default to that
    const selectedSecondaryId = scriptAssignIds.includes(currentSecondaryId) ?
      currentSecondaryId : noAssignment;

    this.setState({
      selectedBaseName,
      selectedVersionYear,
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
    const { assignments, assignmentGroups, dropdownStyle, disabled } = this.props;
    const { selectedPrimaryId, selectedSecondaryId, selectedBaseName, selectedVersionYear } = this.state;
    const versionYears = this.getVersionYears(selectedBaseName);

    const assignmentGroupsByCategory = categorizeAssignmentGroups(assignmentGroups);
    let secondaryOptions;
    const primaryAssignment = assignments[selectedPrimaryId];
    if (primaryAssignment) {
      secondaryOptions = primaryAssignment.scriptAssignIds;
    }

    return (
      <div>
        <select
          id="uitest-assignment-group"
          value={selectedBaseName}
          onChange={this.onChangeBaseName}
          style={dropdownStyle}
          disabled={disabled}
        >
          <option key="default"/>
          {this.props.chooseLaterOption &&
            <option key="later" value={decideLater}>
              {i18n.decideLater()}
            </option>
          }
          {Object.keys(assignmentGroupsByCategory).map((categoryName, index) => (
            <optgroup key={index} label={categoryName}>
              {assignmentGroupsByCategory[categoryName].map(assignmentGroup => (
                (assignmentGroup !== undefined) &&
                  <option
                    key={assignmentGroup.base_name}
                    value={assignmentGroup.base_name}
                  >
                    {assignmentGroup.name}
                  </option>
              ))}
            </optgroup>
          ))}
        </select>
        {versionYears.length > 1 && (
          <select
            value={selectedVersionYear}
            onChange={this.onChangeVersionYear}
            style={dropdownStyle}
            disabled={disabled}
          >
            {
              versionYears.map(versionYear => (
                <option
                  key={versionYear}
                  value={versionYear}
                >
                  {
                    // If present, the 2018 version is the recommended one,
                    // because this will be the recommended version of csp and
                    // csd, which are the only two versioned courses we will
                    // show initially. This information will need to be provided
                    // by the server once we support versioning of scripts.
                  }
                  {versionYear === '2018' ? `${versionYear} (Recommended)` : versionYear}
                </option>
              ))
            }
          </select>
        )}
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
