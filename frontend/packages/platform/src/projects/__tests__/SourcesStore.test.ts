import {beforeEach, describe, expect, it, vi} from 'vitest';

import type {
  ApiClient,
  ProjectSources,
  QueryClient,
} from '@code-dot-org/core/api/data';
import {sourcesKeys} from '@code-dot-org/core/api/data';

import {SourcesStore} from '../SourcesStore';

// `save()` calls getTabId() from @code-dot-org/platform/user, which reads
// sessionStorage. Stub it so the tests don't depend on storage state.
vi.mock('@code-dot-org/platform/user', () => ({
  getTabId: () => 'tab-1',
}));

type FakeQuery = QueryClient & {
  fetchQuery: ReturnType<typeof vi.fn>;
  invalidateQueries: ReturnType<typeof vi.fn>;
};

function makeQuery(): FakeQuery {
  return {
    fetchQuery: vi.fn(async ({queryFn}: {queryFn: () => Promise<unknown>}) =>
      queryFn(),
    ),
    invalidateQueries: vi.fn(),
  } as unknown as FakeQuery;
}

function makeApi(
  overrides: {
    get?: ReturnType<typeof vi.fn>;
    update?: ReturnType<typeof vi.fn>;
    getVersionList?: ReturnType<typeof vi.fn>;
    restore?: ReturnType<typeof vi.fn>;
  } = {},
): ApiClient {
  return {
    sources: {
      get:
        overrides.get ??
        vi.fn().mockResolvedValue({sources: 'src-body', versionId: 'v-loaded'}),
      update:
        overrides.update ??
        vi.fn().mockResolvedValue({timestamp: 't-1', versionId: 'v-1'}),
      getVersionList: overrides.getVersionList ?? vi.fn().mockResolvedValue([]),
      restore:
        overrides.restore ??
        vi.fn().mockResolvedValue({versionId: 'v-restored'}),
    },
  } as unknown as ApiClient;
}

const fakeSources = {body: 'console.log()'} as unknown as ProjectSources;

describe('SourcesStore.load', () => {
  it('uses the source key with versionId undefined when loading the latest', async () => {
    const store = new SourcesStore();
    const api = makeApi();
    const query = makeQuery();

    const result = await store.load(api, query, 'ch1');

    expect(query.fetchQuery.mock.calls[0][0].queryKey).toEqual(
      sourcesKeys.source('ch1', undefined),
    );
    expect(api.sources.get).toHaveBeenCalledWith({
      channelId: 'ch1',
      versionId: undefined,
    });
    expect(result).toBe('src-body');
  });

  it('records the returned versionId as currentVersionId when loading the latest', async () => {
    const store = new SourcesStore();
    await store.load(makeApi(), makeQuery(), 'ch1');
    expect(store.getCurrentVersionId()).toBe('v-loaded');
  });

  it('does NOT touch currentVersionId when loading a specific version', async () => {
    // Loading a historical version is read-only — the "current" pointer
    // tracks the latest in-session version only.
    const store = new SourcesStore();
    await store.load(makeApi(), makeQuery(), 'ch1', 'v-old');
    expect(store.getCurrentVersionId()).toBeNull();
  });

  it('threads through the versionId in the key when given', async () => {
    const store = new SourcesStore();
    const query = makeQuery();
    await store.load(makeApi(), query, 'ch1', 'v-old');
    expect(query.fetchQuery.mock.calls[0][0].queryKey).toEqual(
      sourcesKeys.source('ch1', 'v-old'),
    );
  });
});

describe('SourcesStore.save (first save)', () => {
  it('skips the update-options branch on the very first save', async () => {
    // currentVersionId is null on a fresh store, so save() takes the
    // `let options: SaveSourceOptions = {projectType}` path — no
    // currentVersion / replace / firstSaveTimestamp / tabId fields.
    const store = new SourcesStore();
    const api = makeApi();
    const query = makeQuery();

    await store.save(api, query, 'ch1', fakeSources, 'weblab');

    expect(api.sources.update).toHaveBeenCalledWith({
      channelId: 'ch1',
      sources: fakeSources,
      options: {projectType: 'weblab'},
    });
  });

  it('records firstSaveTime, currentVersionId, and invalidates the detail key', async () => {
    const store = new SourcesStore();
    const api = makeApi();
    const query = makeQuery();

    await store.save(api, query, 'ch1', fakeSources);

    expect(store.getCurrentVersionId()).toBe('v-1');
    expect(query.invalidateQueries).toHaveBeenCalledWith({
      queryKey: sourcesKeys.detail('ch1'),
    });
  });
});

