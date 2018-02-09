import { expect } from '../../util/configuredChai';
import Cell from '@cdo/apps/maze/cell';
import DirtDrawer from '@cdo/apps/maze/dirtDrawer';
import Farmer from '@cdo/apps/maze/farmer';
import Maze from '@cdo/apps/maze/maze';
import MazeMap from '@cdo/apps/maze/mazeMap';

describe("Maze", function () {
  var dirtMap = [
    [{
      "tileType": 2
    }, {
      "tileType": 1,
      "value": 1
    }, {
      "tileType": 1,
      "value": -1
    }],
  ];

  describe("scheduleDirtChange", function () {
    let maze;

    beforeEach(function () {
      document.body.innerHTML = '<div id="svgMaze"><div class="pegman-location"></div></div>';
      maze = new Maze();
      maze.map = MazeMap.deserialize(dirtMap, Cell);
      maze.subtype = new Farmer(maze, {}, {
        skin: {
          dirt: 'dirt.png'
        },
        level: {},
      });
      maze.subtype.createDrawer(document.getElementById('svgMaze'));
      maze.pegmanX = 0;
      maze.pegmanY = 0;
    });

    it("can cycle through all types", function () {
      var dirtId = DirtDrawer.cellId('', maze.pegmanX, maze.pegmanY);
      var image;

      // image starts out nonexistant
      expect(document.getElementById(dirtId), 'image starts out nonexistant').to.be.null;

      maze.scheduleFill();
      image = document.getElementById(dirtId);
      // image now exists and is dirt
      expect(image).not.to.be.null;
      expect(image.getAttribute('x'), 'image is dirt').to.equal("-550");

      maze.scheduleDig();
      image = document.getElementById(dirtId);
      // tile is flat, image is therefore hidden
      expect(image, 'image now exists').not.to.be.null;
      expect(image.getAttribute('visibility'), 'tile is flat, image is therefore hidden').to.equal('hidden');

      maze.scheduleDig();
      image = document.getElementById(dirtId);
      // image is a holde
      expect(image, 'image now exists').not.to.be.null;
      expect(image.getAttribute('x'), 'image is a hole').to.equal("-500");

      maze.scheduleFill();
      image = document.getElementById(dirtId);
      // tile is flat, image is therefore hidden
      expect(image, 'image now exists').not.to.be.null;
      expect(image.getAttribute('visibility'), 'tile is flat, image is therefore hidden').to.equal('hidden');
    });
  });
});
