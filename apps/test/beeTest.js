var chai = require('chai');
chai.config.includeStack = true;
var assert = chai.assert;

var testUtils = require('./util/testUtils');

testUtils.setupLocales();

var Bee = require('@cdo/apps/maze/bee');
var utils = require('@cdo/apps/utils');

var baseLevel = {
  honeyGoal: 1,
  map: [
    [ 0 ]
  ],
  flowerType: 'redWithNectar',
  startDirection: 1,
  rawDirt: [
    [ 0 ]
  ]
};

describe("Bee", function () {
  it("fails if no flowerType", function () {
    var maze = {};
    var config = {
      level:  utils.extend(baseLevel, {
        flowerType: undefined
      })
    };
    assert.throws(function () {
      /* jshint nonew:false */
      new Bee(maze, null, config);
      /* jshint nonew:true */
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
      /* jshint nonew:false */
      new Bee(maze, null, config);
      /* jshint nonew:true */
    }, Error, /bad flowerType for Bee/);
  });

  describe("isRedFlower", function () {
    /**
     * Shim a 1x1 maze with the given values and validate that we get the
     * expected result when calling isRedFlower
     */
    function validate(flowerType, rawDirtValue, expected, msg) {
      var maze = {};
      var config = {
        level: utils.extend(baseLevel, {
          flowerType: flowerType,
          rawDirt: [[rawDirtValue]]
        })
      };
      var bee = new Bee(maze, null, config);
      assert.equal(bee.isRedFlower(0, 0), expected, msg);
    }

    it("red default", function () {
      validate('redWithNectar', '+1', true, 'default flower');
      validate('redWithNectar', '-1', false, 'default hive');
      validate('redWithNectar', '+1P', false, 'overriden purple');
      validate('redWithNectar', '+1R', true, 'overriden red');
      validate('redWithNectar', '+1FC', true, 'overriden cloud');
    });

    it("purple default", function () {
      validate('purpleNectarHidden', '+1', false, 'default flower');
      validate('purpleNectarHidden', '-1', false, 'default hive');
      validate('purpleNectarHidden', '+1P', false, 'overriden purple');
      validate('purpleNectarHidden', '+1R', true, 'overriden red');
      validate('purpleNectarHidden', '+1FC', false, 'overriden cloud');
    });
  });

  describe("variable grids", function () {
    function validate(rawDirtValues, expected) {
      var maze = {};
      var config = {
        level: utils.extend(baseLevel, {
          rawDirt: [rawDirtValues]
        })
      };
      var bee = new Bee(maze, null, config);
      assert.equal(bee.staticGrids.length, expected);
    }

    it("generates a single static grid when no variable cells are specified", function () {
      validate([0], 1);
      validate([1], 1);
      validate([2], 1);
      validate(["+1"], 1);
    });

    it("generates the correct number of static grids when some variable cells are specified", function () {
      validate(["+1C"], 2);
      validate(["-1C"], 2);
      validate(["1C"], 2);
      validate(["1Cany"], 3);
      validate(["+1C", "-1C"], 4);
      validate(["+1C", "1Cany"], 6);
    });
  });

  describe("staticGrids", function () {
    var bee;

    beforeEach(function () {
      var maze = {};
      var config = {
        level: utils.extend(baseLevel, {
          rawDirt: [["1Cany"]]
        })
      };
      bee = new Bee(maze, null, config);
    });

    it("can switch between static grids", function () {
      bee.useGridWithId(0);
      assert.equal(bee.getValue(0, 0), 1);
      bee.useGridWithId(1);
      assert.equal(bee.getValue(0, 0), -1);
      bee.useGridWithId(2);
      assert.equal(bee.getValue(0, 0), 0);
    });

    it("switching grids resets current values", function () {
      bee.useGridWithId(0);
      assert.equal(bee.getValue(0, 0), 1);
      bee.setValue(0, 0, 50);
      assert.equal(bee.getValue(0, 0), 50);
      bee.useGridWithId(0);
      assert.equal(bee.getValue(0, 0), 1);
    });
  });
});
