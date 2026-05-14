/**
 * @vitest-environment jsdom
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import type {ApiClient, Channel, QueryClient} from '@code-dot-org/core/api';
import {channelsKeys, projectsKeys} from '@code-dot-org/core/api';

import {ChannelsStore} from '../ChannelsStore';

// The store delegates everything through `api` and `query`. The interest
// of these tests is: did we forward the right arguments, build the right
// query key, and invalidate the right cache entry. So we mock just the
// methods the store touches.

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

function makeApi(overrides: Record<string, unknown> = {}): ApiClient {
  return {
    channels: {
      get: vi.fn().mockResolvedValue({id: 'ch1', name: 'Existing'}),
      update: vi.fn().mockResolvedValue({id: 'ch1', name: 'New'}),
      publish: vi.fn().mockResolvedValue({id: 'ch1', published: true}),
      unpublish: vi.fn().mockResolvedValue({id: 'ch1', published: false}),
      fetchAbuseScore: vi.fn().mockResolvedValue(0),
      fetchSharingDisabled: vi.fn().mockResolvedValue(false),
      fetchIsTeacherOfProjectOwner: vi.fn().mockResolvedValue(true),
    },
    projects: {
      getChannelForLevel: vi.fn().mockResolvedValue({id: 'ch1'}),
    },
    ...overrides,
  } as unknown as ApiClient;
}

const fakeChannel = {
  id: 'ch1',
  name: 'Existing',
  projectType: 'weblab',
} as Channel;

describe('ChannelsStore.loadForLevel', () => {
  it('uses the channelForLevel key and forwards the params', async () => {
    const store = new ChannelsStore();
    const api = makeApi();
    const query = makeQuery();

    await store.loadForLevel(api, query, 100, 200, 300);

    expect(query.fetchQuery).toHaveBeenCalledTimes(1);
    expect(query.fetchQuery.mock.calls[0][0].queryKey).toEqual(
      projectsKeys.channelForLevel({levelId: 100, scriptId: 200, userId: 300}),
    );
    expect(api.projects.getChannelForLevel).toHaveBeenCalledWith({
      levelId: 100,
      scriptId: 200,
      userId: 300,
    });
  });

  it('forwards undefined scriptId/userId verbatim in the key', async () => {
    const store = new ChannelsStore();
    const api = makeApi();
    const query = makeQuery();

    await store.loadForLevel(api, query, 100);

    expect(query.fetchQuery.mock.calls[0][0].queryKey).toEqual(
      projectsKeys.channelForLevel({
        levelId: 100,
        scriptId: undefined,
        userId: undefined,
      }),
    );
  });
});

describe('ChannelsStore.load', () => {
  it('uses the channel detail key', async () => {
    const store = new ChannelsStore();
    const api = makeApi();
    const query = makeQuery();

    await store.load(api, query, 'ch1');

    expect(query.fetchQuery.mock.calls[0][0].queryKey).toEqual(
      channelsKeys.detail('ch1'),
    );
    expect(api.channels.get).toHaveBeenCalledWith({channelId: 'ch1'});
  });
});

describe('ChannelsStore.save', () => {
  it('merges the default channel (name="New Project") under the input', async () => {
    const store = new ChannelsStore();
    const api = makeApi();
    const query = makeQuery();
    const channelWithoutName = {id: 'ch1'} as Channel;

    await store.save(api, query, channelWithoutName);

    expect(api.channels.update).toHaveBeenCalledWith({
      channel: {name: 'New Project', id: 'ch1'},
    });
  });

  it('lets the input override the default name', async () => {
    const store = new ChannelsStore();
    const api = makeApi();
    const query = makeQuery();

    await store.save(api, query, {id: 'ch1', name: 'My Project'} as Channel);

    expect(api.channels.update).toHaveBeenCalledWith({
      channel: expect.objectContaining({name: 'My Project'}),
    });
  });

  it('invalidates the channel detail cache after a successful save', async () => {
    const store = new ChannelsStore();
    const api = makeApi();
    const query = makeQuery();

    await store.save(api, query, fakeChannel);

    expect(query.invalidateQueries).toHaveBeenCalledWith({
      queryKey: channelsKeys.detail('ch1'),
    });
  });
});

describe('ChannelsStore redirects', () => {
  // jsdom's window.location.href is non-configurable. Swap location for a
  // bare object so the store's `window.location.href = …` assignment is
  // observable as a property write.
  const originalLocation = window.location;
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: {href: 'about:blank'},
      writable: true,
      configurable: true,
    });
  });
  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it('redirectToRemix navigates to the project remix URL', () => {
    new ChannelsStore().redirectToRemix(fakeChannel);
    expect(window.location.href).toBe('/projects/weblab/ch1/remix');
  });

  it('redirectToView navigates to the project view URL', () => {
    new ChannelsStore().redirectToView(fakeChannel);
    expect(window.location.href).toBe('/projects/weblab/ch1/view');
  });
});

describe('ChannelsStore.publish / unpublish', () => {
  it('publish forwards the channel and invalidates the detail cache', async () => {
    const store = new ChannelsStore();
    const api = makeApi();
    const query = makeQuery();

    await store.publish(api, query, fakeChannel);

    expect(api.channels.publish).toHaveBeenCalledWith({channel: fakeChannel});
    expect(query.invalidateQueries).toHaveBeenCalledWith({
      queryKey: channelsKeys.detail('ch1'),
    });
  });

  it('unpublish forwards the channel and invalidates the detail cache', async () => {
    const store = new ChannelsStore();
    const api = makeApi();
    const query = makeQuery();

    await store.unpublish(api, query, fakeChannel);

    expect(api.channels.unpublish).toHaveBeenCalledWith({channel: fakeChannel});
    expect(query.invalidateQueries).toHaveBeenCalledWith({
      queryKey: channelsKeys.detail('ch1'),
    });
  });
});

describe('ChannelsStore status fetchers', () => {
  it('getAbuseScore uses the abuseScore key', async () => {
    const store = new ChannelsStore();
    const api = makeApi();
    const query = makeQuery();

    await store.getAbuseScore(api, query, fakeChannel);

    expect(query.fetchQuery.mock.calls[0][0].queryKey).toEqual(
      channelsKeys.abuseScore('ch1'),
    );
    expect(api.channels.fetchAbuseScore).toHaveBeenCalledWith({
      channelId: 'ch1',
    });
  });

  it('getSharingDisabled uses the sharingDisabled key', async () => {
    const store = new ChannelsStore();
    const api = makeApi();
    const query = makeQuery();

    await store.getSharingDisabled(api, query, fakeChannel);

    expect(query.fetchQuery.mock.calls[0][0].queryKey).toEqual(
      channelsKeys.sharingDisabled('ch1'),
    );
    expect(api.channels.fetchSharingDisabled).toHaveBeenCalledWith({
      channelId: 'ch1',
    });
  });

  it('getIsTeacherOfProjectOwner uses the isTeacherOfProjectOwner key', async () => {
    const store = new ChannelsStore();
    const api = makeApi();
    const query = makeQuery();

    await store.getIsTeacherOfProjectOwner(api, query, fakeChannel);

    expect(query.fetchQuery.mock.calls[0][0].queryKey).toEqual(
      channelsKeys.isTeacherOfProjectOwner('ch1'),
    );
    expect(api.channels.fetchIsTeacherOfProjectOwner).toHaveBeenCalledWith({
      channelId: 'ch1',
    });
  });
});
