import {configureStore} from '@reduxjs/toolkit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {DashboardApiClient} from '@code-dot-org/core/api';

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

vi.mock('@code-dot-org/core/api', async importOriginal => ({
  ...(await importOriginal<object>()),
  DashboardApiClient: {
    media: {getImage: vi.fn()},
    animations: {remove: vi.fn()},
  },
}));
const getImage = vi.mocked(DashboardApiClient.media.getImage);
const remove = vi.mocked(DashboardApiClient.animations.remove);

beforeEach(() => {
  getImage.mockReset();
  remove.mockReset();
  getImage.mockResolvedValue(new Blob(['png']));
  remove.mockResolvedValue(undefined);
});

describe('animation list', () => {
  it('seeds from saved sources and loads every image', async () => {
    const store = makeStore();
    const seeding = store.dispatch(
      seedAnimationList(saved('cat', 'dog'), {channelId: 'ch'}),
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
    getImage.mockRejectedValue(new Error('404'));
    await store.dispatch(
      seedAnimationList(saved('cat'), {
        channelId: 'ch',
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
    await store.dispatch(seedAnimationList(saved('cat'), {channelId: 'ch'}));
    await store.dispatch(seedAnimationList(saved('dog'), {channelId: 'ch'}));
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:image-1');
  });

  it('replaces a malformed list with an empty one', async () => {
    const store = makeStore();
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    await store.dispatch(
      seedAnimationList(
        {orderedKeys: ['a'], propsByKey: {}} as SerializedAnimationList,
        {channelId: 'ch'},
      ),
    );
    expect(store.getState().animationList.orderedKeys).toEqual([]);
    expect(error).toHaveBeenCalled();
  });

  it('adds an image first, under a unique name', async () => {
    const store = makeStore();
    await store.dispatch(seedAnimationList(saved('cat'), {channelId: 'ch'}));
    await store.dispatch(
      addAnimation(
        'new',
        {...saved('cat').propsByKey['key-cat'], looping: false},
        {channelId: 'ch'},
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
    await store.dispatch(seedAnimationList(saved('cat'), {channelId: 'ch'}));
    await store.dispatch(deleteAnimation('key-cat', {channelId: 'ch'}));
    expect(store.getState().animationList.orderedKeys).toEqual([]);
    expect(remove).toHaveBeenCalledWith({channelId: 'ch', key: 'key-cat'});
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:image-1');
  });

  it('renames, and knows which names are taken', async () => {
    const store = makeStore();
    await store.dispatch(seedAnimationList(saved('cat'), {channelId: 'ch'}));
    store.dispatch(setAnimationName({key: 'key-cat', name: 'tabby'}));
    const list = store.getState().animationList;
    expect(isNameUnique('cat', list)).toBe(true);
    expect(isNameUnique('tabby', list)).toBe(false);
  });

  it('serializes without image data or load state', async () => {
    const store = makeStore();
    await store.dispatch(seedAnimationList(saved('cat'), {channelId: 'ch'}));
    expect(serializeAnimationList(store.getState().animationList)).toEqual(
      saved('cat'),
    );
  });
});
