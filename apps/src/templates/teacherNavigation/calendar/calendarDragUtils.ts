import React from 'react';

import {CalendarPlanItem, CalendarPlanLesson} from './calendarPlanTypes';

export interface CalendarDragPayload {
  item?: CalendarPlanItem;
  lesson?: CalendarPlanLesson;
}

const CALENDAR_DRAG_DATA_TYPE = 'application/json';

export function setCalendarDragPayload(
  event: React.DragEvent,
  payload: CalendarDragPayload
) {
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData(CALENDAR_DRAG_DATA_TYPE, JSON.stringify(payload));
}

export function getCalendarDragPayload(event: React.DragEvent) {
  const payload = event.dataTransfer.getData(CALENDAR_DRAG_DATA_TYPE);
  return payload ? (JSON.parse(payload) as CalendarDragPayload) : null;
}
