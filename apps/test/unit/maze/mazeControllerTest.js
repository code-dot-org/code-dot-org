import { expect } from '../../util/configuredChai';
import DirtDrawer from '@cdo/apps/maze/dirtDrawer';
import MazeController from '@cdo/apps/maze/mazeController';

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
    let mazeController;

    beforeEach(function () {
      document.body.innerHTML = '<div id="svgMaze"><div class="pegman-location"></div></div>';
      mazeController = new MazeController({
        serializedMaze: dirtMap
      }, {
      }, {
        skinId: 'farmer',
        level: {},
        skin: {
          dirt: 'dirt.png'
        }
      });
      mazeController.subtype.createDrawer(document.getElementById('svgMaze'));
      mazeController.pegmanX = 0;
      mazeController.pegmanY = 0;
    });

    it("can cycle through all types", function () {
      var dirtId = DirtDrawer.cellId('', mazeController.pegmanX, mazeController.pegmanY);
      var image;

      // image starts out nonexistant
      expect(document.getElementById(dirtId), 'image starts out nonexistant').to.be.null;

      mazeController.scheduleFill_();
      image = document.getElementById(dirtId);
      // image now exists and is dirt
      expect(image).not.to.be.null;
      expect(image.getAttribute('x'), 'image is dirt').to.equal("-550");

      mazeController.scheduleDig_();
      image = document.getElementById(dirtId);
      // tile is flat, image is therefore hidden
      expect(image, 'image now exists').not.to.be.null;
      expect(image.getAttribute('visibility'), 'tile is flat, image is therefore hidden').to.equal('hidden');

      mazeController.scheduleDig_();
      image = document.getElementById(dirtId);
      // image is a holde
      expect(image, 'image now exists').not.to.be.null;
      expect(image.getAttribute('x'), 'image is a hole').to.equal("-500");

      mazeController.scheduleFill_();
      image = document.getElementById(dirtId);
      // tile is flat, image is therefore hidden
      expect(image, 'image now exists').not.to.be.null;
      expect(image.getAttribute('visibility'), 'tile is flat, image is therefore hidden').to.equal('hidden');
    });
  });
});
