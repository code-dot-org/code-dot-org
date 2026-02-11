// Original Blockly copyright follows

/**
 * Blockly Apps: Maze
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * JavaScript for Blockly's Maze application.
 * fraser@google.com (Neil Fraser)
 */

import type * as Blockly from 'blockly/core';

import type {BlocklySerialization} from '@code-dot-org/blockly-workspace';
import AnimationsController from './AnimationsController';
import Bee from './Bee';
import Cell from './Cell';
import Collector from './Collector';
import DirtDrawer from './DirtDrawer';
import type Drawer from './Drawer';
import {drawMap} from './drawMap';
import Farmer from './Farmer';
import Harvester from './Harvester';
import MazeMap from './MazeMap';
import Neighborhood from './Neighborhood';
import Pegman from './Pegman';
import PegmanController from './PegmanController';
import Planter from './Planter';
import Scrat from './Scrat';
import {
  type Skin,
  isFarmerSkin,
  isBeeSkin,
  isCollectorSkin,
  isScratSkin,
  isPlanterSkin,
  isHarvesterSkin,
  isWordSearchSkin,
  isNeighborhoodSkin,
} from './skin';
import Subtype from './Subtype';
import type {SubtypeConfiguration, SubtypeConstructor} from './Subtype';
import * as tiles from './tiles';
import * as timeoutList from './timeoutList';
import WordSearch from './WordSearch';

/** Describes Maze level tile data in serialized mazes */
export interface SerializedMazeTileData {
  tileType: number;
}

/** For error reporting */
export interface ExecutionError {
  err: string;
  lineNumber: number;
}

/** Options to pass along to a validator */
export interface GetTestResultsOptions {
  executionError?: ExecutionError;
  allowTopBlocks?: boolean;
}

/** Generic description for Blockly data. */
interface BlocklyData {
  startBlocks?: BlocklySerialization;
  toolboxBlocks?: Blockly.utils.toolbox.ToolboxInfo;
  solutionBlocks?: BlocklySerialization;
  idealBlockCount?: number;
}

/** Describes maze level initial data. */
export interface MazeData extends BlocklyData {
  serializedMaze?: SerializedMazeTileData[][];
  map?: (number | string)[][];
  skinId: string;
  startDirection?: number;
  /** Maze/Gatherer/etc */
  initialDirt?: number[][];
  /** WordSearch */
  searchWord?: string;
  /** Bee */
  flowerType?: string;
  fastGetNectarAnimation?: boolean;
}

/** Maze controller configuration */
export interface Configuration {
  skin?: Skin;
  skinId?: string;
  level?: MazeData;
}

/** Some audio playback options we might expect */
export interface PlayAudioOptions {
  noOverlap?: boolean;
  volume?: number;
}

/** Methods we can pass in via Options */
export interface RebindMethods {
  playAudio?: (sound: string, options?: PlayAudioOptions) => void;
  playAudioOnFailure?: () => void;
  loadAudio?: (filenames: string[], name: string) => void;
  getTestResults?: (
    levelComplete: boolean,
    options?: GetTestResultsOptions,
  ) => number;
}

/** Other Maze controller options */
export interface Options {
  methods?: RebindMethods;
}

class MazeController {
  stepSpeed: number;
  level: MazeData;
  skin: Skin;
  animationsController?: AnimationsController;
  startDirection?: number;
  pegmanController: PegmanController;
  map?: MazeMap<Cell>;
  subtype: Subtype<Cell, DirtDrawer>;

  MAZE_HEIGHT: number;
  MAZE_WIDTH: number;
  PATH_WIDTH: number;
  PEGMAN_HEIGHT: number;
  PEGMAN_WIDTH: number;
  PEGMAN_X_OFFSET: number;
  PEGMAN_Y_OFFSET: number;
  SQUARE_SIZE: number;
  SVG_WIDTH: number;
  SVG_HEIGHT: number;

  /**
   * A few placeholder methods intended to be rebound
   */
  playAudio: (sound: string, options?: PlayAudioOptions) => void = (
    _: string,
    __: PlayAudioOptions = {},
  ) => {};
  playAudioOnFailure: () => void = () => {};
  loadAudio: (filenames: string[], name: string) => void = (
    _: string[],
    __: string,
  ) => {};
  getTestResults: (
    levelComplete: boolean,
    options?: GetTestResultsOptions,
  ) => number = (_: boolean, __?: GetTestResultsOptions) => 0;

