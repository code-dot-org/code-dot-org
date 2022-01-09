import PropTypes from 'prop-types';
import React, {useState} from 'react';
import i18n from '@cdo/locale';
import {newAssignmentShape, assignmentCourseOfferingShape} from './shapes';
import {assignmentId} from './teacherSectionsRedux';
import NewAssignmentVersionSelector from './NewAssignmentVersionSelector';

const noAssignment = assignmentId(null, null);
//Additional valid option in dropdown - no associated course
const decideLater = '__decideLater__';

/**
 * This component displays a dropdown of course offerings, course version and units.
 */
export default function NewAssignmentSelector(props) {
  const {
    assigned,
    courseOfferings,
    chooseLaterOption,
    dropdownStyle,
    disabled
  } = props;

  const [selectedCourseOffering, setSelectedCourseOffering] = useState(
    assigned.course_offering
  );
  const [selectedCourseVersion, setSelectedCourseVersion] = useState(
    assigned.course_version
  );
  const [selectedUnit, setSelectedUnit] = useState(assigned.unit);

  return (
    <div>
      <span style={styles.family}>
        <div style={styles.dropdownLabel}>
          {i18n.assignmentSelectorCourse()}
        </div>
        <select
          id="uitest-assignment-course-offering"
          value={selectedCourseOffering}
          onChange={setSelectedCourseOffering}
          style={dropdownStyle}
          disabled={disabled}
        >
          <option key="default" />
          {chooseLaterOption && (
            <option key="later" value={decideLater}>
              {i18n.decideLater()}
            </option>
          )}
          {courseOfferings.map(courseOffering => (
            <option
              key={courseOffering.id}
              label={courseOffering.display_name}
              value={courseOffering}
            >
              {courseOffering.display_name}
            </option>
          ))}
        </select>
      </span>
      {selectedCourseOffering.course_versions.length > 1 && (
        <NewAssignmentVersionSelector
          dropdownStyle={dropdownStyle}
          selectedCourseVersion={selectedCourseVersion}
          versions={selectedCourseOffering.course_versions}
          onChangeVersion={setSelectedCourseVersion}
          disabled={disabled}
        />
      )}
      {selectedCourseVersion.units.length > 1 && (
        <div style={styles.secondary}>
          <div style={styles.dropdownLabel}>
            {i18n.assignmentSelectorUnit()}
          </div>
          <select
            id="uitest-unit-assignment"
            value={selectedUnit}
            onChange={setSelectedUnit}
            style={dropdownStyle}
            disabled={disabled}
          >
            {selectedCourseVersion.units.map(unit => (
              <option key={unit.id} value={unit}>
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

NewAssignmentSelector.propTypes = {
  assigned: PropTypes.objectOf(newAssignmentShape).isRequired,
  courseOfferings: PropTypes.arrayOf(assignmentCourseOfferingShape).isRequired,
  chooseLaterOption: PropTypes.bool,
  dropdownStyle: PropTypes.object,
  disabled: PropTypes.bool
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
