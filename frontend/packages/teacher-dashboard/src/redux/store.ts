/**
 * The expected redux store.
 */

import {injectSlices, storeHooks} from '@code-dot-org/core/redux';
import {currentUserSlice} from '@code-dot-org/users/redux';

import teacherSectionsSlice from './teacherSectionsSlice';

const store = injectSlices([currentUserSlice, teacherSectionsSlice]);

export type RootState = ReturnType<(typeof store)['getState']>;
export type AppDispatch = typeof store.dispatch;
export const {useAppDispatch, useAppSelector} = storeHooks<typeof store>();

export default store;
