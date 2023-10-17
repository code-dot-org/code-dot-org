import PropTypes from 'prop-types';
import React, {Component} from 'react';
import _ from 'lodash';
import i18n from '@cdo/locale';
import {sectionShape, assignmentCourseOfferingShape} from './shapes';
import AssignmentVersionSelector from './AssignmentVersionSelector';
import {
  CourseOfferingCategories,
  ParticipantAudiencesByType,
} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import {translatedCourseOfferingCategories} from './AssignmentSelectorHelpers';
import fontConstants from '@cdo/apps/fontConstants';

const noAssignment = '__noAssignment__';
//Additional valid option in dropdown - no associated course
const decideLater = '__decideLater__';
const isValidAssignment = id => id !== noAssignment && id !== decideLater;

export const getCourseOfferingsByCategory = (
  courseOfferings,
  participantType
) => {
  const filteredCourseOfferings = _.filter(
    courseOfferings,
    function (offering) {
      return ParticipantAudiencesByType[participantType].includes(
        offering.participant_audience
      );
    }
  );
  let orderedCourseOfferings = _.orderBy(
    filteredCourseOfferings,
    'display_name'
  );
  orderedCourseOfferings = _.orderBy(
    orderedCourseOfferings,
    'is_featured',
    'desc'
  );
  const courseOfferingsByCategories = _.groupBy(
    orderedCourseOfferings,
    'category'
  );

  return courseOfferingsByCategories;
};

/**
 * This component displays a dropdown of courses/scripts, with each of these
 * grouped and ordered appropriately.
 */
export default class AssignmentSelector extends Component {
  static propTypes = {
    section: sectionShape,
    courseOfferings: PropTypes.objectOf(assignmentCourseOfferingShape)
      .isRequired,
    dropdownStyle: PropTypes.object,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    isNewSection: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    const {section} = props;

    const selectedCourseOfferingId = section?.courseOfferingId
      ? section.courseOfferingId
      : noAssignment;
    const selectedCourseVersionId = section?.courseVersionId
      ? section.courseVersionId
      : noAssignment;
    const selectedUnitId = section?.unitId ? section.unitId : noAssignment;

    this.state = {
      selectedCourseOfferingId,
      selectedCourseVersionId,
      selectedUnitId,
    };
  }

  getSelectedAssignment() {
    const {selectedCourseOfferingId, selectedCourseVersionId, selectedUnitId} =
      this.state;

    return {
      courseOfferingId: isValidAssignment(selectedCourseOfferingId)
        ? selectedCourseOfferingId
        : null,
      courseVersionId: isValidAssignment(selectedCourseVersionId)
        ? selectedCourseVersionId
        : null,
      unitId: isValidAssignment(selectedUnitId) ? selectedUnitId : null,
    };
  }

  onChangeCourseOffering = event => {
    if (
      (event.target.value === noAssignment &&
        this.state.selectedCourseOfferingId !== noAssignment) ||
      (event.target.value === decideLater &&
        this.state.selectedCourseOfferingId !== decideLater)
    ) {
      this.setState(
        {
          selectedCourseOfferingId: event.target.value,
          selectedCourseVersionId: noAssignment,
          selectedUnitId: noAssignment,
        },
        this.reportChange
      );
    } else {
      const courseOfferingId = Number(event.target.value);

      if (this.state.selectedCourseOfferingId !== courseOfferingId) {
        const courseVersions =
          this.props.courseOfferings[courseOfferingId]?.course_versions;

        let courseVersionId;

        if (Object.keys(courseVersions).length === 1) {
          courseVersionId = Object.values(courseVersions)[0].id;
        } else {
          courseVersionId = Object.values(courseVersions)?.find(
            versions => versions.is_recommended
          )?.id;
        }

        const units = courseVersionId
          ? Object.values(
              _.orderBy(courseVersions[courseVersionId].units, 'position')
            )
          : null;
        const firstUnitId = units?.length > 1 ? units[0].id : noAssignment;

        this.setState(
          {
            selectedCourseOfferingId: courseOfferingId,
            selectedCourseVersionId: courseVersionId,
            selectedUnitId: firstUnitId,
          },
          this.reportChange
        );
      }
    }
  };

  onChangeCourseVersion = value => {
    if (
      value === noAssignment &&
      this.state.selectedCourseVersionId !== noAssignment
    ) {
      this.setState(
        {
          selectedUnitId: noAssignment,
          selectedCourseVersionId: noAssignment,
        },
        this.reportChange
      );
    } else {
      const courseVersionId = Number(value);

      if (this.state.selectedCourseVersionId !== courseVersionId) {
        const units = Object.values(
          _.orderBy(
            this.props.courseOfferings[this.state.selectedCourseOfferingId]
              ?.course_versions[courseVersionId].units,
            'position'
          )
        );
        const firstUnitId = units.length > 1 ? units[0].id : noAssignment;
        this.setState(
          {
            selectedUnitId: firstUnitId,
            selectedCourseVersionId: courseVersionId,
          },
          this.reportChange
        );
      }
    }
  };

  onChangeUnit = event => {
    if (
      event.target.value === noAssignment &&
      this.state.selectedUnitId !== noAssignment
    ) {
      this.setState(
        {
          selectedUnitId: noAssignment,
        },
        this.reportChange
      );
    } else {
      const unitId = Number(event.target.value);
      if (this.state.selectedUnitId !== unitId) {
        this.setState(
          {
            selectedUnitId: unitId,
          },
          this.reportChange
        );
      }
    }
  };

  reportChange = () => {
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(this.getSelectedAssignment());
    }
  };

  render() {
    const {dropdownStyle, disabled, courseOfferings, section} = this.props;
    const {selectedCourseOfferingId, selectedCourseVersionId, selectedUnitId} =
      this.state;

    const courseOfferingsByCategories = getCourseOfferingsByCategory(
      courseOfferings,
      section.participantType
    );

    const selectedCourseOffering = courseOfferings[selectedCourseOfferingId];
    const selectedCourseVersion =
      selectedCourseOffering?.course_versions[selectedCourseVersionId];

    const orderedUnits = _.orderBy(selectedCourseVersion?.units, 'position');

    /**
     * Filter down the list of all available categories to only the categories
     * where the user has course offerings that they can assign. For example
     * teachers will not be able to see PL course offerings because they
     * can not assign them so they should not see the PL course offerings either
     */
    const filteredCategories = _.filter(
      CourseOfferingCategories,
      function (category) {
        return courseOfferingsByCategories[category];
      }
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
            <option key="default" value={noAssignment} />
            <option key="later" value={decideLater}>
              {i18n.decideLater()}
            </option>
            {filteredCategories.map(category => (
              <optgroup
                key={category}
                label={translatedCourseOfferingCategories[category]}
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
          orderedUnits &&
          Object.entries(orderedUnits).length > 1 && (
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
                {Object.values(orderedUnits).map(unit => (
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
    marginRight: 6,
  },
  secondary: {
    marginTop: 6,
  },
  dropdownLabel: {
    ...fontConstants['main-font-semi-bold'],
  },
};
