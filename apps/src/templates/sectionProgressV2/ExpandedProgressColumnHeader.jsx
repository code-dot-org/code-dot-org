import React from 'react';
import PropTypes from 'prop-types';
import styles from './progress-table-v2.module.scss';
import classNames from 'classnames';
import FontAwesome from '../FontAwesome';
import LevelProgressHeader from './LevelProgressHeader';
import LessonTitleTooltip, {getTooltipId} from './LessonTitleTooltip';
import i18n from '@cdo/locale';

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
        const newWidth = entry.borderBoxSize[0].inlineSize.toFixed(1);
        console.log(
          'lfm',
          entry.borderBoxSize[0],
          entry.contentBoxSize[0],
          newWidth
        );
        setHeaderWidth(newWidth);
      }
    });
    resizeObserver.observe(expandedLevelHeaderRef.current);
  }, [setHeaderWidth, expandedLevelHeaderRef]);

  // If there are 2 or less levels, we only show the number so that the text fits the cell.
  const headerText =
    lesson.levels.length < 3 && expandedChoiceLevels.length === 0
      ? lesson.relative_position
      : lesson.title;

  return (
    <div className={styles.expandedHeader} key={lesson.id}>
      <div
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
      >
        <LessonTitleTooltip lesson={lesson} />
        <FontAwesome
          icon="caret-down"
          className={styles.expandedHeaderCaret}
          title={i18n.unexpand()}
        />
        <div className={styles.expandedHeaderLessonText}>{headerText}</div>
      </div>
      <div
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
      </div>
    </div>
  );
}

ExpandedProgressColumnHeader.propTypes = {
  lesson: PropTypes.object.isRequired,
  removeExpandedLesson: PropTypes.func.isRequired,
  expandedChoiceLevels: PropTypes.arrayOf(PropTypes.string).isRequired,
  toggleExpandedChoiceLevel: PropTypes.func.isRequired,
};
