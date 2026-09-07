// The map as a thing a person uses, rather than as geometry.
//
// What is asserted here is what the picture CLAIMS: that a tile says which
// state it is in and why in words, not only in color, and that the keyboard
// can reach every tile. Both are things a screen reader depends on entirely and
// a sighted mouse user never notices are missing.

import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';

import {TILES} from '../catalogue';
import {adjacent} from '../hex';
import {ProgressionMap, nearestInDirection} from '../ProgressionMap';
import type {TileId} from '../types';

const done = (...ids: TileId[]) => new Set(ids);
const tile = (id: TileId) => TILES.find(t => t.id === id)!;

describe('the map', () => {
  // A listbox of options, not sixty-seven buttons: picking a tile SELECTS it,
  // and `aria-selected` says so where `aria-pressed` would have claimed a
  // toggle. The three buttons are the zoom and fit controls.
  it('draws every tile in the catalogue, as one listbox', () => {
    render(<ProgressionMap completed={done()} />);
    expect(
      screen.getByRole('listbox', {name: 'Progression map'}),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(TILES.length);
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('marks the chosen tile as the selected option', () => {
    render(<ProgressionMap completed={done()} selected="origin/first-world" />);
    expect(
      screen.getByRole('option', {name: /^First light\./, selected: true}),
    ).toBeInTheDocument();
  });

  it('says a tile’s state in words, not only in color', async () => {
    render(<ProgressionMap completed={done('origin/first-world')} />);
    expect(
      screen.getByRole('option', {name: /First light\. Origin\. Done\./}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', {
        name: /Make it go\. Input\. Ready to start\./,
      }),
    ).toBeInTheDocument();
  });

  it('says what a locked tile is waiting for', () => {
    render(<ProgressionMap completed={done()} />);
    expect(
      screen.getByRole('option', {
        name: /Up\. Platformer\. Locked — needs A key is an event and Down\./,
      }),
    ).toBeInTheDocument();
  });

  it('tells the caller which tile was chosen', async () => {
    const onSelect = vi.fn();
    render(<ProgressionMap completed={done()} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('option', {name: /^First light\./}));
    expect(onSelect).toHaveBeenCalledWith('origin/first-world');
  });

  // One tab stop for the whole map, not sixty-seven. The arrows move within it;
  // Tab leaves it. Sixty-seven tab stops is what makes a keyboard user give up.
  it('is one tab stop', () => {
    const {container} = render(<ProgressionMap completed={done()} />);
    const stops = container.querySelectorAll('[data-tile][tabindex="0"]');
    expect(stops).toHaveLength(1);
  });

  it('moves between tiles on the arrow keys', async () => {
    const onSelect = vi.fn();
    render(
      <ProgressionMap
        completed={done()}
        selected="origin/first-world"
        onSelect={onSelect}
      />,
    );
    const origin = screen.getByRole('option', {name: /^First light\./});
    origin.focus();
    await userEvent.keyboard('{ArrowRight}');
    // East of Origin is Motion's first tile — the only cell in that direction.
    expect(onSelect).toHaveBeenCalledWith('motion/speed');
  });
});

/**
 * A pointer event jsdom will actually carry the coordinates of.
 *
 * `fireEvent.pointerDown(el, {button: 0, clientX: 100})` looks like it does
 * this and does not: jsdom has no `PointerEvent`, testing-library falls back to
 * a plain `Event`, and `button` and `clientX` arrive as `undefined` — so a
 * handler that checks `event.button !== 0` returns early and the test silently
 * exercises nothing. A `MouseEvent` of the right TYPE carries both, and React
 * dispatches on the type.
 */
const pointer = (
  type: 'pointerdown' | 'pointermove' | 'pointerup',
  init: MouseEventInit = {},
) => new MouseEvent(type, {bubbles: true, button: 0, ...init});

describe('panning', () => {
  // The bug this pins was invisible in jsdom and total in a browser: capturing
  // the pointer on pointerdown sends the pointerup to the <svg>, so the click
  // resolves against the common ancestor and no tile's onClick ever runs.
  // Every tile was unclickable and the map still panned perfectly.
  it('does not take the pointer until the pointer has moved', () => {
    const {container} = render(<ProgressionMap completed={done()} />);
    const svg = container.querySelector('svg')!;
    const capture = vi.fn();
    (svg as unknown as {setPointerCapture: unknown}).setPointerCapture =
      capture;

    fireEvent(svg, pointer('pointerdown', {clientX: 100, clientY: 100}));
    expect(capture).not.toHaveBeenCalled();

    fireEvent(svg, pointer('pointermove', {clientX: 102, clientY: 100}));
    expect(capture).not.toHaveBeenCalled();

    fireEvent(svg, pointer('pointermove', {clientX: 140, clientY: 130}));
    expect(capture).toHaveBeenCalled();
  });

  it('does not choose the tile a drag happened to end on', async () => {
    const onSelect = vi.fn();
    const {container} = render(
      <ProgressionMap completed={done()} onSelect={onSelect} />,
    );
    const svg = container.querySelector('svg')!;
    const tile = screen.getByRole('option', {name: /^First light\./});

    fireEvent(svg, pointer('pointerdown', {clientX: 100, clientY: 100}));
    fireEvent(svg, pointer('pointermove', {clientX: 180, clientY: 160}));
    fireEvent(svg, pointer('pointerup', {clientX: 180, clientY: 160}));
    fireEvent.click(tile);
    expect(onSelect).not.toHaveBeenCalled();

    // …and the next plain click still works.
    await userEvent.click(tile);
    expect(onSelect).toHaveBeenCalledWith('origin/first-world');
  });
});

describe('moving in a direction', () => {
  // Not "the neighbor in that direction": six neighbors do not fit on four
  // keys. Nearest-in-direction has to cross the holes in the map, which is the
  // case a strict neighbor walk cannot do at all.
  it('crosses a hole rather than stopping at it', () => {
    // Nothing sits between the tip of Place's spike and the tiles east of it,
    // so a walk that only ever stepped to a neighbor would stop here.
    const from = tile('place/camera-feel');
    const east = nearestInDirection(TILES, from, {x: 1, y: 0});
    expect(east).toBeDefined();
    expect(adjacent(from.at, east!.at)).toBe(false);
  });

  it('finds nothing past the edge of the map', () => {
    const corner = tile('making/read');
    expect(nearestInDirection(TILES, corner, {x: 1, y: 0})).toBeUndefined();
  });

  it('prefers the tile most squarely in the direction asked for', () => {
    const east = nearestInDirection(TILES, tile('origin/first-world'), {
      x: 1,
      y: 0,
    });
    expect(east!.id).toBe('motion/speed');
  });
});
