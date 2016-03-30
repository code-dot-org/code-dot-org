var chai = require('chai');
chai.config.includeStack = true;
var assert = chai.assert;

var testUtils = require('./util/testUtils');

testUtils.setupLocales();

var Bee = require('@cdo/apps/maze/bee');
var BeeCell = require('@cdo/apps/maze/beeCell');
var MazeMap = require('@cdo/apps/maze/mazeMap');
var utils = require('@cdo/apps/utils');

var baseLevel = {
  honeyGoal: 1,
  map: [
    [ 0 ]
  ],
  flowerType: 'redWithNectar',
  startDirection: 1,
  initialDirt: [
    [ 0 ]
  ]
};

describe("Bee", function () {
  it("fails if no flowerType", function () {
    var maze = {};
    var config = {
      level: baseLevel
    };
    delete config.level.flowerType;
    assert.throws(function () {
      new Bee(maze, null, config);
    }, Error, /bad flowerType for Bee/);
  });


  it("fails if invalid flowerType", function () {
    var maze = {};
    var config = {
      level: utils.extend(baseLevel, {
        flowerType: 'invalid'
      })
    };
    assert.throws(function () {
      new Bee(maze, null, config);
    }, Error, /bad flowerType for Bee/);
  });

  describe("isRedFlower", function () {
    /**
     * Shim a 1x1 maze with the given values and validate that we get the
     * expected result when calling isRedFlower
     */
    function validate(flowerType, mapValue, initialDirtValue, expected, msg) {
      var map = [[mapValue]];

      var config = {
        level: utils.extend(baseLevel, {
          flowerType: flowerType,
          map: map,
          initialDirt: [[initialDirtValue]]
        })
      };
      var maze = {
        map: MazeMap.parseFromOldValues(config.level.map, config.level.initialDirt, BeeCell)
      };
      var bee = new Bee(maze, null, config);
      assert.equal(bee.isRedFlower(0, 0), expected, msg);
    }

    it("red default", function () {
      validate('redWithNectar', 1, 1, true, 'default flower');
      validate('redWithNectar', 1, -1, false, 'default hive');
      validate('redWithNectar', 'P', 1, false, 'overriden purple');
      validate('redWithNectar', 'R', 1, true, 'overriden red');
      validate('redWithNectar', 'FC', 1, true, 'overriden cloud');
    });

    it("purple default", function () {
      validate('purpleNectarHidden', 1, 1, false, 'default flower');
      validate('purpleNectarHidden', 1, -1, false, 'default hive');
      validate('purpleNectarHidden', 'P', 1, false, 'overriden purple');
      validate('purpleNectarHidden', 'R', 1, true, 'overriden red');
      validate('purpleNectarHidden', 'FC', 1, false, 'overriden cloud');
    });
  });
});
