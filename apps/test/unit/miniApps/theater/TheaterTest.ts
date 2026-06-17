import {TheaterSignalType} from '@cdo/apps/miniApps/theater/constants';
import Theater from '@cdo/apps/miniApps/theater/Theater';

describe('Theater (lab2)', () => {
  let theater: Theater;
  let playSpy: jest.Mock;
  let pauseSpy: jest.Mock;
  let imageElement: {
    src?: string;
    style: {visibility?: string};
    onload?: () => void;
  };
  let audioElement: {
    src?: string;
    play: jest.Mock;
    pause: jest.Mock;
    oncanplaythrough?: () => void;
  };
  let onOutputMessage: jest.Mock;
  let onNewlineMessage: jest.Mock;

  beforeEach(() => {
    onOutputMessage = jest.fn();
    onNewlineMessage = jest.fn();

    playSpy = jest.fn();
    pauseSpy = jest.fn();
    imageElement = {style: {}};
    audioElement = {play: playSpy, pause: pauseSpy};

    theater = new Theater(onOutputMessage, onNewlineMessage);
    theater.getImgElement = () => imageElement as unknown as HTMLImageElement;
    theater.getAudioElement = () => audioElement as unknown as HTMLAudioElement;
  });

  it('sets audio src and waits to play when AUDIO_URL arrives', () => {
    const startPlayback = jest.fn();
    theater.startPlayback = startPlayback;
    theater.handleSignal({
      value: TheaterSignalType.AUDIO_URL,
      detail: {url: 'url'},
    });
    expect(audioElement.src).toContain('url');
    expect(typeof audioElement.oncanplaythrough).toBe('function');
    expect(startPlayback).not.toHaveBeenCalled();
  });

  it('sets image src and waits to show when VISUAL_URL arrives', () => {
    const startPlayback = jest.fn();
    theater.startPlayback = startPlayback;
    theater.handleSignal({
      value: TheaterSignalType.VISUAL_URL,
      detail: {url: 'url'},
    });
    expect(imageElement.src).toContain('url');
    expect(typeof imageElement.onload).toBe('function');
    expect(startPlayback).not.toHaveBeenCalled();
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
    expect(imageElement.style.visibility).not.toBe('visible');
    audioElement.oncanplaythrough!();
    expect(imageElement.style.visibility).toBe('visible');
    expect(playSpy).toHaveBeenCalledTimes(1);
  });

  it('shows the image without waiting for audio after NO_AUDIO', () => {
    theater.handleSignal({
      value: TheaterSignalType.VISUAL_URL,
      detail: {url: 'url'},
    });
    imageElement.onload!();
    theater.handleSignal({value: TheaterSignalType.NO_AUDIO});
    expect(imageElement.style.visibility).toBe('visible');
    expect(playSpy).not.toHaveBeenCalled();
  });

  it('hides and clears the image on reset', () => {
    imageElement.src = 'url';
    audioElement.src = 'url';
    theater.reset();
    expect(imageElement.style.visibility).toBe('hidden');
    expect(imageElement.src).toBe('');
    expect(audioElement.src).toBe('');
    expect(pauseSpy).toHaveBeenCalled();
  });

  it('prints a completion message on close', () => {
    theater.onClose();
    expect(onOutputMessage).toHaveBeenCalled();
    expect(onOutputMessage.mock.calls[0][0]).toContain('Program completed');
  });

  it('reports that photo prompts are unsupported on GET_IMAGE', () => {
    theater.handleSignal({
      value: TheaterSignalType.GET_IMAGE,
      detail: {prompt: 'prompt', uploadUrl: 'upload.url'},
    });
    expect(onOutputMessage).toHaveBeenCalled();
    expect(onOutputMessage.mock.calls[0][0]).toContain('not yet supported');
  });
});
