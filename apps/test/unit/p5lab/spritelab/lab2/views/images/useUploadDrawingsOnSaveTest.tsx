import {render} from '@testing-library/react';
import React from 'react';

import type {SourcesPreparer} from '@cdo/apps/lab2/projects/ProjectManager';
import {ProjectSources} from '@cdo/apps/lab2/types';
import {
  holdPixels,
  resetHeldPixels,
} from '@cdo/apps/p5lab/spritelab/lab2/views/images/pendingUploads';
import useUploadDrawingsOnSave from '@cdo/apps/p5lab/spritelab/lab2/views/images/useUploadDrawingsOnSave';

jest.mock('@cdo/apps/redux', () => {
  const state = {
    lab: {channel: {id: 'chan'}},
    animationList: {
      orderedKeys: ['k1'],
      propsByKey: {} as Record<string, Record<string, unknown>>,
    },
  };
  return {getStore: () => ({getState: () => state}), mockState: state};
});
const state = (
  jest.requireMock('@cdo/apps/redux') as {
    mockState: {
      animationList: {propsByKey: Record<string, Record<string, unknown>>};
    };
  }
).mockState;
let preparer: SourcesPreparer | undefined;
jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({
      getProjectManager: () => ({
        getChannelId: () => 'chan',
        setSourcesPreparer: (p: SourcesPreparer) => (preparer = p),
      }),
    }),
  },
}));
const repointAnimation = jest.fn();
jest.mock('@cdo/apps/p5lab/spritelab/lab2/views/imageSave', () => ({
  repointAnimation: (...args: unknown[]) => repointAnimation(...args),
}));
const reclaim = jest.fn();
jest.mock('@cdo/apps/p5lab/spritelab/lab2/views/useReclaimAsset', () => ({
  __esModule: true,
  ...jest.requireActual('@cdo/apps/p5lab/spritelab/lab2/views/useReclaimAsset'),
  default: () => (url?: string) => reclaim(url),
}));
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: () => undefined,
}));
const sendEvent = jest.fn();
jest.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  __esModule: true,
  default: {sendEvent: (...args: unknown[]) => sendEvent(...args)},
}));

const marked = (sourceUrl: string) =>
  ({
    animations: {
      orderedKeys: ['k1'],
      propsByKey: {
        k1: {
          name: 'Sprite 1',
          sourceUrl,
          edited: true,
          frameSize: {x: 8, y: 8},
          frameCount: 1,
          looping: true,
          frameDelay: 2,
          pendingUpload: true,
        },
      },
    },
  } as unknown as ProjectSources);

function setup(upload: (name: string) => Promise<string>) {
  const Probe = () => {
    useUploadDrawingsOnSave('chan', upload);
    return null;
  };
  render(<Probe />);
  return preparer!;
}

describe('useUploadDrawingsOnSave', () => {
  beforeEach(() => {
    resetHeldPixels();
    repointAnimation.mockClear();
    reclaim.mockClear();
    sendEvent.mockClear();
    state.animationList.propsByKey.k1 = {
      sourceUrl: '/v3/assets/chan/generated-1.png',
    };
  });

  it('points the image at its uploaded file and releases the file it replaced', async () => {
    const prepare = setup(async name => `/v3/assets/chan/${name}`);
    holdPixels('chan', 'k1', 'data:image/png;base64,AA');
    await prepare(marked('/v3/assets/chan/generated-1.png'));
    expect(repointAnimation).toHaveBeenCalledTimes(1);
    expect(repointAnimation.mock.calls[0][2]).toMatchObject({
      sourceUrl: expect.stringMatching(/^\/v3\/assets\/chan\/sprite_1_/),
      pendingUpload: undefined,
    });
    expect(reclaim).toHaveBeenCalledWith('/v3/assets/chan/generated-1.png');
  });

  it('leaves an image alone that another picture replaced while the upload ran', async () => {
    const prepare = setup(async name => {
      state.animationList.propsByKey.k1 = {
        sourceUrl: '/v3/assets/chan/generated-2.png',
      };
      return `/v3/assets/chan/${name}`;
    });
    holdPixels('chan', 'k1', 'data:image/png;base64,AA');
    await prepare(marked('/v3/assets/chan/generated-1.png'));
    expect(repointAnimation).not.toHaveBeenCalled();
    expect(reclaim).not.toHaveBeenCalled();
  });

  it('leaves alone a new image deleted while its first upload ran', async () => {
    state.animationList.propsByKey.k1 = {};
    const prepare = setup(async name => {
      delete state.animationList.propsByKey.k1;
      return `/v3/assets/chan/${name}`;
    });
    holdPixels('chan', 'k1', 'data:image/png;base64,AA');
    const sources = marked('');
    delete (
      sources as unknown as {
        animations: {propsByKey: {k1: {sourceUrl?: string}}};
      }
    ).animations.propsByKey.k1.sourceUrl;
    await prepare(sources);
    expect(repointAnimation).not.toHaveBeenCalled();
  });

  it("reports an image's failed upload again after an upload of it has succeeded", async () => {
    let fail = true;
    const prepare = setup(name =>
      fail
        ? Promise.reject(new Error('500'))
        : Promise.resolve(`/v3/assets/chan/${name}`)
    );
    const failOnce = async () => {
      holdPixels('chan', 'k1', 'data:image/png;base64,AA');
      await prepare(marked('/v3/assets/chan/generated-1.png'));
    };
    await failOnce();
    fail = false;
    await prepare(marked('/v3/assets/chan/generated-1.png'));
    fail = true;
    await failOnce();
    expect(sendEvent).toHaveBeenCalledTimes(2);
  });

  it("reports an image's failed upload once, though every save tries again", async () => {
    const prepare = setup(() => Promise.reject(new Error('500')));
    holdPixels('chan', 'k1', 'data:image/png;base64,AA');
    await prepare(marked('/v3/assets/chan/generated-1.png'));
    await prepare(marked('/v3/assets/chan/generated-1.png'));
    expect(sendEvent).toHaveBeenCalledTimes(1);
    expect(sendEvent.mock.calls[0][1]).toEqual({
      picture: 'drawn',
      reason: 'uploadFailed',
      detail: '500',
      hadFile: true,
    });
  });
});
