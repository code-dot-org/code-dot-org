import {render} from '@testing-library/react';
import React from 'react';

import useReclaimAsset from '@cdo/apps/p5lab/spritelab/lab2/views/useReclaimAsset';

jest.mock('@cdo/apps/redux', () => {
  const propsByKey: Record<string, Record<string, unknown>> = {};
  const store = {
    getState: () => ({
      animationList: {orderedKeys: Object.keys(propsByKey), propsByKey},
    }),
    dispatch: () => undefined,
  };
  return {
    getStore: () => store,
    registerReducers: () => undefined,
    mockPropsByKey: propsByKey,
  };
});
const propsByKey = (
  jest.requireMock('@cdo/apps/redux') as {
    mockPropsByKey: Record<string, Record<string, unknown>>;
  }
).mockPropsByKey;
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  useAppSelector: (select: (state: unknown) => unknown) =>
    select({lab: {channel: {id: 'chan'}}}),
}));
const httpDelete = jest.fn((...args: unknown[]) => Promise.resolve());
jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  default: {delete: (...args: unknown[]) => httpDelete(...args)},
}));

const manager = {
  saved: {} as unknown,
  listeners: [] as (() => void)[],
  getLastSource() {
    return this.saved;
  },
  addSaveSuccessListener(listener: () => void) {
    this.listeners.push(listener);
  },
  addSaveNoopListener(listener: () => void) {
    this.listeners.push(listener);
  },
  finishSave(saved: unknown) {
    this.saved = saved;
    this.listeners.forEach(listener => listener());
  },
};
let currentManager: typeof manager | undefined = manager;
jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  __esModule: true,
  default: {getInstance: () => ({getProjectManager: () => currentManager})},
}));

const savedNaming = (url: string) => ({
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
    manager.saved = {};
    currentManager = manager;
  });

  it("deletes one of this project's uploads that no image points at", () => {
    propsByKey.k1 = {sourceUrl: '/v3/assets/chan/kept.png'};
    reclaimer()('/v3/assets/chan/old.png');
    // No delete until a save finishes: a save in progress may still name the file.
    expect(httpDelete).not.toHaveBeenCalled();
    manager.finishSave({});
    expect(httpDelete).toHaveBeenCalledWith('/v3/assets/chan/old.png', true);
  });

  it('leaves a file an image still points at, and files of other projects', () => {
    propsByKey.k1 = {sourceUrl: '/v3/assets/chan/used.png'};
    const reclaim = reclaimer();
    reclaim('/v3/assets/chan/used.png');
    reclaim('/v3/assets/other/old.png');
    reclaim('data:image/png;base64,AAAA');
    reclaim(undefined);
    expect(httpDelete).not.toHaveBeenCalled();
  });

  it('reports whether the file is gone', async () => {
    propsByKey.k1 = {sourceUrl: '/v3/assets/chan/used.png'};
    const reclaim = reclaimer();
    const old = reclaim('/v3/assets/chan/old.png');
    manager.finishSave({});
    await expect(old).resolves.toBe(true);
    await expect(reclaim('/v3/assets/chan/used.png')).resolves.toBe(false);
    httpDelete.mockRejectedValueOnce(new Error('503'));
    const other = reclaim('/v3/assets/chan/other.png');
    manager.finishSave({});
    await expect(other).resolves.toBe(false);
    // An older project can hold a picture inside itself, as a data URI.
    // It leaves no file behind, and deleting it must still unflag the
    // project.
    await expect(reclaim('data:image/png;base64,AAAA')).resolves.toBe(true);
  });

  it('waits for a save that no longer names the file', async () => {
    manager.saved = savedNaming('/v3/assets/chan/old.png');
    const reclaimed = reclaimer()('/v3/assets/chan/old.png');
    expect(httpDelete).not.toHaveBeenCalled();
    manager.finishSave(savedNaming('/v3/assets/chan/old.png'));
    expect(httpDelete).not.toHaveBeenCalled();
    manager.finishSave(savedNaming('/v3/assets/chan/new.png'));
    expect(httpDelete).toHaveBeenCalledWith('/v3/assets/chan/old.png', true);
    await expect(reclaimed).resolves.toBe(true);
  });

  it('matches the whole file name', async () => {
    manager.saved = savedNaming('/v3/assets/chan/old.png2');
    reclaimer()('/v3/assets/chan/old.png');
    manager.finishSave(manager.saved);
    expect(httpDelete).toHaveBeenCalledWith('/v3/assets/chan/old.png', true);
  });

  it('treats links that differ only in their query as one file', async () => {
    manager.saved = savedNaming('/v3/assets/chan/drawn.png?t=2');
    const reclaimed = reclaimer()('/v3/assets/chan/drawn.png?t=1');
    manager.finishSave(manager.saved);
    expect(httpDelete).not.toHaveBeenCalled();
    propsByKey.k1 = {sourceUrl: '/v3/assets/chan/drawn.png?t=3'};
    manager.finishSave({});
    expect(httpDelete).not.toHaveBeenCalled();
    await expect(reclaimed).resolves.toBe(false);
  });

  it('keeps a file an image points at again before the save', async () => {
    manager.saved = savedNaming('/v3/assets/chan/old.png');
    const reclaimed = reclaimer()('/v3/assets/chan/old.png');
    propsByKey.k1 = {sourceUrl: '/v3/assets/chan/old.png'};
    manager.finishSave(savedNaming('/v3/assets/chan/old.png'));
    manager.finishSave({});
    expect(httpDelete).not.toHaveBeenCalled();
    await expect(reclaimed).resolves.toBe(false);
  });

  it('keeps the file when nothing is known to be saved', async () => {
    manager.saved = undefined;
    reclaimer()('/v3/assets/chan/old.png');
    expect(httpDelete).not.toHaveBeenCalled();
    currentManager = undefined;
    await expect(reclaimer()('/v3/assets/chan/other.png')).resolves.toBe(false);
    expect(httpDelete).not.toHaveBeenCalled();
  });
});
