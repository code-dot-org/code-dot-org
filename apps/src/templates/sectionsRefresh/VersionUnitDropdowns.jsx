import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import moduleStyles from './sections-refresh.module.scss';
import AssignmentVersionSelector from '../teacherDashboard/AssignmentVersionSelector';

export default function VersionUnitDropdowns({
  courseOffering,
  updateCourse,
  sectionCourse
}) {
  const VERSION_ID = 'versionId';
  const UNIT_ID = 'unitId';
  const noAssignment = '__noAssignment__';
  const decideLater = '__decideLater__';

  const updateCourseDetail = (label, id) => {
    sectionCourse[label] = id;
    updateCourse(sectionCourse);
  };

  const prepareCourseVersions = () => {
    const versionObject = {};
    courseOffering.course_versions.map(cv => {
      versionObject[cv[1].id] = cv[1];
    });
    return versionObject;
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
        {sectionCourse?.unitId && (
          <span>
            <div>{i18n.assignmentSelectorCourse()}</div>
            <select
              id="uitest-unit-dropdown"
              value={courseOffering}
              onChange={updateCourseDetail(UNIT_ID, event.target.value)}
            >
              <option key="default" value={noAssignment} />
              <option key="later" value={decideLater}>
                {i18n.decideLater()}
              </option>
              {courseOffering.map(offering => (
                <optgroup
                  key={offering.display_name}
                  label={offering.display_name}
                >
                  {courseOffering?.map(courseOffering => (
                    <option key={courseOffering.id} value={courseOffering.id}>
                      {courseOffering.display_name}
                    </option>
                  ))}
                </optgroup>
              ))}
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
