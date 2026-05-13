import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Typography as MuiTypography} from '@mui/material';
import React from 'react';

import i18n from '@cdo/locale';

import {
  CalendarPlanItem as CalendarPlanItemData,
  CalendarPlanLesson,
} from './calendarPlanTypes';

import styles from './calendar.module.scss';

interface CalendarPlanItemProps {
  item: CalendarPlanItemData;
  lesson?: CalendarPlanLesson;
  draggable?: boolean;
  dragHandlePosition?: 'left' | 'right';
  onDragEnd?: (event: React.DragEvent) => void;
  onDragStart?: (event: React.DragEvent) => void;
  onRemove?: () => void;
  showDragHandle?: boolean;
  showDuration?: boolean;
  showRemoveButton?: boolean;
  showTypeIcon?: boolean;
}

const CalendarPlanItem: React.FC<CalendarPlanItemProps> = ({
  item,
  lesson,
  draggable,
  dragHandlePosition = 'left',
  onDragEnd,
  onDragStart,
  onRemove,
  showDragHandle = draggable,
  showDuration = true,
  showRemoveButton = !!onRemove,
  showTypeIcon = true,
}) => {
  const isPlaceholder = item.itemType === 'placeholder';
  const title = isPlaceholder
    ? item.placeholderTitle
    : lesson?.title.replace(/^Lesson\s+\d+:\s*/, '') ||
      `Lesson ${item.lessonId}`;
  const plannedMinutes = item.plannedMinutes || lesson?.duration;
  const dragHandle = showDragHandle && (
    <FontAwesomeV6Icon
      className={styles.dragHandleIcon}
      iconName="grip-vertical"
      iconStyle="solid"
    />
  );

  return (
    <div
      className={
        isPlaceholder
          ? styles.placeholderCalendarItem
          : styles.lessonCalendarItem
      }
      draggable={draggable}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
    >
      {dragHandlePosition === 'left' && dragHandle}
      {showTypeIcon && (
        <FontAwesomeV6Icon
          iconName={isPlaceholder ? 'note-sticky' : 'book-open'}
          iconStyle="solid"
        />
      )}
      <div className={styles.calendarItemContent}>
        {lesson?.url ? (
          <MuiTypography
            className={styles.calendarItemTitle}
            variant="body4"
            component="a"
            href={lesson.url}
          >
            {title}
          </MuiTypography>
        ) : (
          <MuiTypography
            className={styles.calendarItemTitle}
            variant="body4"
            component="span"
          >
            {title}
          </MuiTypography>
        )}
        {showDuration && plannedMinutes && (
          <MuiTypography
            className={styles.calendarItemDuration}
            variant="body4"
            component="span"
          >
            {plannedMinutes} min
          </MuiTypography>
        )}
      </div>
      <div className={styles.calendarItemActions}>
        {showRemoveButton && onRemove && (
          <IconButton
            size="small"
            aria-label={i18n.remove()}
            onClick={onRemove}
          >
            <FontAwesomeV6Icon iconName="trash" />
          </IconButton>
        )}
      </div>
      {dragHandlePosition === 'right' && dragHandle}
    </div>
  );
};

export default CalendarPlanItem;
