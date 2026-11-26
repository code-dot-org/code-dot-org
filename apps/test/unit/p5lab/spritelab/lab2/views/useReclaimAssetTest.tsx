import {render} from '@testing-library/react';
import React from 'react';

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

const deleteFileOnceUnnamed = jest.fn((url: string, isInUse?: () => boolean) =>
  Promise.resolve(true)
);
let currentManager: {deleteFileOnceUnnamed: unknown} | undefined;
jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  __esModule: true,
  default: {getInstance: () => ({getProjectManager: () => currentManager})},
}));

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
    deleteFileOnceUnnamed.mockClear();
    currentManager = {deleteFileOnceUnnamed};
  });

  it('asks the project manager to delete a file no image points at', async () => {
    propsByKey.k1 = {sourceUrl: '/v3/assets/chan/kept.png'};
    await expect(reclaimer()('/v3/assets/chan/old.png')).resolves.toBe(true);
    expect(deleteFileOnceUnnamed).toHaveBeenCalledWith(
      '/v3/assets/chan/old.png',
      expect.any(Function)
    );
  });

  it('leaves a file an image points at, under any query', async () => {
    propsByKey.k1 = {sourceUrl: '/v3/assets/chan/used.png?t=2'};
    await expect(reclaimer()('/v3/assets/chan/used.png?t=1')).resolves.toBe(
      false
    );
    expect(deleteFileOnceUnnamed).not.toHaveBeenCalled();
  });

  it('gives the project manager a check for an image pointing at the file again', async () => {
    await reclaimer()('/v3/assets/chan/old.png');
    const isInUse = deleteFileOnceUnnamed.mock.calls[0][1]!;
    expect(isInUse()).toBe(false);
    propsByKey.k1 = {sourceUrl: '/v3/assets/chan/old.png?t=3'};
    expect(isInUse()).toBe(true);
  });

  it('counts a picture with no file as gone', async () => {
    const reclaim = reclaimer();
    // An older project can hold a picture inside itself, as a data URI.
    // It leaves no file behind, and deleting it must still unflag the
    // project.
    await expect(reclaim('data:image/png;base64,AAAA')).resolves.toBe(true);
    await expect(reclaim(undefined)).resolves.toBe(true);
    expect(deleteFileOnceUnnamed).not.toHaveBeenCalled();
  });

  it('resolves false with no project manager', async () => {
    currentManager = undefined;
    await expect(reclaimer()('/v3/assets/chan/old.png')).resolves.toBe(false);
  });
});
