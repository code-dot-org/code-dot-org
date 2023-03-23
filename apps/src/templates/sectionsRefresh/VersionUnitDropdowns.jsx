import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import moduleStyles from './sections-refresh.module.scss';
import AssignmentVersionSelector from '../teacherDashboard/AssignmentVersionSelector';
import _ from 'lodash';

export default function VersionUnitDropdowns({
  courseOffering,
  updateCourse,
  sectionCourse
}) {
  const VERSION_ID = 'versionId';
  const noAssignment = '__noAssignment__';

  const updateCourseDetail = (label, id) => {
    sectionCourse[label] = id;
    updateCourse(sectionCourse);
  };

  const prepareCourseVersions = () => {
    const versionObject = {};
    courseOffering?.course_versions.map(cv => {
      versionObject[cv[1].id] = cv[1];
    });
    return versionObject;
  };

  const selectedCourseVersionObject = prepareCourseVersions()[
    (sectionCourse?.versionId)
  ];

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
      updateCourse({...sectionCourse, unitId: unitId});
    }
  };

  return (
    <div className={moduleStyles.buttonRow}>
      <div className={moduleStyles.buttonsInRow}>
        {courseOffering && (
          <AssignmentVersionSelector
            selectedCourseVersionId={sectionCourse.versionId}
            courseVersions={prepareCourseVersions()}
            onChangeVersion={id => updateCourseDetail(VERSION_ID, id)}
          />
        )}
        {sectionCourse?.versionId !== 0 &&
          orderedUnits &&
          Object.entries(orderedUnits).length > 1 && (
            <span>
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
  sectionCourse: PropTypes.object
};
