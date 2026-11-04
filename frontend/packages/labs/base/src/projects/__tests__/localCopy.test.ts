// Unsaved work kept in the browser until a save lands (projects/localCopy).

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import type {LocalCopy, LocalCopyStore} from '../localCopy';
import ProjectManager from '../ProjectManager';

const sourcesOf = (text: string) => ({source: text}) as never;

/** A copy store that is just a Map. */
const held = (): LocalCopyStore & {copies: Map<string, LocalCopy>} => {
  const copies = new Map<string, LocalCopy>();
  return {
    copies,
    read: id => copies.get(id),
    write: (id, copy) => void copies.set(id, copy),
    clear: id => void copies.delete(id),
  };
};

/** A server holding `text` at version `version`, which each save advances. */
const server = (text: string, version: string | null) => {
  const state = {text, version, saves: 0};
  const sourcesStore = {
    load: vi.fn(async () => sourcesOf(state.text)),
    save: vi.fn(
      async (_a: unknown, _q: unknown, _c: unknown, sources: never) => {
        state.text = (sources as {source: string}).source;
        state.saves += 1;
        state.version = `v${state.saves + 1}`;
      },
    ),
    getCurrentVersionId: () => state.version,
  };
  const channel = {isOwner: true, projectType: 'world'};
  const channelsStore = {
    load: vi.fn(async () => channel),
    save: vi.fn(async () => channel),
    getAbuseScore: vi.fn(async () => 0),
    getSharingDisabled: vi.fn(async () => false),
    getIsTeacherOfProjectOwner: vi.fn(async () => false),
  };
  return {state, sourcesStore, channelsStore};
};

const managerOn = (
  backend: ReturnType<typeof server>,
  localCopy: LocalCopyStore,
) => {
  const manager = new ProjectManager({
    apiClient: {} as never,
    queryClient: {} as never,
    sourcesStore: backend.sourcesStore as never,
    channelsStore: backend.channelsStore as never,
    channelId: 'c1',
    metricsReporter: {logError: vi.fn(), logWarning: vi.fn()} as never,
    reduceChannelUpdates: false,
    isStandaloneProjectLevel: false,
    localCopy,
  });
  // The version list decides whether the next save starts a version; none.
  vi.spyOn(manager, 'getVersionList').mockResolvedValue([]);
  return manager;
};

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('a copy of unsaved work', () => {
  it('is written a moment after an edit, and on leaving at once', async () => {
    const backend = server('start', 'v1');
    const copies = held();
    const manager = managerOn(backend, copies);
    await manager.load();
    // The first save goes straight out; the interval then holds the next.
    await manager.save(sourcesOf('first'));
    await manager.save(sourcesOf('second'));
    expect(copies.copies.get('c1')).toBeUndefined();

    vi.advanceTimersByTime(2000);
    expect(copies.copies.get('c1')).toEqual({
      base: 'v2',
      sources: sourcesOf('second'),
    });

    await manager.save(sourcesOf('third'));
    copies.copies.clear();
    void manager.cleanUp();
    expect(copies.copies.get('c1')?.sources).toEqual(sourcesOf('third'));
  });

  it('comes back on the next load, and is saved', async () => {
    const backend = server('start', 'v1');
    const copies = held();
    copies.write('c1', {base: 'v1', sources: sourcesOf('unsaved')});
    const manager = managerOn(backend, copies);

    const {sources} = await manager.load();

    expect(sources).toEqual(sourcesOf('unsaved'));
    await vi.runAllTimersAsync();
    expect(backend.state.text).toBe('unsaved');
    expect(copies.copies.has('c1')).toBe(false);
  });

  it('is dropped once a save from elsewhere has overtaken it', async () => {
    // Made on v1, and the server is at v4: writing it would undo whatever
    // v2 to v4 hold.
    const backend = server('elsewhere', 'v4');
    const copies = held();
    copies.write('c1', {base: 'v1', sources: sourcesOf('stale')});
    const manager = managerOn(backend, copies);

    const {sources} = await manager.load();

    expect(sources).toEqual(sourcesOf('elsewhere'));
    expect(copies.copies.has('c1')).toBe(false);
  });

  it('is dropped by starting over', async () => {
    const backend = server('start', 'v1');
    const copies = held();
    copies.write('c1', {base: 'v1', sources: sourcesOf('unsaved')});
    const manager = managerOn(backend, copies);

    const {sources} = await manager.load(/* resetSource */ true);

    expect(sources).toBeUndefined();
    expect(copies.copies.has('c1')).toBe(false);
  });

  it('is kept by no manager that was not given a store', async () => {
    const backend = server('start', 'v1');
    const manager = new ProjectManager({
      apiClient: {} as never,
      queryClient: {} as never,
      sourcesStore: backend.sourcesStore as never,
      channelsStore: backend.channelsStore as never,
      channelId: 'c1',
      metricsReporter: {logError: vi.fn()} as never,
      reduceChannelUpdates: false,
      isStandaloneProjectLevel: false,
    });
    vi.spyOn(manager, 'getVersionList').mockResolvedValue([]);
    await manager.load();
    await manager.save(sourcesOf('first'));
    await manager.save(sourcesOf('second'));
    vi.advanceTimersByTime(2000);

    expect(backend.state.saves).toBe(1);
  });
});
