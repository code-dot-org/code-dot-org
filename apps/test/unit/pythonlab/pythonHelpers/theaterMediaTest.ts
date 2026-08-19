import CodebridgeRegistry from '@cdo/apps/codebridge/CodebridgeRegistry';
import {TheaterSignalType} from '@cdo/apps/miniApps/theater/constants';
import {handleTheaterMedia} from '@cdo/apps/pythonlab/pythonHelpers/theaterMedia';

describe('handleTheaterMedia', () => {
  let handleSignal: jest.Mock;
  let createdUrls: string[];

  beforeEach(() => {
    handleSignal = jest.fn();
    createdUrls = [];

    let counter = 0;
    window.URL.createObjectURL = jest.fn(() => {
      const url = `blob:mock/${counter++}`;
      createdUrls.push(url);
      return url;
    });

    jest.spyOn(CodebridgeRegistry, 'getInstance').mockReturnValue({
      getTheater: () => ({handleSignal}),
    } as unknown as CodebridgeRegistry);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sends the gif as an object url followed by NO_AUDIO', () => {
    handleTheaterMedia(new Uint8Array([1, 2, 3]));

    expect(handleSignal).toHaveBeenCalledTimes(2);
    expect(handleSignal).toHaveBeenNthCalledWith(1, {
      value: TheaterSignalType.VISUAL_URL,
      detail: {url: createdUrls[0], durationMs: undefined},
    });
    expect(handleSignal).toHaveBeenNthCalledWith(2, {
      value: TheaterSignalType.NO_AUDIO,
      detail: {},
    });
  });

  it('sends the gif and the wav as object urls when there is audio', () => {
    handleTheaterMedia(new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6]));

    expect(handleSignal).toHaveBeenCalledTimes(2);
    expect(handleSignal).toHaveBeenNthCalledWith(1, {
      value: TheaterSignalType.VISUAL_URL,
      detail: {url: createdUrls[0], durationMs: undefined},
    });
    expect(handleSignal).toHaveBeenNthCalledWith(2, {
      value: TheaterSignalType.AUDIO_URL,
      detail: {url: createdUrls[1]},
    });
  });

  it('creates the blobs with gif and wav content types', () => {
    handleTheaterMedia(new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6]));

    const blobs = (window.URL.createObjectURL as jest.Mock).mock.calls.map(
      call => call[0] as Blob
    );
    expect(blobs.map(blob => blob.type)).toEqual(['image/gif', 'audio/wav']);
  });

  it('sends the length it reads off the gif with the visual', () => {
    // Two frames written by Pillow, the first held a second.
    const gif = Uint8Array.from(
      Buffer.from(
        'R0lGODlhBAAEAIEAAP8AAAAAAAAAAAAAACH5BARkAAAALAAAAAAEAAQAAAgJAAEIHEiwIICA' +
          'ACH5BAUAAAEALAAAAAAEAAQAgQD/AAAAAAAAAAAAAAgJAAEIHEiwIICAADs=',
        'base64'
      )
    );

    handleTheaterMedia(gif);

    expect(handleSignal).toHaveBeenNthCalledWith(1, {
      value: TheaterSignalType.VISUAL_URL,
      detail: {url: createdUrls[0], durationMs: 1000},
    });
  });

  it('does nothing when no theater is registered', () => {
    jest.spyOn(CodebridgeRegistry, 'getInstance').mockReturnValue({
      getTheater: () => null,
    } as unknown as CodebridgeRegistry);

    expect(() => handleTheaterMedia(new Uint8Array([1]))).not.toThrow();
    expect(handleSignal).not.toHaveBeenCalled();
    expect(window.URL.createObjectURL).not.toHaveBeenCalled();
  });
});
