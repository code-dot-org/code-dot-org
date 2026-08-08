// Where a backdrop goes once the camera has moved.
//
// The bug this exists to stop: a tiled slot is a child of its layer's
// container, and the camera slides that container. A finite rectangle of one
// viewport rode along with it and ran out — pan a quarter of a viewport and a
// quarter-viewport band of bare clear-colour appeared at the trailing edge,
// which is the exact opposite of what "tiled" promises.
//
// So the interesting tests are not the formulas, which would only restate
// themselves. They are the two RELATIONSHIPS: that a tiled sprite lands over
// the viewport whatever the container did, and that its picture nonetheless
// ends up where riding along would have put it.

import {describe, expect, it} from 'vitest';

import {VIEWPORT_HEIGHT, VIEWPORT_WIDTH} from '../../viewport';
import {
  layerShift,
  placementParallax,
  stretchedPlacement,
  tiledPlacement,
  type LayerMotion,
  type Shift,
} from '../backdropPlacement';

const MOVES_WITH_VIEW: LayerMotion = {parallax: {x: 1, y: 1}, fit: false};
const SKY: LayerMotion = {parallax: {x: 0.2, y: 0}, fit: false};
const INTERFACE: LayerMotion = {parallax: {x: 1, y: 1}, fit: true};
const PINNED: LayerMotion = {parallax: {x: 0, y: 0}, fit: false};

const CENTRE = {x: VIEWPORT_WIDTH / 2, y: VIEWPORT_HEIGHT / 2};
const NO_OFFSET = {x: 0, y: 0};

/**
 * Where a slot actually lands on screen: its layer's container is placed at the
 * negative of the shift, and the slot is a child of it.
 */
const onScreen = (
  shift: {x: number; y: number},
  local: {x: number; y: number},
) => ({
  x: -shift.x + local.x,
  y: -shift.y + local.y,
});

describe('layerShift', () => {
  it('moves a normal layer with the view', () => {
    expect(layerShift(MOVES_WITH_VIEW, {x: 80, y: 40})).toEqual({x: 80, y: 40});
  });

  it('scales a parallax layer per axis', () => {
    // A sky that shifts as the player walks and stays put when they jump.
    expect(layerShift(SKY, {x: 100, y: 50})).toEqual({x: 20, y: 0});
  });

  it('does not move a fit layer, whatever its parallax says', () => {
    // `fit` does not consult the camera at all — that is what makes an
    // interface layer an interface layer, and it wins over the factor.
    expect(layerShift(INTERFACE, {x: 100, y: 50})).toEqual({x: 0, y: 0});
  });

  it('does not move a layer at factor zero', () => {
    expect(layerShift(PINNED, {x: 100, y: 50})).toEqual({x: 0, y: 0});
  });

  it('does not move a layer that is not there', () => {
    expect(layerShift(undefined, {x: 100, y: 50})).toEqual({x: 0, y: 0});
  });
});

describe('a tiled slot', () => {
  it('lands over the viewport however far the camera moved', () => {
    // THE regression. Before the fix the sprite sat at the viewport centre in
    // LOCAL coordinates, so the container's translation moved it bodily off
    // the screen and its far edge came into view.
    for (const camera of [
      {x: 0, y: 0},
      {x: 80, y: 0},
      {x: -240, y: 160},
      {x: 5000, y: -5000},
    ]) {
      const shift = layerShift(MOVES_WITH_VIEW, camera);
      const {position} = tiledPlacement(shift, NO_OFFSET);

      expect(onScreen(shift, position)).toEqual(CENTRE);
    }
  });

  it('lands over the viewport for a parallax layer too', () => {
    const shift = layerShift(SKY, {x: 100, y: 50});
    const {position} = tiledPlacement(shift, NO_OFFSET);

    expect(onScreen(shift, position)).toEqual(CENTRE);
  });

  it('scrolls its picture the way riding along would have moved it', () => {
    // The other half. Staying put is only right if the PICTURE still tracks the
    // world — otherwise the background is nailed to the screen and the game
    // looks like it is not moving. A rising tile position scrolls the picture
    // left, and a camera moving right moves the world left, so they agree in
    // sign.
    const shift = layerShift(MOVES_WITH_VIEW, {x: 80, y: 40});

    expect(tiledPlacement(shift, NO_OFFSET).tile).toEqual({x: 80, y: 40});
  });

  it('adds the author’s own slide to the camera’s', () => {
    // `slide background` is negated against the camera: raising it moves the
    // picture the way raising a position moves an actor.
    const shift = layerShift(MOVES_WITH_VIEW, {x: 80, y: 40});

    expect(tiledPlacement(shift, {x: 30, y: 10}).tile).toEqual({x: 50, y: 30});
  });

  it('is unmoved with a resting camera, as it always was', () => {
    const {position, tile} = tiledPlacement({x: 0, y: 0}, NO_OFFSET);

    expect(position).toEqual(CENTRE);
    expect(tile).toEqual({x: 0, y: 0});
  });
});

