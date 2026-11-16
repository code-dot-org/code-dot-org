import {
  createNamedAnimation,
  framesPatch,
  repointAnimation,
  SINGLE_FRAME_PROPS,
  uploadOrEmbed,
} from '@cdo/apps/p5lab/spritelab/lab2/views/imageSave';

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
jest.mock('@cdo/apps/p5lab/redux/animationList', () => ({
  SET_INITIAL_ANIMATION_LIST: 'SET_LIST',
  addAnimation: (key: string, props: unknown) => ({type: 'ADD', key, props}),
  setAnimationName: (key: string, name: string) => ({type: 'NAME', key, name}),
  isNameUnique: (name: string, byKey: Record<string, {name?: string}>) =>
    !Object.values(byKey).some(p => p.name === name),
}));
jest.mock('@cdo/apps/utils', () => ({createUuid: () => 'uuid-1'}));

describe('imageSave', () => {
  beforeEach(() => {
    Object.keys(propsByKey).forEach(key => delete propsByKey[key]);
  });

  it("lays out a strip from a result's frames, or one frame with no strip", () => {
    const poses = {'stand-right': {start: 0, count: 1, frameDelay: 6}};
    expect(
      framesPatch({
        frameSize: {x: 32, y: 32},
        frameCount: 5,
        frameDelay: 6,
        looping: true,
        poses,
      })
    ).toEqual({
      frameSize: {x: 32, y: 32},
      sourceSize: {x: 160, y: 32},
      frameCount: 5,
      frameDelay: 6,
      looping: true,
      poses,
    });
    expect(framesPatch(undefined)).toEqual({
      ...SINGLE_FRAME_PROPS,
      poses: undefined,
    });
  });

  it('creates an animation under the given name and keeps that name', () => {
    const dispatch = jest.fn();
    const key = createNamedAnimation(dispatch, 'Sprite 1', {
      sourceUrl: 'a.png',
    });
    expect(key).toBe('uuid-1');
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: 'ADD',
      key: 'uuid-1',
      props: {name: 'Sprite 1', ...SINGLE_FRAME_PROPS, sourceUrl: 'a.png'},
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: 'NAME',
      key: 'uuid-1',
      name: 'Sprite 1',
    });
  });

  it('repoints an animation and returns the file it replaced', () => {
    propsByKey.k1 = {name: 'Sprite 1', sourceUrl: 'old.png', trimmed: true};
    const dispatch = jest.fn();
    expect(
      repointAnimation(dispatch, 'k1', {sourceUrl: 'new.png', trimmed: false})
    ).toBe('old.png');
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_LIST',
      animationList: {
        orderedKeys: ['k1'],
        propsByKey: {
          k1: {
            name: 'Sprite 1',
            sourceUrl: 'new.png',
            trimmed: false,
            loadedFromSource: true,
            saved: false,
          },
        },
      },
    });
  });

  it('embeds the picture when there is no uploader or the upload fails', async () => {
    const bytes = new Uint8Array([1]);
    expect(
      await uploadOrEmbed(undefined, 'a.png', bytes, 'image/png', 'data:a')
    ).toBe('data:a');
    expect(
      await uploadOrEmbed(
        async () => 'https://x/a.png',
        'a.png',
        bytes,
        'image/png',
        'data:a'
      )
    ).toBe('https://x/a.png');
    expect(
      await uploadOrEmbed(
        async () => {
          throw new Error('no');
        },
        'a.png',
        bytes,
        'image/png',
        'data:a'
      )
    ).toBe('data:a');
  });
});
