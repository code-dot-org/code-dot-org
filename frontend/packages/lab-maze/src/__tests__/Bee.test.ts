import Bee from '../Bee';
import BeeCell, {FeatureType} from '../BeeCell';
import MazeController, {Configuration} from '../MazeController';
import MazeMap from '../MazeMap';
import type {Skin} from '../skin';

import {baseLevel, mockSkin} from './data';

jest.mock('../MazeController');

describe('Bee', () => {
  describe('isRedFlower', () => {
    /**
     * Shim a 1x1 maze with the given values and validate that we get the
     * expected result when calling isRedFlower
     */
    const validate = (
      flowerType: string,
      mapValue: string | number,
      initialDirtValue: number,
      expected: boolean,
      msg: string,
    ) => {
      const map: (string | number)[][] = [[mapValue]];

      const config = {
        level: {
          ...baseLevel,
          flowerType: flowerType,
          map,
          initialDirt: [[initialDirtValue]],
        },
        skin: mockSkin,
      };
      const maze = new MazeController(
        config.level,
        config.skin as Skin,
        config as Configuration,
        {},
      );
      maze.map = MazeMap.parseFromOldValues(
        config.level.map,
        config.level.initialDirt,
        BeeCell,
      );
      const bee = new Bee(maze, config);
      expect({msg, result: bee.isRedFlower(0, 0)}).toEqual({
        msg,
        result: expected,
      });
    };

    it('red default', () => {
      validate('redWithNectar', 1, 1, true, 'default flower');
      validate('redWithNectar', 1, -1, false, 'default hive');
      validate('redWithNectar', 'P', 1, false, 'overriden purple');
      validate('redWithNectar', 'R', 1, true, 'overriden red');
      validate('redWithNectar', 'FC', 1, true, 'overriden cloud');
    });

    it('purple default', () => {
      validate('purpleNectarHidden', 1, 1, false, 'default flower');
      validate('purpleNectarHidden', 1, -1, false, 'default hive');
      validate('purpleNectarHidden', 'P', 1, false, 'overriden purple');
      validate('purpleNectarHidden', 'R', 1, true, 'overriden red');
      validate('purpleNectarHidden', 'FC', 1, false, 'overriden cloud');
    });
  });

  describe('getting nectar', () => {
    it('builds the map', () => {
      const map = new MazeMap([[new BeeCell(1, FeatureType.FLOWER, 2)]]);

      const config = {
        level: baseLevel,
        skin: mockSkin,
      };

      const maze = new MazeController(
        config.level,
        config.skin as Skin,
        config as Configuration,
        {},
      );
      maze.map = map;
      maze.getPegmanX = jest.fn().mockReturnValue(0);
      maze.getPegmanY = jest.fn().mockReturnValue(0);
      const bee = new Bee(maze, config);

      const flowerEmptySpy = jest.fn();
      bee.on('flowerEmpty', flowerEmptySpy);
      bee.reset();
      expect((bee.getCell(0, 0) as BeeCell | undefined)?.isFlower()).toEqual(
        true,
      );

      // Can get nectar twice.
      expect(bee.tryGetNectar()).toEqual(true);
      expect(bee.tryGetNectar()).toEqual(true);

      // Getting nectar again returns false, and emits a "flowerEmpty" event.
      expect(bee.tryGetNectar()).toEqual(false);
      expect(flowerEmptySpy).toHaveBeenCalledTimes(1);
    });
  });
});
