import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import TextField from '@code-dot-org/component-library/textField';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import React, {useMemo, useState} from 'react';

import i18n from '@cdo/locale';

import {CalendarPlanLesson, SectionCalendarPlan} from './calendarPlanTypes';

import styles from './calendar.module.scss';

interface CalendarLessonDrawerProps {
  lessons: CalendarPlanLesson[];
  plan: SectionCalendarPlan;
  onPlanChange: (plan: SectionCalendarPlan) => void;
}

function newClientId(prefix: string) {
  if (window.crypto?.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const CalendarLessonDrawer: React.FC<CalendarLessonDrawerProps> = ({
  lessons,
  plan,
  onPlanChange,
}) => {
  const [placeholderTitle, setPlaceholderTitle] = useState('');
  const removedLessonIds = useMemo(
    () =>
      new Set(
        plan.items
          .filter(item => item.removed && item.lessonId)
          .map(item => item.lessonId)
      ),
    [plan.items]
  );

  const removeLesson = (lesson: CalendarPlanLesson) => {
    onPlanChange({
      ...plan,
      mode: 'detailed_sessions',
      items: [
        ...plan.items.filter(item => item.lessonId !== lesson.id),
        {
          clientId: newClientId('removed-lesson'),
          itemType: 'lesson',
          lessonId: lesson.id,
          plannedMinutes: lesson.duration,
          removed: true,
        },
      ],
    });
  };

  const restoreLesson = (lesson: CalendarPlanLesson) => {
    onPlanChange({
      ...plan,
      items: plan.items.filter(item => item.lessonId !== lesson.id),
    });
  };

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
          plannedMinutes: 30,
          removed: false,
        },
      ],
    });
    setPlaceholderTitle('');
  };

  return (
    <div className={styles.lessonDrawer}>
      <MuiTypography variant="body3" component="h3">
        {i18n.calendarPlanLessons()}
      </MuiTypography>
      <div className={styles.placeholderControls}>
        <TextField
          id="calendar-placeholder-title"
          name="calendar-placeholder-title"
          label={i18n.placeholderTitle()}
          value={placeholderTitle}
          onChange={event => setPlaceholderTitle(event.target.value)}
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
      <div className={styles.lessonList}>
        {lessons.map(lesson => {
          const isRemoved = removedLessonIds.has(lesson.id);
          return (
            <div className={styles.lessonListItem} key={lesson.id}>
              <MuiTypography variant="body4" component="span">
                {lesson.lessonNumber}. {lesson.title}
              </MuiTypography>
              <MuiButton
                size="small"
                variant="text"
                startIcon={
                  <FontAwesomeV6Icon
                    iconName={isRemoved ? 'rotate-left' : 'trash'}
                  />
                }
                onClick={() =>
                  isRemoved ? restoreLesson(lesson) : removeLesson(lesson)
                }
              >
                {isRemoved ? i18n.restore() : i18n.remove()}
              </MuiButton>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarLessonDrawer;
