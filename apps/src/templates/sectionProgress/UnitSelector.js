import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {asyncLoadCoursesWithProgress} from '@cdo/apps/redux/unitSelectionRedux';

import styles from './unit-selector.module.scss';
import skeletonizeContent from '@cdo/apps/sharedComponents/skeletonize-content.module.scss';

function UnitSelector({
  scriptId,
  onChange,
  coursesWithProgress,
  asyncLoadCoursesWithProgress,
  isLoadingCourses,
}) {
  React.useEffect(() => {
    if (!coursesWithProgress || coursesWithProgress.length === 0) {
      asyncLoadCoursesWithProgress();
    }
  }, [coursesWithProgress, asyncLoadCoursesWithProgress]);

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

  return isLoadingCourses ||
    !coursesWithProgress ||
    coursesWithProgress.length === 0 ? (
    loadingSkeleton()
  ) : (
    <div>
      <select
        value={scriptId || undefined}
        onChange={event => onChange(parseInt(event.target.value))}
        className={styles.dropdown}
        id="uitest-course-dropdown"
      >
        {coursesWithProgress.map((version, index) => (
          <optgroup key={index} label={version.display_name}>
            {version.units.map(unit => (
              <option key={unit.id} value={unit.id}>
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
  onChange: PropTypes.func.isRequired,
  asyncLoadCoursesWithProgress: PropTypes.func.isRequired,
  isLoadingCourses: PropTypes.bool,
};

export const UnconnectedUnitSelector = UnitSelector;

export default connect(
  state => ({
    coursesWithProgress: state.unitSelection.coursesWithProgress,
    isLoadingCourses: state.unitSelection.isLoadingCoursesWithProgress,
  }),
  dispatch => ({
    asyncLoadCoursesWithProgress() {
      dispatch(asyncLoadCoursesWithProgress());
    },
  })
)(UnitSelector);
