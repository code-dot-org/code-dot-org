import CodebridgeRegistry from '@cdo/apps/codebridge/CodebridgeRegistry';
import {TheaterSignalType} from '@cdo/apps/miniApps/theater/constants';
import {handleTheaterMedia} from '@cdo/apps/pythonlab/pythonHelpers/theaterMedia';

describe('handleTheaterMedia', () => {
  let handleSignal: jest.Mock;
  let createdUrls: string[];
  let revokedUrls: string[];

  beforeEach(() => {
    handleSignal = jest.fn();
    createdUrls = [];
    revokedUrls = [];

    let counter = 0;
    window.URL.createObjectURL = jest.fn(() => {
      const url = `blob:mock/${counter++}`;
      createdUrls.push(url);
      return url;
    });
    window.URL.revokeObjectURL = jest.fn((url: string) => {
      revokedUrls.push(url);
    });

    jest.spyOn(CodebridgeRegistry, 'getInstance').mockReturnValue({
      getTheater: () => ({handleSignal}),
    } as unknown as CodebridgeRegistry);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('emits a visual signal and an audio signal when audio is present', () => {
    handleTheaterMedia(new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6]));

    expect(handleSignal).toHaveBeenCalledTimes(2);
    expect(handleSignal).toHaveBeenNthCalledWith(1, {
      value: TheaterSignalType.VISUAL_URL,
      detail: {url: createdUrls[0]},
    });
    expect(handleSignal).toHaveBeenNthCalledWith(2, {
      value: TheaterSignalType.AUDIO_URL,
      detail: {url: createdUrls[1]},
    });
  });

  it('emits a visual signal and NO_AUDIO when audio is null', () => {
    handleTheaterMedia(new Uint8Array([1, 2, 3]), null);

    expect(handleSignal).toHaveBeenCalledTimes(2);
    expect(handleSignal).toHaveBeenNthCalledWith(1, {
      value: TheaterSignalType.VISUAL_URL,
      detail: {url: createdUrls[0]},
    });
    expect(handleSignal).toHaveBeenNthCalledWith(2, {
      value: TheaterSignalType.NO_AUDIO,
      detail: {},
    });
  });

  it('revokes the previous run object urls on the next run', () => {
    handleTheaterMedia(new Uint8Array([1]), new Uint8Array([2]));
    const firstRunUrls = [...createdUrls];

    handleTheaterMedia(new Uint8Array([3]), new Uint8Array([4]));

    expect(revokedUrls).toEqual(expect.arrayContaining(firstRunUrls));
  });

  it('does nothing when no theater is registered', () => {
    jest.spyOn(CodebridgeRegistry, 'getInstance').mockReturnValue({
      getTheater: () => null,
    } as unknown as CodebridgeRegistry);

    expect(() => handleTheaterMedia(new Uint8Array([1]), null)).not.toThrow();
    expect(handleSignal).not.toHaveBeenCalled();
  });
});
