import PropTypes from 'prop-types';
import React, {Component} from 'react';
import _ from 'lodash';
import i18n from '@cdo/locale';
import {sectionShape, assignmentCourseOfferingShape} from './shapes';
import AssignmentVersionSelector from './AssignmentVersionSelector';
import {CourseOfferingCategories} from '@cdo/apps/generated/curriculum/sharedCourseConstants';

const noAssignment = 0;
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

    let selectedCourseOfferingId, selectedCourseVersionId, selectedUnitId;
    if (!section) {
      selectedCourseOfferingId = noAssignment;
      selectedCourseVersionId = noAssignment;
      selectedUnitId = noAssignment;
    } else {
      selectedCourseOfferingId = section.courseOfferingId;
      selectedCourseVersionId = section.courseVersionId;
      selectedUnitId = section.unitId;
    }

    this.state = {
      selectedCourseOfferingId,
      selectedCourseVersionId,
      selectedUnitId
    };
  }

  getSelectedAssignment() {
    const {
      selectedCourseOfferingId,
      selectedCourseVersionId,
      selectedUnitId
    } = this.state;

    return {
      courseOfferingId: isValidAssignment(selectedCourseOfferingId)
        ? selectedCourseOfferingId
        : null,
      courseVersionId: isValidAssignment(selectedCourseVersionId)
        ? selectedCourseVersionId
        : null,
      unitId: isValidAssignment(selectedUnitId) ? selectedUnitId : null
    };
  }
  onChangeCourseOffering = event => {
    const courseOfferingId = event.target.value;
    let courseVersions = [];
    if (courseOfferingId !== noAssignment && courseOfferingId !== decideLater) {
      courseVersions = this.props.courseOfferings[courseOfferingId]
        .course_versions;
    }

    if (courseOfferingId === noAssignment || courseOfferingId === decideLater) {
      this.setState({
        selectedCourseOfferingId: noAssignment,
        selectedCourseVersionId: noAssignment,
        selectedUnitId: noAssignment
      });
    } else if (this.state.selectedCourseOfferingId !== courseOfferingId) {
      const recommendedCourseVersionId = Object.values(
        this.props.courseOfferings[courseOfferingId].course_versions
      ).find(versions => versions.is_recommended).id;

      this.setState({
        selectedCourseOfferingId: courseOfferingId,
        selectedCourseVersionId: recommendedCourseVersionId,
        selectedUnitId: noAssignment
      });
    } else if (Object.values(courseVersions).length === 1) {
      let courseVersionId = Object.keys(courseVersions)[0];

      if (Object.values(courseVersions.units).length === 1) {
        this.setState({
          selectedUnitId: Object.keys(courseVersions.units)[0],
          selectedCourseVersionId: courseVersionId,
          selectedCourseOfferingId: courseOfferingId
        });
      } else {
        this.setState({
          selectedUnitId: noAssignment,
          selectedCourseVersionId: courseVersionId,
          selectedCourseOfferingId: courseOfferingId
        });
      }
    }
  };

  onChangeCourseVersion = value => {
    const courseVersionId = value;
    const units = this.props.courseOfferings[
      this.state.selectedCourseOfferingId
    ].course_versions[courseVersionId].units;

    if (
      courseVersionId === noAssignment ||
      this.state.selectedCourseVersionId !== courseVersionId
    ) {
      this.setState({
        selectedUnitId: noAssignment,
        selectedCourseVersionId: courseVersionId
      });
    } else if (Object.values(units).length === 1) {
      let unitId = Object.keys(units)[0];
      this.setState({
        selectedUnitId: unitId,
        selectedCourseVersionId: courseVersionId
      });
    }
  };

  onChangeUnit = event => {
    this.setState(
      {
        selectedUnitId: event.target.value
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
    const {dropdownStyle, disabled, courseOfferings} = this.props;
    const {
      selectedCourseOfferingId,
      selectedCourseVersionId,
      selectedUnitId
    } = this.state;

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

    const selectedCourseOffering = courseOfferings[selectedCourseOfferingId];
    const selectedCourseVersion =
      selectedCourseOffering?.course_versions[selectedCourseVersionId];

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
        {selectedCourseOfferingId !== noAssignment &&
          selectedCourseOffering?.course_versions &&
          Object.entries(selectedCourseOffering?.course_versions)?.length >
            1 && (
            <AssignmentVersionSelector
              dropdownStyle={dropdownStyle}
              selectedCourseVersionId={selectedCourseVersionId}
              courseVersions={selectedCourseOffering?.course_versions}
              onChangeVersion={this.onChangeCourseVersion}
              disabled={disabled}
            />
          )}
        {selectedCourseVersionId !== 0 &&
          selectedCourseVersion?.units &&
          Object.entries(selectedCourseVersion?.units).length > 1 && (
            <div style={styles.secondary}>
              <div style={styles.dropdownLabel}>
                {i18n.assignmentSelectorUnit()}
              </div>
              <select
                id="uitest-secondary-assignment"
                value={selectedUnitId}
                onChange={this.onChangeUnit}
                style={dropdownStyle}
                disabled={disabled}
              >
                {Object.values(selectedCourseVersion?.units).map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
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
