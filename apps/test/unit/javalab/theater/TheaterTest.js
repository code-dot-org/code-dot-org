import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {
  TheaterSignalType,
  InputMessageType,
  InputMessage,
} from '@cdo/apps/javalab/constants';
import Theater from '@cdo/apps/javalab/theater/Theater';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

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
    onOutputMessage = sinon.stub();
    onNewlineMessage = sinon.stub();
    openPhotoPrompter = sinon.stub();
    closePhotoPrompter = sinon.stub();
    onJavabuilderMessage = sinon.stub();

    playAudioSpy = sinon.spy();
    pauseAudioSpy = sinon.spy();
    imageElement = {};
    audioElement = {play: playAudioSpy, pause: pauseAudioSpy};
    uploadFile = sinon.stub();

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
    theater.startPlayback = sinon.spy();
    theater.handleSignal(data);
    expect(audioElement.src).to.contain(url);
    expect(typeof audioElement.oncanplaythrough).to.equal('function');
    expect(theater.startPlayback).to.have.not.been.called;
  });

  it('sets visual detail when handleSignal with image is called', () => {
    const url = 'url';
    const data = {value: TheaterSignalType.VISUAL_URL, detail: {url: url}};
    theater.startPlayback = sinon.spy();
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

    sinon.assert.calledWith(openPhotoPrompter, prompt);
  });

  it('closes photo prompter on stop', () => {
    theater.onStop();
    sinon.assert.calledOnce(closePhotoPrompter);
  });

  it('closes photo prompter on close', () => {
    theater.onClose();
    sinon.assert.calledOnce(closePhotoPrompter);
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

    sinon.assert.calledWith(uploadFile, uploadUrl, photoFile);
  });

  it('does not upload and sends error message if no upload URL is present', () => {
    theater.onPhotoPrompterFileSelected(new File([], 'file'));

    sinon.assert.notCalled(uploadFile);
    sinon.assert.calledWith(
      onJavabuilderMessage,
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
    sinon.assert.calledOnce(uploadFile);

    // Get callbacks
    const onSuccess = uploadFile.getCall(0).args[2];
    const onError = uploadFile.getCall(0).args[3];

    onJavabuilderMessage.reset();
    onSuccess();
    sinon.assert.calledWith(
      onJavabuilderMessage,
      InputMessageType.THEATER,
      InputMessage.UPLOAD_SUCCESS
    );

    onJavabuilderMessage.reset();
    onError();
    sinon.assert.calledWith(
      onJavabuilderMessage,
      InputMessageType.THEATER,
      InputMessage.UPLOAD_ERROR
    );
  });
});
