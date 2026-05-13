export type CalendarPlanMode = 'weekly_minutes' | 'detailed_sessions';

export type CalendarPlanItemType = 'lesson' | 'placeholder';

export interface CalendarPlanLesson {
  id: number;
  lessonNumber: number;
  title: string;
  duration: number;
  assessment: boolean;
  unplugged: boolean;
  url: string;
}

export interface CalendarPlanRecurringSession {
  id?: number;
  clientId: string;
  weekday: number;
  startTime: string;
  durationMinutes: number;
  position: number;
  active: boolean;
}

export interface CalendarPlanOneOffSession {
  id?: number;
  clientId: string;
  sessionDate: string;
  startTime: string;
  durationMinutes: number;
  position: number;
}

export interface CalendarPlanCancellation {
  id?: number;
  sessionDate: string;
  recurringSessionClientId?: string;
  oneOffSessionClientId?: string;
  reason?: string;
}

export interface CalendarPlanItem {
  id?: number;
  clientId: string;
  itemType: CalendarPlanItemType;
  lessonId?: number;
  placeholderTitle?: string;
  plannedMinutes?: number;
  sessionDate?: string;
  sessionClientId?: string;
  sessionSort?: number;
  removed: boolean;
}

export interface SectionCalendarPlan {
  id?: number;
  sectionId: number;
  unitId: number;
  courseName: string;
  unitPosition: number;
  startDate: string | null;
  mode: CalendarPlanMode;
  weeklyInstructionalMinutes: number;
  recurringSessions: CalendarPlanRecurringSession[];
  oneOffSessions: CalendarPlanOneOffSession[];
  cancellations: CalendarPlanCancellation[];
  items: CalendarPlanItem[];
}

export interface SectionCalendarPlanResponse {
  plan: SectionCalendarPlan | null;
}

export interface CalendarPlanSession {
  id: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  source: 'recurring' | 'one_off';
  sourceClientId: string;
  canceled: boolean;
  items: CalendarPlanItem[];
}
