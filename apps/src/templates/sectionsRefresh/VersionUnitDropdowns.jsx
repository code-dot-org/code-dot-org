import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import moduleStyles from './sections-refresh.module.scss';
import AssignmentVersionSelector from '../teacherDashboard/AssignmentVersionSelector';
import _ from 'lodash';

export default function VersionUnitDropdowns({
  courseOffering,
  updateCourse,
  sectionCourse,
}) {
  const VERSION_ID = 'versionId';
  const UNIT_ID = 'unitId';
  const noAssignment = '__noAssignment__';

  // When selecting a new version, remove the outdated assigned unit
  const updateCourseVersion = id => {
    sectionCourse[VERSION_ID] = id;
    sectionCourse[UNIT_ID] = null;
    updateCourse(sectionCourse);
  };

  const prepareCourseVersions = () => {
    const versionObject = {};
    courseOffering?.course_versions.map(cv => {
      versionObject[cv[1].id] = cv[1];
    });
    return versionObject;
  };

  const selectedCourseVersionObject =
    prepareCourseVersions()[sectionCourse?.versionId];

  const orderedUnits = _.orderBy(
    selectedCourseVersionObject?.units,
    'position'
  );

  const selectedUnitId = sectionCourse?.unitId
    ? sectionCourse.unitId
    : noAssignment;

  const onChangeUnit = event => {
    if (event.target.value === noAssignment) {
      updateCourse({...sectionCourse, unitId: null});
    } else {
      const unitId = Number(event.target.value);
      const selectedUnit = Object.values(orderedUnits).find(
        unit => unit.id === unitId
      );
      updateCourse({
        ...sectionCourse,
        unitId: unitId,
        hasLessonExtras: selectedUnit.lesson_extras_available,
        hasTextToSpeech: selectedUnit.text_to_speech_enabled,
      });
    }
  };

  return (
    <div className={moduleStyles.buttonRow}>
      <div className={moduleStyles.buttonsInRow}>
        {Object.values(prepareCourseVersions()).length > 1 &&
          courseOffering && (
            <AssignmentVersionSelector
              selectedCourseVersionId={sectionCourse.versionId}
              courseVersions={prepareCourseVersions()}
              onChangeVersion={id => updateCourseVersion(id)}
            />
          )}
        {sectionCourse?.versionId &&
          orderedUnits &&
          Object.entries(orderedUnits).length > 1 && (
            <span className={moduleStyles.unitDropdown}>
              <div>{i18n.startWithUnit()}</div>
              <select
                id="uitest-secondary-assignment"
                value={selectedUnitId}
                onChange={onChangeUnit}
              >
                {Object.values(orderedUnits).map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
                <option value={noAssignment} />
              </select>
            </span>
          )}
      </div>
    </div>
  );
}

VersionUnitDropdowns.propTypes = {
  courseOffering: PropTypes.object,
  updateCourse: PropTypes.func.isRequired,
  sectionCourse: PropTypes.object,
};