describe('a stretched slot', () => {
  const MAP = {x: VIEWPORT_WIDTH * 3, y: VIEWPORT_HEIGHT * 2};

  /**
   * Whether the picture covers the window at one camera position.
   *
   * Its layer's container sits at the negative of the shift, so the image's
   * screen span is its local span translated by that — and what has to be true
   * is that the span contains `[0, viewport]` on both axes.
   */
  const covers = (parallax: {x: number; y: number}, camera: Shift) => {
    const {position, size} = stretchedPlacement(NO_OFFSET, MAP, parallax);
    const shift = layerShift({parallax, fit: false}, camera);
    const left = -shift.x + position.x - size.x / 2;
    const top = -shift.y + position.y - size.y / 2;
    return (
      left <= 0 &&
      left + size.x >= VIEWPORT_WIDTH &&
      top <= 0 &&
      top + size.y >= VIEWPORT_HEIGHT
    );
  };

  /** Every camera position inside the map, at both extremes and between. */
  const acrossTheMap = (parallax: {x: number; y: number}) => {
    const span = {x: MAP.x - VIEWPORT_WIDTH, y: MAP.y - VIEWPORT_HEIGHT};
    const uncovered: string[] = [];
    for (let step = 0; step <= 20; step++) {
      const camera = {x: (span.x * step) / 20, y: (span.y * step) / 20};
      if (!covers(parallax, camera)) {
        uncovered.push(`${camera.x},${camera.y}`);
      }
    }
    return uncovered;
  };

  it('stretches over the MAP, centred on it, at the usual factor', () => {
    // What a learner means by a background: it belongs to the level, not to the
    // window onto the level. One viewport at the viewport's centre covered
    // exactly one camera position and rode away from every other.
    const {position, size} = stretchedPlacement(NO_OFFSET, MAP, {x: 1, y: 1});

    expect(size).toEqual(MAP);
    expect(position).toEqual({x: MAP.x / 2, y: MAP.y / 2});
  });

  it('covers the window from every camera position, at every factor', () => {
    // The requirement the formula is derived from, checked rather than
    // restated. Includes above 1 — the block offers "runs ahead of it", and a
    // layer that outruns the world needs more picture than the world has, so
    // map-sizing alone would gap at the far end.
    for (const factor of [0, 0.2, 0.5, 1, 1.5, 2]) {
      expect(acrossTheMap({x: factor, y: factor})).toEqual([]);
    }
  });

  it('covers it with the factor reversed, too', () => {
    // Negative runs backwards, which moves the slack to the other side.
    expect(acrossTheMap({x: -0.5, y: -0.5})).toEqual([]);
  });

  it('is one viewport at rest for a fixed layer, exactly as before', () => {
    // `fit` is parallax zero here — its container never moves — so screen
    // furniture is untouched by any of this.
    const fixed = placementParallax(INTERFACE);
    const {position, size} = stretchedPlacement(NO_OFFSET, MAP, fixed);

    expect(fixed).toEqual({x: 0, y: 0});
    expect(size).toEqual({x: VIEWPORT_WIDTH, y: VIEWPORT_HEIGHT});
    expect(position).toEqual(CENTRE);
  });

  it('is one viewport in a world with no map', () => {
    // `mapBounds` is the viewport until a map says otherwise, so the pan range
    // is zero and every factor collapses to what this drew before.
    for (const factor of [0, 0.5, 1, 2]) {
      const {position, size} = stretchedPlacement(
        NO_OFFSET,
        {x: VIEWPORT_WIDTH, y: VIEWPORT_HEIGHT},
        {x: factor, y: factor},
      );

      expect(size).toEqual({x: VIEWPORT_WIDTH, y: VIEWPORT_HEIGHT});
      expect(position).toEqual(CENTRE);
    }
  });

  it('still lets the author slide it off the edge', () => {
    // An offset on a stretched slot moves the picture bodily, gap and all —
    // that is what it means, and the tooltip points at tiled for the rest.
    const {position} = stretchedPlacement({x: 30, y: 10}, MAP, {x: 1, y: 1});

    expect(position).toEqual({x: MAP.x / 2 + 30, y: MAP.y / 2 + 10});
  });
});
