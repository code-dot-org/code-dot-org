import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {getCurrentUnitData} from '../../sectionProgress/sectionProgressRedux';
import ExpandedProgressColumnHeader from '../ExpandedProgressColumnHeader';
import LessonProgressColumnHeader from '../LessonProgressColumnHeader';
import {
  areAllLevelsLocked,
  getLockedStatusPerStudent,
} from '../LockedLessonUtils';

import styles from './floating-header.module.scss';
import progressStyles from '../progress-table-v2.module.scss';

/** A component that displays lesson headers in a floating header above a table.
 *
 * 'ProgressTableV2' has a list of columns. Each column has a header.
 * This component has a copy of each header for each column in 'ProgressTableV2'.
 * These copies are grouped together into a floating header that is only displayed
 * when the original headers are not visible on the screen.
 *
 * {children}: the table to display below the floating header
 * {setScrollCallback}: A function that sets a function to be called when the table is scrolled
 * {outsideTableRef}: A reference to the table that the floating header is floating above
 */

function FloatingHeader({
  children,
  lessons,
  expandedLessonIds,
  setScrollCallback,
  levelProgressByStudent,
  sortedStudents,
  outsideTableRef,
}) {
  const headerRef = React.useRef();
  const childContainerRef = React.useRef();

  const [shouldFloatHeader, setShouldFloatHeader] = React.useState(false);

  const [headerWidth, setHeaderWidth] = React.useState(0);
  const [scrollPosition, setScrollPosition] = React.useState(0);

  const outsideTableResizeObserver = React.useMemo(
    () =>
      new ResizeObserver(([entry]) => {
        if (entry.borderBoxSize) {
          setHeaderWidth(entry.borderBoxSize[0].inlineSize);
        }
      }),
    [setHeaderWidth]
  );

  React.useEffect(() => {
    if (outsideTableResizeObserver && outsideTableRef?.current) {
      outsideTableResizeObserver.observe(outsideTableRef.current);
    }
    return () => {
      outsideTableResizeObserver.disconnect();
    };
  }, [outsideTableResizeObserver, outsideTableRef]);

  const handleScrollAndResize = React.useCallback(() => {
    const maxVisibleY =
      window.innerHeight || document.documentElement.clientHeight;

    const isTableTopVisible =
      childContainerRef?.current.getBoundingClientRect().top > 0;
    // Hide scrollbar if top is below screen or bottom is above screen.
    const isTableOffScreen =
      childContainerRef?.current.getBoundingClientRect().top > maxVisibleY ||
      childContainerRef?.current.getBoundingClientRect().bottom < 0;

    const newShouldFloatHeader = !isTableTopVisible && !isTableOffScreen;

    if (newShouldFloatHeader !== shouldFloatHeader) {
      setShouldFloatHeader(newShouldFloatHeader);
      if (newShouldFloatHeader && headerRef.current) {
        headerRef.current.scrollLeft = scrollPosition;
      }
    }
  }, [
    childContainerRef,
    shouldFloatHeader,
    setShouldFloatHeader,
    scrollPosition,
  ]);

  React.useEffect(() => {
    if (headerRef.current) {
      headerRef.current.scrollLeft = scrollPosition;
    }
  }, [scrollPosition, headerRef]);

  React.useEffect(() => {
    window.addEventListener('scroll', handleScrollAndResize);
    window.addEventListener('resize', handleScrollAndResize);
    setScrollCallback(() => scroll => {
      if (scroll?.target) {
        setScrollPosition(scroll.target.scrollLeft);
      }
    });

    // Set sizing and scroll on initial render
    handleScrollAndResize();

    return () => {
      // return a cleanup function to unregister our function since it will run multiple times
      window.removeEventListener('scroll', handleScrollAndResize);
      window.removeEventListener('resize', handleScrollAndResize);
      setScrollCallback(undefined);
    };
  }, [handleScrollAndResize, setScrollCallback, headerRef]);

  // For lockable lessons, check whether each level is locked for each student.
  // Used to control locked/unlocked icon in lesson header.
  const getLessonAllLocked = React.useCallback(
    lesson =>
      areAllLevelsLocked(
        getLockedStatusPerStudent(
          levelProgressByStudent,
          sortedStudents,
          lesson
        )
      ),
    [levelProgressByStudent, sortedStudents]
  );

  const headers = React.useMemo(
    () =>
      lessons.map(lesson => {
        if (expandedLessonIds.includes(lesson.id)) {
          return (
            <table
              className={progressStyles.expandedColumn}
              key={lesson.id + '-float-header'}
            >
              <ExpandedProgressColumnHeader lesson={lesson} />
            </table>
          );
        }
        return (
          <div
            className={progressStyles.lessonColumn}
            key={lesson.id + '-float-header'}
          >
            <LessonProgressColumnHeader
              lesson={lesson}
              allLocked={getLessonAllLocked(lesson)}
              key={lesson.id + '-float-header'}
            />
          </div>
        );
      }),
    [lessons, expandedLessonIds, getLessonAllLocked]
  );

  return (
    // The floating header is a copy of the header that isn't visible.
    // Screen readers should ignore it and only need the original/non-floating header..
    <div className={styles.floatingHeader} aria-hidden={true}>
      {shouldFloatHeader && (
        <div className={styles.floatHeader}>
          <div
            style={{
              width: headerWidth + 'px',
            }}
            className={styles.floatHeaderInterior}
            ref={headerRef}
          >
            {headers}
          </div>
        </div>
      )}
      <div ref={childContainerRef} className={styles.childContainer}>
        {children}
      </div>
    </div>
  );
}

export default connect(state => ({
  lessons: getCurrentUnitData(state)?.lessons || [],
  levelProgressByStudent:
    state.sectionProgress.studentLevelProgressByUnit[
      state.unitSelection.scriptId
    ],
  expandedLessonIds:
    state.sectionProgress.expandedLessonIds[
      state.teacherSections.selectedSectionId
    ] || [],
}))(FloatingHeader);

FloatingHeader.propTypes = {
  children: PropTypes.node.isRequired,
  setScrollCallback: PropTypes.func.isRequired,
  lessons: PropTypes.array.isRequired,
  expandedLessonIds: PropTypes.array.isRequired,
  levelProgressByStudent: PropTypes.object,
  sortedStudents: PropTypes.array,
  outsideTableRef: PropTypes.object,
};
