import {act, render} from '@testing-library/react';
import React from 'react';

import {Scene, Sources} from '@cdo/apps/p5lab/spritelab/lab2/types';
import useSceneThumbnails from '@cdo/apps/p5lab/spritelab/lab2/views/useSceneThumbnails';
import HttpClient from '@cdo/apps/util/HttpClient';

const reclaim = jest.fn((url?: string) => Promise.resolve(true));
jest.mock('@cdo/apps/p5lab/spritelab/lab2/views/useReclaimAsset', () => ({
  __esModule: true,
  default: () => (url?: string) => reclaim(url),
}));
jest.mock('@cdo/apps/p5lab/spritelab/lab2/sceneThumbnails', () => ({
  ...jest.requireActual('@cdo/apps/p5lab/spritelab/lab2/sceneThumbnails'),
  THUMBNAIL_QUIET_MS: 0,
  sceneFingerprint: () => 'new',
  copyFrame: (canvas: HTMLCanvasElement) => canvas,
  canvasToPngBytes: () => Promise.resolve(new Uint8Array([1])),
}));
jest.mock('@cdo/apps/redux', () => ({
  getStore: () => ({getState: () => ({animationList: {}})}),
}));

describe('useSceneThumbnails', () => {
  it("leaves a scene's old thumbnail for deletion once a save drops it", async () => {
    const remove = jest.spyOn(HttpClient, 'delete');
    const scenes = [
      {
        id: 'one',
        name: 'one',
        source: {},
        thumbnail: {url: '/v3/assets/chan/old.png', fingerprint: 'old'},
      },
    ] as unknown as Scene[];
    let sources = {scenes} as unknown as Sources;
    const updateSources = jest.fn((update: (prev: Sources) => Sources) => {
      sources = update(sources);
    });
    const engine = {
      captureFirstFrame: (done: (stage: HTMLCanvasElement) => void) =>
        done(document.createElement('canvas')),
    };
    let request: (sceneId: string) => void = () => undefined;
    const Probe = () => {
      request = useSceneThumbnails({
        engineRef: {current: engine} as never,
        scenes,
        channelId: 'chan',
        uploadImage: async (name: string) => `/v3/assets/chan/${name}`,
        updateSources: updateSources as never,
        getScenes: s => (s as unknown as {scenes: Scene[]}).scenes,
        enabled: true,
      });
      return null;
    };
    render(<Probe />);
    await act(async () => {
      request('one');
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    const stored = (sources as unknown as {scenes: Scene[]}).scenes[0];
    expect(stored.thumbnail?.url).toMatch(/^\/v3\/assets\/chan\/scene-thumb-/);
    expect(reclaim.mock.calls).toEqual([['/v3/assets/chan/old.png']]);
    expect(remove).not.toHaveBeenCalled();
    remove.mockRestore();
  });
});
