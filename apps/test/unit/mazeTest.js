import {assert} from '../util/configuredChai';
var Maze = require('@cdo/apps/maze/maze');
var MazeMap = require('@cdo/apps/maze/mazeMap');
var DirtDrawer = require('@cdo/apps/maze/dirtDrawer');
var Cell = require('@cdo/apps/maze/cell');
var Farmer = require('@cdo/apps/maze/farmer');

describe("Maze", function () {
  var dirtMap = [
    [{
      "tileType": 1
    }, {
      "tileType": 1,
      "value": 1
    }, {
      "tileType": 1,
      "value": -1
    }],
  ];

  describe("scheduleDirtChange", function () {
    beforeEach(function () {
      document.body.innerHTML = '<div id="svgMaze"><div class="pegman-location"></div></div>';
      Maze.map = MazeMap.deserialize(dirtMap, Cell);
      Maze.subtype = new Farmer(Maze, {}, {
        skin: {
          dirt: 'dirt.png'
        }
      });
      Maze.subtype.createDrawer();
      Maze.pegmanX = 0;
      Maze.pegmanY = 0;
    });

    it("can cycle through all types", function () {
      var dirtId = DirtDrawer.cellId('', Maze.pegmanX, Maze.pegmanY);
      var image;

      assert.equal(document.getElementById(dirtId), null, 'image starts out nonexistent');

      Maze.scheduleFill();
      image = document.getElementById(dirtId);
      assert.notEqual(image, null, 'image now exists');
      assert.equal(image.getAttribute('x'), -550, 'image is dirt');

      Maze.scheduleDig();
      image = document.getElementById(dirtId);
      assert.notEqual(image, null, 'image now exists');
      assert.equal(image.getAttribute('visibility'), 'hidden', 'tile is flat, image is therefore hidden');

      Maze.scheduleDig();
      image = document.getElementById(dirtId);
      assert.notEqual(image, null, 'image now exists');
      assert.equal(image.getAttribute('x'), -500, 'image is a hole');

      Maze.scheduleFill();
      image = document.getElementById(dirtId);
      assert.notEqual(image, null, 'image now exists');
      assert.equal(image.getAttribute('visibility'), 'hidden', 'tile is flat, image is therefore hidden');
    });
  });

  it("rotate maze map", () => {
    const map = MazeMap.parseFromOldValues([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ], null, Cell);
    map.rotate();
    assert.deepEqual(map.grid_, MazeMap.parseFromOldValues([
      [3, 6, 9],
      [2, 5, 8],
      [1, 4, 7],
    ], null, Cell).grid_);
  });
});