  constructor(
    level: MazeData,
    skin: Skin,
    config: Configuration,
    options: Options = {},
  ) {
    this.stepSpeed = 100;

    this.level = level;
    this.skin = skin;

    this.pegmanController = new PegmanController();

    if (options.methods) {
      this.rebindMethods(options.methods);
    }

    // Ensure level and skin are provided in Configuration and visible by Subtypes
    config.level ||= level;
    config.skin ||= skin;

    this.SQUARE_SIZE = 50;
    this.MAZE_HEIGHT = this.SQUARE_SIZE * 8;
    this.MAZE_WIDTH = this.MAZE_HEIGHT;
    this.SVG_WIDTH = this.MAZE_WIDTH;
    this.SVG_HEIGHT = this.MAZE_HEIGHT;
    this.PEGMAN_HEIGHT = this.SQUARE_SIZE;
    this.PEGMAN_WIDTH = this.SQUARE_SIZE;
    this.PEGMAN_X_OFFSET = 0;
    this.PEGMAN_Y_OFFSET = 0;
    this.PATH_WIDTH = this.SQUARE_SIZE / 3;

    const Type = MazeController.getSubtypeForSkin(
      config.skinId || skin.id || 'unknown',
    );
    this.subtype = new Type(this, config as SubtypeConfiguration);
    this.loadLevel_();
  }

  static getSubtypeForSkin<T extends Cell, U extends Drawer<T>>(
    skinId: string,
  ): SubtypeConstructor<T, U> {
    if (isFarmerSkin(skinId)) {
      return Farmer as unknown as SubtypeConstructor<T, U>;
    }
    if (isBeeSkin(skinId)) {
      return Bee as unknown as SubtypeConstructor<T, U>;
    }
    if (isCollectorSkin(skinId)) {
      return Collector as unknown as SubtypeConstructor<T, U>;
    }
    if (isWordSearchSkin(skinId)) {
      return WordSearch as unknown as SubtypeConstructor<T, U>;
    }
    if (isScratSkin(skinId)) {
      return Scrat as unknown as SubtypeConstructor<T, U>;
    }
    if (isHarvesterSkin(skinId)) {
      return Harvester as unknown as SubtypeConstructor<T, U>;
    }
    if (isPlanterSkin(skinId)) {
      return Planter as unknown as SubtypeConstructor<T, U>;
    }
    if (isNeighborhoodSkin(skinId)) {
      return Neighborhood as unknown as SubtypeConstructor<T, U>;
    }

    return Subtype as SubtypeConstructor<T, U>;
  }

  rebindMethods(methods: RebindMethods) {
    this.playAudio = methods.playAudio || this.playAudio;
    this.playAudioOnFailure =
      methods.playAudioOnFailure || this.playAudioOnFailure;
    this.loadAudio = methods.loadAudio || this.loadAudio;
    this.getTestResults = methods.getTestResults || this.getTestResults;
  }

  initWithSvg(svg: SVGSVGElement) {
    // Adjust outer element size to desired size of overall SVG.
    // This may be equal to the 'actual' maze size
    // (square size * num_columns x square size * num_rows)
    // if no svg size was provided by the skin.
    svg.setAttribute('width', this.SVG_WIDTH.toString());
    svg.setAttribute('height', this.SVG_HEIGHT.toString());
    // Adjust view box. View box width and height are the 'actual' maze dimensions.
    // This attribute combined with the width and height will scale the svg to our
    // desired size. We want to maintain the top corner location, so the min-x
    // and min-y values are set to 0.
    // See view box explanation here: https://css-tricks.com/scale-svg/
    svg.setAttribute('viewBox', `0 0 ${this.MAZE_WIDTH} ${this.MAZE_HEIGHT}`);

    if (this.map) {
      drawMap(svg, this.skin, this.subtype, this.map, this.SQUARE_SIZE);
    }
    this.animationsController = new AnimationsController(this, svg);
  }

