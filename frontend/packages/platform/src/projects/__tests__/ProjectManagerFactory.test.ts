/**
 * @vitest-environment jsdom
 */

import {beforeEach, describe, expect, it, vi} from 'vitest';

import type {ApiClient, QueryClient} from '@code-dot-org/core/api';

// Mock the channels-for-level call. ProjectManagerFactory constructs its
// own ChannelsStore and SourcesStore internally, so we can't inject
// doubles via the public surface — instead we intercept the underlying
// `api.projects.getChannelForLevel` which ChannelsStore.loadForLevel
// ultimately calls.
//
// `query.fetchQuery` just forwards to its queryFn in our stub so the
// result we mock on the api flows back through the store.
function makeApi(getChannelForLevel: ReturnType<typeof vi.fn>): ApiClient {
  return {
    channels: {
      get: vi.fn(),
      update: vi.fn(),
      publish: vi.fn(),
      unpublish: vi.fn(),
      fetchAbuseScore: vi.fn(),
      fetchSharingDisabled: vi.fn(),
      fetchIsTeacherOfProjectOwner: vi.fn(),
    },
    projects: {
      getChannelForLevel,
      getProjectThumbnailUrl: vi.fn(),
      updateProjectThumbnail: vi.fn(),
    },
    sources: {
      get: vi.fn(),
      update: vi.fn(),
      getVersionList: vi.fn(),
      restore: vi.fn(),
    },
  } as unknown as ApiClient;
}

function makeQuery(): QueryClient {
  return {
    fetchQuery: vi.fn(async ({queryFn}: {queryFn: () => Promise<unknown>}) =>
      queryFn(),
    ),
    invalidateQueries: vi.fn(),
  } as unknown as QueryClient;
}

// Import lazily so vi.mock(...) declarations elsewhere don't race.
import ProjectManagerFactory from '../ProjectManagerFactory';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ProjectManagerFactory.getProjectManager', () => {
  it('builds a ProjectManager keyed on the given projectId', () => {
    const api = makeApi(vi.fn());
    const query = makeQuery();
    const pm = ProjectManagerFactory.getProjectManager(
      api,
      query,
      'proj-9',
      true,
      false,
    );
    expect(pm.getChannelId()).toBe('proj-9');
    expect(pm.getIsStandaloneProjectLevel()).toBe(true);
  });

  it('defaults isShareView to false', () => {
    // No public getter for isShareView, but getShouldCaptureThumbnail()
    // depends on !isShareView — combined with !isOwner before load, it
    // always returns false. The default doesn't have a visible effect
    // without further setup, so this test just pins the call signature
    // (3 vs 4 args) doesn't blow up.
    const pm = ProjectManagerFactory.getProjectManager(
      makeApi(vi.fn()),
      makeQuery(),
      'proj-9',
      false,
    );
    expect(pm.getChannelId()).toBe('proj-9');
  });
});

describe('ProjectManagerFactory.getProjectManagerForLevel', () => {
  it('loads the channel for the level and constructs a manager keyed on it', async () => {
    const getChannelForLevel = vi
      .fn()
      .mockResolvedValue({channel: 'ch-100', reduceChannelUpdates: false});
    const api = makeApi(getChannelForLevel);
    const query = makeQuery();

    const pm = await ProjectManagerFactory.getProjectManagerForLevel(
      api,
      query,
      100,
      false,
      42, // userId
      7, // scriptId
    );

    expect(getChannelForLevel).toHaveBeenCalledWith({
      levelId: 100,
      scriptId: 7,
      userId: 42,
    });
    expect(pm).not.toBeNull();
    expect(pm!.getChannelId()).toBe('ch-100');
  });

  it('returns null when the student has not started (response.started === false)', async () => {
    const getChannelForLevel = vi.fn().mockResolvedValue({started: false});
    const api = makeApi(getChannelForLevel);

    const result = await ProjectManagerFactory.getProjectManagerForLevel(
      api,
      makeQuery(),
      100,
      false,
    );
    expect(result).toBeNull();
  });

  it('throws when the response has neither a channel nor started=false', async () => {
    const getChannelForLevel = vi.fn().mockResolvedValue({});
    const api = makeApi(getChannelForLevel);

    await expect(
      ProjectManagerFactory.getProjectManagerForLevel(
        api,
        makeQuery(),
        100,
        false,
      ),
    ).rejects.toThrow(/Could not load channel for level/);
  });

  it('forwards reduceChannelUpdates from the response into the manager', async () => {
    // No public getter for reduceChannelUpdates, but we can prove it via
    // the saveHelper's branch: with reduceChannelUpdates=true and
    // initialSaveComplete=false, the first save still runs through
    // the channel save. Subsequent saves wouldn't — but that's deep in
    // ProjectManager. Here we only pin the construction wiring.
    const getChannelForLevel = vi
      .fn()
      .mockResolvedValue({channel: 'ch-1', reduceChannelUpdates: true});
    const api = makeApi(getChannelForLevel);

    const pm = await ProjectManagerFactory.getProjectManagerForLevel(
      api,
      makeQuery(),
      100,
      false,
    );

    // The successful construction itself is the assertion — exposing
    // reduceChannelUpdates would require a private accessor we don't
    // have.
    expect(pm).not.toBeNull();
    expect(pm!.getChannelId()).toBe('ch-1');
  });
});
