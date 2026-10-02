// The lab store: lab-base's store with Sprite Lab's slice added. The value
// import of `@code-dot-org/lab/redux` is what injects the base slices.

import {injectSlices, storeHooks} from '@code-dot-org/core/redux';
import type {StateFor} from '@code-dot-org/core/redux';
import {default as labStore} from '@code-dot-org/lab/redux';

import {animationListSlice} from './animationListSlice';
import {spriteLab2Slice} from './spriteLab2Redux';

const store = injectSlices<
  [typeof spriteLab2Slice, typeof animationListSlice],
  typeof labStore
>([spriteLab2Slice, animationListSlice]);

export type RootState = StateFor<typeof store>;
export type AppDispatch = (typeof store)['dispatch'];
export const {useAppDispatch, useAppSelector} = storeHooks<typeof store>();

export default store;
