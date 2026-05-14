/**
 * @vitest-environment jsdom
 */

import {z} from 'zod';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import type {
  ApiClient,
  Channel,
  ProjectSources,
  QueryClient,
} from '@code-dot-org/core/api';
import {ApiError} from '@code-dot-org/core/api';

import ProjectManager from '../ProjectManager';

// Observability is a sibling plugin — stub it so logger/recordError are
// observable without pulling in the singleton.
const loggerWarn = vi.fn();
const recordError = vi.fn();
vi.mock('@code-dot-org/core/plugins/observability', () => ({
  logger: {warn: (...args: unknown[]) => loggerWarn(...args)},
  recordError: (...args: unknown[]) => recordError(...args),
}));

// Bare-minimum SourcesStore / ChannelsStore doubles. ProjectManager only
// calls a small subset of methods on each.
function makeSourcesStore() {
  return {
    load: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
    restore: vi.fn().mockResolvedValue(undefined),
    getVersionList: vi.fn().mockResolvedValue([]),
    getCurrentVersionId: vi.fn().mockReturnValue('v-current'),
  };
}

function makeChannelsStore() {
  return {
    load: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
    getAbuseScore: vi.fn().mockResolvedValue(0),
    getSharingDisabled: vi.fn().mockResolvedValue(false),
    getIsTeacherOfProjectOwner: vi.fn().mockResolvedValue(false),
    publish: vi.fn().mockResolvedValue(undefined),
    unpublish: vi.fn().mockResolvedValue(undefined),
    redirectToRemix: vi.fn(),
    redirectToView: vi.fn(),
  };
}

function makeApi(): ApiClient {
  return {
    projects: {
      getProjectThumbnailUrl: vi.fn().mockReturnValue('/thumb/path'),
      updateProjectThumbnail: vi.fn().mockResolvedValue(undefined),
    },
  } as unknown as ApiClient;
}

function makeQuery(): QueryClient {
  return {} as unknown as QueryClient;
}

function setup(
  opts: {
    channelId?: string;
    reduceChannelUpdates?: boolean;
    isStandaloneProjectLevel?: boolean;
    isShareView?: boolean;
  } = {},
) {
  const api = makeApi();
  const query = makeQuery();
  const sourcesStore = makeSourcesStore();
  const channelsStore = makeChannelsStore();
  const pm = new ProjectManager({
    apiClient: api,
    queryClient: query,
    // The runtime only relies on the structural shape; the casts are to
    // avoid pulling in the full class implementations from the real types.
    sourcesStore: sourcesStore as unknown as ConstructorParameters<
      typeof ProjectManager
    >[0]['sourcesStore'],
    channelsStore: channelsStore as unknown as ConstructorParameters<
      typeof ProjectManager
    >[0]['channelsStore'],
    channelId: opts.channelId ?? 'ch1',
    reduceChannelUpdates: opts.reduceChannelUpdates ?? false,
    isStandaloneProjectLevel: opts.isStandaloneProjectLevel ?? false,
    isShareView: opts.isShareView,
  });
  return {pm, api, query, sourcesStore, channelsStore};
}

const fakeChannel: Channel = {
  id: 'ch1',
  name: 'Existing',
  projectType: 'weblab',
  isOwner: true,
} as unknown as Channel;
const fakeSources = {body: 'source'} as unknown as ProjectSources;

beforeEach(() => {
  loggerWarn.mockClear();
  recordError.mockClear();
});

describe('ProjectManager getters', () => {
  it('returns the channel id from the constructor', () => {
    expect(setup({channelId: 'abc'}).pm.getChannelId()).toBe('abc');
  });

  it('returns isStandaloneProjectLevel from the constructor', () => {
    expect(
      setup({isStandaloneProjectLevel: true}).pm.getIsStandaloneProjectLevel(),
    ).toBe(true);
  });

  it('returns undefined projectType before any channel has been loaded', () => {
    expect(setup().pm.getProjectType()).toBeUndefined();
  });

  it('forwards getCurrentVersionId to the sources store', () => {
    const {pm, sourcesStore} = setup();
    expect(pm.getCurrentVersionId()).toBe('v-current');
    expect(sourcesStore.getCurrentVersionId).toHaveBeenCalledTimes(1);
  });

  it('round-trips forceNewVersion through the setter', () => {
    const {pm} = setup();
    expect(pm.getForceNewVersion()).toBe(false);
    pm.setForceNewVersion(true);
    expect(pm.getForceNewVersion()).toBe(true);
  });

  it('starts not force-reloading', () => {
    expect(setup().pm.isForceReloading()).toBe(false);
  });

  it('hasUnsavedChanges is false on a fresh manager', () => {
    expect(setup().pm.hasUnsavedChanges()).toBe(false);
  });
});

