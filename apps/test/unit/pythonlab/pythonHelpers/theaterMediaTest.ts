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
      detail: {url: createdUrls[0]},
    });
    expect(handleSignal).toHaveBeenNthCalledWith(2, {
      value: TheaterSignalType.NO_AUDIO,
      detail: {},
    });
  });

  it('creates the blob with a gif content type', () => {
    handleTheaterMedia(new Uint8Array([1, 2, 3]));

    const blob = (window.URL.createObjectURL as jest.Mock).mock
      .calls[0][0] as Blob;
    expect(blob.type).toBe('image/gif');
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
