import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {getCurrentUnitData} from '../../sectionProgress/sectionProgressRedux';
import ExpandedProgressColumnHeader from '../ExpandedProgressColumnHeader';
import LessonProgressColumnHeader from '../LessonProgressColumnHeader';

import styles from './floating-header.module.scss';
import progressStyles from '../progress-table-v2.module.scss';

/** A component that displays lesson headers in a floating header above a table.
 *
 * Each column (e.g. LessonProgressDataColumn) displays a header.
 * This component has a copy of each header,
 * and only shows the copy when the original is not visible.
 *
 * {children}: the table to display below the floating header
 */

function FloatingHeader({
  children,
  lessons,
  expandedLessonIds,
  addExpandedLesson,
  removeExpandedLesson,
  setScrollCallback,
  removeScrollCallback,
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
  }, [
    handleScrollAndResize,
    setScrollCallback,
    removeScrollCallback,
    headerRef,
  ]);

  const lockedPerStudent = React.useCallback(
    lesson =>
      Object.fromEntries(
        sortedStudents.map(student => [
          student.id,
          lesson.lockable &&
            lesson.levels.every(
              level => levelProgressByStudent[student.id][level.id]?.locked
            ),
        ])
      ),
    [levelProgressByStudent, sortedStudents]
  );

  // For lockable lessons, check whether each level is locked for each student.
  // Used to control locked/unlocked icon in lesson header.
  const allLocked = React.useMemo(
    () => sortedStudents.every(student => lockedPerStudent[student.id]),
    [sortedStudents, lockedPerStudent]
  );

  // Will need to implement this.
  // Most likely by moving the state up to `ProgressTableV2`
  const toggleExpandedChoiceLevel = () => {};
  const expandedChoiceLevels = React.useMemo(() => [], []);

  const headers = React.useMemo(
    () =>
      lessons.map(lesson => {
        if (expandedLessonIds.includes(lesson.id)) {
          return (
            <table
              className={progressStyles.expandedColumn}
              key={lesson.id + '-float-header'}
            >
              <ExpandedProgressColumnHeader
                lesson={lesson}
                removeExpandedLesson={removeExpandedLesson}
                expandedChoiceLevels={expandedChoiceLevels}
                toggleExpandedChoiceLevel={toggleExpandedChoiceLevel}
              />
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
              addExpandedLesson={addExpandedLesson}
              allLocked={allLocked}
              key={lesson.id + '-float-header'}
            />
          </div>
        );
      }),
    [
      lessons,
      expandedLessonIds,
      expandedChoiceLevels,
      addExpandedLesson,
      removeExpandedLesson,
      allLocked,
    ]
  );

  return (
    <div className={styles.floatingHeader}>
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
      <div ref={childContainerRef}>{children}</div>
    </div>
  );
}

export default connect(state => ({
  lessons: getCurrentUnitData(state)?.lessons || [],
  levelProgressByStudent:
    state.sectionProgress.studentLevelProgressByUnit[
      state.unitSelection.scriptId
    ],
}))(FloatingHeader);

FloatingHeader.propTypes = {
  children: PropTypes.node.isRequired,
  setScrollCallback: PropTypes.func,
  removeScrollCallback: PropTypes.func,
  lessons: PropTypes.array,
  expandedLessonIds: PropTypes.array,
  addExpandedLesson: PropTypes.func,
  removeExpandedLesson: PropTypes.func,
  levelProgressByStudent: PropTypes.object,
  sortedStudents: PropTypes.array,
  outsideTableRef: PropTypes.object,
};