describe('ProjectManager destruction guards', () => {
  it('load() throws after destroy()', async () => {
    const {pm} = setup();
    pm.destroy();
    await expect(pm.load()).rejects.toThrow(/destroyed/);
  });

  it('restoreSources() throws after destroy()', async () => {
    const {pm} = setup();
    pm.destroy();
    await expect(pm.restoreSources('v')).rejects.toThrow(/destroyed/);
  });

  it('save() returns a 304 noop response after destroy()', async () => {
    const {pm} = setup();
    pm.destroy();
    const result = (await pm.save(fakeSources)) as Response;
    expect(result.status).toBe(304);
  });

  it('flushSave() returns a 304 noop response after destroy()', async () => {
    const {pm} = setup();
    pm.destroy();
    const result = (await pm.flushSave()) as Response;
    expect(result.status).toBe(304);
  });

  it('redirectToRemix throws after destroy()', () => {
    const {pm} = setup();
    pm.destroy();
    expect(() => pm.redirectToRemix()).toThrow(/destroyed/);
  });

  it('redirectToView throws after destroy()', () => {
    const {pm} = setup();
    pm.destroy();
    expect(() => pm.redirectToView()).toThrow(/destroyed/);
  });
});

describe('ProjectManager.load', () => {
  it('returns ProjectAndSources with channel + auxiliary status fields', async () => {
    const {pm, sourcesStore, channelsStore} = setup();
    sourcesStore.load.mockResolvedValue(fakeSources);
    channelsStore.load.mockResolvedValue(fakeChannel);
    channelsStore.getAbuseScore.mockResolvedValue(2);
    channelsStore.getSharingDisabled.mockResolvedValue(true);
    channelsStore.getIsTeacherOfProjectOwner.mockResolvedValue(true);

    const out = await pm.load();

    expect(out.channel).toBe(fakeChannel);
    expect(out.sources).toBe(fakeSources);
    expect(out.abuseScore).toBe(2);
    expect(out.sharingDisabled).toBe(true);
    expect(out.isTeacherOfProjectOwner).toBe(true);
  });

  it('returns undefined sources when resetSource=true and skips sources.load', async () => {
    const {pm, sourcesStore, channelsStore} = setup();
    channelsStore.load.mockResolvedValue(fakeChannel);

    const out = await pm.load(true);

    expect(out.sources).toBeUndefined();
    expect(sourcesStore.load).not.toHaveBeenCalled();
  });

  it('wraps a channels.load failure in "Error loading channel"', async () => {
    const {pm, channelsStore} = setup();
    channelsStore.load.mockRejectedValue(new Error('boom'));

    await expect(pm.load()).rejects.toThrow(/Error loading channel/);
  });

  it('caches the loaded channel for subsequent getProjectType / redirects', async () => {
    const {pm, channelsStore} = setup();
    channelsStore.load.mockResolvedValue(fakeChannel);
    await pm.load();
    expect(pm.getProjectType()).toBe('weblab');
  });
});

describe('ProjectManager.loadSources error branches', () => {
  it('returns undefined and warns on a Zod ValidationError', async () => {
    const {pm, sourcesStore} = setup();
    sourcesStore.load.mockRejectedValue(
      new z.ZodError([{code: 'custom', message: 'bad', path: []}]),
    );

    const out = await pm.loadSources();

    expect(out).toBeUndefined();
    expect(loggerWarn).toHaveBeenCalledWith(
      expect.stringMatching(/Error validating sources/),
    );
  });

  it('returns undefined silently on a 404 ApiError (new project)', async () => {
    const {pm, sourcesStore} = setup();
    sourcesStore.load.mockRejectedValue(
      new ApiError('not found', {
        status: 404,
        url: '/sources',
        method: 'GET',
      }),
    );

    const out = await pm.loadSources();

    expect(out).toBeUndefined();
    expect(loggerWarn).not.toHaveBeenCalled();
  });

  it('rethrows other ApiErrors wrapped in "Error loading sources"', async () => {
    const {pm, sourcesStore} = setup();
    sourcesStore.load.mockRejectedValue(
      new ApiError('server died', {
        status: 500,
        url: '/sources',
        method: 'GET',
      }),
    );

    await expect(pm.loadSources()).rejects.toThrow(/Error loading sources/);
  });
});