  loadLevel_() {
    // Load maps.
    //
    // "serializedMaze" is the new way of storing maps; it's a JSON array
    // containing complex map data.
    //
    // "map" plus optionally "levelDirt" is the old way of storing maps;
    // they are each arrays of a combination of strings and ints with
    // their own complex syntax. This way is deprecated for new levels,
    // and only exists for backwards compatibility for not-yet-updated
    // levels.
    if (this.level.serializedMaze) {
      this.map = MazeMap.deserialize(
        this.level.serializedMaze,
        this.subtype.getCellClass(),
      );
    } else {
      if (this.level.map) {
        this.map = MazeMap.parseFromOldValues(
          this.level.map,
          this.level.initialDirt,
          this.subtype.getCellClass(),
        );
      }
    }

    // this could possibly be eliminated in favor of just always referencing
    // this.level.startDirection
    this.startDirection = this.level.startDirection;

    // this could probably be moved to the constructor

    if (this.level.fastGetNectarAnimation) {
      this.skin.actionSpeedScale ||= {};
      this.skin.actionSpeedScale.nectar = 0.5;
    }

    // Pixel height and width of each maze square (i.e. tile).
    this.SQUARE_SIZE = this.skin.squareSize || 50;
    this.PEGMAN_HEIGHT = this.skin.pegmanHeight || this.SQUARE_SIZE;
    this.PEGMAN_WIDTH = this.skin.pegmanWidth || this.SQUARE_SIZE;
    this.PEGMAN_X_OFFSET = this.skin.pegmanXOffset || 0;
    this.PEGMAN_Y_OFFSET = this.skin.pegmanYOffset || 0;

    this.MAZE_WIDTH = this.SQUARE_SIZE * (this.map?.COLS || 8);
    this.MAZE_HEIGHT = this.SQUARE_SIZE * (this.map?.ROWS || 8);
    this.SVG_WIDTH = this.skin.svgWidth || this.MAZE_WIDTH;
    this.SVG_HEIGHT = this.skin.svgHeight || this.MAZE_HEIGHT;

    this.PATH_WIDTH = this.SQUARE_SIZE / 3;
  }

  /**
   * Redraw all dirt images
   * @param running - Whether or not user program is currently running
   */
  resetDirtImages(running: boolean) {
    this.map?.forEachCell((_cell: Cell, row: number, col: number) => {
      this.subtype.drawer.updateItemImage(row, col, running);
    });
  }

  gridNumberToPosition_(n: number): number {
    return (n + 0.5) * this.SQUARE_SIZE;
  }

  /**
   * Draws a set of lines highlighting a path through the maze.
   */
  drawHintPath(svg: SVGSVGElement, coordinates: [number, number][]) {
    const path = svg.getElementById('hintPath');
    path.setAttribute(
      'd',
      'M' +
        coordinates
          .map(([x, y]) => {
            return `${this.gridNumberToPosition_(x)},${this.gridNumberToPosition_(y)}`;
          })
          .join(' '),
    );
  }

  /**
   * Reset the maze to the start position and kill any pending animation tasks.
   * @param first - True if an opening animation is to be played.
   * @param showDefault - True if the default pegman should be shown. Only applies
   * to subtypes that allow multiple pegman
   */
  reset(first: boolean, showDefault: boolean = true) {
    this.subtype.reset();

    // Kill all tasks.
    timeoutList.clearTimeouts();

    if (this.subtype.start) {
      // Move default Pegman into position.
      this.setPegmanX(this.subtype.start.x);
      this.setPegmanY(this.subtype.start.y);
      this.setPegmanD(this.startDirection || 0);
    }

    if (this.subtype.allowMultiplePegmen()) {
      // hide all pegman except the default. Show the default if it exists and
      // showDefault is true
      const pegmanIds = this.pegmanController.getAllPegmanIds();
      pegmanIds.forEach(pegmanId => {
        if (this.pegmanController.isDefaultPegman(pegmanId) && showDefault) {
          this.animationsController?.showPegman(pegmanId);
        } else {
          this.animationsController?.hidePegman(pegmanId);
        }
      });
    }
    this.animationsController?.reset(first);

    // Move the init dirt marker icons into position.
    this.map?.resetDirt();
    this.resetDirtImages(false);

    // Reset the obstacle image.
    let obsId = 0;
    let x, y;
    for (y = 0; y < (this.map?.ROWS || 0); y++) {
      for (x = 0; x < (this.map?.COLS || 0); x++) {
        const obsIcon = document.getElementById('obstacle' + obsId);
        if (obsIcon) {
          obsIcon.setAttributeNS(
            'http://www.w3.org/1999/xlink',
            'xlink:href',
            this.skin.obstacleIdle || '',
          );
        }
        ++obsId;
      }
    }

    if (!this.subtype.resetTiles()) {
      this.resetTiles_();
    }
  }

