import Cell from './Cell';
import {SVG_NS, pegmanElements} from './constants';
import Drawer from './Drawer';
import MazeMap from './MazeMap';
import type {Skin} from './skin';
import type Subtype from './Subtype';
import * as tiles from './tiles';
import {createUuid, getPegmanElementId} from './utils';

const {SquareType} = tiles;

// Height and width of the goal and obstacles.
const MARKER_HEIGHT = 43;
const MARKER_WIDTH = 50;

/**
 * Calculate the y coordinates for pegman sprite.
 */
export function getPegmanYForRow(
  skin: Skin,
  mazeRow: number,
  squareSize: number = 50,
): number {
  return Math.floor(
    squareSize * (mazeRow + 0.5) -
      (skin.pegmanHeight || 1) / 2 +
      (skin.pegmanYOffset || 0),
  );
}

export function displayPegman(
  skin: Skin,
  pegmanIcon: SVGImageElement,
  clipRect: SVGRectElement,
  x: number,
  y: number,
  frame: number,
  squareSize: number = 50,
) {
  const xOffset = skin.pegmanXOffset || 0;
  pegmanIcon.setAttribute(
    'x',
    (x * squareSize - frame * (skin.pegmanWidth || 1) + 1 + xOffset).toString(),
  );
  pegmanIcon.setAttribute(
    'y',
    getPegmanYForRow(skin, y, squareSize).toString(),
  );

  clipRect.setAttribute('x', (x * squareSize + 1 + xOffset).toString());
  clipRect.setAttribute('y', pegmanIcon.getAttribute('y') || '0');
}

export function addNewPegman(
  skin: Skin,
  pegmanId: string | undefined,
  x: number,
  y: number,
  direction: number,
  svg: SVGSVGElement,
  squareSize: number = 50,
) {
  // Pegman's clipPath element, whose (x, y) is reset by Maze.displayPegman
  const pegmanClip = document.createElementNS(SVG_NS, 'clipPath');
  const pegmanClipId = `pegmanClipPath-${createUuid()}`;
  pegmanClip.setAttribute('id', pegmanClipId);
  const clipRect = document.createElementNS(SVG_NS, 'rect');
  clipRect.setAttribute(
    'id',
    getPegmanElementId(pegmanElements.CLIP_RECT, pegmanId),
  );
  clipRect.setAttribute('width', (skin.pegmanWidth || 1).toString());
  clipRect.setAttribute('height', (skin.pegmanHeight || 1).toString());
  pegmanClip.appendChild(clipRect);
  svg.appendChild(pegmanClip);

  const pegmanIcon = document.createElementNS(SVG_NS, 'image');
  pegmanIcon.setAttribute(
    'id',
    getPegmanElementId(pegmanElements.PEGMAN, pegmanId),
  );
  pegmanIcon.setAttribute('class', 'pegman-location');
  pegmanIcon.setAttributeNS(
    'http://www.w3.org/1999/xlink',
    'xlink:href',
    skin.avatar,
  );
  pegmanIcon.setAttribute('height', (skin.pegmanHeight || 1).toString());
  // default pegman sheet has 21 sprites. Skin may override with a specific width for the sheet.
  const sheetWidth = skin.pegmanSheetWidth || (skin.pegmanWidth || 1) * 21;
  pegmanIcon.setAttribute('width', sheetWidth.toString());
  pegmanIcon.setAttribute('clip-path', `url(#${pegmanClipId})`);
  svg.appendChild(pegmanIcon);

  displayPegman(
    skin,
    pegmanIcon,
    clipRect,
    x,
    y,
    tiles.directionToFrame(direction),
    squareSize,
  );

  const pegmanFadeoutAnimation = document.createElementNS(SVG_NS, 'animate');
  pegmanFadeoutAnimation.setAttribute(
    'id',
    getPegmanElementId(pegmanElements.FADEOUT, pegmanId),
  );
  pegmanFadeoutAnimation.setAttribute('attributeType', 'CSS');
  pegmanFadeoutAnimation.setAttribute('attributeName', 'opacity');
  pegmanFadeoutAnimation.setAttribute('from', '1');
  pegmanFadeoutAnimation.setAttribute('to', '0');
  pegmanFadeoutAnimation.setAttribute('dur', '1s');
  pegmanFadeoutAnimation.setAttribute('begin', 'indefinite');
  pegmanIcon.appendChild(pegmanFadeoutAnimation);
}

