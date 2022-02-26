import PropTypes from 'prop-types';
import React, {Component} from 'react';
import _ from 'lodash';
import i18n from '@cdo/locale';
import {
  sectionShape,
  assignmentShape,
  assignmentCourseOfferingShape
} from './shapes';
import {assignmentId} from './teacherSectionsRedux';
import AssignmentVersionSelector from './AssignmentVersionSelector';
import {CourseOfferingCategories} from '@cdo/apps/generated/curriculum/sharedCourseConstants';

const noAssignment = assignmentId(null, null);
//Additional valid option in dropdown - no associated course
const decideLater = '__decideLater__';
const isValidAssignment = id => id !== noAssignment && id !== decideLater;

/**
 * This component displays a dropdown of courses/scripts, with each of these
 * grouped and ordered appropriately.
 */
export default class AssignmentSelector extends Component {
  static propTypes = {
    section: sectionShape,
    assignments: PropTypes.objectOf(assignmentShape).isRequired,
    courseOfferings: PropTypes.objectOf(assignmentCourseOfferingShape)
      .isRequired,
    chooseLaterOption: PropTypes.bool,
    dropdownStyle: PropTypes.object,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    localeCode: PropTypes.string,
    isNewSection: PropTypes.bool
  };

  constructor(props) {
    super(props);

    const {section} = props;

    let selectedPrimaryId,
      selectedSecondaryId,
      selectedCourseOfferingId,
      selectedCourseVersionId,
      selectedUnitId;
    if (!section) {
      selectedPrimaryId = noAssignment;
      selectedSecondaryId = noAssignment;
      selectedCourseOfferingId = 0;
      selectedCourseVersionId = 0;
      selectedUnitId = 0;
    } else if (section.courseId) {
      selectedPrimaryId = assignmentId(section.courseId, null);
      selectedSecondaryId = assignmentId(null, section.scriptId);

      selectedCourseOfferingId = section.courseOfferingId;
      selectedCourseVersionId = section.courseVersionId;
      selectedUnitId = section.unitId;
    } else {
      selectedPrimaryId = assignmentId(null, section.scriptId);
      selectedSecondaryId = noAssignment;

      selectedCourseOfferingId = section.courseOfferingId;
      selectedCourseVersionId = section.courseVersionId;
      selectedUnitId = section.unitId;
    }

    this.state = {
      selectedPrimaryId,
      selectedSecondaryId,
      selectedCourseOfferingId,
      selectedCourseVersionId,
      selectedUnitId
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
  onChangeCourseOffering = event => {
    const courseOfferingId = event.target.value;
    this.setState({selectedCourseOfferingId: courseOfferingId});
  };

  onChangeCourseVersion = value => {
    this.setState({selectedCourseVersionId: value});
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
    const {assignments, dropdownStyle, disabled, courseOfferings} = this.props;
    const {
      selectedPrimaryId,
      selectedSecondaryId,
      selectedCourseOfferingId,
      selectedCourseVersionId,
      selectedUnitId
    } = this.state;

    console.log(selectedUnitId);

    let secondaryOptions;
    const primaryAssignment = assignments[selectedPrimaryId];
    if (primaryAssignment) {
      secondaryOptions = primaryAssignment.scriptAssignIds;
    }

    let orderedCourseOfferings = _.orderBy(courseOfferings, 'display_name');
    orderedCourseOfferings = _.orderBy(
      orderedCourseOfferings,
      'is_featured',
      'desc'
    );
    const courseOfferingsByCategories = _.groupBy(
      orderedCourseOfferings,
      'category'
    );

    return (
      <div>
        <span style={styles.family}>
          <div style={styles.dropdownLabel}>
            {i18n.assignmentSelectorCourse()}
          </div>
          <select
            id="uitest-assignment-family"
            value={selectedCourseOfferingId}
            onChange={this.onChangeCourseOffering}
            style={dropdownStyle}
            disabled={disabled}
          >
            <option key="default" />
            {this.props.chooseLaterOption && (
              <option key="later" value={decideLater}>
                {i18n.decideLater()}
              </option>
            )}
            {Object.keys(CourseOfferingCategories).map(category => (
              <optgroup
                key={category}
                label={CourseOfferingCategories[category]}
              >
                {courseOfferingsByCategories[category]?.map(courseOffering => (
                  <option key={courseOffering.id} value={courseOffering.id}>
                    {courseOffering.display_name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </span>
        {selectedCourseOfferingId !== 0 &&
          courseOfferings[selectedCourseOfferingId]?.course_versions &&
          Object.entries(
            courseOfferings[selectedCourseOfferingId]?.course_versions
          )?.length > 1 && (
            <AssignmentVersionSelector
              dropdownStyle={dropdownStyle}
              selectedCourseVersionId={selectedCourseVersionId}
              courseVersions={
                courseOfferings[selectedCourseOfferingId]?.course_versions
              }
              onChangeVersion={this.onChangeCourseVersion}
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