  destroy() {
    // Reset everything
    this.reset(false);

    // Destroy ALL tasks
    timeoutList.clearIntervals();
    timeoutList.clearTimeouts();
  }

  resetTiles_() {
    // Reset the tiles
    let tileId = 0;
    for (let y = 0; y < (this.map?.ROWS || 0); y++) {
      for (let x = 0; x < (this.map?.COLS || 0); x++) {
        // Tile's clipPath element.
        const tileClip = document.getElementById('tileClipPath' + tileId);
        tileClip?.setAttribute('visibility', 'visible');
        // Tile sprite.
        const tileElement = document.getElementById('tileElement' + tileId);
        tileElement?.setAttributeNS(
          'http://www.w3.org/1999/xlink',
          'xlink:href',
          this.skin.tiles || '',
        );
        tileElement?.setAttribute('opacity', '1');
        tileId++;
      }
    }
  }

  animatedFinish(timePerStep: number) {
    this.animationsController?.scheduleDance(true, timePerStep);
  }

  animatedMove(direction: number, timeForMove: number, id?: string) {
    const positionChange = tiles.directionToDxDy(direction);
    const newX = (this.getPegmanX(id) || 0) + positionChange.dx;
    const newY = (this.getPegmanY(id) || 0) + positionChange.dy;
    this.animationsController?.scheduleMove(newX, newY, timeForMove, id);
    this.playAudio('walk');
    this.setPegmanX(newX, id);
    this.setPegmanY(newY, id);
  }

  animatedTurn(direction: number, id?: string) {
    const newDirection = (this.getPegmanD(id) || 0) + direction;
    this.animationsController?.scheduleTurn(newDirection, id);
    this.setPegmanD(tiles.constrainDirection4(newDirection), id);
  }

  /**
   * A version of animated turn that bypasses the mod in animatedTurn
   * and moves straight to the direction given.
   * @param direction
   * @param id
   */
  animatedCardinalTurn(direction: number, id?: string) {
    this.animationsController?.simpleTurn(direction, id);
    this.setPegmanD(direction, id);
  }

  animatedFail(forward: boolean, id?: string) {
    const dxDy = tiles.directionToDxDy(this.getPegmanD(id) || 0);
    let deltaX = dxDy.dx;
    let deltaY = dxDy.dy;

    if (!forward) {
      deltaX = -deltaX;
      deltaY = -deltaY;
    }

    const targetX = (this.getPegmanX(id) || 0) + deltaX;
    const targetY = (this.getPegmanY(id) || 0) + deltaY;
    const frame = tiles.directionToFrame(this.getPegmanD(id) || 0);
    this.animationsController?.displayPegman(
      (this.getPegmanX(id) || 0) + deltaX / 4,
      (this.getPegmanY(id) || 0) + deltaY / 4,
      frame,
      id,
    );
    // Play sound and animation for hitting wall or obstacle
    const squareType: number | undefined = this.map?.getTile(targetY, targetX);
    if (
      squareType === tiles.SquareType.WALL ||
      squareType === undefined ||
      (this.subtype.isScrat() && squareType === tiles.SquareType.OBSTACLE)
    ) {
      // Play the sound
      this.playAudio('wall');
      if (squareType !== undefined) {
        // Check which type of wall pegman is hitting
        this.playAudio(
          'wall' + (this.subtype.wallMap?.[targetY][targetX] || 0),
        );
      }

      if (this.subtype.isScrat() && squareType === tiles.SquareType.OBSTACLE) {
        this.animationsController?.crackSurroundingIce(targetX, targetY);
      }

      this.animationsController?.scheduleWallHit(
        targetX,
        targetY,
        deltaX,
        deltaY,
        frame,
        id,
      );
      timeoutList.setTimeout(() => {
        this.playAudioOnFailure();
      }, this.stepSpeed * 2);
    } else if (squareType === tiles.SquareType.OBSTACLE) {
      // Play the sound
      this.playAudio('obstacle');
      this.animationsController?.scheduleObstacleHit(
        targetX,
        targetY,
        deltaX,
        deltaY,
        frame,
        id,
      );
      timeoutList.setTimeout(() => {
        this.playAudioOnFailure();
      }, this.stepSpeed);
    }
  }

