/**
 * The expected redux store.
 */

import {default as labStore} from '@code-dot-org/lab/redux';
import {injectSlices, storeHooks} from '@code-dot-org/core/redux';
import type {StateFor} from '@code-dot-org/core/redux';

import musicSlice from './musicSlice';

const store = injectSlices([musicSlice], labStore);

export type RootState = StateFor<typeof store>;
export type AppDispatch = (typeof store)['dispatch'];
export const {useAppDispatch, useAppSelector} = storeHooks(store);

export default store;