describe('ProjectManager.restoreSources', () => {
  it('calls sourcesStore.restore and re-loads sources', async () => {
    const {pm, sourcesStore} = setup();
    sourcesStore.load.mockResolvedValue(fakeSources);

    const out = await pm.restoreSources('v-old');

    expect(sourcesStore.restore).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      'ch1',
      'v-old',
    );
    expect(out).toBe(fakeSources);
  });

  it('wraps a restore failure in "Error restoring sources"', async () => {
    const {pm, sourcesStore} = setup();
    sourcesStore.restore.mockRejectedValue(new Error('boom'));

    await expect(pm.restoreSources('v-old')).rejects.toThrow(
      /Error restoring sources/,
    );
  });
});

describe('ProjectManager.save throttling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('saves immediately on the very first call', async () => {
    const {pm, sourcesStore, channelsStore} = setup();
    // load() seeds lastChannel — saveHelper requires it.
    channelsStore.load.mockResolvedValue(fakeChannel);
    // saveHelper assigns the result of channelsStore.save back into
    // lastChannel — if the mock returned undefined, subsequent saves
    // would bail out as noops on the missing-channel guard.
    channelsStore.save.mockResolvedValue(fakeChannel);
    await pm.load();

    await pm.save(fakeSources);

    expect(sourcesStore.save).toHaveBeenCalledTimes(1);
  });

  it('enqueues a second save inside the throttle window and only runs once after the interval', async () => {
    const {pm, sourcesStore, channelsStore} = setup();
    channelsStore.load.mockResolvedValue(fakeChannel);
    channelsStore.save.mockResolvedValue(fakeChannel);
    await pm.load();

    await pm.save(fakeSources);
    sourcesStore.save.mockClear();
    // A save was just made → nextSaveTime is set 30s in the future.
    // This call should be enqueued, not executed.
    const second = pm.save({body: 'newer'} as unknown as ProjectSources);
    const noop = (await second) as Response;
    expect(noop.status).toBe(304);
    expect(sourcesStore.save).not.toHaveBeenCalled();

    // Advance past the throttle window and let the enqueued timeout fire.
    await vi.advanceTimersByTimeAsync(30_000);
    expect(sourcesStore.save).toHaveBeenCalledTimes(1);
  });

  it('a force save bypasses the throttle', async () => {
    const {pm, sourcesStore, channelsStore} = setup();
    channelsStore.load.mockResolvedValue(fakeChannel);
    channelsStore.save.mockResolvedValue(fakeChannel);
    await pm.load();

    await pm.save(fakeSources);
    sourcesStore.save.mockClear();

    await pm.save({body: 'forced'} as unknown as ProjectSources, true);
    expect(sourcesStore.save).toHaveBeenCalledTimes(1);
  });
});

