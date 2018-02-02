import { expect } from '../../util/configuredChai';
import { SVG_NS } from '@cdo/apps/constants';
import Collector from '@cdo/apps/maze/collector';
import Cell from '@cdo/apps/maze/cell';
import MazeMap from '@cdo/apps/maze/mazeMap';

describe("drawCorners", function () {
  it("draws corners only when needed", function () {
    const svg = document.createElementNS(SVG_NS, 'svg');
    document.body.appendChild(svg);

    const corners = ['NW', 'NE', 'SW', 'SE'];
    const empty_config = {
      level: {},
      skin: {
        corners: 'corners.png'
      }
    };

    function verify(name, maze, target, expected) {
      const map = MazeMap.deserialize(maze.map(row => row.map(val => {
        return {tileType: val};
      })), Cell);

      const collector = new Collector({map}, {}, empty_config);

      collector.drawCorners(svg, target[0], target[1], name);
      corners.forEach(corner => {
        const id = `tileCorner${corner}ClipPath${name}`;
        const corner_exists = svg.getElementById(id) !== null;
        const expect_corner_to_exist = expected.indexOf(corner) !== -1;
        expect(corner_exists).to.equal(expect_corner_to_exist);
      });

      svg.innerHTML = '';
    }

    verify('all corners', [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ], [1, 1], ['NW', 'NE', 'SW', 'SE']);

    verify('no corners', [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ], [1, 1], []);

    verify('NW', [
      [0, 1, 0],
      [1, 1, 0],
      [0, 0, 0],
    ], [1, 1], ['NW']);

    verify('NE', [
      [1, 1, 0],
      [1, 1, 1],
      [1, 1, 1],
    ], [1, 1], ['NE']);

    verify('S', [
      [1, 1, 1],
      [1, 1, 1],
      [0, 1, 0],
    ], [1, 1], ['SE', 'SW']);
  });
});

