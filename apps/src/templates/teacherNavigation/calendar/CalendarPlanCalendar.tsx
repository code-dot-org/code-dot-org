import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  Button as MuiButton,
  IconButton,
  Typography as MuiTypography,
} from '@mui/material';
import classNames from 'classnames';
import moment from 'moment';
import React, {useMemo, useState} from 'react';

import i18n from '@cdo/locale';

import {
  CalendarDragPayload,
  getCalendarDragPayload,
  setCalendarDragPayload,
} from './calendarDragUtils';
import CalendarPlanItem from './CalendarPlanItem';
import {CalendarPlanLesson, CalendarPlanSession} from './calendarPlanTypes';

import styles from './calendar.module.scss';

type CalendarViewMode = 'week' | 'month';

interface CalendarPlanCalendarProps {
  sessions: CalendarPlanSession[];
  lessons: CalendarPlanLesson[];
  onToggleCancellation?: (session: CalendarPlanSession) => void;
  onDropItem?: (
    payload: CalendarDragPayload,
    session: CalendarPlanSession,
    index: number
  ) => void;
  onDragStateChange?: (isDragging: boolean) => void;
}

interface CalendarDay {
  date: moment.Moment;
  sessions: CalendarPlanSession[];
}

function formatSessionTime(session: CalendarPlanSession) {
  return moment(session.startTime, 'HH:mm').format('h:mma');
}

function totalSessionMinutes(session: CalendarPlanSession) {
  return session.items.reduce(
    (total, item) => total + (item.plannedMinutes || 0),
    0
  );
}

function calendarRange(cursorDate: moment.Moment, viewMode: CalendarViewMode) {
  const start =
    viewMode === 'month'
      ? cursorDate.clone().startOf('month').startOf('week')
      : cursorDate.clone().startOf('week');
  const days = viewMode === 'month' ? 42 : 7;

  return Array.from({length: days}, (_, index) =>
    start.clone().add(index, 'days')
  );
}