describe('ProjectManager.save listener notifications', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires saveStart + saveSuccess listeners on a successful save', async () => {
    const {pm, channelsStore} = setup();
    channelsStore.load.mockResolvedValue(fakeChannel);
    channelsStore.save.mockResolvedValue(fakeChannel);
    await pm.load();

    const start = vi.fn();
    const success = vi.fn();
    const fail = vi.fn();
    pm.addSaveStartListener(start);
    pm.addSaveSuccessListener(success);
    pm.addSaveFailListener(fail);

    await pm.save(fakeSources);

    expect(start).toHaveBeenCalledTimes(1);
    expect(success).toHaveBeenCalledTimes(1);
    expect(fail).not.toHaveBeenCalled();
  });

  it('fires saveNoop when there is no last channel', async () => {
    // No `load()` call → lastChannel is undefined → saveHelper takes the
    // noop path and calls saveNoop listeners.
    const {pm} = setup();
    const noop = vi.fn();
    const start = vi.fn();
    pm.addSaveNoopListener(noop);
    pm.addSaveStartListener(start);

    await pm.save(fakeSources, /* forceSave */ true);

    expect(noop).toHaveBeenCalledTimes(1);
    expect(start).not.toHaveBeenCalled();
  });

  it('fires saveFail when sourcesStore.save throws', async () => {
    const {pm, channelsStore, sourcesStore} = setup();
    channelsStore.load.mockResolvedValue(fakeChannel);
    sourcesStore.save.mockRejectedValue(new Error('500 server'));
    await pm.load();

    const fail = vi.fn();
    pm.addSaveFailListener(fail);

    await pm.save(fakeSources);

    expect(fail).toHaveBeenCalledTimes(1);
    expect(fail.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(recordError).toHaveBeenCalled();
  });
});

describe('ProjectManager.rename', () => {
  it('returns a noop without a lastChannel', async () => {
    const {pm, channelsStore} = setup();
    const out = (await pm.rename('new name')) as Response;
    expect(out.status).toBe(304);
    expect(channelsStore.save).not.toHaveBeenCalled();
  });

  it('returns a noop after destroy()', async () => {
    const {pm, channelsStore} = setup();
    channelsStore.load.mockResolvedValue(fakeChannel);
    await pm.load();
    pm.destroy();

    const out = (await pm.rename('x')) as Response;
    expect(out.status).toBe(304);
  });

  it('triggers a channel save with the new name', async () => {
    const {pm, channelsStore} = setup();
    channelsStore.load.mockResolvedValue(fakeChannel);
    channelsStore.save.mockResolvedValue({...fakeChannel, name: 'New'});
    await pm.load();

    await pm.rename('New');

    expect(channelsStore.save).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({name: 'New'}),
    );
  });
});

describe('ProjectManager publish/unpublish', () => {
  // Skipped: the missing-channel branch surfaces as an unhandled
  // rejection because publish() is sync-void wrapping an async
  // publishHelper. Intercepting it cleanly requires either changing the
  // production signature (return the promise) or spying on a private
  // method. Not worth it — real callers always load before publish.

  it('delegates publish to the channels store', async () => {
    const {pm, channelsStore} = setup();
    channelsStore.load.mockResolvedValue(fakeChannel);
    await pm.load();

    pm.publish();

    expect(channelsStore.publish).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      fakeChannel,
    );
  });

  it('delegates unpublish to the channels store', async () => {
    const {pm, channelsStore} = setup();
    channelsStore.load.mockResolvedValue(fakeChannel);
    await pm.load();

    pm.unpublish();

    expect(channelsStore.unpublish).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      fakeChannel,
    );
  });
});

describe('ProjectManager redirects', () => {
  it('redirectToRemix throws without a channel', () => {
    const {pm} = setup();
    expect(() => pm.redirectToRemix()).toThrow(/Cannot remix without channel/);
  });

  it('redirectToRemix delegates after load', async () => {
    const {pm, channelsStore} = setup();
    channelsStore.load.mockResolvedValue(fakeChannel);
    await pm.load();
    pm.redirectToRemix();
    expect(channelsStore.redirectToRemix).toHaveBeenCalledWith(fakeChannel);
  });

  it('redirectToView delegates after load', async () => {
    const {pm, channelsStore} = setup();
    channelsStore.load.mockResolvedValue(fakeChannel);
    await pm.load();
    pm.redirectToView();
    expect(channelsStore.redirectToView).toHaveBeenCalledWith(fakeChannel);
  });
});

describe('ProjectManager.getShareUrl', () => {
  // jsdom: swap window.location to control origin without triggering
  // navigation logic. window.location.href is otherwise non-configurable.
  const original = window.location;
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: {origin: 'https://studio.code.org', href: ''},
      writable: true,
      configurable: true,
    });
  });
  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: original,
      writable: true,
      configurable: true,
    });
  });

  it('returns null without a lastChannel', () => {
    expect(setup().pm.getShareUrl()).toBeNull();
  });

  it('builds {origin}/projects/{type}/{channelId} when channel + type are present', async () => {
    const {pm, channelsStore} = setup({channelId: 'ch9'});
    channelsStore.load.mockResolvedValue(fakeChannel);
    await pm.load();
    expect(pm.getShareUrl()).toBe(
      'https://studio.code.org/projects/weblab/ch9',
    );
  });
});

