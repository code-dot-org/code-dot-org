import {describe, expect, it} from 'vitest';

import Farmer from '../Farmer';
import MazeController, {type MazeData} from '../MazeController';
import Cell from '../Cell';
import Validator from '../Validator';
import skins, {skinFor} from '../skins';

// Pins Author Mode gate #2's cheap extra: a real farmer level also has no
// finish tile — win is every pile filled and every hole dug (legacy
// FarmerHandler.isDirtCorrect_, apps/src/maze/results/farmer.js).
const farmerSkin = skinFor(skins, 'farmer');

// One row: col 0 start, col 1 a pile (positive dirt), col 2 a hole
// (negative dirt).
function makeFarmerController(): MazeController {
  const level = {
    map: [['2', '1', '1']],
    initialDirt: [[0, 3, -2]],
    startDirection: 1,
  } as MazeData;
  return new MazeController(level, farmerSkin, {skinId: 'farmer'});
}

describe('Farmer goal-based win condition', () => {
  it('fails while any pile or hole is not yet at zero', () => {
    const controller = makeFarmerController();
    controller.subtype.initStartFinish();
    const validator = new Validator(controller);
    expect(validator.succeeded()).toBe(false);
  });

  it('fails when the pile is filled but the hole is not yet dug', () => {
    const controller = makeFarmerController();
    controller.subtype.initStartFinish();
    (controller.subtype as Farmer<Cell>).setValue(0, 1, 0);
    const validator = new Validator(controller);
    expect(validator.succeeded()).toBe(false);
  });

  it('succeeds once every pile and hole reaches zero', () => {
    const controller = makeFarmerController();
    controller.subtype.initStartFinish();
    const farmer = controller.subtype as Farmer<Cell>;
    farmer.setValue(0, 1, 0);
    farmer.setValue(0, 2, 0);
    const validator = new Validator(controller);
    expect(validator.succeeded()).toBe(true);
  });

  it('still wins by position when the level has a finish tile', () => {
    const level = {
      map: [['2', '3']],
      startDirection: 1,
    } as MazeData;
    const controller = new MazeController(level, farmerSkin, {
      skinId: 'farmer',
    });
    controller.subtype.initStartFinish();
    controller.setPegmanX(1);
    controller.setPegmanY(0);
    const validator = new Validator(controller);
    expect(validator.succeeded()).toBe(true);
  });
});
