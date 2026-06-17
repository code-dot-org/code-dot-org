import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {TheaterSignalType} from '@cdo/apps/miniApps/theater/constants';
import Theater from '@cdo/apps/miniApps/theater/Theater';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('Theater (lab2)', () => {
  let theater: Theater;
  let playAudioSpy: sinon.SinonSpy;
  let pauseAudioSpy: sinon.SinonSpy;
  let imageElement: {
    src?: string;
    style: {visibility?: string};
    onload?: () => void;
  };
  let audioElement: {
    src?: string;
    play: sinon.SinonSpy;
    pause: sinon.SinonSpy;
    oncanplaythrough?: () => void;
  };
  let onOutputMessage: sinon.SinonStub;
  let onNewlineMessage: sinon.SinonStub;

  beforeEach(() => {
    onOutputMessage = sinon.stub();
    onNewlineMessage = sinon.stub();

    playAudioSpy = sinon.spy();
    pauseAudioSpy = sinon.spy();
    imageElement = {style: {}};
    audioElement = {play: playAudioSpy, pause: pauseAudioSpy};

    theater = new Theater(onOutputMessage, onNewlineMessage);
    theater.getImgElement = () => imageElement as unknown as HTMLImageElement;
    theater.getAudioElement = () => audioElement as unknown as HTMLAudioElement;
  });

  it('sets audio src and waits to play when AUDIO_URL arrives', () => {
    theater.startPlayback = sinon.spy();
    theater.handleSignal({
      value: TheaterSignalType.AUDIO_URL,
      detail: {url: 'url'},
    });
    expect(audioElement.src).to.contain('url');
    expect(typeof audioElement.oncanplaythrough).to.equal('function');
    expect(theater.startPlayback).to.have.not.been.called;
  });

  it('sets image src and waits to show when VISUAL_URL arrives', () => {
    theater.startPlayback = sinon.spy();
    theater.handleSignal({
      value: TheaterSignalType.VISUAL_URL,
      detail: {url: 'url'},
    });
    expect(imageElement.src).to.contain('url');
    expect(typeof imageElement.onload).to.equal('function');
    expect(theater.startPlayback).to.have.not.been.called;
  });

  it('shows the image and plays audio once both have loaded', () => {
    theater.handleSignal({
      value: TheaterSignalType.AUDIO_URL,
      detail: {url: 'url'},
    });
    theater.handleSignal({
      value: TheaterSignalType.VISUAL_URL,
      detail: {url: 'url'},
    });
    imageElement.onload!();
    expect(imageElement.style.visibility).to.not.equal('visible');
    audioElement.oncanplaythrough!();
    expect(imageElement.style.visibility).to.equal('visible');
    expect(playAudioSpy).to.have.been.calledOnce;
  });

  it('shows the image without waiting for audio after NO_AUDIO', () => {
    theater.handleSignal({
      value: TheaterSignalType.VISUAL_URL,
      detail: {url: 'url'},
    });
    imageElement.onload!();
    theater.handleSignal({value: TheaterSignalType.NO_AUDIO});
    expect(imageElement.style.visibility).to.equal('visible');
    expect(playAudioSpy).to.have.not.been.called;
  });

  it('hides and clears the image on reset', () => {
    imageElement.src = 'url';
    audioElement.src = 'url';
    theater.reset();
    expect(imageElement.style.visibility).to.equal('hidden');
    expect(imageElement.src).to.equal('');
    expect(audioElement.src).to.equal('');
    expect(pauseAudioSpy).to.have.been.called;
  });

  it('prints a completion message on close', () => {
    theater.onClose();
    expect(onOutputMessage).to.have.been.called;
    expect(onOutputMessage.getCall(0).args[0]).to.contain('Program completed');
  });

  it('reports that photo prompts are unsupported on GET_IMAGE', () => {
    theater.handleSignal({
      value: TheaterSignalType.GET_IMAGE,
      detail: {prompt: 'prompt', uploadUrl: 'upload.url'},
    });
    expect(onOutputMessage).to.have.been.called;
    expect(onOutputMessage.getCall(0).args[0]).to.contain('not yet supported');
  });
});
