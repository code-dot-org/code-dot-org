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
  onMovePrevious?: () => void;
  onMoveNext?: () => void;
  onRemove?: () => void;
}

const CalendarPlanItem: React.FC<CalendarPlanItemProps> = ({
  item,
  lesson,
  onMovePrevious,
  onMoveNext,
  onRemove,
}) => {
  const isPlaceholder = item.itemType === 'placeholder';
  const title = isPlaceholder
    ? item.placeholderTitle
    : lesson?.title || `Lesson ${item.lessonId}`;

  return (
    <div
      className={
        isPlaceholder
          ? styles.placeholderCalendarItem
          : styles.lessonCalendarItem
      }
    >
      <FontAwesomeV6Icon
        iconName={isPlaceholder ? 'note-sticky' : 'book-open'}
        iconStyle="solid"
      />
      <MuiTypography variant="body4" component="span">
        {title}
      </MuiTypography>
      <div className={styles.calendarItemActions}>
        {onMovePrevious && (
          <IconButton
            size="small"
            aria-label={i18n.moveEarlier()}
            onClick={onMovePrevious}
          >
            <FontAwesomeV6Icon iconName="arrow-left" />
          </IconButton>
        )}
        {onMoveNext && (
          <IconButton
            size="small"
            aria-label={i18n.moveLater()}
            onClick={onMoveNext}
          >
            <FontAwesomeV6Icon iconName="arrow-right" />
          </IconButton>
        )}
        {onRemove && (
          <IconButton
            size="small"
            aria-label={i18n.remove()}
            onClick={onRemove}
          >
            <FontAwesomeV6Icon iconName="trash" />
          </IconButton>
        )}
      </div>
    </div>
  );
};

export default CalendarPlanItem;
