/**
 * The expected redux store.
 */

import type {ThunkDispatch, UnknownAction} from '@reduxjs/toolkit';

import {progressSlice} from '@code-dot-org/progress/redux';
import {injectSlices, storeHooks} from '@code-dot-org/core/redux';
import {teacherSectionsSlice} from '@code-dot-org/teacher-dashboard/redux';
import {currentUserSlice} from '@code-dot-org/users/redux';

import labProjectSlice from './labProjectSlice';
import labSlice from './labSlice';
import labSystemSlice from './labSystemSlice';
import labViewSlice from './labViewSlice';
import predictLevelSlice from './predictLevelSlice';

const store = injectSlices([
  currentUserSlice,
  labSlice,
  labSystemSlice,
  labProjectSlice,
  labViewSlice,
  predictLevelSlice,
  progressSlice,
  teacherSectionsSlice,
]);

export type RootState = ReturnType<(typeof store)['getState']>;
export type AppDispatch = ThunkDispatch<RootState, undefined, UnknownAction>;
export const {useAppDispatch, useAppSelector} = storeHooks<typeof store>();

export default store;
