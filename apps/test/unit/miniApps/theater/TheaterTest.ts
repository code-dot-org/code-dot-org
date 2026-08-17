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
  let imageElement: Partial<HTMLImageElement>;
  let audioElement: Partial<HTMLAudioElement>;
  let onOutputMessage: jest.Mock;
  let onNewlineMessage: jest.Mock;
  let openPhotoPrompter: jest.Mock;
  let closePhotoPrompter: jest.Mock;
  let onJavabuilderMessage: jest.Mock;
  let uploadFile: jest.Mock;

  beforeEach(() => {
    onOutputMessage = jest.fn();
    onNewlineMessage = jest.fn();
    openPhotoPrompter = jest.fn();
    closePhotoPrompter = jest.fn();
    onJavabuilderMessage = jest.fn();

    playAudioSpy = jest.fn();
    pauseAudioSpy = jest.fn();
    imageElement = {};
    audioElement = {play: playAudioSpy, pause: pauseAudioSpy};
    uploadFile = jest.fn();

    theater = new Theater(
      onOutputMessage,
      onNewlineMessage,
      openPhotoPrompter,
      closePhotoPrompter,
      onJavabuilderMessage
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
  });

  it('revokes blob urls on reset', () => {
    const revokeSpy = jest.fn();
    window.URL.revokeObjectURL = revokeSpy;
    imageElement.style = {} as CSSStyleDeclaration;
    imageElement.src = 'blob:image';
    audioElement.src = 'blob:audio';

    theater.reset();

    expect(revokeSpy).toHaveBeenCalledWith('blob:image');
    expect(revokeSpy).toHaveBeenCalledWith('blob:audio');
  });

  it('does not revoke remote urls on reset', () => {
    const revokeSpy = jest.fn();
    window.URL.revokeObjectURL = revokeSpy;
    imageElement.style = {} as CSSStyleDeclaration;
    imageElement.src = 'https://example.com/theater.gif';
    audioElement.src = '';

    theater.reset();

    expect(revokeSpy).not.toHaveBeenCalled();
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
    imageElement.style = {} as CSSStyleDeclaration;
    theater.handleSignal(audioData);
    theater.handleSignal(visualData);
    (imageElement as HTMLImageElement).onload?.(new Event('load'));
    (audioElement as HTMLAudioElement).oncanplaythrough?.(
      new Event('canplaythrough')
    );
    expect(imageElement.style.visibility).toBe('visible');
    expect(playAudioSpy).toHaveBeenCalledTimes(1);
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
