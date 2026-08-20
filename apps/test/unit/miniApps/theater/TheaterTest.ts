import {InputMessageType} from '@cdo/apps/javalab/constants';
import {
  InputMessage,
  TheaterSignalType,
} from '@cdo/apps/miniApps/theater/constants';
import Theater from '@cdo/apps/miniApps/theater/Theater';

describe('Theater', () => {
  let theater: Theater;
  let playAudioSpy: jest.Mock;
  let pauseAudioSpy: jest.Mock;
  let removeImageSrcSpy: jest.Mock;
  let removeAudioSrcSpy: jest.Mock;
  let loadAudioSpy: jest.Mock;
  let imageElement: Partial<HTMLImageElement>;
  let audioElement: Partial<HTMLAudioElement>;
  let onOutputMessage: jest.Mock;
  let onNewlineMessage: jest.Mock;
  let openPhotoPrompter: jest.Mock;
  let closePhotoPrompter: jest.Mock;
  let onJavabuilderMessage: jest.Mock;
  let onOutputVisibleChange: jest.Mock;
  let onMediaLoadError: jest.Mock;
  let uploadFile: jest.Mock;

  beforeEach(() => {
    onOutputMessage = jest.fn();
    onNewlineMessage = jest.fn();
    openPhotoPrompter = jest.fn();
    closePhotoPrompter = jest.fn();
    onJavabuilderMessage = jest.fn();
    onOutputVisibleChange = jest.fn();
    onMediaLoadError = jest.fn();

    playAudioSpy = jest.fn();
    pauseAudioSpy = jest.fn();
    removeImageSrcSpy = jest.fn();
    removeAudioSrcSpy = jest.fn();
    loadAudioSpy = jest.fn();
    imageElement = {
      style: {} as CSSStyleDeclaration,
      removeAttribute: removeImageSrcSpy,
    };
    audioElement = {
      play: playAudioSpy,
      pause: pauseAudioSpy,
      removeAttribute: removeAudioSrcSpy,
      load: loadAudioSpy,
    };
    uploadFile = jest.fn();

    theater = new Theater(
      onOutputMessage,
      onNewlineMessage,
      openPhotoPrompter,
      closePhotoPrompter,
      onJavabuilderMessage,
      onOutputVisibleChange,
      onMediaLoadError
    );
    theater.getImgElement = () => imageElement as HTMLImageElement;
    theater.getAudioElement = () => audioElement as HTMLAudioElement;
    theater.uploadFile = uploadFile;
  });

  it('sets audio detail when handleSignal with audio is called', () => {
    const url = 'url';
    const data = {value: TheaterSignalType.AUDIO_URL, detail: {url: url}};
    theater.startPlayback = jest.fn();
    theater.handleSignal(data);
    expect(audioElement.src).toContain(url);
    expect(typeof audioElement.oncanplaythrough).toBe('function');
    expect(typeof audioElement.onerror).toBe('function');
    expect(theater.startPlayback).not.toHaveBeenCalled();
  });

  it('sets visual detail when handleSignal with image is called', () => {
    const url = 'url';
    const data = {value: TheaterSignalType.VISUAL_URL, detail: {url: url}};
    theater.startPlayback = jest.fn();
    theater.handleSignal(data);
    expect(imageElement.src).toContain(url);
    expect(typeof imageElement.onload).toBe('function');
    expect(theater.startPlayback).not.toHaveBeenCalled();
  });

  it('cache-busts remote urls', () => {
    theater.startPlayback = jest.fn();
    theater.handleSignal({
      value: TheaterSignalType.VISUAL_URL,
      detail: {url: 'https://example.com/theater.gif'},
    });
    expect(imageElement.src).toContain('https://example.com/theater.gif?=');
  });

  it('uses blob and data urls verbatim', () => {
    theater.startPlayback = jest.fn();
    theater.handleSignal({
      value: TheaterSignalType.VISUAL_URL,
      detail: {url: 'blob:https://studio.code.org/abc-123'},
    });
    expect(imageElement.src).toBe('blob:https://studio.code.org/abc-123');

    theater.handleSignal({
      value: TheaterSignalType.AUDIO_URL,
      detail: {url: 'data:audio/wav;base64,AAAA'},
    });
    expect(audioElement.src).toBe('data:audio/wav;base64,AAAA');
  });

  it('revokes a blob url when it is replaced', () => {
    const revokeSpy = jest.fn();
    window.URL.revokeObjectURL = revokeSpy;
    theater.startPlayback = jest.fn();

    theater.handleSignal({
      value: TheaterSignalType.VISUAL_URL,
      detail: {url: 'blob:first'},
    });
    expect(revokeSpy).not.toHaveBeenCalled();

    theater.handleSignal({
      value: TheaterSignalType.VISUAL_URL,
      detail: {url: 'blob:second'},
    });
    expect(revokeSpy).toHaveBeenCalledWith('blob:first');
    expect(imageElement.src).toBe('blob:second');

    theater.handleSignal({
      value: TheaterSignalType.AUDIO_URL,
      detail: {url: 'blob:audio-first'},
    });
    theater.handleSignal({
      value: TheaterSignalType.AUDIO_URL,
      detail: {url: 'blob:audio-second'},
    });
    expect(revokeSpy).toHaveBeenCalledWith('blob:audio-first');
    expect(audioElement.src).toBe('blob:audio-second');
  });

  it('revokes blob urls on reset', () => {
    const revokeSpy = jest.fn();
    window.URL.revokeObjectURL = revokeSpy;
    theater.startPlayback = jest.fn();
    theater.handleSignal({
      value: TheaterSignalType.VISUAL_URL,
      detail: {url: 'blob:image'},
    });
    theater.handleSignal({
      value: TheaterSignalType.AUDIO_URL,
      detail: {url: 'blob:audio'},
    });

    theater.reset();

    expect(revokeSpy).toHaveBeenCalledWith('blob:image');
    expect(revokeSpy).toHaveBeenCalledWith('blob:audio');
  });

  it('drops a media src without loading an empty url', () => {
    // Assigning '' would make the browser load the empty url, which Firefox
    // reports as "Invalid URI. Load of media resource failed."
    theater.startPlayback = jest.fn();
    theater.handleSignal({
      value: TheaterSignalType.VISUAL_URL,
      detail: {url: 'blob:image'},
    });
    theater.handleSignal({
      value: TheaterSignalType.AUDIO_URL,
      detail: {url: 'blob:audio'},
    });

    theater.reset();

    expect(removeImageSrcSpy).toHaveBeenCalledWith('src');
    expect(removeAudioSrcSpy).toHaveBeenCalledWith('src');
    expect(imageElement.src).not.toBe('');
    expect(audioElement.src).not.toBe('');
    // The audio element only lets go of the revoked object url once it reloads.
    expect(loadAudioSpy).toHaveBeenCalled();
  });

  it('revokes blob urls after the elements are unmounted', () => {
    const revokeSpy = jest.fn();
    window.URL.revokeObjectURL = revokeSpy;
    theater.startPlayback = jest.fn();
    theater.handleSignal({
      value: TheaterSignalType.VISUAL_URL,
      detail: {url: 'blob:image'},
    });
    theater.handleSignal({
      value: TheaterSignalType.AUDIO_URL,
      detail: {url: 'blob:audio'},
    });
    theater.getImgElement = () => null;
    theater.getAudioElement = () => null;

    theater.onStop();

    expect(revokeSpy).toHaveBeenCalledWith('blob:image');
    expect(revokeSpy).toHaveBeenCalledWith('blob:audio');
  });

  it('does not revoke remote urls on reset', () => {
    const revokeSpy = jest.fn();
    window.URL.revokeObjectURL = revokeSpy;
    theater.startPlayback = jest.fn();
    theater.handleSignal({
      value: TheaterSignalType.VISUAL_URL,
      detail: {url: 'https://example.com/theater.gif'},
    });
    theater.handleSignal({
      value: TheaterSignalType.AUDIO_URL,
      detail: {url: 'https://example.com/theater.wav'},
    });

    theater.reset();

    expect(revokeSpy).not.toHaveBeenCalled();
  });

  it('reports output only after media arrives, until the next reset', () => {
    theater.startPlayback = jest.fn();
    expect(theater.hasOutput()).toBe(false);

    theater.handleSignal({
      value: TheaterSignalType.VISUAL_URL,
      detail: {url: 'blob:image'},
    });
    expect(theater.hasOutput()).toBe(true);

    theater.reset();
    expect(theater.hasOutput()).toBe(false);
  });

  it('does not report output for a run that only signals NO_AUDIO', () => {
    theater.handleSignal({value: TheaterSignalType.NO_AUDIO, detail: {}});

    expect(theater.hasOutput()).toBe(false);
  });

  it('shows a/v once elements have loaded', () => {
    const url = 'url';
    const audioData = {
      value: TheaterSignalType.AUDIO_URL,
      detail: {url: url},
    };
    const visualData = {
      value: TheaterSignalType.VISUAL_URL,
      detail: {url: url},
    };
    theater.handleSignal(audioData);
    theater.handleSignal(visualData);
    (imageElement as HTMLImageElement).onload?.(new Event('load'));
    (audioElement as HTMLAudioElement).oncanplaythrough?.(
      new Event('canplaythrough')
    );
    expect(imageElement.style?.visibility).toBe('visible');
    expect(playAudioSpy).toHaveBeenCalledTimes(1);
    expect(onOutputVisibleChange).toHaveBeenLastCalledWith(true);
  });

  it.each(['reset', 'onStop'] as const)('hides output on %s', method => {
    theater[method]();

    expect(imageElement.style?.visibility).toBe('hidden');
    expect(onOutputVisibleChange).toHaveBeenLastCalledWith(false);
  });

  it('reports a failed image load and drops the media', () => {
    const revokeSpy = jest.fn();
    window.URL.revokeObjectURL = revokeSpy;
    theater.handleSignal({value: TheaterSignalType.NO_AUDIO, detail: {}});
    theater.handleSignal({
      value: TheaterSignalType.VISUAL_URL,
      detail: {url: 'blob:image'},
    });

    (imageElement as HTMLImageElement).onerror?.(new Event('error'));

    expect(onMediaLoadError).toHaveBeenCalledTimes(1);
    expect(theater.hasOutput()).toBe(false);
    expect(imageElement.style?.visibility).toBe('hidden');
    expect(onOutputVisibleChange).toHaveBeenLastCalledWith(false);
    expect(revokeSpy).toHaveBeenCalledWith('blob:image');
  });

  it('reports a failed audio load and drops the media', () => {
    const revokeSpy = jest.fn();
    window.URL.revokeObjectURL = revokeSpy;
    theater.handleSignal({
      value: TheaterSignalType.AUDIO_URL,
      detail: {url: 'blob:audio'},
    });

    (audioElement as HTMLAudioElement).onerror?.(new Event('error'));

    expect(onMediaLoadError).toHaveBeenCalledTimes(1);
    expect(theater.hasOutput()).toBe(false);
    expect(onOutputVisibleChange).toHaveBeenLastCalledWith(false);
    expect(revokeSpy).toHaveBeenCalledWith('blob:audio');
  });

  it('does not leave the stage hidden waiting on audio that never loads', () => {
    theater.handleSignal({
      value: TheaterSignalType.VISUAL_URL,
      detail: {url: 'blob:image'},
    });
    (imageElement as HTMLImageElement).onload?.(new Event('load'));
    theater.handleSignal({
      value: TheaterSignalType.AUDIO_URL,
      detail: {url: 'blob:audio'},
    });

    (audioElement as HTMLAudioElement).onerror?.(new Event('error'));

    expect(playAudioSpy).not.toHaveBeenCalled();
    expect(onOutputVisibleChange).toHaveBeenLastCalledWith(false);
    expect(onMediaLoadError).toHaveBeenCalledTimes(1);
  });

  it('does not report an error for media dropped by a reset', () => {
    theater.startPlayback = jest.fn();
    theater.handleSignal({
      value: TheaterSignalType.VISUAL_URL,
      detail: {url: 'blob:image'},
    });

    theater.reset();

    // Clearing the src can fire an error event for the discarded image.
    expect(imageElement.onerror).toBeNull();
    expect(imageElement.onload).toBeNull();
    expect(audioElement.oncanplaythrough).toBeNull();
    expect(audioElement.onerror).toBeNull();
    expect(onMediaLoadError).not.toHaveBeenCalled();
  });

  it('starts playback on a later load after a failed one', () => {
    theater.handleSignal({value: TheaterSignalType.NO_AUDIO, detail: {}});
    theater.handleSignal({
      value: TheaterSignalType.VISUAL_URL,
      detail: {url: 'blob:bad'},
    });
    (imageElement as HTMLImageElement).onerror?.(new Event('error'));

    theater.handleSignal({value: TheaterSignalType.NO_AUDIO, detail: {}});
    theater.handleSignal({
      value: TheaterSignalType.VISUAL_URL,
      detail: {url: 'blob:good'},
    });
    (imageElement as HTMLImageElement).onload?.(new Event('load'));

    expect(imageElement.style?.visibility).toBe('visible');
    expect(onOutputVisibleChange).toHaveBeenLastCalledWith(true);
  });

  it('opens photo prompter after receiving a GET_IMAGE signal', () => {
    const prompt = 'prompt';
    const getImageSignal = {
      value: TheaterSignalType.GET_IMAGE,
      detail: {
        prompt: prompt,
      },
    };

    theater.handleSignal(getImageSignal);

    expect(openPhotoPrompter).toHaveBeenCalledWith(prompt);
  });

  it('closes photo prompter on stop', () => {
    theater.onStop();
    expect(closePhotoPrompter).toHaveBeenCalledTimes(1);
  });

  it('closes photo prompter on close', () => {
    theater.onClose();
    expect(closePhotoPrompter).toHaveBeenCalledTimes(1);
  });

  it('uploads photo file when file selected if URL is available', () => {
    const uploadUrl = 'upload.url';
    const photoFile = new File([], 'file');

    theater.handleSignal({
      value: TheaterSignalType.GET_IMAGE,
      detail: {
        prompt: 'prompt',
        uploadUrl: uploadUrl,
      },
    });

    theater.onPhotoPrompterFileSelected(photoFile);

    expect(uploadFile).toHaveBeenCalledWith(
      uploadUrl,
      photoFile,
      expect.any(Function),
      expect.any(Function)
    );
  });

  it('does not upload and sends error message if no upload URL is present', () => {
    theater.onPhotoPrompterFileSelected(new File([], 'file'));

    expect(uploadFile).not.toHaveBeenCalled();
    expect(onJavabuilderMessage).toHaveBeenCalledWith(
      InputMessageType.THEATER,
      InputMessage.UPLOAD_ERROR
    );
  });

  it('sends success or failure message based on upload result', () => {
    theater.handleSignal({
      value: TheaterSignalType.GET_IMAGE,
      detail: {
        prompt: 'prompt',
        uploadUrl: 'upload.url',
      },
    });
    theater.onPhotoPrompterFileSelected(new File([], 'file'));
    expect(uploadFile).toHaveBeenCalledTimes(1);

    // Get callbacks
    const onSuccess = uploadFile.mock.calls[0][2];
    const onError = uploadFile.mock.calls[0][3];

    onJavabuilderMessage.mockClear();
    onSuccess();
    expect(onJavabuilderMessage).toHaveBeenCalledWith(
      InputMessageType.THEATER,
      InputMessage.UPLOAD_SUCCESS
    );

    onJavabuilderMessage.mockClear();
    onError();
    expect(onJavabuilderMessage).toHaveBeenCalledWith(
      InputMessageType.THEATER,
      InputMessage.UPLOAD_ERROR
    );
  });
});
