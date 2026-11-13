import {renderHook} from '@testing-library/react-hooks';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import SpriteLab2Engine from '@cdo/apps/p5lab/spritelab/lab2/SpriteLab2Engine';
import {Scene} from '@cdo/apps/p5lab/spritelab/lab2/types';
import useProjectPicture, {
  isOneColor,
  PROJECT_PICTURE_PX,
} from '@cdo/apps/p5lab/spritelab/lab2/views/useProjectPicture';

const pngBlob = new Blob(['picture'], {type: 'image/png'});
const mockCopyFrame = jest.fn();

jest.mock('@cdo/apps/p5lab/spritelab/lab2/SpriteLab2Engine', () => ({}));
jest.mock('@cdo/apps/p5lab/spritelab/lab2/sceneThumbnails', () => ({
  ...jest.requireActual('@cdo/apps/p5lab/spritelab/lab2/sceneThumbnails'),
  copyFrame: (...args: unknown[]) => mockCopyFrame(...args),
}));
jest.mock('@cdo/apps/redux', () => ({
  getStore: () => ({
    getState: () => ({animationList: {orderedKeys: [], propsByKey: {}}}),
  }),
}));

type FrameWaiter = (stage: HTMLCanvasElement | null) => void;

const source = (blockId: string) => ({
  blocks: {
    languageVersion: 0,
    blocks: [{type: 'spritelab2_whenRun', id: blockId}],
  },
});

const scene = (id: string, blockId = 'a'): Scene => ({
  id,
  name: id,
  source: source(blockId),
});

describe('useProjectPicture', () => {
  const stage = {} as HTMLCanvasElement;
  let waiters: FrameWaiter[];
  let engineRef: React.RefObject<SpriteLab2Engine | null>;
  let setThumbnail: jest.Mock;
  let shouldCapture: boolean;
  // The pixels of the copied frame, four bytes for each.
  let framePixels: number[];

  // Draws the first frame of a run: everyone waiting on it gets the stage.
  const drawFirstFrame = () => {
    const waiting = waiters;
    waiters = [];
    waiting.forEach(onFrame => onFrame(stage));
  };

  const renderPictureHook = (
    scenes: Scene[] = [scene('first'), scene('second')],
    enabled = true
  ) =>
    renderHook(
      (props: {scenes: Scene[]}) =>
        useProjectPicture({
          engineRef,
          scenes: props.scenes,
          startSceneId: 'first',
          enabled,
        }),
      {initialProps: {scenes}}
    );

  beforeEach(() => {
    waiters = [];
    engineRef = {
      current: {
        captureFirstFrame: (onFrame: FrameWaiter) => waiters.push(onFrame),
      } as unknown as SpriteLab2Engine,
    };
    setThumbnail = jest.fn();
    shouldCapture = true;
    mockCopyFrame.mockReset();
    framePixels = [255, 255, 255, 255, 0, 0, 0, 255];
    mockCopyFrame.mockReturnValue({
      getContext: () => ({getImageData: () => ({data: framePixels})}),
      toBlob: (onBlob: (blob: Blob) => void) => onBlob(pngBlob),
    });
    jest
      .spyOn(Lab2Registry.getInstance(), 'getProjectManager')
      .mockReturnValue({
        getShouldCaptureThumbnail: () => shouldCapture,
        setThumbnail,
      } as unknown as ReturnType<Lab2Registry['getProjectManager']>);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("hands the project manager the starting scene's first frame", () => {
    const {result} = renderPictureHook();
    result.current('first');
    drawFirstFrame();

    expect(mockCopyFrame).toHaveBeenCalledWith(stage, PROJECT_PICTURE_PX);
    expect(setThumbnail).toHaveBeenCalledWith(pngBlob);
  });

  it('takes no picture of a scene other than the starting scene', () => {
    const {result} = renderPictureHook();
    result.current('second');

    expect(waiters).toHaveLength(0);
    expect(setThumbnail).not.toHaveBeenCalled();
  });

  it('takes no second picture while the starting scene is unchanged', () => {
    const {result} = renderPictureHook();
    result.current('first');
    drawFirstFrame();
    result.current('first');
    drawFirstFrame();

    expect(setThumbnail).toHaveBeenCalledTimes(1);
  });

  it('takes a new picture once the starting scene has changed', () => {
    const {result, rerender} = renderPictureHook();
    result.current('first');
    drawFirstFrame();
    rerender({scenes: [scene('first', 'changed'), scene('second')]});
    result.current('first');
    drawFirstFrame();

    expect(setThumbnail).toHaveBeenCalledTimes(2);
  });

  it("does not use another scene's first frame for a run that never started", () => {
    const {result} = renderPictureHook();
    result.current('first');
    result.current('second');
    drawFirstFrame();

    expect(setThumbnail).not.toHaveBeenCalled();
  });

  it('keeps no picture of a frame that is one flat color', () => {
    framePixels = [255, 255, 255, 255, 255, 255, 255, 255];
    const {result} = renderPictureHook();
    result.current('first');
    drawFirstFrame();

    expect(setThumbnail).not.toHaveBeenCalled();
  });

  it('returns the same function when the scenes change', () => {
    const {result, rerender} = renderPictureHook();
    const first = result.current;
    rerender({scenes: [scene('first', 'changed')]});

    expect(result.current).toBe(first);
  });

  it('takes no picture when it is not enabled', () => {
    const {result} = renderPictureHook(undefined, false);
    result.current('first');

    expect(waiters).toHaveLength(0);
  });

  it('takes no picture when the project manager says not to', () => {
    shouldCapture = false;
    const {result} = renderPictureHook();
    result.current('first');

    expect(waiters).toHaveLength(0);
  });
});

describe('isOneColor', () => {
  it('is true when every pixel matches the first', () => {
    expect(isOneColor([10, 20, 30, 255, 10, 20, 30, 255])).toBe(true);
  });

  it('is false when any pixel differs', () => {
    expect(isOneColor([10, 20, 30, 255, 10, 20, 31, 255])).toBe(false);
  });
});
