// Apps' animationList thunks that Sprite Lab 2 used. Where apps marked the
// project changed, the view saves the serialized list when it changes.
import type {Dispatch} from '@reduxjs/toolkit';

import {
  loadAnimationSources,
  normalizeAnimationList,
  revokeAnimationSources,
  uniqueName,
} from '../engine/animations';
import type {RuntimeAnimationList, SerializedAnimationList} from '../types';

import {
  addAnimationAt,
  type AnimationListState,
  type AnimationProps,
  doneLoadingFromSource,
  removeAnimation,
  setAnimationList,
  startLoadingFromSource,
} from './animationListSlice';

type GetState = () => {animationList: AnimationListState};

export interface ImageLoadOptions {
  channelId: string | undefined;
  /** An image that failed to load; it stays in the list without data. */
  onError?: (key: string, name: string, error: unknown) => void;
  fetch?: typeof fetch;
}

function loadFromSource(
  key: string,
  options: ImageLoadOptions,
): (dispatch: Dispatch, getState: GetState) => Promise<void> {
  return async (dispatch, getState) => {
    const props = getState().animationList.propsByKey[key];
    if (!props) {
      return;
    }
    dispatch(startLoadingFromSource(key));
    const loaded = await loadAnimationSources(
      {orderedKeys: [key], propsByKey: {[key]: {...props, dataURI: undefined}}},
      options,
    );
    const dataURI = loaded.propsByKey[key]?.dataURI;
    // The image may have gone, or been replaced, while it loaded.
    if (getState().animationList.propsByKey[key] !== undefined) {
      dispatch(doneLoadingFromSource({key, dataURI}));
    } else if (dataURI) {
      URL.revokeObjectURL(dataURI);
    }
  };
}

/**
 * Replaces the list with a project's saved one and loads every image. A
 * malformed list is reported and replaced by an empty one.
 */
export function seedAnimationList(
  saved: SerializedAnimationList | undefined,
  options: ImageLoadOptions,
) {
  return (dispatch: Dispatch, getState: GetState): Promise<void> => {
    let list: RuntimeAnimationList;
    try {
      list = normalizeAnimationList(saved);
    } catch (error) {
      console.error('Unable to load animations:', error);
      list = normalizeAnimationList(undefined);
    }
    revokeAnimationSources(getState().animationList);
    dispatch(setAnimationList(list));
    return Promise.all(
      list.orderedKeys.map(key =>
        loadFromSource(key, options)(dispatch, getState),
      ),
    ).then(() => undefined);
  };
}

/** Adds an image first in the list, under a name no other image has. */
export function addAnimation(
  key: string,
  props: AnimationProps,
  options: ImageLoadOptions,
) {
  return (dispatch: Dispatch, getState: GetState): Promise<void> => {
    const name = uniqueName(props.name, getState().animationList);
    dispatch(
      addAnimationAt({key, props: {...props, name, looping: true}, index: 0}),
    );
    return loadFromSource(key, options)(dispatch, getState);
  };
}

/** Removes an image and deletes its file from the project's animations. */
export function deleteAnimation(
  key: string,
  {channelId, fetch: fetchImpl = fetch}: ImageLoadOptions,
) {
  return (dispatch: Dispatch, getState: GetState): Promise<void> => {
    const removed = getState().animationList.propsByKey[key];
    if (removed?.dataURI?.startsWith('blob:')) {
      URL.revokeObjectURL(removed.dataURI);
    }
    dispatch(removeAnimation(key));
    if (!channelId) {
      return Promise.resolve();
    }
    const path = encodeURIComponent(key).replace(/%2F/g, '/');
    return fetchImpl(`/v3/animations/${channelId}/${path}.png`, {
      method: 'DELETE',
    })
      .then(response => {
        if (!response.ok) {
          console.error(
            `Error deleting object ${key}: ${response.status} ${response.statusText}`,
          );
        }
      })
      .catch(error => console.error(`Error deleting object ${key}:`, error));
  };
}
