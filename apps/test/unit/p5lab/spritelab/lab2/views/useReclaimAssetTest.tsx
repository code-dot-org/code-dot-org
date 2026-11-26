import {render} from '@testing-library/react';
import React from 'react';

import LabMetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';
import {ChannelsStore} from '@cdo/apps/lab2/projects/ChannelsStore';
import ProjectManager from '@cdo/apps/lab2/projects/ProjectManager';
import {SourcesStore} from '@cdo/apps/lab2/projects/SourcesStore';
import {ProjectSources} from '@cdo/apps/lab2/types';
import useReclaimAsset from '@cdo/apps/p5lab/spritelab/lab2/views/useReclaimAsset';

jest.mock('@cdo/apps/redux', () => {
  const propsByKey: Record<string, Record<string, unknown>> = {};
  const store = {
    getState: () => ({
      animationList: {orderedKeys: Object.keys(propsByKey), propsByKey},
    }),
  };
  return {getStore: () => store, mockPropsByKey: propsByKey};
});
const propsByKey = (
  jest.requireMock('@cdo/apps/redux') as {
    mockPropsByKey: Record<string, Record<string, unknown>>;
  }
).mockPropsByKey;
const httpDelete = jest.fn((...args: unknown[]) => Promise.resolve());
jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  default: {delete: (...args: unknown[]) => httpDelete(...args)},
}));

// A stand-in project manager. `settle(saved, waiting)` acts as a save that
// has finished, leaving `saved` on the server and `waiting` still to be
// saved.
const newManager = () => ({
  saved: {} as unknown,
  waiting: undefined as unknown,
  certain: true,
  isOwner: true,
  listeners: [] as (() => void)[],
  getChannelId: () => 'chan',
  getLastChannel() {
    return {isOwner: this.isOwner};
  },
  getSettledSources() {
    return this.certain
      ? {saved: this.saved, waiting: this.waiting}
      : undefined;
  },
  addSourcesSettledListener(listener: () => void) {
    this.listeners.push(listener);
  },
  settle(saved: unknown, waiting?: unknown) {
    this.saved = saved;
    this.waiting = waiting;
    this.certain = true;
    this.listeners.forEach(listener => listener());
  },
});
let manager = newManager();
let currentManager: unknown = manager;
jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  __esModule: true,
  default: {getInstance: () => ({getProjectManager: () => currentManager})},
}));

const FILE = '/v3/assets/chan/old.png';
const naming = (url: string) => ({
  animations: {propsByKey: {k1: {sourceUrl: url}}},
});

function reclaimer() {
  let reclaim: (url?: string) => Promise<boolean> = () =>
    Promise.resolve(false);
  const Probe = () => {
    reclaim = useReclaimAsset();
    return null;
  };
  render(<Probe />);
  return (url?: string) => reclaim(url);
}