const CalendarPlanCalendar: React.FC<CalendarPlanCalendarProps> = ({
  sessions,
  lessons,
  onToggleCancellation,
  onDropItem,
  onDragStateChange,
}) => {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [cursorDate, setCursorDate] = useState(() => moment());

  const lessonsById = useMemo(
    () => new Map(lessons.map(lesson => [lesson.id, lesson])),
    [lessons]
  );
  const sessionsByDate = useMemo(() => {
    const sessionMap = new Map<string, CalendarPlanSession[]>();
    sessions.forEach(session => {
      const sessionsForDate = sessionMap.get(session.date) || [];
      sessionsForDate.push(session);
      sessionMap.set(session.date, sessionsForDate);
    });
    return sessionMap;
  }, [sessions]);
  const days: CalendarDay[] = calendarRange(cursorDate, viewMode).map(date => ({
    date,
    sessions: sessionsByDate.get(date.format('YYYY-MM-DD')) || [],
  }));
  const title =
    viewMode === 'month'
      ? cursorDate.format('MMMM YYYY')
      : `${days[0].date.format('MMM D')} - ${days[6].date.format(
          'MMM D, YYYY'
        )}`;

  const handleDrop = (
    event: React.DragEvent,
    session: CalendarPlanSession,
    index: number
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const payload = getCalendarDragPayload(event);
    if (payload) {
      onDropItem?.(payload, session, index);
    }
    onDragStateChange?.(false);
  };

  const renderSession = (session: CalendarPlanSession) => {
    const plannedMinutes = totalSessionMinutes(session);
    const isOverScheduled =
      !session.canceled && plannedMinutes > session.durationMinutes;

    return (
      <div
        className={classNames(
          styles.sessionCard,
          viewMode === 'month' && styles.monthSessionCard,
          viewMode === 'week' && styles.weekSessionCard,
          session.canceled && styles.canceledSessionCard,
          isOverScheduled && styles.overScheduledSessionCard
        )}
        key={session.id}
        onDragOver={event => event.preventDefault()}
        onDrop={event => handleDrop(event, session, session.items.length)}
      >
        <div className={styles.sessionCardHeader}>
          <div>
            <MuiTypography variant="body4" component="div">
              {formatSessionTime(session)}
            </MuiTypography>
            <MuiTypography variant="body4" component="div">
              {plannedMinutes}/{session.durationMinutes} min
            </MuiTypography>
          </div>
          {onToggleCancellation && (
            <IconButton
              size="small"
              aria-label={session.canceled ? i18n.restore() : i18n.cancel()}
              onClick={() => onToggleCancellation(session)}
            >
              <FontAwesomeV6Icon
                iconName={session.canceled ? 'rotate-left' : 'ban'}
              />
            </IconButton>
          )}
        </div>
        {session.canceled ? (
          <MuiTypography variant="body4" component="div">
            {i18n.canceled()}
          </MuiTypography>
        ) : (
          <div className={styles.sessionItemList}>
            {session.items.map((item, index) => (
              <div
                className={styles.sessionDropTarget}
                key={item.clientId}
                onDragOver={event => event.preventDefault()}
                onDrop={event => handleDrop(event, session, index)}
              >
                <CalendarPlanItem
                  item={item}
                  lesson={
                    item.lessonId ? lessonsById.get(item.lessonId) : undefined
                  }
                  draggable
                  dragHandlePosition="right"
                  onDragEnd={() => onDragStateChange?.(false)}
                  onDragStart={event => {
                    setCalendarDragPayload(event, {item});
                    onDragStateChange?.(true);
                  }}
                  showDragHandle
                  showDuration={viewMode === 'week'}
                  showRemoveButton={false}
                  showTypeIcon={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.calendarDisplay}>
      <div className={styles.calendarToolbar}>
        <div className={styles.calendarNavButtons}>
          <IconButton
            aria-label="Previous"
            onClick={() =>
              setCursorDate(date =>
                date
                  .clone()
                  .subtract(1, viewMode === 'month' ? 'month' : 'week')
              )
            }
          >
            <FontAwesomeV6Icon iconName="chevron-left" />
          </IconButton>
          <IconButton
            aria-label="Next"
            onClick={() =>
              setCursorDate(date =>
                date.clone().add(1, viewMode === 'month' ? 'month' : 'week')
              )
            }
          >
            <FontAwesomeV6Icon iconName="chevron-right" />
          </IconButton>
          <MuiButton
            size="small"
            variant="outlined"
            onClick={() => setCursorDate(moment())}
          >
            {i18n.today()}
          </MuiButton>
        </div>
        <MuiTypography variant="h3" component="h2">
          {title}
        </MuiTypography>
        <div className={styles.calendarViewButtons}>
          <MuiButton
            size="small"
            variant={viewMode === 'week' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('week')}
          >
            {i18n.week()}
          </MuiButton>
          <MuiButton
            size="small"
            variant={viewMode === 'month' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('month')}
          >
            {i18n.month()}
          </MuiButton>
        </div>
      </div>
      <div className={styles.calendarGridHeader}>
        {days.slice(0, 7).map(day => (
          <div className={styles.calendarDayHeading} key={day.date.format('d')}>
            {day.date.format('ddd')}
          </div>
        ))}
      </div>
      <div
        className={classNames(
          styles.calendarGrid,
          viewMode === 'month' && styles.monthCalendarGrid,
          viewMode === 'week' && styles.weekCalendarGrid
        )}
      >
        {days.map(day => {
          const isOutsideMonth =
            viewMode === 'month' && !day.date.isSame(cursorDate, 'month');
          return (
            <div
              className={classNames(
                styles.calendarDayCell,
                isOutsideMonth && styles.outsideMonthDayCell,
                day.date.isSame(moment(), 'day') && styles.todayDayCell
              )}
              key={day.date.format('YYYY-MM-DD')}
            >
              <div className={styles.dayNumber}>{day.date.format('D')}</div>
              <div className={styles.daySessions}>
                {day.sessions.map(renderSession)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarPlanCalendar;
