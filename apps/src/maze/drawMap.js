import {SVG_NS} from '../constants';
import tiles from './tiles';
import {createUuid} from '../utils';

const SquareType = tiles.SquareType;

// Height and width of the goal and obstacles.
const MARKER_HEIGHT = 43;
const MARKER_WIDTH = 50;

/**
 * Calculate the y coordinates for pegman sprite.
 */
export function getPegmanYForRow(skin, mazeRow, squareSize = 50) {
  return Math.floor(squareSize * (mazeRow + 0.5) - skin.pegmanHeight / 2 +
    skin.pegmanYOffset);
}

export function displayPegman(skin, pegmanIcon, clipRect, x, y, frame, squareSize = 50) {
  const xOffset = skin.pegmanXOffset || 0;
  pegmanIcon.setAttribute('x',
    x * squareSize - frame * skin.pegmanWidth + 1 + xOffset);
  pegmanIcon.setAttribute('y', getPegmanYForRow(skin, y));

  clipRect.setAttribute('x', x * squareSize + 1 + xOffset);
  clipRect.setAttribute('y', pegmanIcon.getAttribute('y'));
}

export default function drawMap(svg, skin, subtype, map, squareSize = 50) {
  const MAZE_WIDTH = map.COLS * squareSize;
  const MAZE_HEIGHT = map.ROWS * squareSize;

  var x, y, tile;

  // Draw the outer square.
  var square = document.createElementNS(SVG_NS, 'rect');
  square.setAttribute('width', MAZE_WIDTH);
  square.setAttribute('height', MAZE_HEIGHT);
  square.setAttribute('fill', '#F1EEE7');
  square.setAttribute('stroke-width', 1);
  square.setAttribute('stroke', '#CCB');
  svg.appendChild(square);

  if (skin.background) {
    tile = document.createElementNS(SVG_NS, 'image');
    tile.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      skin.background);
    tile.setAttribute('height', MAZE_HEIGHT);
    tile.setAttribute('width', MAZE_WIDTH);
    tile.setAttribute('x', 0);
    tile.setAttribute('y', 0);
    svg.appendChild(tile);
  }

  subtype.drawMapTiles(svg);

  // Add hint path.
  const hintPath = document.createElementNS(SVG_NS, 'path');
  hintPath.setAttribute('id', 'hintPath');
  hintPath.setAttribute('stroke', '#c00');
  hintPath.setAttribute('stroke-width', '5');
  hintPath.setAttribute('fill', 'none');
  hintPath.setAttribute('stroke-linecap', 'round');
  hintPath.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(hintPath);

  if (subtype.start) {
    // Pegman's clipPath element, whose (x, y) is reset by Maze.displayPegman
    const pegmanClip = document.createElementNS(SVG_NS, 'clipPath');
    const pegmanClipId = `pegmanClipPath-${createUuid()}`;
    pegmanClip.setAttribute('id', pegmanClipId);
    const clipRect = document.createElementNS(SVG_NS, 'rect');
    clipRect.setAttribute('id', 'clipRect');
    clipRect.setAttribute('width', skin.pegmanWidth);
    clipRect.setAttribute('height', skin.pegmanHeight);
    pegmanClip.appendChild(clipRect);
    svg.appendChild(pegmanClip);

    // Add pegman.
    var pegmanIcon = document.createElementNS(SVG_NS, 'image');
    pegmanIcon.setAttribute('id', 'pegman');
    pegmanIcon.setAttribute('class', 'pegman-location');
    pegmanIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      skin.avatar);
    pegmanIcon.setAttribute('height', skin.pegmanHeight);
    pegmanIcon.setAttribute('width', skin.pegmanWidth * 21); // 49 * 21 = 1029
    pegmanIcon.setAttribute('clip-path', `url(#${pegmanClipId})`);
    svg.appendChild(pegmanIcon);

    displayPegman(skin, pegmanIcon, clipRect, subtype.start.x, subtype.start.y,
      tiles.directionToFrame(subtype.startDirection));

    var pegmanFadeoutAnimation = document.createElementNS(SVG_NS, 'animate');
    pegmanFadeoutAnimation.setAttribute('id', 'pegmanFadeoutAnimation');
    pegmanFadeoutAnimation.setAttribute('attributeType', 'CSS');
    pegmanFadeoutAnimation.setAttribute('attributeName', 'opacity');
    pegmanFadeoutAnimation.setAttribute('from', 1);
    pegmanFadeoutAnimation.setAttribute('to', 0);
    pegmanFadeoutAnimation.setAttribute('dur', '1s');
    pegmanFadeoutAnimation.setAttribute('begin', 'indefinite');
    pegmanIcon.appendChild(pegmanFadeoutAnimation);
  }

  if (subtype.finish && skin.goalIdle) {
    // Add finish marker.
    var finishMarker = document.createElementNS(SVG_NS, 'image');
    finishMarker.setAttribute('id', 'finish');
    finishMarker.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      skin.goalIdle);
    finishMarker.setAttribute('height', MARKER_HEIGHT);
    finishMarker.setAttribute('width', MARKER_WIDTH);
    svg.appendChild(finishMarker);

    // Move the finish icon into position.
    finishMarker.setAttribute('x', squareSize * (subtype.finish.x + 0.5) -
      finishMarker.getAttribute('width') / 2);
    finishMarker.setAttribute('y', squareSize * (subtype.finish.y + 0.9) -
      finishMarker.getAttribute('height'));
    finishMarker.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      skin.goalIdle);
    finishMarker.setAttribute('visibility', 'visible');
  }

  // Add obstacles.
  if (skin.obstacleIdle) {
    var obsId = 0;
    for (y = 0; y < map.ROWS; y++) {
      for (x = 0; x < map.COLS; x++) {
        if (map.getTile(y, x) === SquareType.OBSTACLE) {
          var obsIcon = document.createElementNS(SVG_NS, 'image');
          obsIcon.setAttribute('id', 'obstacle' + obsId);
          obsIcon.setAttribute('height', MARKER_HEIGHT * skin.obstacleScale);
          obsIcon.setAttribute('width', MARKER_WIDTH * skin.obstacleScale);
          obsIcon.setAttributeNS(
            'http://www.w3.org/1999/xlink', 'xlink:href', skin.obstacleIdle);
          obsIcon.setAttribute('x',
            squareSize * (x + 0.5) -
            obsIcon.getAttribute('width') / 2);
          obsIcon.setAttribute('y',
            squareSize * (y + 0.9) -
            obsIcon.getAttribute('height'));
          svg.appendChild(obsIcon);
        }
        ++obsId;
      }
    }
  }
}
