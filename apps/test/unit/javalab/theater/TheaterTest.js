import {expect} from '../../../util/reconfiguredChai';
import {
  TheaterSignalType,
  InputMessageType,
  InputMessage,
} from '@cdo/apps/javalab/constants';
import Theater from '@cdo/apps/javalab/theater/Theater';

describe('Theater', () => {
  let theater,
    playAudioSpy,
    pauseAudioSpy,
    imageElement,
    audioElement,
    onOutputMessage,
    onNewlineMessage,
    openPhotoPrompter,
    closePhotoPrompter,
    onJavabuilderMessage,
    uploadFile;

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
    theater.getImgElement = () => {
      return imageElement;
    };
    theater.getAudioElement = () => {
      return audioElement;
    };
    theater.uploadFile = uploadFile;
  });

  it('sets audio detail when handleSignal with audio is called', () => {
    const url = 'url';
    const data = {value: TheaterSignalType.AUDIO_URL, detail: {url: url}};
    theater.startPlayback = jest.fn();
    theater.handleSignal(data);
    expect(audioElement.src).to.contain(url);
    expect(typeof audioElement.oncanplaythrough).to.equal('function');
    expect(theater.startPlayback).to.have.not.been.called;
  });

  it('sets visual detail when handleSignal with image is called', () => {
    const url = 'url';
    const data = {value: TheaterSignalType.VISUAL_URL, detail: {url: url}};
    theater.startPlayback = jest.fn();
    theater.handleSignal(data);
    expect(imageElement.src).to.contain(url);
    expect(typeof imageElement.onload).to.equal('function');
    expect(theater.startPlayback).to.have.not.been.called;
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
    imageElement.style = {};
    theater.handleSignal(audioData);
    theater.handleSignal(visualData);
    imageElement.onload();
    audioElement.oncanplaythrough();
    expect(imageElement.style.visibility).to.equal('visible');
    expect(playAudioSpy).to.have.been.called.once;
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

    expect(uploadFile).toHaveBeenCalledWith(uploadUrl, photoFile);
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

    onJavabuilderMessage.mockReset();
    onSuccess();
    expect(onJavabuilderMessage).toHaveBeenCalledWith(
      InputMessageType.THEATER,
      InputMessage.UPLOAD_SUCCESS
    );

    onJavabuilderMessage.mockReset();
    onError();
    expect(onJavabuilderMessage).toHaveBeenCalledWith(
      InputMessageType.THEATER,
      InputMessage.UPLOAD_ERROR
    );
  });
});
