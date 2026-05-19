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

export function removeMatchingPlanItems(
  items: CalendarPlanItem[],
  itemToReplace: CalendarPlanItem
) {
  return items.filter(item => !isMatchingPlanItem(item, itemToReplace));
}

function isMatchingPlanItem(
  item: CalendarPlanItem,
  itemToReplace: CalendarPlanItem
) {
  return item.clientId === itemToReplace.clientId;
}

function placedSessionKey(item: CalendarPlanItem) {
  return item.sessionDate && item.sessionClientId
    ? `${item.sessionDate}:${item.sessionClientId}`
    : null;
}

function sessionMinutesUsed(session: CalendarPlanSession) {
  return session.items.reduce(
    (total, item) => total + (item.plannedMinutes || 0),
    0
  );
}

function splitPartIndex(item: CalendarPlanItem) {
  return item.splitPartIndex === undefined
    ? Number.MAX_SAFE_INTEGER
    : item.splitPartIndex;
}

function orderSplitParts(items: CalendarPlanItem[]) {
  return items
    .map((item, index) => ({item, index}))
    .sort((a, b) => {
      if (a.item.splitGroupId && a.item.splitGroupId === b.item.splitGroupId) {
        return splitPartIndex(a.item) - splitPartIndex(b.item);
      }

      return a.index - b.index;
    })
    .map(({item}) => item);
}

function resequencePlacedItems(items: CalendarPlanItem[]) {
  const orderedSessionItems = new Map<string, CalendarPlanItem[]>();
  items.forEach(item => {
    const key = placedSessionKey(item);
    if (!key || item.removed) {
      return;
    }

    const sessionItems = orderedSessionItems.get(key) || [];
    sessionItems.push(item);
    orderedSessionItems.set(key, sessionItems);
  });

  const sortByClientId = new Map<string, number>();
  orderedSessionItems.forEach(sessionItems => {
    sessionItems
      .slice()
      .sort((a, b) => (a.sessionSort || 0) - (b.sessionSort || 0))
      .forEach((item, index) => sortByClientId.set(item.clientId, index));
  });

  return items.map(item =>
    sortByClientId.has(item.clientId)
      ? {...item, sessionSort: sortByClientId.get(item.clientId)}
      : item
  );
}

export function placeItemInSession(
  plan: SectionCalendarPlan,
  item: CalendarPlanItem,
  targetSession: CalendarPlanSession,
  targetIndex: number
): SectionCalendarPlan {
  if (targetSession.canceled) {
    return plan;
  }

  const currentSessionItems = targetSession.items.filter(
    sessionItem => !isMatchingPlanItem(sessionItem, item)
  );
  const boundedTargetIndex = Math.max(
    0,
    Math.min(targetIndex, currentSessionItems.length)
  );
  const targetSessionItems = orderSplitParts([
    ...currentSessionItems.slice(0, boundedTargetIndex),
    item,
    ...currentSessionItems.slice(boundedTargetIndex),
  ]);
  const itemsOutsideTargetSession = plan.items.filter(
    planItem =>
      !targetSessionItems.some(sessionItem =>
        isMatchingPlanItem(planItem, sessionItem)
      )
  );
  const placedTargetSessionItems = targetSessionItems.map(
    (sessionItem, index) => ({
      ...sessionItem,
      sessionDate: targetSession.date,
      sessionClientId: targetSession.sourceClientId,
      sessionSort: index,
      removed: false,
    })
  );

  return {
    ...plan,
    mode: 'detailed_sessions',
    items: resequencePlacedItems([
      ...itemsOutsideTargetSession,
      ...placedTargetSessionItems,
    ]),
  };
}

export function replaceItemInSession(
  plan: SectionCalendarPlan,
  item: CalendarPlanItem,
  targetSession: CalendarPlanSession,
  replacementItems: CalendarPlanItem[]
): SectionCalendarPlan {
  if (targetSession.canceled) {
    return plan;
  }

  const itemIndex = targetSession.items.findIndex(sessionItem =>
    isMatchingPlanItem(sessionItem, item)
  );
  const insertionIndex =
    itemIndex === -1 ? targetSession.items.length : itemIndex;
  const targetSessionItems = targetSession.items.filter(
    sessionItem => !isMatchingPlanItem(sessionItem, item)
  );
  targetSessionItems.splice(insertionIndex, 0, ...replacementItems);
  const orderedTargetSessionItems = orderSplitParts(targetSessionItems);

  const itemsOutsideTargetSession = plan.items.filter(
    planItem =>
      !orderedTargetSessionItems.some(sessionItem =>
        isMatchingPlanItem(planItem, sessionItem)
      )
  );
  const placedTargetSessionItems = orderedTargetSessionItems.map(
    (sessionItem, index) => ({
      ...sessionItem,
      sessionDate: targetSession.date,
      sessionClientId: targetSession.sourceClientId,
      sessionSort: index,
      removed: false,
    })
  );

  return {
    ...plan,
    mode: 'detailed_sessions',
    items: resequencePlacedItems([
      ...itemsOutsideTargetSession,
      ...placedTargetSessionItems,
    ]),
  };
}

export interface CalendarPlanItemPlacement {
  item: CalendarPlanItem;
  session: CalendarPlanSession;
  sessionSort: number;
}

export function replaceItemsInSessions(
  plan: SectionCalendarPlan,
  itemsToReplace: CalendarPlanItem[],
  placements: CalendarPlanItemPlacement[]
): SectionCalendarPlan {
  const clientIdsToReplace = new Set(itemsToReplace.map(item => item.clientId));
  const itemsOutsideReplacements = plan.items.filter(
    planItem => !clientIdsToReplace.has(planItem.clientId)
  );
  const replacementItems = placements.map(({item, session, sessionSort}) => ({
    ...item,
    sessionDate: session.date,
    sessionClientId: session.sourceClientId,
    sessionSort,
    removed: false,
  }));

  return {
    ...plan,
    mode: 'detailed_sessions',
    items: resequencePlacedItems([
      ...itemsOutsideReplacements,
      ...replacementItems,
    ]),
  };
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
  let remainingMinutes = openSessions[0]
    ? openSessions[0].durationMinutes - sessionMinutesUsed(openSessions[0])
    : 0;

  unplacedItems.forEach(item => {
    while (openSessions[sessionIndex] && remainingMinutes <= 0) {
      sessionIndex += 1;
      remainingMinutes = openSessions[sessionIndex]
        ? openSessions[sessionIndex].durationMinutes -
          sessionMinutesUsed(openSessions[sessionIndex])
        : 0;
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