describe('ProjectManager thumbnails', () => {
  it('setThumbnail records the URL via the api thumbnail route', () => {
    const {pm, api} = setup();
    const blob = new Blob(['x'], {type: 'image/png'});
    pm.setThumbnail(blob);
    expect(api.projects.getProjectThumbnailUrl).toHaveBeenCalledWith({
      channelId: 'ch1',
    });
  });

  it('saveThumbnail is a no-op until setThumbnail has been called', async () => {
    const {pm, api} = setup();
    await pm.saveThumbnail();
    expect(api.projects.updateProjectThumbnail).not.toHaveBeenCalled();
  });

  it('saveThumbnail uploads the stored blob via the files API', async () => {
    const {pm, api} = setup();
    const blob = new Blob(['x'], {type: 'image/png'});
    pm.setThumbnail(blob);
    await pm.saveThumbnail();
    expect(api.projects.updateProjectThumbnail).toHaveBeenCalledWith({
      channelId: 'ch1',
      file: blob,
    });
  });

  it('getShouldCaptureThumbnail requires channelId, isOwner, and !isShareView', async () => {
    const {pm: pmShare, channelsStore: ch1} = setup({isShareView: true});
    ch1.load.mockResolvedValue(fakeChannel);
    await pmShare.load();
    expect(pmShare.getShouldCaptureThumbnail()).toBe(false);

    const {pm, channelsStore: ch2} = setup();
    ch2.load.mockResolvedValue(fakeChannel);
    await pm.load();
    expect(pm.getShouldCaptureThumbnail()).toBe(true);

    const {pm: pmNonOwner, channelsStore: ch3} = setup();
    ch3.load.mockResolvedValue({...fakeChannel, isOwner: false} as Channel);
    await pmNonOwner.load();
    expect(pmNonOwner.getShouldCaptureThumbnail()).toBe(false);
  });
});

describe('ProjectManager.getVersionList', () => {
  it('forwards includeComments to sourcesStore.getVersionList', async () => {
    const {pm, sourcesStore} = setup();
    await pm.getVersionList(true);
    expect(sourcesStore.getVersionList).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      'ch1',
      true,
    );
  });

  it('defaults includeComments to false', async () => {
    const {pm, sourcesStore} = setup();
    await pm.getVersionList();
    expect(sourcesStore.getVersionList).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      'ch1',
      false,
    );
  });
});

describe('ProjectManager.initializeForceNewVersionState (via load)', () => {
  it('sets forceNewVersion=true when the current version has a non-empty comment', async () => {
    const {pm, sourcesStore, channelsStore} = setup();
    channelsStore.load.mockResolvedValue(fakeChannel);
    sourcesStore.getCurrentVersionId.mockReturnValue('v-1');
    sourcesStore.getVersionList.mockResolvedValue([
      {versionId: 'v-1', comment: 'milestone'},
    ]);
    await pm.load();
    expect(pm.getForceNewVersion()).toBe(true);
  });

  it('keeps forceNewVersion=false when there is no current version', async () => {
    const {pm, sourcesStore, channelsStore} = setup();
    channelsStore.load.mockResolvedValue(fakeChannel);
    sourcesStore.getCurrentVersionId.mockReturnValue(null);
    await pm.load();
    expect(pm.getForceNewVersion()).toBe(false);
  });

  it('falls back to false and warns if the version list fetch fails', async () => {
    const {pm, sourcesStore, channelsStore} = setup();
    channelsStore.load.mockResolvedValue(fakeChannel);
    sourcesStore.getCurrentVersionId.mockReturnValue('v-1');
    sourcesStore.getVersionList.mockRejectedValue(new Error('network'));
    await pm.load();
    expect(pm.getForceNewVersion()).toBe(false);
    expect(loggerWarn).toHaveBeenCalledWith(
      expect.stringMatching(/Failed to initialize comment state/),
    );
  });
});
