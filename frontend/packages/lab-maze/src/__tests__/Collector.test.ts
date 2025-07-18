import Cell from '../Cell';
import Collector from '../Collector';
import {SVG_NS} from '../constants';
import MazeController, {Configuration} from '../MazeController';
import MazeMap from '../MazeMap';
import type {Skin} from '../skin';

import {baseLevel, mockSkin} from './data';

//jest.mock('../MazeController');

describe('drawCorners', () => {
  it('draws corners only when needed', () => {
    const svg = document.createElementNS(SVG_NS, 'svg');
    document.body.appendChild(svg);

    const corners = ['NW', 'NE', 'SW', 'SE'];
    const config = {
      level: {
        ...baseLevel,
      },
      skin: {
        ...mockSkin,
        corners: 'corners.png',
      },
    };

    const verify = (
      name: string,
      map: number[][],
      target: [number, number],
      expected: string[],
    ) => {
      const maze = new MazeController(
        config.level,
        config.skin as Skin,
        config as Configuration,
        {},
      );
      maze.map = MazeMap.deserialize(
        map.map(row =>
          row.map(val => {
            return {tileType: val};
          }),
        ),
        Cell,
      );

      const collector = new Collector(maze, config);

      collector.drawCorners(svg, target[0], target[1], name);
      corners.forEach(corner => {
        const id = `tileCorner${corner}ClipPath${name}`;
        const corner_exists = svg.getElementById(id) !== null;
        const expect_corner_to_exist = expected.indexOf(corner) !== -1;
        expect(corner_exists).toEqual(expect_corner_to_exist);
      });

      svg.innerHTML = '';
    };

    verify(
      'all corners',
      [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0],
      ],
      [1, 1],
      ['NW', 'NE', 'SW', 'SE'],
    );

    verify(
      'no corners',
      [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
      ],
      [1, 1],
      [],
    );

    verify(
      'NW',
      [
        [0, 1, 0],
        [1, 1, 0],
        [0, 0, 0],
      ],
      [1, 1],
      ['NW'],
    );

    verify(
      'NE',
      [
        [1, 1, 0],
        [1, 1, 1],
        [1, 1, 1],
      ],
      [1, 1],
      ['NE'],
    );

    verify(
      'S',
      [
        [1, 1, 1],
        [1, 1, 1],
        [0, 1, 0],
      ],
      [1, 1],
      ['SE', 'SW'],
    );
  });
});
