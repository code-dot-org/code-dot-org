import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import i18n from '@cdo/locale';

import FontAwesome from '../FontAwesome';

import LessonTitleTooltip, {getTooltipId} from './LessonTitleTooltip';
import {getLessonColumnHeaderId} from './LevelDataCell';
import LevelProgressHeader from './LevelProgressHeader';

import styles from './progress-table-v2.module.scss';

export default function ExpandedProgressColumnHeader({
  lesson,
  removeExpandedLesson,
  expandedChoiceLevels,
  toggleExpandedChoiceLevel,
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
    lesson.levels.length < 3 && expandedChoiceLevels.length === 0
      ? lesson.relative_position
      : lesson.title;

  return (
    <tbody className={styles.expandedHeader} key={lesson.id}>
      <tr>
        <th
          className={classNames(
            styles.gridBox,
            styles.expandedHeaderLessonCell,
            styles.pointerMouse
          )}
          style={{width: headerWidth + 'px'}}
          onClick={() => removeExpandedLesson(lesson.id)}
          aria-label={headerText}
          data-tip
          data-for={getTooltipId(lesson)}
          id={getLessonColumnHeaderId(lesson.id)}
          scope="colgroup"
        >
          <LessonTitleTooltip lesson={lesson} />
          <FontAwesome
            icon="caret-down"
            className={styles.expandedHeaderCaret}
            title={i18n.unexpand()}
          />
          <div className={styles.expandedHeaderLessonText}>{headerText}</div>
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
            isLevelExpanded={expandedChoiceLevels.includes(level.id)}
            toggleExpandedChoiceLevel={toggleExpandedChoiceLevel}
          />
        ))}
      </tr>
    </tbody>
  );
}

ExpandedProgressColumnHeader.propTypes = {
  lesson: PropTypes.object.isRequired,
  removeExpandedLesson: PropTypes.func.isRequired,
  expandedChoiceLevels: PropTypes.arrayOf(PropTypes.string).isRequired,
  toggleExpandedChoiceLevel: PropTypes.func.isRequired,
};
