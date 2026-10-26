// What an animation says at the playhead (specs/ANIMATION_PLAN.md, step 7).

import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import type {Timeline} from '../../../engine/core/keyframes';
import {MomentPanel} from '../MomentPanel';

/** Grows over a second, faded half way, with the glow on from the start. */
const GROW: Timeline = {
  tracks: {
    sprite: [{at: 0, value: 'a.png'}],
    drawnScale: [
      {at: 0, value: 1},
      {at: 1, value: 2},
    ],
    opacity: [{at: 0.5, value: 0.5}],
    'effect:effects/glow': [{at: 0, value: true}],
  },
};

const show = (time: number, isReadOnly = false) => {
  const onSet = vi.fn();
  render(
    <MomentPanel
      timeline={GROW}
      time={time}
      pictures={['a.png', 'b.png']}
      effects={[{path: 'effects/glow', name: 'Glow'}]}
      onSet={onSet}
      isReadOnly={isReadOnly}
    />,
  );
  return onSet;
};

// A value between keys is named so: "Scale Between keys".
const field = (name: string) =>
  screen.getByLabelText(new RegExp(`^${name}`)) as HTMLInputElement;

describe('the values at the playhead', () => {
  it('shows a key’s value plainly, and one between keys as such', () => {
    show(0.5);
    // Opacity has a key here; scale is half way between two.
    expect(field('Opacity').value).toBe('0.5');
    expect(field('Scale').value).toBe('1.5');
    expect(field('Scale').closest('[class*="interpolated"]')).not.toBeNull();
    expect(field('Opacity').closest('[class*="interpolated"]')).toBeNull();
    expect(screen.getAllByText('Between keys')).toHaveLength(1);
    expect(field('Scale')).toHaveAccessibleName('Scale Between keys');
  });

  it('says a value after the last key is held from it', () => {
    show(1.5);
    expect(field('Scale').value).toBe('2');
    expect(field('Scale')).toHaveAccessibleName('Scale Held from the last key');
  });

  it('leaves blank what the animation does not say', () => {
    show(0.25);
    // Opacity's first key is later: before it the actor is as it is.
    expect(field('Opacity').value).toBe('');
    expect(field('Turn').value).toBe('');
  });

  it('writes a key when a value is changed, on leaving the field', () => {
    const onSet = show(0.5);
    fireEvent.change(field('Scale'), {target: {value: '3'}});
    expect(onSet).not.toHaveBeenCalled();
    fireEvent.blur(field('Scale'));
    expect(onSet).toHaveBeenCalledWith('drawnScale', 3);
  });

  it('writes the offset whole, keeping the other half', () => {
    const onSet = show(0);
    fireEvent.change(field('Offset Y'), {target: {value: '-8'}});
    fireEvent.blur(field('Offset Y'));
    expect(onSet).toHaveBeenCalledWith('drawnOffset', {x: 0, y: -8});
  });

  it('writes nothing for a value left as it was', () => {
    const onSet = show(0.5);
    fireEvent.change(field('Opacity'), {target: {value: '0.5'}});
    fireEvent.blur(field('Opacity'));
    expect(onSet).not.toHaveBeenCalled();
  });

  it('keys the picture, and each effect on or off', () => {
    const onSet = show(0);
    fireEvent.change(screen.getByLabelText('Picture'), {
      target: {value: 'b.png'},
    });
    expect(onSet).toHaveBeenCalledWith('sprite', 'b.png');
    const glow = screen.getByRole('checkbox', {name: 'Glow'});
    expect(glow).toBeChecked();
    fireEvent.click(glow);
    expect(onSet).toHaveBeenCalledWith('effect:effects/glow', false);
  });

  it('has no Picture field for an interface actor, which is drawn', () => {
    render(
      <MomentPanel
        timeline={GROW}
        time={0}
        effects={[]}
        onSet={vi.fn()}
        isReadOnly={false}
      />,
    );
    expect(screen.queryByLabelText('Picture')).toBeNull();
    expect(field('Scale')).toBeInTheDocument();
  });

  it('changes nothing read only', () => {
    show(0, true);
    expect(field('Scale')).toBeDisabled();
    expect(screen.getByRole('checkbox', {name: 'Glow'})).toBeDisabled();
  });
});
