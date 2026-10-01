/**
 * The expected redux store.
 */

// A value import (not type-only) on purpose: loading the lab store module is
// what injects the lab slices this store layers on.
import {default as labStore} from '@code-dot-org/lab/redux';
import {injectSlices, storeHooks} from '@code-dot-org/core/redux';
import type {StateFor} from '@code-dot-org/core/redux';

import musicSlice from './musicSlice';

const store = injectSlices<[typeof musicSlice], typeof labStore>([musicSlice]);

export type RootState = StateFor<typeof store>;
export type AppDispatch = (typeof store)['dispatch'];
export const {useAppDispatch, useAppSelector} = storeHooks<typeof store>();

export default store;
