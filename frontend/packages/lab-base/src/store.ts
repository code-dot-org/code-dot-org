/**
 * The expected redux store.
 */

import {useDispatch, useSelector} from 'react-redux';

import {progressSlice} from '@code-dot-org/progress/reducers';
import {injectSlices} from '@code-dot-org/redux';
import {currentUserSlice} from '@code-dot-org/user/reducers';

import {labSystemSlice, labProjectSlice, predictLevelSlice} from './reducers';

const store = injectSlices([
  currentUserSlice,
  labSystemSlice,
  labProjectSlice,
  predictLevelSlice,
  progressSlice,
]);

export type RootState = ReturnType<typeof store['getState']>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export default store;
