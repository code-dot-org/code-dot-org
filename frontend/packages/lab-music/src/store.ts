/**
 * The expected redux store.
 */

import {useDispatch, useSelector} from 'react-redux';

import {injectSlices} from '@code-dot-org/redux';

import {musicSlice} from './reducers';

const store = injectSlices([
  musicSlice,
]);

export type RootState = ReturnType<typeof store['getState']>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export default store;
