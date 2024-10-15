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
}

const initialState: CalendarState = {
  showCalendar: false,
  calendarLessons: null,
};

const calendarReduxSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setShowCalendar(state, action: PayloadAction<boolean>) {
      state.showCalendar = action.payload;
    },
    setCalendarLessons(state, action: PayloadAction<CalendarLesson[]>) {
      state.calendarLessons = action.payload;
    },
  },
});

export const {setShowCalendar, setCalendarLessons} = calendarReduxSlice.actions;
export default calendarReduxSlice.reducer;
