import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import i18n from '@cdo/locale';
import { sectionShape, assignmentShape, assignmentFamilyShape } from './shapes';
import { assignmentId, assignmentFamilyFields } from './teacherSectionsRedux';

const styles = {
  secondary: {
    marginTop: 10
  }
};

const noAssignment = assignmentId(null, null);
//Additional valid option in dropdown - no associated course
const decideLater = '__decideLater__';
const isValidAssignment = id => id !== noAssignment && id !== decideLater;

const hasAssignmentFamily = (assignmentFamilies, assignment)  => (
  assignment && assignmentFamilies.some(assignmentFamily => (
    assignmentFamily.assignment_family_name === assignment.assignment_family_name
  ))
);

/**
 * Group our assignment families by category for our dropdown
 */
const categorizeAssignmentFamilies = assignmentFamilies => (
  _(assignmentFamilies)
    .values()
    .orderBy(['category_priority', 'category', 'position', 'assignment_family_title'])
    .groupBy('category')
    .value()
  );

const getVersion = assignment => ({
    year: assignment.version_year,
    title: assignment.version_title
});

/**
 * This component displays a dropdown of courses/scripts, with each of these
 * grouped and ordered appropriately.
 */
export default class AssignmentSelector extends Component {
  static propTypes = {
    section: sectionShape,
    assignments: PropTypes.objectOf(assignmentShape).isRequired,
    assignmentFamilies: PropTypes.arrayOf(assignmentFamilyShape).isRequired,
    chooseLaterOption: PropTypes.bool,
    dropdownStyle: PropTypes.object,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
  };

  /**
   * Given an assignment family, return a list of versions representing valid
   * assignments within that family, with highest year numbers first.
   * @param {AssignmentFamilyShape} assignmentFamilyName
   * @returns {Object} Version object with the following properties:
   *   {string} year The year associated with this version, used as a key for
   *     identifying this version programmatically.
   *   {string} title The UI string associated with this version.
   */
  getVersions = assignmentFamilyName => {
    if (!assignmentFamilyName) {
      return [];
    }
    return _(this.props.assignments)
      .values()
      .filter(assignment => assignment.assignment_family_name === assignmentFamilyName)
      .map(getVersion)
      .sortBy('year')
      .reverse()
      .value();
  };

  constructor(props) {
    super(props);

    const { section, assignments } = props;

    let selectedAssignmentFamily, versions, selectedVersion, selectedPrimaryId, selectedSecondaryId;
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

    const primaryAssignment = assignments[selectedPrimaryId];
    if (primaryAssignment) {
      selectedAssignmentFamily = primaryAssignment.assignment_family_name;
      versions = this.getVersions(selectedAssignmentFamily);
      selectedVersion = getVersion(primaryAssignment);
    }

    this.state = {
      selectedAssignmentFamily,
      versions: versions || [],
      selectedVersion,
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
  onChangeAssignmentFamily = event => {
    const assignmentFamily = event.target.value;
    const { versions } = this.state;
    this.setPrimary(assignmentFamily, versions[0]);
  };

  onChangeVersion = event => {
    const { selectedAssignmentFamily, versions } = this.state;
    const versionYear = event.target.value;
    const version = versions.find(version => version.year === versionYear);
    this.setPrimary(selectedAssignmentFamily, version);
  };

  getSelectedPrimaryId(selectedAssignmentFamily, selectedVersion) {
    const primaryAssignment = _.values(this.props.assignments).find(assignment => (
      assignment.assignment_family_name === selectedAssignmentFamily &&
      assignment.version_year === selectedVersion.year
    ));

    if (!primaryAssignment) {
      return noAssignment;
    }

    return assignmentId(primaryAssignment.courseId, primaryAssignment.scriptId);
  }

  setPrimary = (selectedAssignmentFamily, selectedVersion) => {
    const versions = this.getVersions(selectedAssignmentFamily);
    selectedVersion = selectedVersion || versions[0];
    const selectedPrimaryId = this.getSelectedPrimaryId(selectedAssignmentFamily, selectedVersion);
    const selectedSecondaryId = noAssignment;

    this.setState({
      selectedAssignmentFamily,
      versions,
      selectedVersion,
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
    const { assignments, dropdownStyle, disabled } = this.props;
    let { assignmentFamilies } = this.props;
    const { selectedPrimaryId, selectedSecondaryId, selectedAssignmentFamily, versions, selectedVersion } = this.state;

    let secondaryOptions;
    const primaryAssignment = assignments[selectedPrimaryId];
    if (primaryAssignment) {
      secondaryOptions = primaryAssignment.scriptAssignIds;
      if (!hasAssignmentFamily(assignmentFamilies, primaryAssignment)) {
        assignmentFamilies = [_.pick(primaryAssignment, assignmentFamilyFields)]
          .concat(assignmentFamilies);
      }
    }

    const assignmentFamiliesByCategory = categorizeAssignmentFamilies(assignmentFamilies);

    return (
      <div>
        <select
          id="uitest-assignment-family"
          value={selectedAssignmentFamily}
          onChange={this.onChangeAssignmentFamily}
          style={dropdownStyle}
          disabled={disabled}
        >
          <option key="default"/>
          {this.props.chooseLaterOption &&
            <option key="later" value={decideLater}>
              {i18n.decideLater()}
            </option>
          }
          {Object.keys(assignmentFamiliesByCategory).map((categoryName, index) => (
            <optgroup key={index} label={categoryName}>
              {assignmentFamiliesByCategory[categoryName].map(assignmentFamily => (
                (assignmentFamily !== undefined) &&
                  <option
                    key={assignmentFamily.assignment_family_name}
                    value={assignmentFamily.assignment_family_name}
                  >
                    {assignmentFamily.assignment_family_title}
                  </option>
              ))}
            </optgroup>
          ))}
        </select>
        {versions.length > 1 && (
          <select
            id="assignment-version-year"
            value={selectedVersion.year}
            onChange={this.onChangeVersion}
            style={dropdownStyle}
            disabled={disabled}
          >
            {
              versions.map(version => (
                <option
                  key={version.year}
                  value={version.year}
                >
                  {
                    // If present, the 2018 version is the recommended one,
                    // because this will be the recommended version of csp and
                    // csd, which are the only two versioned courses we will
                    // show initially. This information will need to be provided
                    // by the server once we support versioning of scripts.
                  }
                  {version.year === '2018' ? `${version.title} (Recommended)` : version.title}
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
