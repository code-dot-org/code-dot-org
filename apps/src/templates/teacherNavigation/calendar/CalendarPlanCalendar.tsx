import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Typography as MuiTypography} from '@mui/material';
import React, {useEffect, useMemo, useState} from 'react';

import i18n from '@cdo/locale';

import CalendarPlanItem from './CalendarPlanItem';
import {
  CalendarPlanItem as CalendarPlanItemData,
  CalendarPlanLesson,
  CalendarPlanSession,
} from './calendarPlanTypes';

import styles from './calendar.module.scss';

interface CalendarPlanCalendarProps {
  sessions: CalendarPlanSession[];
  lessons: CalendarPlanLesson[];
  onToggleCancellation?: (session: CalendarPlanSession) => void;
  onMoveItem?: (
    item: CalendarPlanItemData,
    session: CalendarPlanSession,
    direction: -1 | 1
  ) => void;
  onRemoveItem?: (item: CalendarPlanItemData) => void;
}

interface CalendarEventContent {
  event: {
    extendedProps: {
      session: CalendarPlanSession;
    };
  };
  timeText: string;
}

interface FullCalendarComponentProps {
  plugins: unknown[];
  initialView: string;
  headerToolbar: {
    left: string;
    center: string;
    right: string;
  };
  allDaySlot: boolean;
  events: {
    id: string;
    start: string;
    end: string;
    classNames: string[];
    extendedProps: {session: CalendarPlanSession};
  }[];
  eventContent: (eventContent: CalendarEventContent) => React.ReactNode;
  height: string;
  nowIndicator: boolean;
}

interface FullCalendarModules {
  FullCalendar: React.ComponentType<FullCalendarComponentProps>;
  plugins: unknown[];
}

function eventEnd(date: string, startTime: string, durationMinutes: number) {
  const start = new Date(`${date}T${startTime}:00`);
  return new Date(start.getTime() + durationMinutes * 60 * 1000).toISOString();
}

const CalendarPlanCalendar: React.FC<CalendarPlanCalendarProps> = ({
  sessions,
  lessons,
  onToggleCancellation,
  onMoveItem,
  onRemoveItem,
}) => {
  const [calendarModules, setCalendarModules] =
    useState<FullCalendarModules | null>(null);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      import('@fullcalendar/react'),
      import('@fullcalendar/timegrid'),
      import('@fullcalendar/daygrid'),
      import('@fullcalendar/interaction'),
    ]).then(
      ([
        fullCalendarModule,
        timeGridModule,
        dayGridModule,
        interactionModule,
      ]) => {
        if (!isMounted) {
          return;
        }

        setCalendarModules({
          FullCalendar:
            fullCalendarModule.default as unknown as React.ComponentType<FullCalendarComponentProps>,
          plugins: [
            timeGridModule.default,
            dayGridModule.default,
            interactionModule.default,
          ],
        });
      }
    );

    return () => {
      isMounted = false;
    };
  }, []);

  const lessonsById = useMemo(
    () => new Map(lessons.map(lesson => [lesson.id, lesson])),
    [lessons]
  );
  const events = sessions.map(session => ({
    id: session.id,
    start: `${session.date}T${session.startTime}:00`,
    end: eventEnd(session.date, session.startTime, session.durationMinutes),
    classNames: session.canceled ? [styles.canceledSessionEvent] : [],
    extendedProps: {session},
  }));

  const renderEventContent = (eventContent: CalendarEventContent) => {
    const session = eventContent.event.extendedProps.session;

    return (
      <div className={styles.sessionEvent}>
        <div className={styles.sessionEventHeader}>
          <MuiTypography variant="body4" component="div">
            {eventContent.timeText}
            {session.canceled ? ` - ${i18n.canceled()}` : ''}
          </MuiTypography>
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
        {session.items.map(item => (
          <CalendarPlanItem
            key={item.clientId}
            item={item}
            lesson={item.lessonId ? lessonsById.get(item.lessonId) : undefined}
            onMovePrevious={
              onMoveItem ? () => onMoveItem(item, session, -1) : undefined
            }
            onMoveNext={
              onMoveItem ? () => onMoveItem(item, session, 1) : undefined
            }
            onRemove={onRemoveItem ? () => onRemoveItem(item) : undefined}
          />
        ))}
      </div>
    );
  };

  if (!calendarModules) {
    return <div className={styles.calendarDisplay} />;
  }

  const FullCalendar = calendarModules.FullCalendar;

  return (
    <div className={styles.calendarDisplay}>
      <FullCalendar
        plugins={calendarModules.plugins}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridWeek,dayGridMonth',
        }}
        allDaySlot={false}
        events={events}
        eventContent={renderEventContent}
        height="auto"
        nowIndicator
      />
    </div>
  );
};

export default CalendarPlanCalendar;