export function drawMap<T extends Cell, U extends Drawer<T>>(
  svg: SVGSVGElement,
  skin: Skin,
  subtype: Subtype<T, U>,
  map: MazeMap<T>,
  squareSize: number = 50,
) {
  const MAZE_WIDTH = map.COLS * squareSize;
  const MAZE_HEIGHT = map.ROWS * squareSize;

  let x, y, tile;

  // Draw the outer square.
  const square = document.createElementNS(SVG_NS, 'rect');
  square.setAttribute('width', MAZE_WIDTH.toString());
  square.setAttribute('height', MAZE_HEIGHT.toString());
  square.setAttribute('fill', '#F1EEE7');
  square.setAttribute('stroke-width', '1');
  square.setAttribute('stroke', '#CCB');
  svg.appendChild(square);

  if (skin.background) {
    tile = document.createElementNS(SVG_NS, 'image');
    tile.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'xlink:href',
      skin.background,
    );
    tile.setAttribute('height', MAZE_HEIGHT.toString());
    tile.setAttribute('width', MAZE_WIDTH.toString());
    tile.setAttribute('x', '0');
    tile.setAttribute('y', '0');
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
    addNewPegman(
      skin,
      undefined,
      subtype.start.x,
      subtype.start.y,
      subtype.startDirection,
      svg,
      squareSize,
    );
  }

  if (subtype.finish && skin.goalIdle) {
    // Add finish marker.
    const finishMarker = document.createElementNS(SVG_NS, 'image');
    finishMarker.setAttribute('id', 'finish');
    finishMarker.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'xlink:href',
      skin.goalIdle,
    );
    finishMarker.setAttribute('height', MARKER_HEIGHT.toString());
    finishMarker.setAttribute('width', MARKER_WIDTH.toString());
    svg.appendChild(finishMarker);

    // Move the finish icon into position.
    finishMarker.setAttribute(
      'x',
      (
        squareSize * (subtype.finish.x + 0.5) -
        parseInt(finishMarker.getAttribute('width') || '0') / 2
      ).toString(),
    );
    finishMarker.setAttribute(
      'y',
      (
        squareSize * (subtype.finish.y + 0.9) -
        parseInt(finishMarker.getAttribute('height') || '0')
      ).toString(),
    );
    finishMarker.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'xlink:href',
      skin.goalIdle,
    );
    finishMarker.setAttribute('visibility', 'visible');
  }

  // Add obstacles.
  if (skin.obstacleIdle) {
    let obsId = 0;
    for (y = 0; y < map.ROWS; y++) {
      for (x = 0; x < map.COLS; x++) {
        if (map.getTile(y, x) === SquareType.OBSTACLE) {
          const obsIcon = document.createElementNS(SVG_NS, 'image');
          obsIcon.setAttribute('id', 'obstacle' + obsId);
          obsIcon.setAttribute(
            'height',
            (MARKER_HEIGHT * (skin.obstacleScale || 1)).toString(),
          );
          obsIcon.setAttribute(
            'width',
            (MARKER_WIDTH * (skin.obstacleScale || 1)).toString(),
          );
          obsIcon.setAttributeNS(
            'http://www.w3.org/1999/xlink',
            'xlink:href',
            skin.obstacleIdle,
          );
          obsIcon.setAttribute(
            'x',
            (
              squareSize * (x + 0.5) -
              parseInt(obsIcon.getAttribute('width') || '0') / 2
            ).toString(),
          );
          obsIcon.setAttribute(
            'y',
            (
              squareSize * (y + 0.9) -
              parseInt(obsIcon.getAttribute('height') || '0')
            ).toString(),
          );
          svg.appendChild(obsIcon);
        }
        ++obsId;
      }
    }
  }
}
