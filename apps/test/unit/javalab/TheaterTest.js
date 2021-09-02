import sinon from 'sinon';
import {expect} from '../../util/reconfiguredChai';
import {TheaterSignalType} from '@cdo/apps/javalab/constants';
import Theater from '@cdo/apps/javalab/Theater';

describe('Theater', () => {
  let theater, playAudioSpy, imageElement, audioElement;
  beforeEach(() => {
    playAudioSpy = sinon.spy();
    imageElement = {};
    audioElement = {play: playAudioSpy};
    theater = new Theater();
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
    expect(audioElement.src).to.equal(url);
    expect(typeof audioElement.oncanplaythrough).to.equal('function');
    expect(theater.startPlayback).to.have.not.been.called;
  });

  it('sets visual detail when handleSignal with image is called', () => {
    const url = 'url';
    const data = {value: TheaterSignalType.VISUAL_URL, detail: {url: url}};
    theater.startPlayback = sinon.spy();
    theater.handleSignal(data);
    expect(imageElement.src).to.equal(url);
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
});
