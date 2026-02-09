/**
 * The expected redux store.
 */

import {useDispatch, useSelector} from 'react-redux';

import {default as defaultStore, injectSlices} from '@code-dot-org/core/redux';
import {currentUserSlice} from '@code-dot-org/platform/user';

import teacherSectionsSlice from './teacherSectionsSlice';

const store = injectSlices(
  [currentUserSlice, teacherSectionsSlice],
  defaultStore,
);

export type RootState = ReturnType<(typeof store)['getState']>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export default store;
