import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import i18n from '@cdo/locale';

import FontAwesome from '../../legacySharedComponents/FontAwesome';
import {removeExpandedLesson} from '../sectionProgress/sectionProgressRedux';

import LessonTitleTooltip, {getTooltipId} from './LessonTitleTooltip';
import {getLessonColumnHeaderId} from './LevelDataCell';
import LevelProgressHeader from './LevelProgressHeader';

import styles from './progress-table-v2.module.scss';

function ExpandedProgressColumnHeader({
  unitId,
  sectionId,
  lesson,
  removeExpandedLesson,
  expandedChoiceLevelIds,
}) {
  const expandedLevelHeaderRef = React.useRef();

  const [headerWidth, setHeaderWidth] = React.useState(0);

  React.useEffect(() => {
    const resizeObserver = new ResizeObserver(([entry]) => {
      if (entry.borderBoxSize) {
        // toFixed(1) is necessary because most browsers round to one decimal point,
        // But with zoom, borderBoxSize can be a float with many decimal points.
        const newWidth = entry.borderBoxSize[0].inlineSize.toFixed(1);
        setHeaderWidth(newWidth);
      }
    });
    resizeObserver.observe(expandedLevelHeaderRef.current);

    return () => resizeObserver.disconnect();
  }, [setHeaderWidth, expandedLevelHeaderRef]);

  // If there are 2 or less levels, we only show the number so that the text fits the cell.
  const headerText =
    lesson.levels.length < 3 && expandedChoiceLevelIds.length === 0
      ? lesson.relative_position
      : lesson.title;

  return (
    <tbody className={styles.expandedHeader} key={lesson.id}>
      <tr>
        <th
          className={styles.expandedHeaderLessonCell}
          style={{width: headerWidth + 'px', maxWidth: headerWidth + 'px'}}
          data-tip
          data-for={getTooltipId(lesson)}
          id={getLessonColumnHeaderId(lesson.id)}
          scope="colgroup"
        >
          <button
            id={
              'ui-test-expanded-progress-column-header-' +
              lesson.relative_position
            }
            onClick={() => removeExpandedLesson(unitId, sectionId, lesson.id)}
            aria-label={headerText}
            aria-expanded={true}
            type="button"
            className={styles.expandedHeaderLessonCellButton}
          >
            <LessonTitleTooltip lesson={lesson} />
            <FontAwesome
              icon="caret-down"
              className={styles.expandedHeaderCaret}
              title={i18n.unexpand()}
            />
            <div
              className={styles.expandedHeaderLessonText}
              title={lesson.title}
            >
              {headerText}
            </div>
          </button>
        </th>
      </tr>
      <tr
        className={styles.expandedHeaderSecondRow}
        ref={expandedLevelHeaderRef}
      >
        {lesson.levels.map(level => (
          <LevelProgressHeader
            key={level.id}
            lesson={lesson}
            level={level}
            isLevelExpanded={expandedChoiceLevelIds.includes(level.id)}
          />
        ))}
      </tr>
    </tbody>
  );
}

export default connect(
  state => ({
    sectionId: state.teacherSections.selectedSectionId,
    unitId: state.unitSelection.scriptId,
    expandedChoiceLevelIds: state.sectionProgress.expandedChoiceLevelIds,
  }),
  dispatch => ({
    removeExpandedLesson(unitId, sectionId, lessonId) {
      dispatch(removeExpandedLesson(unitId, sectionId, lessonId));
    },
  })
)(ExpandedProgressColumnHeader);

ExpandedProgressColumnHeader.propTypes = {
  unitId: PropTypes.number.isRequired,
  sectionId: PropTypes.number.isRequired,
  lesson: PropTypes.object.isRequired,
  removeExpandedLesson: PropTypes.func.isRequired,
  expandedChoiceLevelIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};
