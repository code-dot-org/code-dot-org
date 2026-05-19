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
  onSplit?: () => void;
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
  onSplit,
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
  const splitLabel =
    item.splitPartIndex && item.splitPartCount
      ? `${item.splitPartIndex}/${item.splitPartCount}`
      : null;
  const plannedMinutes = item.plannedMinutes ?? lesson?.duration;
  const dragHandle = showDragHandle && (
    <FontAwesomeV6Icon
      className={styles.dragHandleIcon}
      iconName="grip-vertical"
      iconStyle="solid"
    />
  );
  const splitButton = onSplit && (
    <IconButton
      size="small"
      aria-label="Split lesson"
      onClick={event => {
        event.stopPropagation();
        onSplit();
      }}
    >
      <FontAwesomeV6Icon iconName="code-branch" />
    </IconButton>
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
            {splitLabel ? `${splitLabel} ${title}` : title}
          </MuiTypography>
        ) : (
          <MuiTypography
            className={styles.calendarItemTitle}
            variant="body4"
            component="span"
          >
            {splitLabel ? `${splitLabel} ${title}` : title}
          </MuiTypography>
        )}
        {showDuration && plannedMinutes !== undefined && (
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
      {dragHandlePosition === 'right' && (
        <div className={styles.calendarItemUtilityColumn}>
          {dragHandle}
          {splitButton}
        </div>
      )}
      {dragHandlePosition === 'left' && splitButton}
    </div>
  );
};

export default CalendarPlanItem;
