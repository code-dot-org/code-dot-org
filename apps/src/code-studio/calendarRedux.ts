import {PayloadAction, createSlice} from '@reduxjs/toolkit';

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
  showCalendar: boolean;
  calendarLessons: CalendarLesson[] | null;
  versionYear: number | null;
}

interface CalendarDataPayload {
  showCalendar: boolean;
  calendarLessons: CalendarLesson[] | null;
  versionYear: number | null;
}

const initialState: CalendarState = {
  showCalendar: false,
  calendarLessons: null,
  versionYear: null,
};

const calendarReduxSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setCalendarData(state, action: PayloadAction<CalendarDataPayload>) {
      state.showCalendar = action.payload.showCalendar;
      state.calendarLessons = action.payload.calendarLessons;
      state.versionYear = action.payload.versionYear;
    },
  },
});

export const {setCalendarData} = calendarReduxSlice.actions;
export default calendarReduxSlice.reducer;
