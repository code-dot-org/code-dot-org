import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {getCurrentUnitData} from '../../sectionProgress/sectionProgressRedux';
import ExpandedProgressColumnHeader from '../ExpandedProgressColumnHeader';
import LessonProgressColumnHeader from '../LessonProgressColumnHeader';

import styles from './floating-header.module.scss';
import progressStyles from '../progress-table-v2.module.scss';

/** A component that displays prop {header} at the top of
 * {child}. This header will float at the top of the screen
 * when the top of {child} is not visible.
 *
 * {child} must be a single element and not a list of elements.
 *  {child} should have all content visible and not itself scrollable.
 * header - the element to float at the top of the screen
 * {header} should have all content visible and not itself scrollable.
 */

function FloatingHeader({
  children,
  tableRef,
  id,
  lessons,
  expandedLessonIds,
  addExpandedLesson,
  removeExpandedLesson,
  addScrollCallback,
  removeScrollCallback,
  levelProgressByStudent,
  sortedStudents,
  outsideTableRef,
}) {
  const headerRef = React.useRef();
  const childContainerRef = React.useRef();

  const [floatHeader, setFloatHeader] = React.useState(false);

  const [headerWidth, setHeaderWidth] = React.useState(0);

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

    const shouldFloatHeader = !isTableTopVisible && !isTableOffScreen;

    if (shouldFloatHeader !== floatHeader) {
      setFloatHeader(shouldFloatHeader);
    }
  }, [childContainerRef, floatHeader, setFloatHeader]);

  React.useEffect(() => {
    window.addEventListener('scroll', handleScrollAndResize);
    window.addEventListener('resize', handleScrollAndResize);
    addScrollCallback(id, scroll => {
      if (headerRef.current) {
        headerRef.current.scrollLeft = scroll.target.scrollLeft;
      }
    });
    // Call it on initial render to set the initial state
    handleScrollAndResize();

    return () => {
      // return a cleanup function to unregister our function since it will run multiple times
      window.removeEventListener('scroll', handleScrollAndResize);
      window.removeEventListener('resize', handleScrollAndResize);
      removeScrollCallback(id);
    };
  }, [
    handleScrollAndResize,
    tableRef,
    addScrollCallback,
    id,
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
              key={lesson.id + 'header-cpy'}
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
            key={lesson.id + 'header-cpy'}
          >
            <LessonProgressColumnHeader
              lesson={lesson}
              addExpandedLesson={addExpandedLesson}
              allLocked={allLocked}
              key={lesson.id + 'header-cpy'}
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
      {floatHeader && (
        <div className={styles.floatHeader} style={{}}>
          <div
            style={{
              width: headerWidth + 'px',
              display: 'flex',
              flexDirection: 'row',
              overflowX: 'hidden',
            }}
            ref={headerRef}
          >
            {headers}
          </div>
        </div>
      )}
      <div className={styles.childContainer} ref={childContainerRef}>
        <div className={styles.child}>{children}</div>
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
}))(FloatingHeader);

FloatingHeader.propTypes = {
  children: PropTypes.node.isRequired,
  tableRef: PropTypes.object,
  id: PropTypes.number,
  addScrollCallback: PropTypes.func,
  removeScrollCallback: PropTypes.func,
  lessons: PropTypes.array,
  expandedLessonIds: PropTypes.array,
  addExpandedLesson: PropTypes.func,
  removeExpandedLesson: PropTypes.func,
  levelProgressByStudent: PropTypes.object,
  sortedStudents: PropTypes.array,
  outsideTableRef: PropTypes.object,
};
