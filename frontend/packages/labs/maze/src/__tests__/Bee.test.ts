import {beforeEach, describe, expect, it} from 'vitest';

import Bee from '../Bee';
import MazeController, {type MazeData} from '../MazeController';
import Validator from '../Validator';
import skins, {skinFor} from '../skins';

// Pins the fix for Author Mode gate #2: a real bee level has no finish
// tile — Validator.succeeded() used to only ever compare Pegman's position
// to subtype.finish, so a bee level could never be won regardless of what
// the program collected. These pin Validator.succeeded() delegating to
// Bee.succeeded() (nectar/honey goals, cloud/purple checks) whenever there
// is no finish tile, matching legacy BeeHandler.succeeded()
// (apps/src/maze/results/bee.js).
const beeSkin = skinFor(skins, 'bee');

// One row: col 0 start, col 1 a red flower (nectar capacity 2), col 2 a
// hive (honey capacity 1). BeeCell.parseFromOldValues requires the mapCell
// string to contain '1' for a feature cell, and reads the feature/sign from
// initialDirt (positive = flower, negative = hive).
function makeBeeController(overrides: Partial<MazeData> = {}): MazeController {
  const level = {
    map: [['2', '1', '1']],
    initialDirt: [[0, 2, -1]],
    startDirection: 1,
    flowerType: 'redWithNectar',
    ...overrides,
  } as MazeData;
  return new MazeController(level, beeSkin, {skinId: 'bee'});
}

let controller: MazeController;
let bee: Bee;
let validator: Validator;

describe('Bee goal-based win condition', () => {
  beforeEach(() => {
    controller = makeBeeController({nectarGoal: 2, honeyGoal: 1});
    controller.subtype.initStartFinish();
    bee = controller.subtype as Bee;
    // reset() allocates userChecks_ — the cloud/purple-check tracker
    // checkedAllClouded/checkedAllPurple read; real usage always resets
    // once before a run (MazeController.reset()).
    bee.reset();
    validator = new Validator(controller);
  });

  it('fails before any nectar/honey is collected', () => {
    expect(validator.succeeded()).toBe(false);
  });

  it('fails when only the nectar goal is met', () => {
    controller.setPegmanX(1);
    controller.setPegmanY(0);
    bee.tryGetNectar();
    bee.tryGetNectar();
    expect(validator.succeeded()).toBe(false);
  });

  it('succeeds once both the nectar and honey goals are met', () => {
    controller.setPegmanX(1);
    controller.setPegmanY(0);
    bee.tryGetNectar();
    bee.tryGetNectar();
    controller.setPegmanX(2);
    controller.setPegmanY(0);
    bee.tryMakeHoney();
    expect(validator.succeeded()).toBe(true);
  });

  it('is unaffected by a partial run — a fresh reset clears collected totals', () => {
    controller.setPegmanX(1);
    controller.setPegmanY(0);
    bee.tryGetNectar();
    bee.tryGetNectar();
    controller.setPegmanX(2);
    controller.setPegmanY(0);
    bee.tryMakeHoney();
    expect(validator.succeeded()).toBe(true);

    bee.reset();
    expect(validator.succeeded()).toBe(false);
  });
});

describe('Bee goal-based win condition — purple flowers must be checked', () => {
  // A purple flower hides its nectar count from the player (Gap 3's
  // flowerType); the win condition still requires the program to have
  // queried it via nectarRemaining(userCheck=true) at least once, exactly
  // like legacy's checkedAllPurple gate.
  function makePurpleController(): MazeController {
    const level = {
      map: [['2', 'P']],
      initialDirt: [[0, 3]],
      startDirection: 1,
      flowerType: 'purpleNectarHidden',
    } as MazeData;
    return new MazeController(level, beeSkin, {skinId: 'bee'});
  }

  it('fails until the purple flower has been checked, even with no goal set', () => {
    const purpleController = makePurpleController();
    purpleController.subtype.initStartFinish();
    const purpleBee = purpleController.subtype as Bee;
    purpleBee.reset();
    const purpleValidator = new Validator(purpleController);

    purpleController.setPegmanX(1);
    purpleController.setPegmanY(0);
    expect(purpleValidator.succeeded()).toBe(false);

    purpleBee.nectarRemaining(true);
    expect(purpleValidator.succeeded()).toBe(true);
  });
});

describe('Bee — finish-tile levels keep position-based win (unchanged)', () => {
  it('wins by reaching the finish tile regardless of unmet goals', () => {
    const finishController = makeBeeController({
      map: [['2', '3']],
      initialDirt: undefined,
      nectarGoal: 5,
      honeyGoal: 5,
    });
    finishController.subtype.initStartFinish();
    finishController.setPegmanX(1);
    finishController.setPegmanY(0);
    const finishValidator = new Validator(finishController);
    expect(finishValidator.succeeded()).toBe(true);
  });

  it('fails by position even once goals are met, when a finish tile exists', () => {
    const finishController = makeBeeController({
      map: [['2', '1', '3']],
      initialDirt: [[0, 1, 0]],
      nectarGoal: 1,
      honeyGoal: 0,
    });
    finishController.subtype.initStartFinish();
    const finishBee = finishController.subtype as Bee;
    finishController.setPegmanX(1);
    finishController.setPegmanY(0);
    finishBee.tryGetNectar();
    // Goal met, but Pegman never reached the finish tile at col 2.
    const finishValidator = new Validator(finishController);
    expect(finishValidator.succeeded()).toBe(false);
  });
});
