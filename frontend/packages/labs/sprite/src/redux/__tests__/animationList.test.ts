import {configureStore} from '@reduxjs/toolkit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import type {SerializedAnimationList} from '../../types';
import reducer, {
  allAnimationsLoaded,
  isNameUnique,
  serializeAnimationList,
  setAnimationName,
} from '../animationListSlice';
import {
  addAnimation,
  deleteAnimation,
  seedAnimationList,
} from '../animationListThunks';

function makeStore() {
  return configureStore({reducer: {animationList: reducer}});
}

function saved(...names: string[]): SerializedAnimationList {
  return {
    orderedKeys: names.map(name => `key-${name}`),
    propsByKey: Object.fromEntries(
      names.map(name => [
        `key-${name}`,
        {
          name,
          frameSize: {x: 10, y: 10},
          frameCount: 1,
          looping: true,
          frameDelay: 2,
          sourceUrl: `/api/v1/animation-library/${name}.png`,
        },
      ]),
    ),
  };
}

let urls = 0;

beforeEach(() => {
  urls = 0;
  URL.createObjectURL = vi.fn(() => `blob:image-${++urls}`);
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

const ok = vi.fn(async () => new Response(new Blob(['png'])));

describe('animation list', () => {
  it('seeds from saved sources and loads every image', async () => {
    const store = makeStore();
    const seeding = store.dispatch(
      seedAnimationList(saved('cat', 'dog'), {channelId: 'ch', fetch: ok}),
    );
    expect(allAnimationsLoaded(store.getState().animationList)).toBe(false);
    await seeding;
    const list = store.getState().animationList;
    expect(list.orderedKeys).toEqual(['key-cat', 'key-dog']);
    expect(list.propsByKey['key-cat'].dataURI).toMatch(/^blob:/);
    expect(allAnimationsLoaded(list)).toBe(true);
  });

  it('counts a failed image as loaded, without data', async () => {
    const store = makeStore();
    const onError = vi.fn();
    await store.dispatch(
      seedAnimationList(saved('cat'), {
        channelId: 'ch',
        fetch: async () => new Response('', {status: 404}),
        onError,
      }),
    );
    const props = store.getState().animationList.propsByKey['key-cat'];
    expect(props.loadedFromSource).toBe(true);
    expect(props.dataURI).toBeUndefined();
    expect(onError).toHaveBeenCalledOnce();
  });

  it('reseeding frees the old images', async () => {
    const store = makeStore();
    await store.dispatch(
      seedAnimationList(saved('cat'), {channelId: 'ch', fetch: ok}),
    );
    await store.dispatch(
      seedAnimationList(saved('dog'), {channelId: 'ch', fetch: ok}),
    );
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:image-1');
  });

  it('replaces a malformed list with an empty one', async () => {
    const store = makeStore();
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    await store.dispatch(
      seedAnimationList(
        {orderedKeys: ['a'], propsByKey: {}} as SerializedAnimationList,
        {channelId: 'ch', fetch: ok},
      ),
    );
    expect(store.getState().animationList.orderedKeys).toEqual([]);
    expect(error).toHaveBeenCalled();
  });

  it('adds an image first, under a unique name', async () => {
    const store = makeStore();
    await store.dispatch(
      seedAnimationList(saved('cat'), {channelId: 'ch', fetch: ok}),
    );
    await store.dispatch(
      addAnimation(
        'new',
        {...saved('cat').propsByKey['key-cat'], looping: false},
        {channelId: 'ch', fetch: ok},
      ),
    );
    const list = store.getState().animationList;
    expect(list.orderedKeys).toEqual(['new', 'key-cat']);
    expect(list.propsByKey.new.name).toBe('cat_1');
    expect(list.propsByKey.new.looping).toBe(true);
    expect(list.propsByKey.new.dataURI).toMatch(/^blob:/);
  });

  it('deletes an image and its file', async () => {
    const store = makeStore();
    await store.dispatch(
      seedAnimationList(saved('cat'), {channelId: 'ch', fetch: ok}),
    );
    const remove = vi.fn(async () => new Response(''));
    await store.dispatch(
      deleteAnimation('key-cat', {channelId: 'ch', fetch: remove}),
    );
    expect(store.getState().animationList.orderedKeys).toEqual([]);
    expect(remove).toHaveBeenCalledWith('/v3/animations/ch/key-cat.png', {
      method: 'DELETE',
    });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:image-1');
  });

  it('renames, and knows which names are taken', async () => {
    const store = makeStore();
    await store.dispatch(
      seedAnimationList(saved('cat'), {channelId: 'ch', fetch: ok}),
    );
    store.dispatch(setAnimationName({key: 'key-cat', name: 'tabby'}));
    const list = store.getState().animationList;
    expect(isNameUnique('cat', list)).toBe(true);
    expect(isNameUnique('tabby', list)).toBe(false);
  });

  it('serializes without image data or load state', async () => {
    const store = makeStore();
    await store.dispatch(
      seedAnimationList(saved('cat'), {channelId: 'ch', fetch: ok}),
    );
    expect(serializeAnimationList(store.getState().animationList)).toEqual(
      saved('cat'),
    );
  });
});
