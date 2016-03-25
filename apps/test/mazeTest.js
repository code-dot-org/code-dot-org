var testUtils = require('./util/testUtils');
var Maze = require('@cdo/apps/maze/maze');
var MazeMap = require('@cdo/apps/maze/mazeMap');
var DirtDrawer = require('@cdo/apps/maze/dirtDrawer');
var Cell = require('@cdo/apps/maze/cell');
var assert = testUtils.assert;
var cellId = require('@cdo/apps/maze/mazeUtils').cellId;
var studioApp = require('@cdo/apps/StudioApp').singleton;

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
      Maze.gridItemDrawer = new DirtDrawer(Maze.map, "http://fakedirt.png");
      Maze.pegmanX = 0;
      Maze.pegmanY = 0;
    });

    it("can cycle through all types", function () {
      var dirtId = cellId('dirt', Maze.pegmanX, Maze.pegmanY);
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
});
