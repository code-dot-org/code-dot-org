/**
 * The expected redux store.
 */

import {useDispatch, useSelector} from 'react-redux';

import {default as labStore} from '@code-dot-org/lab/redux';
import {injectSlices} from '@code-dot-org/redux';
import type {StateFor} from '@code-dot-org/redux';

import musicSlice from './musicSlice';

const store = injectSlices([musicSlice], labStore);

export type RootState = StateFor<typeof store>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export default store;
