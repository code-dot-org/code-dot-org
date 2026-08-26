import {createSlice} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';

import {CourseRoles, type CourseRole} from './index';

export interface CurrentUserState {
  userRoleInCourse: CourseRole;
  userId?: number;
  userType?: 'teacher' | 'student';
  isTeacher?: boolean;
}

// Author Mode has no real session/auth; the author IS effectively acting as
// the instructor, so default to that role rather than the more restrictive
// Learner (which would hide InstructorsOnly-gated UI the fat lab expects to
// show its own author affordances through).
const initialState: CurrentUserState = {
  userRoleInCourse: CourseRoles.Instructor,
  userType: 'teacher',
  isTeacher: true,
};

const slice = createSlice({
  name: 'currentUser',
  initialState,
  reducers: {
    setUserRoleInCourse(state, action: PayloadAction<CourseRole>) {
      state.userRoleInCourse = action.payload;
    },
  },
});

export const currentUserSlice = slice;
export const currentUserActions = slice.actions;
