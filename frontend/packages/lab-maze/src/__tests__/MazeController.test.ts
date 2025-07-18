import DirtDrawer from '../DirtDrawer';
import MazeController from '../MazeController';

import {baseLevel, mockSkin} from './data';

describe('Maze', () => {
  const dirtMap = [
    [
      {
        tileType: 2,
      },
      {
        tileType: 1,
        value: 1,
      },
      {
        tileType: 1,
        value: -1,
      },
    ],
  ];

  describe('scheduleDirtChange', () => {
    let mazeController: MazeController;

    beforeEach(() => {
      document.body.innerHTML =
        '<div id="svgMaze"><div class="pegman-location"></div></div>';

      const config = {
        level: {
          ...baseLevel,
          serializedMaze: dirtMap,
        },
        skin: {
          ...mockSkin,
          id: 'farmer',
          dirt: 'dirt.png',
        },
        skinId: 'farmer',
      };
      mazeController = new MazeController(config.level, config.skin, config);
      const svgMaze = document.getElementById('svgMaze') as unknown as
        | SVGSVGElement
        | undefined;
      if (!svgMaze) {
        fail('svg cannot be created in dom');
      }

      mazeController.subtype.createDrawer(svgMaze);
      mazeController.setPegmanX(0);
      mazeController.setPegmanY(0);
    });

    it('can cycle through all types', () => {
      const dirtId = DirtDrawer.cellId(
        '',
        mazeController.getPegmanX() || 0,
        mazeController.getPegmanY() || 0,
      );
      let image;

      // image starts out nonexistant
      expect(document.getElementById(dirtId)).toBeNull();

      mazeController.scheduleFill();
      image = document.getElementById(dirtId);
      // image now exists and is dirt
      expect(image).not.toBeNull();
      expect(image?.getAttribute('x')).toEqual('-550');

      mazeController.scheduleDig();
      image = document.getElementById(dirtId);
      // tile is flat, image is therefore hidden
      expect(image).not.toBeNull();
      expect(image?.getAttribute('visibility')).toEqual('hidden');

      mazeController.scheduleDig();
      image = document.getElementById(dirtId);
      // image is a holde
      expect(image).not.toBeNull();
      expect(image?.getAttribute('x')).toEqual('-500');

      mazeController.scheduleFill();
      image = document.getElementById(dirtId);
      // tile is flat, image is therefore hidden
      expect(image).not.toBeNull();
      expect(image?.getAttribute('visibility')).toEqual('hidden');
    });
  });
});