describe('SourcesStore.save (subsequent saves)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('replaces the existing version when within the 15-min window', async () => {
    // First save establishes currentVersionId + lastNewVersionTime.
    // Second save (immediately) sees lastNewVersionTime within the window
    // → replace=true, no new version cut.
    const store = new SourcesStore();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

    // First save: no currentVersionId, simple options.
    await store.save(makeApi(), makeQuery(), 'ch1', fakeSources);

    // Second save: currentVersionId exists, lastNewVersionTime still null
    // until forceNewVersion or the window expires. Reading the impl:
    // `replaceExistingVersion = !forceNewVersion && this.shouldReplaceExistingVersion();`
    // shouldReplaceExistingVersion returns false when lastNewVersionTime
    // is null — so the very-next save records lastNewVersionTime (new
    // version branch) but DOES NOT yet replace. Then the THIRD save will
    // be within the window.
    const api2 = makeApi();
    await store.save(api2, makeQuery(), 'ch1', fakeSources);
    expect(api2.sources.update).toHaveBeenCalledWith({
      channelId: 'ch1',
      sources: fakeSources,
      options: expect.objectContaining({
        currentVersion: 'v-1',
        replace: false,
        tabId: 'tab-1',
      }),
    });

    vi.advanceTimersByTime(60 * 1000); // 1 minute
    const api3 = makeApi();
    await store.save(api3, makeQuery(), 'ch1', fakeSources);
    expect(api3.sources.update).toHaveBeenCalledWith({
      channelId: 'ch1',
      sources: fakeSources,
      options: expect.objectContaining({replace: true}),
    });
  });

  it('honors forceNewVersion=true even within the window', async () => {
    const store = new SourcesStore();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

    // Run through saves to put lastNewVersionTime inside the window.
    await store.save(makeApi(), makeQuery(), 'ch1', fakeSources);
    await store.save(makeApi(), makeQuery(), 'ch1', fakeSources);
    vi.advanceTimersByTime(60 * 1000);

    const api = makeApi();
    await store.save(api, makeQuery(), 'ch1', fakeSources, undefined, true);
    expect(api.sources.update).toHaveBeenCalledWith({
      channelId: 'ch1',
      sources: fakeSources,
      options: expect.objectContaining({replace: false}),
    });
  });

  it('cuts a new version once 15 minutes have passed', async () => {
    const store = new SourcesStore();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

    await store.save(makeApi(), makeQuery(), 'ch1', fakeSources);
    await store.save(makeApi(), makeQuery(), 'ch1', fakeSources);

    vi.advanceTimersByTime(15 * 60 * 1000 + 1); // just past the window
    const api = makeApi();
    await store.save(api, makeQuery(), 'ch1', fakeSources);
    expect(api.sources.update).toHaveBeenCalledWith({
      channelId: 'ch1',
      sources: fakeSources,
      options: expect.objectContaining({replace: false}),
    });
  });
});

describe('SourcesStore.shouldReplaceExistingVersion', () => {
  it('returns false when no save has been made yet', () => {
    expect(new SourcesStore().shouldReplaceExistingVersion()).toBe(false);
  });
});

describe('SourcesStore.getVersionList', () => {
  it('uses the versionList key and forwards includeComments', async () => {
    const store = new SourcesStore();
    const api = makeApi();
    const query = makeQuery();

    await store.getVersionList(api, query, 'ch1', true);

    expect(query.fetchQuery.mock.calls[0][0].queryKey).toEqual(
      sourcesKeys.versionList('ch1'),
    );
    expect(api.sources.getVersionList).toHaveBeenCalledWith({
      channelId: 'ch1',
      includeComments: true,
    });
  });

  it('defaults includeComments to false', async () => {
    const store = new SourcesStore();
    const api = makeApi();
    await store.getVersionList(api, makeQuery(), 'ch1');
    expect(api.sources.getVersionList).toHaveBeenCalledWith({
      channelId: 'ch1',
      includeComments: false,
    });
  });
});

describe('SourcesStore.restore', () => {
  it('records the returned versionId and invalidates the detail key', async () => {
    const store = new SourcesStore();
    const api = makeApi();
    const query = makeQuery();

    await store.restore(api, query, 'ch1', 'v-old');

    expect(api.sources.restore).toHaveBeenCalledWith({
      channelId: 'ch1',
      versionId: 'v-old',
    });
    expect(store.getCurrentVersionId()).toBe('v-restored');
    expect(query.invalidateQueries).toHaveBeenCalledWith({
      queryKey: sourcesKeys.detail('ch1'),
    });
  });

  it('still invalidates when the response has no versionId', async () => {
    const store = new SourcesStore();
    const api = makeApi({
      restore: vi.fn().mockResolvedValue(undefined),
    });
    const query = makeQuery();

    await store.restore(api, query, 'ch1', 'v-old');

    expect(store.getCurrentVersionId()).toBeNull();
    expect(query.invalidateQueries).toHaveBeenCalled();
  });
});
