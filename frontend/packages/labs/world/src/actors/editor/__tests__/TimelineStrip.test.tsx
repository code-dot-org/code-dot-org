// An animation's timeline (specs/ANIMATION_PLAN.md, step 6).

import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import type {Timeline} from '../../../engine/core/keyframes';
import {drawnLength, TimelineStrip, trackName} from '../TimelineStrip';

/** A hop: up and back over a second, and a glow switched on half way. */
const HOP: Timeline = {
  tracks: {
    drawnOffset: [
      {at: 0, value: {x: 0, y: 0}},
      {at: 0.5, value: {x: 0, y: -8}},
      {at: 1, value: {x: 0, y: 0}},
    ],
    'effect:effects/glow': [{at: 0.5, value: true}],
  },
};

const show = (time = 0, timeline = HOP) => {
  const onTime = vi.fn();
  const view = render(
    <TimelineStrip
      name="Hop"
      timeline={timeline}
      time={time}
      onTime={onTime}
      effectName={path => (path === 'effects/glow' ? 'Glow' : path)}
    />,
  );
  return {onTime, slider: screen.getByRole('slider'), ...view};
};

describe('the timeline', () => {
  it('is a slider over the timeline, saying the time', () => {
    const {slider} = show(0.5);
    expect(slider).toHaveAccessibleName('Hop timeline');
    // Its own length, to the next second: it ends at 1.
    expect(slider).toHaveAttribute('aria-valuemax', '1');
    expect(slider).toHaveAttribute('aria-valuenow', '0.5');
    expect(slider).toHaveAttribute('aria-valuetext', '0.5 s');
  });

  it('has a row per track, named, and a mark per key', () => {
    const {container} = show();
    expect(
      [...container.querySelectorAll('ul li')].map(li => li.textContent),
    ).toEqual(['Offset', 'Glow']);
    expect(container.querySelectorAll('[class*="key"]')).toHaveLength(4);
  });

  it('moves a tick with the arrows, and to either end', () => {
    const {onTime, slider} = show(0.5);
    fireEvent.keyDown(slider, {key: 'ArrowRight'});
    expect(onTime).toHaveBeenLastCalledWith(0.6);
    fireEvent.keyDown(slider, {key: 'ArrowLeft'});
    expect(onTime).toHaveBeenLastCalledWith(0.4);
    fireEvent.keyDown(slider, {key: 'Home'});
    expect(onTime).toHaveBeenLastCalledWith(0);
    // The end is its last key, not the end of the strip.
    fireEvent.keyDown(slider, {key: 'End'});
    expect(onTime).toHaveBeenLastCalledWith(1);
  });

  it('puts the playhead where it is pressed, to the tick', () => {
    const {onTime, slider} = show();
    slider.getBoundingClientRect = () =>
      ({left: 100, width: 500, top: 0, height: 40}) as DOMRect;
    // A fifth of the way along one second is a fifth of a second.
    // jsdom has no PointerEvent, and drops the point from one it makes up.
    fireEvent(
      slider,
      new MouseEvent('pointerdown', {clientX: 201, buttons: 1, bubbles: true}),
    );
    expect(onTime).toHaveBeenLastCalledWith(0.2);
  });

  it('cannot play an animation that does nothing', () => {
    show(0, {tracks: {}});
    expect(screen.getByRole('button', {name: 'Play'})).toBeDisabled();
    expect(screen.getByText(/Nothing moves yet/)).toBeInTheDocument();
  });

  it('is drawn five seconds long when it has nothing on it, else its own length', () => {
    expect(drawnLength({tracks: {}})).toBe(5);
    expect(drawnLength(HOP)).toBe(1);
    expect(drawnLength({tracks: {opacity: [{at: 2.2, value: 0}]}})).toBe(3);
    expect(drawnLength({...HOP, length: 4})).toBe(4);
  });

  it('names its tracks', () => {
    expect(trackName('sprite')).toBe('Picture');
    expect(trackName('drawnTurn')).toBe('Turn');
    expect(trackName('effect:effects/glow', () => 'Glow')).toBe('Glow');
  });
});
