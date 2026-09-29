/**
 * The Codebridge redux store: the base lab store with the codebridge workspace
 * slice layered on. Loading the base store module (a value import, not a
 * type-only one) is what injects the base lab slices this store builds upon;
 * `injectSlices` then adds `codebridgeWorkspace`.
 */

import {injectSlices, storeHooks} from '@code-dot-org/core/redux';
import type {StateFor} from '@code-dot-org/core/redux';
// A value import (not type-only) on purpose: it injects the base lab slices.
import {default as labStore} from '@code-dot-org/lab/redux';

import codebridgeWorkspaceSlice from './workspaceSlice';

const store = injectSlices<[typeof codebridgeWorkspaceSlice], typeof labStore>([
  codebridgeWorkspaceSlice,
]);

export type RootState = StateFor<typeof store>;
export type AppDispatch = (typeof store)['dispatch'];
export const {useAppDispatch, useAppSelector} = storeHooks<typeof store>();

export default store;
