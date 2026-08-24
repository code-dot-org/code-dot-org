import {AudioPlayer} from '@codebridge/components/AudioPlayer';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import '@testing-library/jest-dom';

// MUI's button ripple schedules state updates across a timer, a microtask, and
// an effect, which don't line up with act() boundaries and warn after the test.
// The ripple is cosmetic, so disable it; it has no bearing on what we assert.
const noRippleTheme = createTheme({
  components: {MuiButtonBase: {defaultProps: {disableRipple: true}}},
});

const renderPlayer = (props: React.ComponentProps<typeof AudioPlayer>) =>
  render(
    <ThemeProvider theme={noRippleTheme}>
      <AudioPlayer {...props} />
    </ThemeProvider>
  );

// The audio element is deliberately kept out of the accessibility tree: it
// carries no native controls, and the play/pause button is the user-facing
// control. There is therefore no accessible query that reaches it.
const getAudioElement = (container: HTMLElement) =>
  // eslint-disable-next-line no-restricted-properties
  container.querySelector('audio') as HTMLAudioElement;

describe('AudioPlayer', () => {
  let play: jest.Mock;
  let pause: jest.Mock;

  beforeEach(() => {
    // jsdom does not implement playback, so stand in for it and track paused
    // state ourselves. The component reads `paused` to decide what to do next.
    play = jest.fn().mockImplementation(function (this: HTMLAudioElement) {
      Object.defineProperty(this, 'paused', {value: false, configurable: true});
      this.dispatchEvent(new Event('play'));
      return Promise.resolve();
    });
    pause = jest.fn().mockImplementation(function (this: HTMLAudioElement) {
      Object.defineProperty(this, 'paused', {value: true, configurable: true});
      this.dispatchEvent(new Event('pause'));
    });
    HTMLMediaElement.prototype.play = play;
    HTMLMediaElement.prototype.pause = pause;
  });

  it('renders the file name and an unknown duration before metadata loads', () => {
    renderPlayer({src: 'https://example.com/bark.wav', fileName: 'bark.wav'});

    expect(screen.getByText('bark.wav')).toBeInTheDocument();
    expect(screen.getByText('0:00 / --:--')).toBeInTheDocument();
  });

  it('points the audio element at the file url', () => {
    const {container} = renderPlayer({
      src: 'https://example.com/bark.wav',
      fileName: 'bark.wav',
    });

    expect(getAudioElement(container)).toHaveAttribute(
      'src',
      'https://example.com/bark.wav'
    );
  });

  it('starts playback when the play button is clicked', async () => {
    renderPlayer({src: 'https://example.com/bark.wav', fileName: 'bark.wav'});

    await userEvent.click(screen.getByRole('button', {name: 'Play bark.wav'}));

    expect(play).toHaveBeenCalled();
    expect(
      screen.getByRole('button', {name: 'Pause bark.wav'})
    ).toBeInTheDocument();
  });

  it('pauses playback when the pause button is clicked', async () => {
    renderPlayer({src: 'https://example.com/bark.wav', fileName: 'bark.wav'});

    await userEvent.click(screen.getByRole('button', {name: 'Play bark.wav'}));
    await userEvent.click(screen.getByRole('button', {name: 'Pause bark.wav'}));

    expect(pause).toHaveBeenCalled();
    expect(
      screen.getByRole('button', {name: 'Play bark.wav'})
    ).toBeInTheDocument();
  });

  it('returns to the play label when the audio ends on its own', async () => {
    const {container} = renderPlayer({
      src: 'https://example.com/bark.wav',
      fileName: 'bark.wav',
    });

    await userEvent.click(screen.getByRole('button', {name: 'Play bark.wav'}));
    fireEvent.ended(getAudioElement(container));

    expect(
      screen.getByRole('button', {name: 'Play bark.wav'})
    ).toBeInTheDocument();
  });

  it('shows elapsed and total time', () => {
    const {container} = renderPlayer({
      src: 'https://example.com/bark.wav',
      fileName: 'bark.wav',
    });
    const audio = getAudioElement(container);

    Object.defineProperty(audio, 'duration', {value: 75, configurable: true});
    fireEvent.loadedMetadata(audio);
    Object.defineProperty(audio, 'currentTime', {value: 5, configurable: true});
    fireEvent.timeUpdate(audio);

    expect(screen.getByText('0:05 / 1:15')).toBeInTheDocument();
  });

  it('reports a load failure and disables the play button', () => {
    const {container} = renderPlayer({
      src: 'https://example.com/missing.wav',
      fileName: 'missing.wav',
    });

    fireEvent.error(getAudioElement(container));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'This file could not be played.'
    );
    expect(
      screen.getByRole('button', {name: 'Play missing.wav'})
    ).toBeDisabled();
  });

  it('reports a playback failure when play() rejects', async () => {
    play.mockRejectedValue(new DOMException('no decoder', 'NotSupportedError'));
    renderPlayer({src: 'https://example.com/bark.wav', fileName: 'bark.wav'});

    await userEvent.click(screen.getByRole('button', {name: 'Play bark.wav'}));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'This file could not be played.'
    );
  });

  it('ignores the AbortError from pausing a pending play', async () => {
    play.mockRejectedValue(new DOMException('interrupted', 'AbortError'));
    renderPlayer({src: 'https://example.com/bark.wav', fileName: 'bark.wav'});

    await userEvent.click(screen.getByRole('button', {name: 'Play bark.wav'}));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('clears the error when switching to another audio file', () => {
    const {container, rerender} = renderPlayer({
      src: 'https://example.com/missing.wav',
      fileName: 'missing.wav',
    });
    fireEvent.error(getAudioElement(container));

    rerender(
      <ThemeProvider theme={noRippleTheme}>
        <AudioPlayer src="https://example.com/meow.wav" fileName="meow.wav" />
      </ThemeProvider>
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Play meow.wav'})).toBeEnabled();
  });

  it('stops the previous file when switching to another audio file', async () => {
    const {rerender} = renderPlayer({
      src: 'https://example.com/bark.wav',
      fileName: 'bark.wav',
    });

    await userEvent.click(screen.getByRole('button', {name: 'Play bark.wav'}));

    rerender(
      <ThemeProvider theme={noRippleTheme}>
        <AudioPlayer src="https://example.com/meow.wav" fileName="meow.wav" />
      </ThemeProvider>
    );

    expect(pause).toHaveBeenCalled();
    expect(
      screen.getByRole('button', {name: 'Play meow.wav'})
    ).toBeInTheDocument();
    expect(screen.getByText('0:00 / --:--')).toBeInTheDocument();
  });
});
