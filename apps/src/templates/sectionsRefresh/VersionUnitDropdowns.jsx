import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import moduleStyles from './sections-refresh.module.scss';

export default function VersionUnitDropdowns({
  courseOfferings,
  marketingAudience,
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

  const versionList = () => {
    return courseOfferings[marketingAudience][sectionCourse.id].course_versions;
  };

  return (
    <div className={moduleStyles.buttonRow}>
      <div className={moduleStyles.buttonsInRow}>
        {sectionCourse.versionId && (
          <span>
            <div>{i18n.assignmentSelectorCourse()}</div>
            <select
              id="uitest-version-dropdown"
              value={courseOfferings[marketingAudience]}
              onChange={updateCourseDetail(VERSION_ID, event.target.value)}
            >
              {versionList.map(cv => (
                <option key={cv.id} value={cv.id}>
                  {cv.key}
                </option>
              ))}
            </select>
          </span>
        )}
        {sectionCourse.unitId && (
          <span>
            <div>{i18n.assignmentSelectorCourse()}</div>
            <select
              id="uitest-unit-dropdown"
              value={courseOfferings[marketingAudience]}
              onChange={updateCourseDetail(UNIT_ID, event.target.value)}
            >
              <option key="default" value={noAssignment} />
              <option key="later" value={decideLater}>
                {i18n.decideLater()}
              </option>
              {courseOfferings.map(offering => (
                <optgroup
                  key={offering.display_name}
                  label={offering.display_name}
                >
                  {courseOfferings[marketingAudience]?.map(courseOffering => (
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
  courseOfferings: PropTypes.object.isRequired,
  marketingAudience: PropTypes.string.isRequired,
  updateCourse: PropTypes.func.isRequired,
  sectionCourse: PropTypes.object
};
