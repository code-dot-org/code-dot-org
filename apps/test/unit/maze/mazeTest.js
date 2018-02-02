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
    beforeEach(function () {
      document.body.innerHTML = '<div id="svgMaze"><div class="pegman-location"></div></div>';
      Maze.map = MazeMap.deserialize(dirtMap, Cell);
      Maze.subtype = new Farmer(Maze, {}, {
        skin: {
          dirt: 'dirt.png'
        },
        level: {},
      });
      Maze.subtype.createDrawer(document.getElementById('svgMaze'));
      Maze.pegmanX = 0;
      Maze.pegmanY = 0;
    });

    it("can cycle through all types", function () {
      var dirtId = DirtDrawer.cellId('', Maze.pegmanX, Maze.pegmanY);
      var image;

      // image starts out nonexistant
      expect(document.getElementById(dirtId)).to.be.null;

      Maze.scheduleFill();
      image = document.getElementById(dirtId);
      // image now exists and is dirt
      expect(image).not.to.be.null;
      expect(image.getAttribute('x')).to.equal("-550");

      Maze.scheduleDig();
      image = document.getElementById(dirtId);
      // tile is flat, image is therefore hidden
      expect(image).not.to.be.null;
      expect(image.getAttribute('visibility')).to.equal('hidden');

      Maze.scheduleDig();
      image = document.getElementById(dirtId);
      // image is a holde
      expect(image).not.to.be.null;
      expect(image.getAttribute('x')).to.equal("-500");

      Maze.scheduleFill();
      image = document.getElementById(dirtId);
      // tile is flat, image is therefore hidden
      expect(image).not.to.be.null;
      expect(image.getAttribute('visibility')).to.equal('hidden');
    });
  });
});
