import {act, render} from '@testing-library/react';
import React from 'react';

import useImageWriter, {
  ImageWriter,
} from '@cdo/apps/p5lab/spritelab/lab2/views/images/useImageWriter';

// The store is built inside the mock: modules read it as they load.
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
const dispatch = jest.fn();
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (select: (state: unknown) => unknown) =>
    select({lab: {channel: {id: 'chan'}}}),
}));
const createNamedAnimation = jest.fn((...args: unknown[]) => 'new-key');
const repointAnimation = jest.fn(
  (...args: unknown[]) => '/v3/assets/chan/old.png'
);
jest.mock('@cdo/apps/p5lab/spritelab/lab2/views/imageSave', () => ({
  ...jest.requireActual('@cdo/apps/p5lab/spritelab/lab2/views/imageSave'),
  createNamedAnimation: (...args: unknown[]) => createNamedAnimation(...args),
  repointAnimation: (...args: unknown[]) => repointAnimation(...args),
}));
const httpDelete = jest.fn((...args: unknown[]) => Promise.resolve());
jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  default: {delete: (...args: unknown[]) => httpDelete(...args)},
}));
jest.mock('@cdo/apps/imageUtils', () => ({
  dataURIToSourceSize: () => Promise.resolve({x: 64, y: 64}),
}));

const PNG = new Uint8Array([137, 80, 78, 71]);
const result = (filename: string) => ({
  filename,
  uint8Array: PNG,
  mediaType: 'image/png',
  generation: {
    prompt: 'A cat',
    imageType: 'sprite' as const,
    style: 'pixel' as const,
    seed: 1,
  },
});

function renderWriter() {
  const uploadImage = jest.fn(
    async (name: string) => `/v3/assets/chan/${name}`
  );
  const latest: {current: ImageWriter | null} = {current: null};
  const onDeleteImage = jest.fn();
  const Harness = () => {
    latest.current = useImageWriter({
      uploadImage,
      imageRole: 'hero',
      onDeleteImage,
    });
    return null;
  };
  render(<Harness />);
  const writer = () => latest.current as ImageWriter;
  return {writer, uploadImage, onDeleteImage};
}

describe('useImageWriter', () => {
  beforeEach(() => {
    Object.keys(propsByKey).forEach(key => delete propsByKey[key]);
    createNamedAnimation.mockClear();
    repointAnimation.mockClear();
    httpDelete.mockClear();
    dispatch.mockClear();
  });

  it('creates a new image from a picture, with the level role', async () => {
    const {writer} = renderWriter();
    let key = '';
    await act(async () => {
      key = await writer().acceptGenerated(
        {key: null, imageType: 'sprite', subject: 'character'},
        result('cat.png')
      );
    });
    expect(key).toBe('new-key');
    expect(createNamedAnimation).toHaveBeenCalledTimes(1);
    const [, name, patch] = createNamedAnimation.mock.calls[0] as unknown as [
      unknown,
      string,
      Record<string, unknown>
    ];
    expect(name).toBe('Sprite 1');
    expect(patch).toMatchObject({
      sourceUrl: '/v3/assets/chan/cat.png',
      frameSize: {x: 64, y: 64},
      role: 'hero',
      categories: [],
    });
  });

  it('repoints an existing image, uploading each picture once', async () => {
    propsByKey.k1 = {name: 'Sprite 1', sourceUrl: '/v3/assets/chan/old.png'};
    const {writer, uploadImage} = renderWriter();
    const target = {key: 'k1', imageType: 'sprite' as const};
    await act(async () => {
      await writer().acceptGenerated(target, result('one.png'));
      await writer().acceptGenerated(target, result('two.png'));
      await writer().acceptGenerated(target, result('one.png'));
    });
    expect(uploadImage).toHaveBeenCalledTimes(2);
    expect(repointAnimation).toHaveBeenCalledTimes(3);
    expect(createNamedAnimation).not.toHaveBeenCalled();
  });

  it('reclaims the session uploads nothing points at when it ends', async () => {
    propsByKey.k1 = {name: 'Sprite 1', sourceUrl: '/v3/assets/chan/old.png'};
    const {writer} = renderWriter();
    const target = {key: 'k1', imageType: 'sprite' as const};
    await act(async () => {
      await writer().acceptGenerated(target, result('one.png'));
      await writer().acceptGenerated(target, result('two.png'));
    });
    // The image now points at two.png; one.png and old.png are leftovers.
    propsByKey.k1.sourceUrl = '/v3/assets/chan/two.png';
    act(() => writer().endSession());
    const deleted = httpDelete.mock.calls.map(call => call[0]).sort();
    expect(deleted).toEqual([
      '/v3/assets/chan/old.png',
      '/v3/assets/chan/one.png',
    ]);
  });

  it('deletes an image and drops its references', () => {
    propsByKey.k1 = {name: 'Sprite 1', sourceUrl: '/v3/assets/chan/old.png'};
    const {writer, onDeleteImage} = renderWriter();
    act(() => {
      writer().deleteImage('k1');
    });
    expect(dispatch).toHaveBeenCalled();
    expect(onDeleteImage).toHaveBeenCalledWith('Sprite 1');
  });
});