  /**
   * Display the look icon at Pegman's current location,
   * in the specified direction.
   */
  animatedLook(direction: number, id?: string) {
    let x = this.getPegmanX(id) || 0;
    let y = this.getPegmanY(id) || 0;
    switch (direction) {
      case tiles.Direction.NORTH:
        x += 0.5;
        break;
      case tiles.Direction.EAST:
        x += 1;
        y += 0.5;
        break;
      case tiles.Direction.SOUTH:
        x += 0.5;
        y += 1;
        break;
      case tiles.Direction.WEST:
        y += 0.5;
        break;
    }
    x *= this.SQUARE_SIZE;
    y *= this.SQUARE_SIZE;
    const d = direction * 90 - 45;

    this.animationsController?.scheduleLook(x, y, d);
  }

  scheduleDirtChange_(options: {amount: number; sound: string}) {
    const col = this.getPegmanX() || 0;
    const row = this.getPegmanY() || 0;

    // cells that started as "flat" will be undefined
    const previousValue = this.map?.getValue(row, col) || 0;

    this.map?.setValue(row, col, previousValue + options.amount);
    this.subtype.scheduleDirtChange(row, col);
    this.playAudio(options.sound);
  }

  /**
   * Schedule to add dirt at pegman's current position.
   */
  scheduleFill() {
    this.scheduleDirtChange_({
      amount: 1,
      sound: 'fill',
    });
  }

  /**
   * Schedule to remove dirt at pegman's current location.
   */
  scheduleDig() {
    this.scheduleDirtChange_({
      amount: -1,
      sound: 'dig',
    });
  }

  getPegmanX(id?: string): number | undefined {
    const pegman = this.pegmanController.getPegman(id);
    return pegman && pegman.getX();
  }

  getPegmanY(id?: string): number | undefined {
    const pegman = this.pegmanController.getPegman(id);
    return pegman && pegman.getY();
  }

  getPegmanD(id?: string): number | undefined {
    const pegman = this.pegmanController.getPegman(id);
    return pegman && pegman.getDirection();
  }

  setPegmanX(x: number, id?: string) {
    const pegman = this.pegmanController.getOrCreatePegman(id);
    pegman.setX(x);
  }

  setPegmanY(y: number, id?: string) {
    const pegman = this.pegmanController.getOrCreatePegman(id);
    pegman.setY(y);
  }

  setPegmanD(d: number, id?: string) {
    const pegman = this.pegmanController.getOrCreatePegman(id);
    pegman.setDirection(d);
  }

  addPegman(id: string, x: number, y: number, d: number) {
    // if pegman with id <id> already exists, reset
    // its location and direction. Otherwise, create a
    // new pegman and add it to the maze.
    if (this.pegmanController.getPegman(id)) {
      this.animationsController?.hidePegman(id);
      const pegman = this.pegmanController.getPegman(id);
      pegman?.setX(x);
      pegman?.setY(y);
      pegman?.setDirection(d);

      const frame = tiles.directionToFrame(d);
      this.animationsController?.displayPegman(x, y, frame, id);
      this.animationsController?.showPegman(id);
    } else {
      this.createAndDisplayPegman(id, x, y, d);
    }
  }

  createAndDisplayPegman(id: string, x: number, y: number, d: number) {
    const pegman = new Pegman(id, x, y, d);
    this.pegmanController.addPegman(pegman);
    this.animationsController?.addNewPegman(id, x, y, d);
  }

  hideDefaultPegman() {
    // if default pegman exists, hide it
    if (this.pegmanController.getPegman()) {
      this.animationsController?.hidePegman();
    }
  }

  showPegman(id?: string) {
    this.animationsController?.showPegman(id);
  }

  hidePegman(id?: string) {
    this.animationsController?.hidePegman(id);
  }
}

export default MazeController;
