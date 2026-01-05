/**
 * The expected redux store.
 */

import {useDispatch, useSelector} from 'react-redux';

import {progressSlice} from '@code-dot-org/progress/redux';
import {default as defaultStore, injectSlices} from '@code-dot-org/redux';
import {teacherSectionsSlice} from '@code-dot-org/teacher-dashboard/redux';
import {currentUserSlice} from '@code-dot-org/user/redux';

import labProjectSlice from './labProjectSlice';
import labSlice from './labSlice';
import labSystemSlice from './labSystemSlice';
import predictLevelSlice from './predictLevelSlice';

const store = injectSlices(
  [
    currentUserSlice,
    labSlice,
    labSystemSlice,
    labProjectSlice,
    predictLevelSlice,
    progressSlice,
    teacherSectionsSlice,
  ],
  defaultStore,
);

export type RootState = ReturnType<(typeof store)['getState']>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export default store;
