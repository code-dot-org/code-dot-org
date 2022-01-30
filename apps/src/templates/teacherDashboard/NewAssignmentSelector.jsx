import PropTypes from 'prop-types';
import React, {useState} from 'react';
import i18n from '@cdo/locale';
import {
  newAssignmentShape,
  assignmentCourseOfferingShape,
  sectionShape
} from './shapes';
import NewAssignmentVersionSelector from './NewAssignmentVersionSelector';
import {CourseOfferingCategories} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import _ from 'lodash';

const noUnitAssignment = {id: 0, name: ''};
const noCourseVersionAssignment = {id: 0, display_name: '', units: []};
const noCourseOfferingAssignment = {
  id: 0,
  display_name: '',
  course_version: []
};

/**
 * This component displays a dropdown of course offerings, course version and units.
 */
export default function NewAssignmentSelector(props) {
  const {assigned, courseOfferings, dropdownStyle, disabled} = props;

  const [selectedCourseOffering, setSelectedCourseOffering] = useState(
    assigned.course_offering
  );
  const [selectedCourseVersion, setSelectedCourseVersion] = useState(
    assigned.course_version
  );
  const [selectedUnit, setSelectedUnit] = useState(assigned.unit);

  // TO DO
  //highest year numbers first.

  // Decide later feature

  // This will be the
  // course version  if one was specified by the user, otherwise we choose a
  // default from the list of versions.

  // If the user is setting up a new section and selects a course version with units as the
  // primary assignment, default the secondary assignment to the first
  // unit in the course.

  const courseOfferingsByCategories = _.groupBy(courseOfferings, 'category');
  console.log(courseOfferingsByCategories);

  const updateSelectedUnit = unitId => {
    let newUnit = selectedCourseVersion.units.find(
      unit => unit.id === Number(unitId)
    );

    if (!newUnit) {
      setSelectedUnit(noUnitAssignment);
    }

    setSelectedUnit(newUnit);
  };

  const updateSelectedCourseVersion = courseVersionId => {
    let newCourseVersion = selectedCourseOffering.course_versions.find(
      courseVersion => courseVersion.id === Number(courseVersionId)
    );

    if (!newCourseVersion) {
      setSelectedCourseVersion(noCourseVersionAssignment);
      setSelectedUnit(noUnitAssignment);
    }

    setSelectedCourseVersion(newCourseVersion);

    if (newCourseVersion.units.length === 1) {
      setSelectedUnit(newCourseVersion.units[0]);
    } else {
      setSelectedUnit(noUnitAssignment);
    }
  };

  const updateSelectedCourseOffering = courseOfferingId => {
    let newCourseOffering = courseOfferings.find(
      courseOffering => courseOffering.id === Number(courseOfferingId)
    );

    if (!newCourseOffering) {
      setSelectedCourseOffering(noCourseOfferingAssignment);
      setSelectedCourseVersion(noCourseVersionAssignment);
      setSelectedUnit(noUnitAssignment);
    }

    setSelectedCourseOffering(newCourseOffering);
    if (newCourseOffering.course_versions.length === 1) {
      setSelectedCourseVersion(newCourseOffering.course_versions[0]);
      if (newCourseOffering.course_versions[0].units.length === 1) {
        setSelectedUnit(newCourseOffering.course_versions[0].units[0]);
      } else {
        setSelectedUnit(noUnitAssignment);
      }
    } else {
      setSelectedCourseVersion(noCourseVersionAssignment);
      setSelectedUnit(noUnitAssignment);
    }
  };

  return (
    <div>
      <span style={styles.family}>
        <div style={styles.dropdownLabel}>
          {i18n.assignmentSelectorCourse()}
        </div>
        <select
          id="uitest-assignment-course-offering"
          value={selectedCourseOffering.id}
          onChange={event => updateSelectedCourseOffering(event.target.value)}
          style={dropdownStyle}
          disabled={disabled}
        >
          <option key={0} value={0} />
          {CourseOfferingCategories.values.map(category => (
            <optgroup key={category} label={category}>
              {courseOfferingsByCategories[category].map(courseOffering => (
                <option key={courseOffering.id} value={courseOffering.id}>
                  {courseOffering.display_name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </span>
      {selectedCourseOffering?.course_versions.length > 1 && (
        <NewAssignmentVersionSelector
          dropdownStyle={dropdownStyle}
          selectedCourseVersion={selectedCourseVersion}
          courseVersions={selectedCourseOffering.course_versions}
          onChangeVersion={updateSelectedCourseVersion}
          disabled={disabled}
        />
      )}
      {selectedCourseVersion?.units.length > 1 && (
        <div style={styles.secondary}>
          <div style={styles.dropdownLabel}>
            {i18n.assignmentSelectorUnit()}
          </div>
          <select
            id="uitest-unit-assignment"
            value={selectedUnit.id}
            onChange={event => updateSelectedUnit(event.target.value)}
            style={dropdownStyle}
            disabled={disabled}
          >
            <option key={0} value={0} />
            {selectedCourseVersion.units.map(unit => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

NewAssignmentSelector.propTypes = {
  assigned: PropTypes.objectOf(newAssignmentShape).isRequired,
  courseOfferings: PropTypes.arrayOf(assignmentCourseOfferingShape).isRequired,
  dropdownStyle: PropTypes.object,
  disabled: PropTypes.bool,
  section: sectionShape,
  onChange: PropTypes.func
};

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
