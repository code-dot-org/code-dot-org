import sinon from 'sinon';
import {expect} from '../../util/reconfiguredChai';
import {TheaterSignalType} from '@cdo/apps/javalab/constants';
import Theater from '@cdo/apps/javalab/Theater';

describe('Theater', () => {
  let theater,
    playAudioSpy,
    pauseAudioSpy,
    imageElement,
    audioElement,
    onOutputMessage,
    onNewlineMessage,
    openPhotoPrompter,
    closePhotoPrompter;

  beforeEach(() => {
    onOutputMessage = sinon.stub();
    onNewlineMessage = sinon.stub();
    openPhotoPrompter = sinon.stub();
    closePhotoPrompter = sinon.stub();

    playAudioSpy = sinon.spy();
    pauseAudioSpy = sinon.spy();
    imageElement = {};
    audioElement = {play: playAudioSpy, pause: pauseAudioSpy};
    theater = new Theater(
      onOutputMessage,
      onNewlineMessage,
      openPhotoPrompter,
      closePhotoPrompter
    );
    theater.getImgElement = () => {
      return imageElement;
    };
    theater.getAudioElement = () => {
      return audioElement;
    };
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
      detail: {url: url}
    };
    const visualData = {
      value: TheaterSignalType.VISUAL_URL,
      detail: {url: url}
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
        prompt: prompt
      }
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
});
