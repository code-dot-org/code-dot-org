import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import TextField from '@code-dot-org/component-library/textField';
import {
  Button as MuiButton,
  IconButton,
  Typography as MuiTypography,
} from '@mui/material';
import classNames from 'classnames';
import React, {useMemo, useState} from 'react';

import i18n from '@cdo/locale';

import {
  CalendarDragPayload,
  getCalendarDragPayload,
  setCalendarDragPayload,
} from './calendarDragUtils';
import CalendarPlanItem from './CalendarPlanItem';
import {CalendarPlanLesson, SectionCalendarPlan} from './calendarPlanTypes';

import styles from './calendar.module.scss';

const PLACEHOLDER_DURATION_OPTIONS = [10, 15, 20, 30, 45, 60, 75, 90];

interface CalendarLessonDrawerProps {
  isDragging: boolean;
  lessons: CalendarPlanLesson[];
  plan: SectionCalendarPlan;
  onPlanChange: (plan: SectionCalendarPlan) => void;
  onDropToTrash: (payload: CalendarDragPayload) => void;
  onDragStateChange: (isDragging: boolean) => void;
}

function newClientId(prefix: string) {
  if (window.crypto?.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const CalendarLessonDrawer: React.FC<CalendarLessonDrawerProps> = ({
  isDragging,
  lessons,
  plan,
  onPlanChange,
  onDropToTrash,
  onDragStateChange,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [placeholderTitle, setPlaceholderTitle] = useState('');
  const [placeholderMinutes, setPlaceholderMinutes] = useState('30');
  const removedLessonIds = useMemo(
    () =>
      new Set(
        plan.items
          .filter(item => item.removed && item.lessonId)
          .map(item => item.lessonId)
      ),
    [plan.items]
  );
  const unplacedPlaceholders = useMemo(
    () =>
      plan.items.filter(
        item =>
          item.itemType === 'placeholder' && !item.removed && !item.sessionDate
      ),
    [plan.items]
  );

  const addPlaceholder = () => {
    const title = placeholderTitle.trim();
    if (!title) {
      return;
    }

    onPlanChange({
      ...plan,
      mode: 'detailed_sessions',
      items: [
        ...plan.items,
        {
          clientId: newClientId('placeholder'),
          itemType: 'placeholder',
          placeholderTitle: title,
          plannedMinutes: parseInt(placeholderMinutes),
          removed: false,
        },
      ],
    });
    setPlaceholderTitle('');
  };

  const handleTrashDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const payload = getCalendarDragPayload(event);
    if (payload) {
      onDropToTrash(payload);
    }
    onDragStateChange(false);
  };

  const handleDragStart = (
    event: React.DragEvent,
    payload: CalendarDragPayload
  ) => {
    setCalendarDragPayload(event, payload);
    onDragStateChange(true);
  };

  return (
    <div
      className={classNames(
        styles.lessonDrawer,
        isCollapsed && styles.lessonDrawerCollapsed
      )}
    >
      <div className={styles.lessonDrawerHeader}>
        {!isCollapsed && (
          <MuiTypography variant="body3" component="h3">
            {i18n.calendarPlanLessons()}
          </MuiTypography>
        )}
        <IconButton
          size="small"
          aria-label={isCollapsed ? i18n.showLessons() : i18n.hideLessons()}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <FontAwesomeV6Icon
            iconName={isCollapsed ? 'chevron-down' : 'chevron-up'}
          />
        </IconButton>
      </div>
      {isCollapsed ? (
        <MuiTypography
          className={styles.collapsedLessonDrawerLabel}
          variant="body4"
          component="div"
        >
          {i18n.calendarPlanLessons()}
        </MuiTypography>
      ) : (
        <>
          <div className={styles.lessonDrawerControls}>
            <div className={styles.placeholderControls}>
              <TextField
                id="calendar-placeholder-title"
                name="calendar-placeholder-title"
                label={i18n.placeholderTitle()}
                value={placeholderTitle}
                onChange={event => setPlaceholderTitle(event.target.value)}
              />
              <SimpleDropdown
                name="placeholderMinutes"
                items={PLACEHOLDER_DURATION_OPTIONS.map(value => ({
                  value: value.toString(),
                  text: i18n.minutesLabel({number: value}),
                }))}
                selectedValue={placeholderMinutes}
                onChange={event => setPlaceholderMinutes(event.target.value)}
                size="s"
                labelText={i18n.duration()}
              />
              <MuiButton
                size="small"
                variant="outlined"
                startIcon={<FontAwesomeV6Icon iconName="plus" />}
                onClick={addPlaceholder}
              >
                {i18n.addPlaceholder()}
              </MuiButton>
            </div>
          </div>
          {unplacedPlaceholders.length > 0 && (
            <div className={styles.lessonList}>
              {unplacedPlaceholders.map(item => (
                <CalendarPlanItem
                  key={item.clientId}
                  item={item}
                  draggable
                  onDragEnd={() => onDragStateChange(false)}
                  onDragStart={event => handleDragStart(event, {item})}
                />
              ))}
            </div>
          )}
          <div className={styles.lessonList}>
            {lessons.map(lesson => {
              const isRemoved = removedLessonIds.has(lesson.id);
              return (
                <div
                  className={classNames(
                    styles.lessonListItem,
                    isRemoved && styles.removedLessonListItem
                  )}
                  draggable
                  key={lesson.id}
                  onDragEnd={() => onDragStateChange(false)}
                  onDragStart={event => handleDragStart(event, {lesson})}
                >
                  <FontAwesomeV6Icon
                    className={styles.dragHandleIcon}
                    iconName="grip-vertical"
                    iconStyle="solid"
                  />
                  <MuiTypography variant="body4" component="span">
                    {lesson.lessonNumber}. {lesson.title}
                  </MuiTypography>
                </div>
              );
            })}
          </div>
        </>
      )}
      {isDragging && (
        <div
          className={styles.trashDropZone}
          onDragOver={event => event.preventDefault()}
          onDrop={handleTrashDrop}
        >
          <FontAwesomeV6Icon iconName="trash" />
          <MuiTypography variant="body4" component="span">
            Drag here to remove
          </MuiTypography>
        </div>
      )}
    </div>
  );
};

export default CalendarLessonDrawer;
