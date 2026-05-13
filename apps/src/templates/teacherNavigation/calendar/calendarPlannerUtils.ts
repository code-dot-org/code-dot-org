import {
  CalendarPlanItem,
  CalendarPlanLesson,
  CalendarPlanSession,
  SectionCalendarPlan,
} from './calendarPlanTypes';

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_SESSION_LIMIT = 160;

function parseDate(date: string) {
  return new Date(`${date}T12:00:00`);
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_MS);
}

function sessionSortValue(session: CalendarPlanSession) {
  return `${session.date}T${session.startTime}`;
}

function isSessionCanceled(
  plan: SectionCalendarPlan,
  date: string,
  sourceClientId: string
) {
  return plan.cancellations.some(
    cancellation =>
      cancellation.sessionDate === date &&
      (cancellation.recurringSessionClientId === sourceClientId ||
        cancellation.oneOffSessionClientId === sourceClientId)
  );
}

export function buildCalendarSessions(
  plan: SectionCalendarPlan,
  sessionLimit = DEFAULT_SESSION_LIMIT
): CalendarPlanSession[] {
  if (plan.mode !== 'detailed_sessions' || !plan.startDate) {
    return [];
  }

  const sessions: CalendarPlanSession[] = [];
  const startDate = parseDate(plan.startDate);
  const activeRecurringSessions = plan.recurringSessions.filter(
    session => session.active
  );
  let cursor = startDate;

  while (activeRecurringSessions.length > 0 && sessions.length < sessionLimit) {
    const date = formatDate(cursor);
    activeRecurringSessions
      .filter(session => session.weekday === cursor.getDay())
      .forEach(session => {
        sessions.push({
          id: `recurring-${session.clientId}-${date}`,
          date,
          startTime: session.startTime,
          durationMinutes: session.durationMinutes,
          source: 'recurring',
          sourceClientId: session.clientId,
          canceled: isSessionCanceled(plan, date, session.clientId),
          items: [],
        });
      });
    cursor = addDays(cursor, 1);
  }

  plan.oneOffSessions.forEach(session => {
    sessions.push({
      id: `one-off-${session.clientId}`,
      date: session.sessionDate,
      startTime: session.startTime,
      durationMinutes: session.durationMinutes,
      source: 'one_off',
      sourceClientId: session.clientId,
      canceled: isSessionCanceled(plan, session.sessionDate, session.clientId),
      items: [],
    });
  });

  return sessions.sort((a, b) =>
    sessionSortValue(a).localeCompare(sessionSortValue(b))
  );
}

export function buildDefaultLessonItems(
  lessons: CalendarPlanLesson[]
): CalendarPlanItem[] {
  return lessons
    .slice()
    .sort((a, b) => a.lessonNumber - b.lessonNumber)
    .map(lesson => ({
      clientId: `lesson-${lesson.id}`,
      itemType: 'lesson',
      lessonId: lesson.id,
      plannedMinutes: lesson.duration,
      removed: false,
    }));
}

export function placeCalendarItemsIntoSessions(
  plan: SectionCalendarPlan,
  lessons: CalendarPlanLesson[],
  sessionLimit = DEFAULT_SESSION_LIMIT
): CalendarPlanSession[] {
  const sessions = buildCalendarSessions(plan, sessionLimit);
  const openSessions = sessions.filter(session => !session.canceled);
  const sessionsByDate = new Map(
    sessions.map(session => [session.date, session])
  );
  const sessionsByDateAndClientId = new Map(
    sessions.map(session => [
      `${session.date}:${session.sourceClientId}`,
      session,
    ])
  );
  const savedLessonIds = new Set(
    plan.items
      .filter(item => item.itemType === 'lesson' && item.lessonId)
      .map(item => item.lessonId)
  );
  const removedLessonIds = new Set(
    plan.items
      .filter(item => item.removed && item.lessonId)
      .map(item => item.lessonId)
  );
  const pendingItems = [
    ...plan.items.filter(item => !item.removed),
    ...buildDefaultLessonItems(lessons).filter(
      item =>
        !savedLessonIds.has(item.lessonId) &&
        !removedLessonIds.has(item.lessonId)
    ),
  ];

  pendingItems
    .filter(item => item.sessionDate)
    .sort((a, b) => (a.sessionSort || 0) - (b.sessionSort || 0))
    .forEach(item => {
      const session =
        item.sessionDate &&
        ((item.sessionClientId &&
          sessionsByDateAndClientId.get(
            `${item.sessionDate}:${item.sessionClientId}`
          )) ||
          sessionsByDate.get(item.sessionDate));
      if (session && !session.canceled) {
        session.items.push(item);
      }
    });

  const unplacedItems = pendingItems.filter(item => !item.sessionDate);
  let sessionIndex = 0;
  let remainingMinutes = openSessions[0]?.durationMinutes || 0;

  unplacedItems.forEach(item => {
    while (openSessions[sessionIndex] && remainingMinutes <= 0) {
      sessionIndex += 1;
      remainingMinutes = openSessions[sessionIndex]?.durationMinutes || 0;
    }

    const session = openSessions[sessionIndex];
    if (!session) {
      return;
    }

    session.items.push(item);
    remainingMinutes -= item.plannedMinutes || 0;
  });

  return sessions;
}
