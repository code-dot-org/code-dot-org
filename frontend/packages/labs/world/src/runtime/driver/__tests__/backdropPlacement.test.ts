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
  stretchedPlacement,
  tiledPlacement,
  type LayerMotion,
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
  it('still moves bodily with its layer', () => {
    // Deliberately NOT given the tiled treatment. One picture that rides along
    // is what stretched means; the gap it can leave at the edge is the sign
    // that tiled was wanted, and the block's tooltip says so.
    expect(stretchedPlacement(NO_OFFSET)).toEqual(CENTRE);
    expect(stretchedPlacement({x: 30, y: 10})).toEqual({
      x: CENTRE.x + 30,
      y: CENTRE.y + 10,
    });
  });
});
