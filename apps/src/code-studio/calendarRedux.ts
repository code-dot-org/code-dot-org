import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import type {SectionCalendarPlan} from '@cdo/apps/templates/teacherNavigation/calendar/calendarPlanTypes';

interface CalendarLesson {
  id: number;
  lessonNumber: number;
  title: string;
  duration: number;
  assessment: boolean;
  unplugged: boolean;
  url: string;
}

export interface CalendarState {
  unitName: string | null;
  unitPosition: number | null;
  courseName: string | null;
  showCalendar: boolean;
  calendarLessons: CalendarLesson[] | null;
  versionYear: number | null;
  savedPlan: SectionCalendarPlan | null;
  savedPlanLoadStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  savedPlanError: string | null;
}

interface CalendarDataPayload {
  unitName: string | null;
  unitPosition: number | null;
  courseName: string | null;
  showCalendar: boolean;
  calendarLessons: CalendarLesson[] | null;
  versionYear: number | null;
}

const initialState: CalendarState = {
  unitName: null,
  unitPosition: null,
  courseName: null,
  showCalendar: false,
  calendarLessons: null,
  versionYear: null,
  savedPlan: null,
  savedPlanLoadStatus: 'idle',
  savedPlanError: null,
};

const calendarReduxSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setCalendarData(state, action: PayloadAction<CalendarDataPayload>) {
      const contextChanged =
        state.courseName !== action.payload.courseName ||
        state.unitPosition !== action.payload.unitPosition;

      state.unitName = action.payload.unitName;
      state.unitPosition = action.payload.unitPosition;
      state.courseName = action.payload.courseName;
      state.showCalendar = action.payload.showCalendar;
      state.calendarLessons = action.payload.calendarLessons;
      state.versionYear = action.payload.versionYear;

      if (contextChanged) {
        state.savedPlan = null;
        state.savedPlanLoadStatus = 'idle';
        state.savedPlanError = null;
      }
    },
    setCalendarPlanLoading(state) {
      state.savedPlanLoadStatus = 'loading';
      state.savedPlanError = null;
    },
    setCalendarPlanData(
      state,
      action: PayloadAction<SectionCalendarPlan | null>
    ) {
      state.savedPlan = action.payload;
      state.savedPlanLoadStatus = 'succeeded';
      state.savedPlanError = null;
    },
    setCalendarPlanError(state, action: PayloadAction<string>) {
      state.savedPlanLoadStatus = 'failed';
      state.savedPlanError = action.payload;
    },
    clearCalendarPlan(state) {
      state.savedPlan = null;
      state.savedPlanLoadStatus = 'idle';
      state.savedPlanError = null;
    },
  },
});

export const {
  clearCalendarPlan,
  setCalendarData,
  setCalendarPlanData,
  setCalendarPlanError,
  setCalendarPlanLoading,
} = calendarReduxSlice.actions;
export default calendarReduxSlice.reducer;
