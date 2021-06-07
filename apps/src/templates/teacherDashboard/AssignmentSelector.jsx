import PropTypes from 'prop-types';
import React, {Component} from 'react';
import _ from 'lodash';
import i18n from '@cdo/locale';
import {sectionShape, assignmentShape, assignmentFamilyShape} from './shapes';
import {assignmentId, assignmentFamilyFields} from './teacherSectionsRedux';
import AssignmentVersionSelector, {
  setRecommendedAndSelectedVersions
} from './AssignmentVersionSelector';

const noAssignment = assignmentId(null, null);
//Additional valid option in dropdown - no associated course
const decideLater = '__decideLater__';
const isValidAssignment = id => id !== noAssignment && id !== decideLater;

const hasAssignmentFamily = (assignmentFamilies, assignment) =>
  assignment &&
  assignmentFamilies.some(
    assignmentFamily =>
      assignmentFamily.assignment_family_name ===
      assignment.assignment_family_name
  );

/**
 * Group our assignment families by category for our dropdown
 */
const categorizeAssignmentFamilies = assignmentFamilies =>
  _(assignmentFamilies)
    .values()
    .orderBy([
      'category_priority',
      'category',
      'position',
      'assignment_family_title'
    ])
    .groupBy('category')
    .value();

const getVersion = assignment => ({
  year: assignment.version_year,
  title: assignment.version_title,
  isStable: assignment.is_stable,
  locales: assignment.supported_locales || []
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
    localeEnglishName: PropTypes.string,
    isNewSection: PropTypes.bool
  };

  /**
   * Given an assignment family, return a list of versions representing valid
   * assignments within that family, with highest year numbers first.
   * @param {AssignmentFamilyShape} assignmentFamilyName
   * @returns {Object} Version object with the following properties:
   *   {string} year The year associated with this version, used as a key for
   *     identifying this version programmatically.
   *   {string} title The UI string associated with this version.
   *   {boolean} isStable Whether this version is stable.
   *   {boolean} isRecommended Whether this is the latest stable version.
   */
  getVersions = (assignmentFamilyName, selectedVersionYear) => {
    if (!assignmentFamilyName) {
      return [];
    }
    const versions = _(this.props.assignments)
      .values()
      .filter(
        assignment => assignment.assignment_family_name === assignmentFamilyName
      )
      .map(getVersion)
      .sortBy('year')
      .reverse()
      .value();

    return setRecommendedAndSelectedVersions(
      versions,
      this.props.localeEnglishName,
      selectedVersionYear
    );
  };

  constructor(props) {
    super(props);

    const {section, assignments} = props;

    let selectedAssignmentFamily,
      versions,
      selectedPrimaryId,
      selectedSecondaryId;
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
      const selectedVersionYear = primaryAssignment.version_year;
      versions = this.getVersions(
        selectedAssignmentFamily,
        selectedVersionYear
      );
    }

    this.state = {
      selectedAssignmentFamily,
      versions: versions || [],
      selectedPrimaryId,
      selectedSecondaryId
    };
  }

  getSelectedAssignment() {
    const {selectedPrimaryId, selectedSecondaryId} = this.state;
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
        scriptId: primary ? primary.scriptId : null
      };
    }
  }
  onChangeAssignmentFamily = event => {
    const assignmentFamily = event.target.value;
    this.setPrimary(assignmentFamily);
  };

  onChangeVersion = versionYear => {
    const {selectedAssignmentFamily, versions} = this.state;
    const version = versions.find(version => version.year === versionYear);
    this.setPrimary(selectedAssignmentFamily, version.year);
  };

  getSelectedPrimaryId(selectedAssignmentFamily, selectedVersionYear) {
    const primaryAssignment = _.values(this.props.assignments).find(
      assignment =>
        assignment.assignment_family_name === selectedAssignmentFamily &&
        assignment.version_year === selectedVersionYear
    );

    if (!primaryAssignment) {
      return noAssignment;
    }

    return assignmentId(primaryAssignment.courseId, primaryAssignment.scriptId);
  }

  /** @param versions {Array.<assignmentVersionShape>} */
  getSelectedVersionYear(versions) {
    return versions.length > 0
      ? versions.find(v => v.isSelected).year
      : undefined;
  }

  /**
   * Updates this component's state to reflect a new primary assignment having been
   * made via change to the Assignment Family dropdown or the Version dropdown.
   * @param selectedAssignmentFamily {string}
   * @param versionYear {string|undefined} the version year selected by the user,
   * if one has been selected.
   */
  setPrimary = (selectedAssignmentFamily, versionYear) => {
    const versions = this.getVersions(selectedAssignmentFamily, versionYear);

    // The version year to show in the version dropdown. This will be the
    // versionYear if one was specified by the user, otherwise we choose a
    // default from the list of versions.
    //
    // We pull this info from the version list, because the version list is the
    // source of truth for the currently selected version.
    const selectedVersionYear = this.getSelectedVersionYear(versions);

    const selectedPrimaryId = this.getSelectedPrimaryId(
      selectedAssignmentFamily,
      selectedVersionYear
    );
    const primary = this.props.assignments[selectedPrimaryId];
    // If the user is setting up a new section and selects a course as the
    // primary assignment, default the secondary assignment to the first
    // script in the course.
    const defaultSecondaryId =
      this.props.isNewSection && primary && primary.scriptAssignIds
        ? primary.scriptAssignIds[0]
        : noAssignment;

    const selectedSecondaryId = this.props.isNewSection
      ? defaultSecondaryId
      : noAssignment;

    this.setState(
      {
        selectedAssignmentFamily,
        versions,
        selectedPrimaryId,
        selectedSecondaryId
      },
      this.reportChange
    );
  };

  onChangeSecondary = event => {
    this.setState(
      {
        selectedSecondaryId: event.target.value
      },
      this.reportChange
    );
  };

  reportChange = () => {
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(this.getSelectedAssignment());
    }
  };

  render() {
    const {assignments, dropdownStyle, disabled} = this.props;
    let {assignmentFamilies} = this.props;
    const {
      selectedPrimaryId,
      selectedSecondaryId,
      selectedAssignmentFamily,
      versions
    } = this.state;

    let secondaryOptions;
    const primaryAssignment = assignments[selectedPrimaryId];
    if (primaryAssignment) {
      secondaryOptions = primaryAssignment.scriptAssignIds;
      if (!hasAssignmentFamily(assignmentFamilies, primaryAssignment)) {
        assignmentFamilies = [
          _.pick(primaryAssignment, assignmentFamilyFields)
        ].concat(assignmentFamilies);
      }
    }

    const assignmentFamiliesByCategory = categorizeAssignmentFamilies(
      assignmentFamilies
    );

    return (
      <div>
        <span style={styles.family}>
          <div style={styles.dropdownLabel}>
            {i18n.assignmentSelectorCourse()}
          </div>
          <select
            id="uitest-assignment-family"
            value={selectedAssignmentFamily}
            onChange={this.onChangeAssignmentFamily}
            style={dropdownStyle}
            disabled={disabled}
          >
            <option key="default" />
            {this.props.chooseLaterOption && (
              <option key="later" value={decideLater}>
                {i18n.decideLater()}
              </option>
            )}
            {Object.keys(assignmentFamiliesByCategory).map(
              (categoryName, index) => (
                <optgroup key={index} label={categoryName}>
                  {assignmentFamiliesByCategory[categoryName].map(
                    assignmentFamily =>
                      assignmentFamily !== undefined && (
                        <option
                          key={assignmentFamily.assignment_family_name}
                          value={assignmentFamily.assignment_family_name}
                        >
                          {assignmentFamily.assignment_family_title}
                        </option>
                      )
                  )}
                </optgroup>
              )
            )}
          </select>
        </span>
        {versions.length > 1 && (
          <AssignmentVersionSelector
            dropdownStyle={dropdownStyle}
            versions={versions}
            onChangeVersion={this.onChangeVersion}
            disabled={disabled}
          />
        )}
        {secondaryOptions && (
          <div style={styles.secondary}>
            <div style={styles.dropdownLabel}>
              {i18n.assignmentSelectorUnit()}
            </div>
            <select
              id="uitest-secondary-assignment"
              value={selectedSecondaryId}
              onChange={this.onChangeSecondary}
              style={dropdownStyle}
              disabled={disabled}
            >
              {secondaryOptions.map(
                scriptAssignId =>
                  assignments[scriptAssignId] && (
                    <option key={scriptAssignId} value={scriptAssignId}>
                      {assignments[scriptAssignId].name}
                    </option>
                  )
              )}
              <option value={noAssignment} />
            </select>
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  family: {
    display: 'inline-block',
    marginTop: 4,
    marginRight: 6
  },
  secondary: {
    marginTop: 6
  },
  dropdownLabel: {
    fontFamily: '"Gotham 5r", sans-serif'
  }
};
