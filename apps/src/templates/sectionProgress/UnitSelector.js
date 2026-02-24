import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {asyncLoadCoursesWithProgress} from '@cdo/apps/redux/unitSelectionRedux';

import styles from './unit-selector.module.scss';
import skeletonizeContent from '@cdo/apps/sharedComponents/skeletonize-content.module.scss';

function UnitSelector({
  sectionId,
  scriptId,
  courseVersionId,
  onChange,
  coursesWithProgress,
  asyncLoadCoursesWithProgress,
  isLoadingCourses,
  isLoadingSectionData,
}) {
  // Reload courses with progress when selected section changes.
  React.useEffect(() => {
    if (sectionId) {
      asyncLoadCoursesWithProgress();
    }
  }, [sectionId, asyncLoadCoursesWithProgress]);

  const loadingSkeleton = () => (
    <div>
      <div
        className={classNames(
          styles.dropdown,
          styles.skeletonDropdown,
          skeletonizeContent.skeletonizeContent
        )}
        disabled={true}
      />
    </div>
  );
  const onSelectUnit = e => {
    const value = e.target.value;
    const [newCourseVersionId, newUnitId] = value.includes('-')
      ? value.split('-').map(id => parseInt(id))
      : [undefined, parseInt(value)];
    onChange(newUnitId, newCourseVersionId);
  };

  const selectedValue =
    scriptId && courseVersionId ? `${courseVersionId}-${scriptId}` : undefined;
  return isLoadingSectionData ||
    isLoadingCourses ||
    !coursesWithProgress ||
    coursesWithProgress.length === 0 ? (
    loadingSkeleton()
  ) : (
    <div>
      <select
        value={selectedValue}
        onChange={onSelectUnit}
        className={styles.dropdown}
        id="uitest-course-dropdown"
      >
        {coursesWithProgress.map((version, index) => (
          <optgroup key={index} label={version.display_name}>
            {version.units.map(unit => (
              <option key={unit.id} value={`${version.id}-${unit.id}`}>
                {unit.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

UnitSelector.propTypes = {
  coursesWithProgress: PropTypes.array.isRequired,
  scriptId: PropTypes.number,
  courseVersionId: PropTypes.number,
  sectionId: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  asyncLoadCoursesWithProgress: PropTypes.func.isRequired,
  isLoadingCourses: PropTypes.bool,
  isLoadingSectionData: PropTypes.bool.isRequired,
};

export const UnconnectedUnitSelector = UnitSelector;

export default connect(
  state => ({
    coursesWithProgress: state.unitSelection.coursesWithProgress,
    sectionId: state.teacherSections.selectedSectionId,
    isLoadingCourses: state.unitSelection.isLoadingCoursesWithProgress,
    isLoadingSectionData: state.teacherSections.isLoadingSectionData,
  }),
  dispatch => ({
    asyncLoadCoursesWithProgress() {
      dispatch(asyncLoadCoursesWithProgress());
    },
  })
)(UnitSelector);
