import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import PlayBar from '@cdo/apps/p5lab/spritelab/lab2/views/components/PlayBar';

// The arrow key events reaching window; a fired Enter bubbles there too.
const keyEvents = () => {
  const seen: string[] = [];
  const record = (e: Event) => {
    const {type, keyCode} = e as KeyboardEvent;
    if (keyCode >= 37 && keyCode <= 40) {
      seen.push(`${type}:${keyCode}`);
    }
  };
  window.addEventListener('keydown', record);
  window.addEventListener('keyup', record);
  return {
    seen,
    stop: () => {
      window.removeEventListener('keydown', record);
      window.removeEventListener('keyup', record);
    },
  };
};

describe('PlayBar', () => {
  it('shows only Play when not playing', () => {
    const onPlay = jest.fn();
    render(<PlayBar playing={false} arrows="steer" onPlay={onPlay} />);
    fireEvent.click(screen.getByRole('button', {name: 'Play'}));
    expect(onPlay).toHaveBeenCalled();
    expect(screen.queryByRole('button', {name: 'Left'})).toBeNull();
  });

  it('shows Stop and four arrows while playing a steering scene', () => {
    const onStop = jest.fn();
    render(
      <PlayBar playing arrows="steer" onPlay={jest.fn()} onStop={onStop} />
    );
    fireEvent.click(screen.getByRole('button', {name: 'Stop'}));
    expect(onStop).toHaveBeenCalled();
    expect(
      screen
        .getAllByRole('button')
        .map(button => button.getAttribute('aria-label') || button.textContent)
    ).toEqual(['Stop', 'Left', 'Right', 'Up', 'Down']);
  });

  it('replaces up and down with Jump, and drops Stop with nowhere to go', () => {
    render(<PlayBar playing arrows="jump" onPlay={jest.fn()} />);
    expect(
      screen
        .getAllByRole('button')
        .map(button => button.getAttribute('aria-label'))
    ).toEqual(['Left', 'Jump', 'Right']);
  });

  it('holds the key from pointer down to pointer up', () => {
    const keys = keyEvents();
    render(<PlayBar playing arrows="jump" onPlay={jest.fn()} />);
    const jump = screen.getByRole('button', {name: 'Jump'});
    fireEvent.pointerDown(jump);
    fireEvent.pointerDown(jump);
    expect(keys.seen).toEqual(['keydown:38']);
    fireEvent.pointerUp(jump);
    expect(keys.seen).toEqual(['keydown:38', 'keyup:38']);
    keys.stop();
  });

  it('taps the key for a click with no press of its own', () => {
    jest.useFakeTimers();
    const keys = keyEvents();
    render(<PlayBar playing arrows="steer" onPlay={jest.fn()} />);
    const left = screen.getByRole('button', {name: 'Left'});
    fireEvent.click(left);
    expect(keys.seen).toEqual(['keydown:37']);
    jest.advanceTimersByTime(200);
    expect(keys.seen).toEqual(['keydown:37', 'keyup:37']);
    // The click after a real press adds nothing.
    fireEvent.pointerDown(left);
    fireEvent.pointerUp(left);
    fireEvent.click(left);
    jest.advanceTimersByTime(200);
    expect(keys.seen).toEqual([
      'keydown:37',
      'keyup:37',
      'keydown:37',
      'keyup:37',
    ]);
    keys.stop();
    jest.useRealTimers();
  });

  it('holds a tap until the timer and two frames have both passed', () => {
    jest.useFakeTimers();
    const frames: FrameRequestCallback[] = [];
    const raf = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation(cb => frames.push(cb));
    const runFrame = () => frames.shift()?.(0);
    const keys = keyEvents();
    render(<PlayBar playing arrows="steer" onPlay={jest.fn()} />);
    const left = screen.getByRole('button', {name: 'Left'});

    // No frame runs: the timer alone does not release.
    fireEvent.click(left);
    jest.advanceTimersByTime(500);
    expect(keys.seen).toEqual(['keydown:37']);
    runFrame();
    expect(keys.seen).toEqual(['keydown:37']);
    runFrame();
    expect(keys.seen).toEqual(['keydown:37', 'keyup:37']);

    // Frames run at once: the frames alone do not release.
    fireEvent.click(left);
    runFrame();
    runFrame();
    expect(keys.seen).toEqual(['keydown:37', 'keyup:37', 'keydown:37']);
    jest.advanceTimersByTime(200);
    expect(keys.seen).toEqual([
      'keydown:37',
      'keyup:37',
      'keydown:37',
      'keyup:37',
    ]);
    keys.stop();
    raf.mockRestore();
    jest.useRealTimers();
  });

  it('holds the key from Enter down to up, and releases when it goes away', () => {
    const keys = keyEvents();
    const {rerender} = render(
      <PlayBar playing arrows="steer" onPlay={jest.fn()} />
    );
    const down = screen.getByRole('button', {name: 'Down'});
    fireEvent.keyDown(down, {key: 'Enter'});
    expect(keys.seen).toEqual(['keydown:40']);
    // Gravity switched on mid-press: the Down button is gone.
    rerender(<PlayBar playing arrows="jump" onPlay={jest.fn()} />);
    expect(keys.seen).toEqual(['keydown:40', 'keyup:40']);
    keys.stop();
  });
});
