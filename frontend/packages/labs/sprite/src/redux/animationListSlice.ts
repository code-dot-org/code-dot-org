// The project's images: what apps kept in its classic animationList Redux
// module, reduced to what Sprite Lab 2 used. Each image is held as an
// object URL once it has loaded (engine/animations/sources.ts).
import {createSlice, type PayloadAction} from '@reduxjs/toolkit';

import type {
  RuntimeAnimationList,
  RuntimeAnimationProps,
  SerializedAnimationList,
  SerializedAnimationProps,
} from '../types';

export interface AnimationProps extends RuntimeAnimationProps {
  /** False while the image is being fetched; true once it has been. */
  loadedFromSource?: boolean;
}

export interface AnimationListState extends RuntimeAnimationList {
  propsByKey: {[key: string]: AnimationProps};
}

const initialState: AnimationListState = {orderedKeys: [], propsByKey: {}};

export const animationListSlice = createSlice({
  name: 'animationList',
  initialState,
  reducers: {
    setAnimationList: (_state, action: PayloadAction<RuntimeAnimationList>) =>
      action.payload,
    /** Sprite Lab puts a new image first, where the student sees it. */
    addAnimationAt: (
      state,
      action: PayloadAction<{
        key: string;
        props: AnimationProps;
        index: number;
      }>,
    ) => {
      const {key, props, index} = action.payload;
      state.orderedKeys.splice(index, 0, key);
      state.propsByKey[key] = props;
    },
    setAnimationName: (
      state,
      action: PayloadAction<{key: string; name: string}>,
    ) => {
      const props = state.propsByKey[action.payload.key];
      if (props) {
        props.name = action.payload.name;
      }
    },
    startLoadingFromSource: (state, action: PayloadAction<string>) => {
      const props = state.propsByKey[action.payload];
      if (props) {
        props.loadedFromSource = false;
      }
    },
    doneLoadingFromSource: (
      state,
      action: PayloadAction<{key: string; dataURI: string | undefined}>,
    ) => {
      const props = state.propsByKey[action.payload.key];
      if (props) {
        props.loadedFromSource = true;
        props.dataURI = action.payload.dataURI;
      }
    },
    removeAnimation: (state, action: PayloadAction<string>) => {
      state.orderedKeys = state.orderedKeys.filter(
        key => key !== action.payload,
      );
      delete state.propsByKey[action.payload];
    },
  },
});

export const {
  setAnimationList,
  addAnimationAt,
  setAnimationName,
  startLoadingFromSource,
  doneLoadingFromSource,
  removeAnimation,
} = animationListSlice.actions;

export default animationListSlice.reducer;

const SERIALIZED_PROPS: (keyof SerializedAnimationProps)[] = [
  'name',
  'sourceUrl',
  'frameSize',
  'frameCount',
  'looping',
  'frameDelay',
  'version',
  'categories',
  'role',
  'pixelGridSize',
  'recentColors',
  'trimmed',
  'generation',
  'poses',
];

/** The list as a project saves it: no image data, no load state. */
export function serializeAnimationList(
  list: RuntimeAnimationList,
): SerializedAnimationList {
  const propsByKey: SerializedAnimationList['propsByKey'] = {};
  for (const key of list.orderedKeys) {
    const props = list.propsByKey[key];
    if (!props) {
      continue;
    }
    const saved: Partial<SerializedAnimationProps> = {};
    for (const name of SERIALIZED_PROPS) {
      if (props[name] !== undefined) {
        (saved as Record<string, unknown>)[name] = props[name];
      }
    }
    propsByKey[key] = saved as SerializedAnimationProps;
  }
  return {orderedKeys: [...list.orderedKeys], propsByKey};
}

export function isNameUnique(
  name: string,
  list: RuntimeAnimationList,
): boolean {
  return !Object.values(list.propsByKey).some(props => props?.name === name);
}

/**
 * Whether every image has finished loading. A failed image counts as
 * finished, without data; apps left it loading until a grace period ran out.
 */
export function allAnimationsLoaded(list: AnimationListState): boolean {
  return list.orderedKeys.every(key => list.propsByKey[key]?.loadedFromSource);
}