describe('useReclaimAsset', () => {
  beforeEach(() => {
    Object.keys(propsByKey).forEach(key => delete propsByKey[key]);
    httpDelete.mockClear();
    // A fresh manager per test, so files one test leaves waiting are not
    // checked in the next.
    manager = newManager();
    currentManager = manager;
  });

  it('deletes at once a file that no sources name', async () => {
    await expect(reclaimer()(`${FILE}?t=1`)).resolves.toBe(true);
    expect(httpDelete.mock.calls).toEqual([[FILE, true]]);
  });

  it('waits for a save that no longer names the file', async () => {
    manager.saved = naming(FILE);
    const reclaimed = reclaimer()(FILE);
    expect(httpDelete).not.toHaveBeenCalled();
    manager.settle(naming(FILE));
    expect(httpDelete).not.toHaveBeenCalled();
    manager.settle(naming('/v3/assets/chan/new.png'));
    expect(httpDelete.mock.calls).toEqual([[FILE, true]]);
    await expect(reclaimed).resolves.toBe(true);
  });

  it('keeps a file that the sources waiting to be saved name', () => {
    manager.waiting = naming(FILE);
    reclaimer()(FILE);
    manager.settle({}, naming(FILE));
    expect(httpDelete).not.toHaveBeenCalled();
  });

  it('deletes nothing while the manager cannot say what the server holds', async () => {
    manager.certain = false;
    const reclaimed = reclaimer()(FILE);
    expect(httpDelete).not.toHaveBeenCalled();
    manager.settle({});
    expect(httpDelete.mock.calls).toEqual([[FILE, true]]);
    await expect(reclaimed).resolves.toBe(true);
  });

  it('matches the whole file name, under any query', () => {
    manager.saved = naming(`${FILE}2`);
    const reclaim = reclaimer();
    reclaim(FILE);
    expect(httpDelete.mock.calls).toEqual([[FILE, true]]);
    httpDelete.mockClear();
    manager.saved = naming(`${FILE}?t=2`);
    reclaim(`${FILE}?t=1`);
    expect(httpDelete).not.toHaveBeenCalled();
  });

  it('keeps a file named in JSON that the sources hold as a string', () => {
    manager.saved = {source: JSON.stringify(naming(FILE))};
    reclaimer()(FILE);
    expect(httpDelete).not.toHaveBeenCalled();
  });

  it('leaves a file an image points at, under any query', async () => {
    propsByKey.k1 = {sourceUrl: `${FILE}?t=2`};
    await expect(reclaimer()(`${FILE}?t=1`)).resolves.toBe(false);
    expect(httpDelete).not.toHaveBeenCalled();
  });

  it('keeps a file an image points at again before the save, and stops waiting on it', async () => {
    manager.saved = naming(FILE);
    const reclaimed = reclaimer()(FILE);
    propsByKey.k1 = {sourceUrl: `${FILE}?t=3`};
    manager.settle({});
    await expect(reclaimed).resolves.toBe(false);
    delete propsByKey.k1;
    manager.settle({});
    expect(httpDelete).not.toHaveBeenCalled();
  });

  it('refuses files of another project, and files of a project the user does not own', async () => {
    const reclaim = reclaimer();
    await expect(reclaim('/v3/assets/other/old.png')).resolves.toBe(false);
    manager.isOwner = false;
    await expect(reclaim(FILE)).resolves.toBe(false);
    expect(httpDelete).not.toHaveBeenCalled();
  });

  it('deletes a file once when asked under two queries', async () => {
    manager.saved = naming(FILE);
    const reclaim = reclaimer();
    const first = reclaim(`${FILE}?t=1`);
    const second = reclaim(`${FILE}?t=2`);
    manager.settle({});
    expect(httpDelete.mock.calls).toEqual([[FILE, true]]);
    await expect(first).resolves.toBe(true);
    await expect(second).resolves.toBe(true);
  });

  it('resolves false when the delete fails', async () => {
    httpDelete.mockRejectedValueOnce(new Error('503'));
    await expect(reclaimer()(FILE)).resolves.toBe(false);
  });

  it('counts a picture with no file as gone', async () => {
    const reclaim = reclaimer();
    // An older project can hold a picture inside itself, as a data URI.
    // It leaves no file behind, and deleting it must still unflag the
    // project.
    await expect(reclaim('data:image/png;base64,AAAA')).resolves.toBe(true);
    await expect(reclaim(undefined)).resolves.toBe(true);
    expect(httpDelete).not.toHaveBeenCalled();
  });

  it('resolves false with no project manager', async () => {
    currentManager = undefined;
    await expect(reclaimer()(FILE)).resolves.toBe(false);
  });

  describe('with a real project manager', () => {
    const realFile = '/v3/assets/chan/old.png';
    const setup = async () => {
      const sourcesStore = {
        load: jest.fn(async () => naming(realFile)),
        save: jest.fn(async () => new Response('')),
        getCurrentVersionId: () => null,
      };
      const channel = {id: 'chan', isOwner: true, projectType: 'quest_builder'};
      const channelsStore = {
        load: jest.fn(async () => channel),
        save: jest.fn(async () => new Response(JSON.stringify(channel))),
        getAbuseScore: jest.fn(async () => 0),
        getSharingDisabled: jest.fn(async () => false),
        getShareFailure: jest.fn(async () => null),
        getIsTeacherOfProjectOwner: jest.fn(async () => false),
      };
      const projectManager = new ProjectManager({
        sourcesStore: sourcesStore as unknown as SourcesStore,
        channelsStore: channelsStore as unknown as ChannelsStore,
        channelId: 'chan',
        reduceChannelUpdates: false,
        isStandaloneProjectLevel: false,
        metricsReporter: {
          logError: jest.fn(),
          logWarning: jest.fn(),
          logInfo: jest.fn(),
          publishMetric: jest.fn(),
        } as unknown as LabMetricsReporter,
      });
      await projectManager.load();
      currentManager = projectManager;
      return {projectManager, sourcesStore};
    };
    const without = {source: 'code'} as unknown as ProjectSources;

    it('deletes the file after the save that stops naming it', async () => {
      const {projectManager} = await setup();
      const reclaimed = reclaimer()(realFile);
      expect(httpDelete).not.toHaveBeenCalled();
      await projectManager.save(without, true);
      expect(httpDelete.mock.calls).toEqual([[realFile, true]]);
      await expect(reclaimed).resolves.toBe(true);
    });

    it('keeps the file after a failed save, until a save succeeds', async () => {
      const {projectManager, sourcesStore} = await setup();
      reclaimer()(realFile);
      sourcesStore.save.mockRejectedValueOnce(new Error('500'));
      await projectManager.save(without, true);
      expect(httpDelete).not.toHaveBeenCalled();
      await projectManager.save(
        {source: 'code edited'} as unknown as ProjectSources,
        true
      );
      expect(httpDelete.mock.calls).toEqual([[realFile, true]]);
    });
  });
});
