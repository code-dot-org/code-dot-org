/**
 * Blockly App: Studio
 *
 * Copyright 2014 Code.org
 *
 */

import $ from 'jquery';
import * as constants from './constants';
import * as utils from '../utils';
import _ from 'lodash';
import AppView from '../templates/AppView';
import BigGameLogic from './customLogic/bigGameLogic';
import CollisionMaskWalls from './collisionMaskWalls';
import Hammer from '../third-party/hammer';
import GlowFilter from './starwars/GlowFilter';
import InputPrompt from '../templates/InputPrompt';
import Item from './Item';
import JSInterpreter from '../lib/tools/jsinterpreter/JSInterpreter';
import JsInterpreterLogger from '../JsInterpreterLogger';
import MusicController from '../MusicController';
import ObstacleZoneWalls from './obstacleZoneWalls';
import Projectile from './projectile';
import React from 'react';
import ReactDOM from 'react-dom';
import RocketHeightLogic from './customLogic/rocketHeightLogic';
import SamBatLogic from './customLogic/samBatLogic';
import Sprite from './Sprite';
import StudioVisualizationColumn from './StudioVisualizationColumn';
import ThreeSliceAudio from './ThreeSliceAudio';
import TileWalls from './tileWalls';
import api from './api';
import blocks from './blocks';
import CustomMarshalingInterpreter from '../lib/tools/jsinterpreter/CustomMarshalingInterpreter';
import commonMsg from '@cdo/locale';
import dom from '../dom';
import dropletConfig from './dropletConfig';
import paramLists from './paramLists.js';
import studioCell from './cell';
import studioMsg from './locale';
import {GridTurn, GridMove, GridMoveAndCancel} from './spriteActions';
import {Provider} from 'react-redux';
import {singleton as studioApp} from '../StudioApp';
import {outputError, injectErrorHandler} from '../lib/util/javascriptMode';
import JavaScriptModeErrorHandler from '../JavaScriptModeErrorHandler';
import {
  getContainedLevelResultInfo,
  postContainedLevelAttempt,
  runAfterPostContainedLevel
} from '../containedLevels';
import {getStore} from '../redux';
import Sounds from '../Sounds';
import {captureThumbnailFromSvg} from '../util/thumbnail';
import project from '../code-studio/initApp/project';
import {blockAsXmlNode, cleanBlocks} from '../block_utils';
import {parseElement} from '../xml';
import {getRandomDonorTwitter} from '../util/twitterHelper';
import {
  showArrowButtons,
  dismissSwipeOverlay
} from '@cdo/apps/templates/arrowDisplayRedux';

// tests don't have svgelement
import '../util/svgelement-polyfill';

var Direction = constants.Direction;
var CardinalDirections = constants.CardinalDirections;
var NextTurn = constants.NextTurn;
var SquareType = constants.SquareType;
var Emotions = constants.Emotions;
const turnRight90 = constants.turnRight90;
const turnLeft90 = constants.turnLeft90;

import {TestResults, ResultType, KeyCodes, SVG_NS} from '../constants';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';

// Whether we are showing debug information
var showDebugInfo = false;

/**
 * Create a namespace for the application.
 */
let Studio = module.exports;

Studio.keyState = {};
Studio.gesturesObserved = {};
Studio.btnState = {};

const ButtonState = {
  UP: 0,
  DOWN: 1
};

const ArrowIds = {
  LEFT: 'leftButton',
  UP: 'upButton',
  RIGHT: 'rightButton',
  DOWN: 'downButton'
};

Studio.GameStates = {
  WAITING: 0,
  ACTIVE: 1,
  OVER: 2
};

const DRAG_DISTANCE_TO_MOVE_RATIO = 25;

// NOTE: all class names should be unique. eventhandler naming won't work
// if we name a projectile class 'left' for example.

const EdgeClassNames = ['top', 'left', 'bottom', 'right'];

let level;
let skin;

// These skins can be published as projects.
const PUBLISHABLE_SKINS = [
  'gumball',
  'studio',
  'iceage',
  'infinity',
  'hoc2015'
];

//TODO: Make configurable.
studioApp().setCheckForEmptyBlocks(true);

var AUTO_HANDLER_MAP = {
  whenRun: 'whenGameStarts',
  whenDown: 'when-down',
  whenUp: 'when-up',
  whenLeft: 'when-left',
  whenRight: 'when-right',
  whenGetCharacter:
    'whenSpriteCollided-' + (Studio.protagonistSpriteIndex || 0) + '-any_item',
  whenTouchCharacter:
    'whenSpriteCollided-' + (Studio.protagonistSpriteIndex || 0) + '-any_item',
  whenTouchObstacle:
    'whenSpriteCollided-' + (Studio.protagonistSpriteIndex || 0) + '-wall',
  whenGetAllCharacters: 'whenGetAllItems',
  whenTouchGoal: 'whenTouchGoal',
  whenTouchAllGoals: 'whenTouchAllGoals',
  whenScore1000: 'whenScore1000'
};

// Default Scalings
Studio.scale = {
  snapRadius: 1,
  stepSpeed: 33
};

var TITLE_SCREEN_TIMEOUT = 5000;
var TITLE_SCREEN_TITLE_Y_POSITION = 60; // bottom of title text
var TITLE_SCREEN_TEXT_Y_POSITION = 100; // top of text group
var TITLE_SCREEN_TEXT_SIDE_MARGIN = 20;
var TITLE_SCREEN_TEXT_LINE_HEIGHT = 24;
var TITLE_SCREEN_TEXT_MAX_LINES = 7;
var TITLE_SCREEN_TEXT_TOP_MARGIN = 5;
var TITLE_SCREEN_TEXT_V_PADDING = 15;
var TITLE_SCREEN_TEXT_WIDTH = 360;
var TITLE_SCREEN_TEXT_HEIGHT =
  TITLE_SCREEN_TEXT_TOP_MARGIN +
  TITLE_SCREEN_TEXT_V_PADDING +
  TITLE_SCREEN_TEXT_MAX_LINES * TITLE_SCREEN_TEXT_LINE_HEIGHT;

var SPEECH_BUBBLE_RADIUS = 20;
var SPEECH_BUBBLE_H_OFFSET = 50;
var SPEECH_BUBBLE_PADDING = 5;
var SPEECH_BUBBLE_SIDE_MARGIN = 10;
var SPEECH_BUBBLE_LINE_HEIGHT = 20;
var SPEECH_BUBBLE_TOP_MARGIN = 5;
var SPEECH_BUBBLE_MIN_WIDTH = 180;
var SPEECH_BUBBLE_MAX_WIDTH = 380;

var SCORE_TEXT_Y_POSITION = 30; // bottom of text
var VICTORY_TEXT_Y_POSITION = 130;
var RESET_TEXT_Y_POSITION = 380;

var MIN_TIME_BETWEEN_PROJECTILES = 500; // time in ms

var twitterOptions = {
  text: studioMsg.shareStudioTwitterDonor({donor: getRandomDonorTwitter()}),
  hashtag: 'StudioCode'
};

/** @type {JsInterpreterLogger} */
var consoleLogger = null;

// Not actually the "default" map, just the map that's used in the "New Playlab
// Project" level.
const DEFAULT_MAP = [
  [16, 0, 0, 16, 0, 0, 16, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [16, 0, 0, 16, 0, 0, 16, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [16, 0, 0, 16, 0, 0, 16, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [16, 0, 0, 16, 0, 0, 16, 0],
  [0, 0, 0, 0, 0, 0, 0, 0]
];

const REMIX_PROPS = [
  {
    defaultValues: {
      map: DEFAULT_MAP,
      firstSpriteIndex: 1,
      spritesHiddenToStart: true
    },
    generateBlocks: args => {
      const blocks = [];
      let spriteIndex = 1;
      const getDefaultSpriteLocation = () => ({
        x: ((spriteIndex - 1) % 3) * 3,
        y: parseInt((spriteIndex - 1) / 3) * 2
      });
      for (let y = 0; y < Studio.ROWS; y++) {
        for (let x = 0; x < Studio.COLS; x++) {
          const cell = Studio.map[y][x].serialize();
          if (cell.tileType & constants.SquareType.SPRITESTART) {
            const defaultSpriteLocation = getDefaultSpriteLocation();
            if (
              (level.firstSpriteIndex !== 1 || cell.sprite) &&
              !level.spritesHiddenToStart
            ) {
              blocks.push(
                blockAsXmlNode('studio_setSpriteParams', {
                  titles: {
                    VALUE: `"${
                      Studio.startAvatars[
                        cell.sprite
                          ? cell.sprite
                          : spriteIndex + (level.firstSpriteIndex || 0)
                      ]
                    }"`
                  },
                  values: {
                    SPRITE: {
                      type: 'math_number',
                      titleName: 'NUM',
                      titleValue: spriteIndex
                    }
                  }
                })
              );
            }
            if (
              x !== defaultSpriteLocation.x ||
              y !== defaultSpriteLocation.y
            ) {
              blocks.push(
                blockAsXmlNode('studio_setSpriteXY', {
                  values: {
                    SPRITE: {
                      type: 'math_number',
                      titleName: 'NUM',
                      titleValue: spriteIndex
                    },
                    XPOS: {
                      type: 'math_number',
                      titleName: 'NUM',
                      titleValue:
                        x * Studio.SQUARE_SIZE +
                        Studio.sprite[spriteIndex - 1].width / 2
                    },
                    YPOS: {
                      type: 'math_number',
                      titleName: 'NUM',
                      titleValue:
                        y * Studio.SQUARE_SIZE +
                        Studio.sprite[spriteIndex - 1].height / 2
                    }
                  }
                })
              );
            }
            if (
              cell.speed !== undefined &&
              cell.speed !== constants.DEFAULT_SPRITE_SPEED
            ) {
              blocks.push(
                blockAsXmlNode('studio_setSpriteSpeedParams', {
                  values: {
                    SPRITE: {
                      type: 'math_number',
                      titleName: 'NUM',
                      titleValue: spriteIndex
                    },
                    VALUE: {
                      type: 'math_number',
                      titleName: 'NUM',
                      titleValue: cell.speed
                    }
                  }
                })
              );
            }
            if (
              cell.size !== undefined &&
              cell.size !== constants.DEFAULT_SPRITE_SIZE
            ) {
              blocks.push(
                blockAsXmlNode('studio_setSpriteSizeParams', {
                  values: {
                    SPRITE: {
                      type: 'math_number',
                      titleName: 'NUM',
                      titleValue: spriteIndex
                    },
                    VALUE: {
                      type: 'math_number',
                      titleName: 'NUM',
                      titleValue: cell.size
                    }
                  }
                })
              );
            }
            if (cell.emotion && cell.emotion !== Emotions.NORMAL) {
              blocks.push(
                blockAsXmlNode('studio_setSpriteEmotion', {
                  titles: {
                    SPRITE: spriteIndex,
                    VALUE: cell.emotion
                  }
                })
              );
            }

            spriteIndex++;
          }
          if (cell.tileType & constants.SquareType.SPRITEFINISH) {
            blocks.push(
              blockAsXmlNode('sudio_addGoalXY', {
                values: {
                  XPOS: {
                    type: 'math_number',
                    titleName: 'NUM',
                    titleValue: x * Studio.SQUARE_SIZE
                  },
                  YPOS: {
                    type: 'math_number',
                    titleName: 'NUM',
                    titleValue: y * Studio.SQUARE_SIZE
                  }
                }
              })
            );
          }
        }
      }

      return blocks;
    }
  },
  {
    defaultValues: {
      allowSpritesOutsidePlayspace: false
    },
    generateBlocks: args => {
      return [
        blockAsXmlNode('studio_allowSpritesOutsidePlayspace', {
          titles: {
            VALUE: 'true'
          }
        })
      ];
    }
  }
];

Studio.loadLevel = function() {
  // Load maps.
  Studio.map = level.map.map(row =>
    row.map(cell => {
      // Each cell should be either an integer (in which case we are
      // dealing with the legacy format and should treat that value as
      // the tileType for the cell) or an object (in which case we are
      // dealing with the new format and should treat that value as a
      // serialization of the cell).
      const value = isNaN(parseInt(cell))
        ? studioCell.deserialize(cell)
        : new studioCell(cell);
      if (value.tileType_ & constants.WallCoordsMask) {
        Studio.wallMapCollisions = true;
      }
      return value;
    })
  );
  Studio.wallMap = null; // The map name actually being used.
  Studio.wallMapRequested = null; // The map name requested by the caller.
  Studio.allowSpritesOutsidePlayspace = level.allowSpritesOutsidePlayspace;
  Studio.timeoutFailureTick = level.timeoutFailureTick || Infinity;
  Studio.slowExecutionFactor = skin.slowExecutionFactor || 1;
  Studio.gridAlignedExtraPauseSteps = skin.gridAlignedExtraPauseSteps || 0;
  Studio.ticksBeforeFaceSouth =
    Studio.slowExecutionFactor +
    utils.valueOr(
      level.ticksBeforeFaceSouth,
      constants.IDLE_TICKS_BEFORE_FACE_SOUTH
    );
  Studio.minWorkspaceHeight = level.minWorkspaceHeight;
  Studio.softButtons_ = level.softButtons || {};
  // protagonistSpriteIndex was originally mispelled. accept either spelling.
  Studio.protagonistSpriteIndex = utils.valueOr(
    level.protagonistSpriteIndex,
    level.protaganistSpriteIndex
  );

  switch (level.customGameType) {
    case 'Big Game':
      Studio.customLogic = new BigGameLogic(Studio);
      break;
    case 'Rocket Height':
      Studio.customLogic = new RocketHeightLogic(Studio);
      break;
    case 'Sam the Bat':
      Studio.customLogic = new SamBatLogic(Studio);
      break;
    case 'Ninja Cat':
      Studio.customLogic = new BigGameLogic(Studio, {
        staticPlayer: true
      });
  }
  blocks.registerCustomGameLogic(Studio.customLogic);

  // Custom game logic doesn't work yet in the interpreter.
  Studio.legacyRuntime = !!Studio.customLogic;

  if (level.avatarList) {
    Studio.startAvatars = level.avatarList.slice();
  } else {
    Studio.startAvatars = reorderedStartAvatars(
      skin.avatarList,
      level.firstSpriteIndex
    );
  }

  // Override scalars.
  for (var key in level.scale) {
    Studio.scale[key] = level.scale[key];
  }

  // Measure maze dimensions and set sizes.
  // ROWS: Number of tiles down.
  Studio.ROWS = Studio.map.length;
  // COLS: Number of tiles across.
  Studio.COLS = Studio.map[0].length;
  // Pixel height and width of each maze square (i.e. tile).
  Studio.SQUARE_SIZE = 50;
  Studio.HALF_SQUARE = Studio.SQUARE_SIZE / 2;

  // Height and width of the goal and obstacles.
  Studio.MARKER_HEIGHT = level.markerHeight || 100;
  Studio.MARKER_WIDTH = level.markerWidth || 100;

  Studio.MAZE_WIDTH = Studio.SQUARE_SIZE * Studio.COLS;
  Studio.MAZE_HEIGHT = Studio.SQUARE_SIZE * Studio.ROWS;
  studioApp().MAZE_WIDTH = Studio.MAZE_WIDTH;
  studioApp().MAZE_HEIGHT = Studio.MAZE_HEIGHT;

  Studio.walls = loadWalls();
};

function loadWalls() {
  if (skin.customObstacleZones) {
    return new ObstacleZoneWalls(level, skin, Studio.drawDebugRect);
  } else if (skin.wallMaps) {
    return new CollisionMaskWalls(
      level,
      skin,
      Studio.drawDebugRect,
      Studio.drawDebugOverlay,
      Studio.MAZE_WIDTH,
      Studio.MAZE_HEIGHT
    );
  } else {
    return new TileWalls(
      level,
      skin,
      Studio.drawDebugRect,
      Studio.SQUARE_SIZE,
      Studio.ROWS,
      Studio.COLS,
      Studio.getWallValue
    );
  }
}

/**
 * Returns a list of avatars, reordered such that firstSpriteIndex comes first
 * (and is now at index 0).
 */
function reorderedStartAvatars(avatarList, firstSpriteIndex) {
  firstSpriteIndex = firstSpriteIndex || 0;
  return _.flattenDeep([
    avatarList.slice(firstSpriteIndex),
    avatarList.slice(0, firstSpriteIndex)
  ]);
}

var drawMap = function() {
  var svg = document.getElementById('svgStudio');
  var i;

  // Adjust outer element size.
  svg.setAttribute('width', Studio.MAZE_WIDTH);
  svg.setAttribute('height', Studio.MAZE_HEIGHT);

  // Attach click handler.
  var hammerSvg = new Hammer(svg);
  hammerSvg.on('tap', Studio.onSvgClicked);
  hammerSvg.on('drag', Studio.onSvgDrag);

  // Adjust visualizationColumn width.
  var visualizationColumn = document.getElementById('visualizationColumn');
  visualizationColumn.style.width = Studio.MAZE_WIDTH + 'px';

  var backgroundLayer = document.createElementNS(SVG_NS, 'g');
  backgroundLayer.setAttribute('id', 'backgroundLayer');
  svg.appendChild(backgroundLayer);

  if (Studio.background && skin[Studio.background].background) {
    var tile = document.createElementNS(SVG_NS, 'image');
    tile.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'xlink:href',
      skin[Studio.background].background
    );
    tile.setAttribute('id', 'background');
    tile.setAttribute('height', Studio.MAZE_HEIGHT);
    tile.setAttribute('width', Studio.MAZE_WIDTH);
    tile.setAttribute('x', 0);
    tile.setAttribute('y', 0);
    backgroundLayer.appendChild(tile);
  }

  if (skin.showGrid) {
    const tile = document.createElementNS(SVG_NS, 'image');
    tile.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'xlink:href',
      studioApp().assetUrl('media/skins/studio/grid.svg')
    );
    tile.setAttribute('height', Studio.MAZE_HEIGHT);
    tile.setAttribute('width', Studio.MAZE_WIDTH);
    tile.setAttribute('x', 0);
    tile.setAttribute('y', 0);
    backgroundLayer.appendChild(tile);
  }

  if (level.coordinateGridBackground) {
    studioApp().createCoordinateGridBackground({
      svg: 'backgroundLayer',
      origin: 0,
      firstLabel: 100,
      lastLabel: 300,
      increment: 100
    });
  }

  var spriteLayer = document.createElementNS(SVG_NS, 'g');
  spriteLayer.setAttribute('id', 'spriteLayer');
  svg.appendChild(spriteLayer);

  if (Studio.wallMapCollisions) {
    Studio.drawMapTiles();
  }

  if (Studio.spriteStart_) {
    for (i = 0; i < Studio.spriteCount; i++) {
      var spriteSpeechBubble = document.createElementNS(SVG_NS, 'g');
      spriteSpeechBubble.setAttribute('id', 'speechBubble' + i);
      spriteSpeechBubble.setAttribute('visibility', 'hidden');

      var speechRect = document.createElementNS(SVG_NS, 'path');
      speechRect.setAttribute('id', 'speechBubblePath' + i);
      speechRect.setAttribute('class', 'studio-speech-bubble-path');

      var speechText = document.createElementNS(SVG_NS, 'text');
      speechText.setAttribute('id', 'speechBubbleText' + i);
      speechText.setAttribute('class', 'studio-speech-bubble');

      spriteSpeechBubble.appendChild(speechRect);
      spriteSpeechBubble.appendChild(speechText);
      svg.appendChild(spriteSpeechBubble);
    }
  }

  if (Studio.spriteGoals_) {
    for (i = 0; i < Studio.spriteGoals_.length; i++) {
      Studio.createGoalElements(i, Studio.spriteGoals_[i]);
    }
  }
  Studio.applyGoalEffect();

  // Create cloud elements.
  var cloudGroup = document.createElementNS(SVG_NS, 'g');
  cloudGroup.setAttribute('id', 'cloudLayer');
  for (i = 0; i < constants.MAX_NUM_CLOUDS; i++) {
    var cloud = document.createElementNS(SVG_NS, 'image');
    cloud.setAttribute('id', 'cloud' + i);
    cloudGroup.appendChild(cloud);
  }
  svg.appendChild(cloudGroup);

  var gameTextGroup = document.createElementNS(SVG_NS, 'g');
  gameTextGroup.setAttribute('id', 'gameTextGroup');
  svg.appendChild(gameTextGroup);

  var overlayGroup = document.createElementNS(SVG_NS, 'g');
  overlayGroup.setAttribute('id', 'overlayGroup');
  svg.appendChild(overlayGroup);

  var score = document.createElementNS(SVG_NS, 'text');
  score.setAttribute('id', 'score');
  score.setAttribute('class', 'studio-score');
  score.setAttribute('x', Studio.MAZE_WIDTH / 2);
  score.setAttribute('y', SCORE_TEXT_Y_POSITION);
  score.appendChild(document.createTextNode(''));
  score.setAttribute('visibility', 'hidden');
  gameTextGroup.appendChild(score);

  var victoryText = document.createElementNS(SVG_NS, 'text');
  victoryText.setAttribute('id', 'victoryText');
  victoryText.setAttribute('class', 'studio-victory-text');
  victoryText.setAttribute('x', Studio.MAZE_WIDTH / 2);
  victoryText.setAttribute('y', VICTORY_TEXT_Y_POSITION);
  victoryText.appendChild(document.createTextNode(''));
  victoryText.setAttribute('visibility', 'hidden');
  gameTextGroup.appendChild(victoryText);

  if (dom.isMobile() || dom.isWindowsTouch()) {
    var resetOverlayRect = document.createElementNS(SVG_NS, 'rect');
    resetOverlayRect.setAttribute('width', Studio.MAZE_WIDTH);
    resetOverlayRect.setAttribute('height', Studio.MAZE_HEIGHT);
    resetOverlayRect.setAttribute('fill', 'black');
    resetOverlayRect.setAttribute('opacity', 0.3);
    overlayGroup.appendChild(resetOverlayRect);
    var resetTextA = document.createElementNS(SVG_NS, 'text');
    resetTextA.setAttribute('id', 'resetTextA');
    resetTextA.setAttribute('class', 'studio-reset-text');
    resetTextA.setAttribute('x', Studio.MAZE_WIDTH / 2);
    resetTextA.setAttribute('y', RESET_TEXT_Y_POSITION - 30);
    resetTextA.appendChild(document.createTextNode(studioMsg.tapToPlay()));
    resetTextA.setAttribute('visibility', 'visible');
    overlayGroup.appendChild(resetTextA);
    var resetTextB = document.createElementNS(SVG_NS, 'text');
    resetTextB.setAttribute('id', 'resetTextB');
    resetTextB.setAttribute('class', 'studio-reset-text');
    resetTextB.setAttribute('x', Studio.MAZE_WIDTH / 2);
    resetTextB.setAttribute('y', RESET_TEXT_Y_POSITION);
    resetTextB.appendChild(document.createTextNode(studioMsg.swipeToMove()));
    resetTextB.setAttribute('visibility', 'visible');
    overlayGroup.appendChild(resetTextB);
    var touchDragIcon = document.createElementNS(SVG_NS, 'image');
    touchDragIcon.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'xlink:href',
      studioApp().assetUrl('media/common_images/touch-drag.png')
    );
    var touchIconSize = 300;
    touchDragIcon.setAttribute('width', touchIconSize);
    touchDragIcon.setAttribute('height', touchIconSize);
    touchDragIcon.setAttribute('x', (Studio.MAZE_WIDTH - touchIconSize) / 2);
    touchDragIcon.setAttribute(
      'y',
      (Studio.MAZE_HEIGHT - touchIconSize) / 2 - 25
    );
    overlayGroup.appendChild(touchDragIcon);
  } else {
    var resetText = document.createElementNS(SVG_NS, 'text');
    resetText.setAttribute('id', 'resetText');
    resetText.setAttribute('class', 'studio-reset-text');
    resetText.setAttribute('x', Studio.MAZE_WIDTH / 2);
    resetText.setAttribute('y', RESET_TEXT_Y_POSITION);
    resetText.appendChild(
      document.createTextNode(studioMsg.tapOrClickToReset())
    );
    resetText.setAttribute('visibility', 'visible');
    overlayGroup.appendChild(resetText);
  }

  if (level.floatingScore) {
    var floatingScore = document.createElementNS(SVG_NS, 'text');
    floatingScore.setAttribute('id', 'floatingScore');
    floatingScore.setAttribute('class', 'studio-floating-score');
    floatingScore.setAttribute('x', Studio.MAZE_WIDTH / 2);
    floatingScore.setAttribute('y', SCORE_TEXT_Y_POSITION);
    floatingScore.appendChild(document.createTextNode(''));
    floatingScore.setAttribute('visibility', 'hidden');
    svg.appendChild(floatingScore);
  }

  var titleScreenTitle = document.createElementNS(SVG_NS, 'text');
  titleScreenTitle.setAttribute('id', 'titleScreenTitle');
  titleScreenTitle.setAttribute('class', 'studio-ts-title');
  titleScreenTitle.setAttribute('x', Studio.MAZE_WIDTH / 2);
  titleScreenTitle.setAttribute('y', TITLE_SCREEN_TITLE_Y_POSITION);
  titleScreenTitle.appendChild(document.createTextNode(''));
  titleScreenTitle.setAttribute('visibility', 'hidden');
  svg.appendChild(titleScreenTitle);

  var titleScreenTextGroup = document.createElementNS(SVG_NS, 'g');
  var xPosTextGroup = (Studio.MAZE_WIDTH - TITLE_SCREEN_TEXT_WIDTH) / 2;
  titleScreenTextGroup.setAttribute('id', 'titleScreenTextGroup');
  titleScreenTextGroup.setAttribute('x', xPosTextGroup);
  titleScreenTextGroup.setAttribute('y', TITLE_SCREEN_TEXT_Y_POSITION);
  titleScreenTextGroup.setAttribute(
    'transform',
    'translate(' + xPosTextGroup + ',' + TITLE_SCREEN_TEXT_Y_POSITION + ')'
  );
  titleScreenTextGroup.setAttribute('visibility', 'hidden');

  var titleScreenTextRect = document.createElementNS(SVG_NS, 'rect');
  titleScreenTextRect.setAttribute('id', 'titleScreenTextRect');
  titleScreenTextRect.setAttribute('x', 0);
  titleScreenTextRect.setAttribute('y', 0);
  titleScreenTextRect.setAttribute('width', TITLE_SCREEN_TEXT_WIDTH);
  titleScreenTextRect.setAttribute('class', 'studio-ts-text-rect');

  var titleScreenText = document.createElementNS(SVG_NS, 'text');
  titleScreenText.setAttribute('id', 'titleScreenText');
  titleScreenText.setAttribute('class', 'studio-ts-text');
  titleScreenText.setAttribute('x', TITLE_SCREEN_TEXT_WIDTH / 2);
  titleScreenText.setAttribute('y', 0);
  titleScreenText.appendChild(document.createTextNode(''));

  titleScreenTextGroup.appendChild(titleScreenTextRect);
  titleScreenTextGroup.appendChild(titleScreenText);
  svg.appendChild(titleScreenTextGroup);
};

function collisionTest(x1, x2, xVariance, y1, y2, yVariance) {
  return Math.abs(x1 - x2) <= xVariance && Math.abs(y1 - y2) <= yVariance;
}

Studio.allGoals_ = function() {
  return Studio.spriteGoals_.concat(Studio.dynamicSpriteGoals_);
};

/**
 * Creates DOM elements for the given goal, and augments the goal object
 * with pointers to those elements.
 * Note that if this method is called after the initialization step, it
 * will likely need to be followed with a call to sortDrawOrder.
 *
 * @param {number} i - a unique identifier, used to create ids for
 *        created elements
 * @param {object} goal
 */
Studio.createGoalElements = function(i, goal) {
  var svg = document.getElementById('svgStudio');
  var spriteLayer = document.getElementById('backgroundLayer');

  var goalOverride = utils.valueOr(level.goalOverride, {});
  var numFrames = 1;
  if (goalOverride.goalAnimation && skin.animatedGoalFrames) {
    numFrames = skin.animatedGoalFrames;
  }

  // Calculate the dimensions of the spritesheet & the sprite itself that's rendered
  // out of it.  Precedence order is skin.goalSpriteWidth/Height, goalOverride.imageWidth/Height,
  // and then Studio.MARKER_WIDTH/HEIGHT.
  //
  // Legacy levels might specify goalOverride.imageWidth/Height which are dimensions
  // of the entire spritesheet, and rely upon studio's default MARKER_WIDTH/HEIGHT which
  // are dimensions of the sprite itself.
  // Newer levels might specify skin.goalSpriteWith/Height which are the dimensions of the
  // sprite itself.  The dimensions of the spritesheet are calculated using skin.animatedGoalFrames.
  // The fallback dimensions of both spritesheet and sprite are studio's default
  // MARKER_WIDTH/HEIGHT.

  var spritesheetWidth = skin.goalSpriteWidth
    ? skin.goalSpriteWidth * numFrames
    : utils.valueOr(goalOverride.imageWidth, Studio.MARKER_WIDTH);
  var spritesheetHeight = skin.goalSpriteHeight
    ? skin.goalSpriteHeight
    : utils.valueOr(goalOverride.imageHeight, Studio.MARKER_HEIGHT);

  var spriteWidth = utils.valueOr(skin.goalSpriteWidth, Studio.MARKER_WIDTH);
  var spriteHeight = utils.valueOr(skin.goalSpriteHeight, Studio.MARKER_HEIGHT);

  var offsetX = utils.valueOr(
    goalOverride.goalRenderOffsetX,
    utils.valueOr(skin.goalRenderOffsetX, 0)
  );
  var offsetY = utils.valueOr(
    goalOverride.goalRenderOffsetY,
    utils.valueOr(skin.goalRenderOffsetY, 0)
  );

  // Add finish markers.
  goal.clipPath = document.createElementNS(SVG_NS, 'clipPath');
  goal.clipPath.setAttribute('id', 'finishClipPath' + i);
  goal.clipRect = document.createElementNS(SVG_NS, 'rect');
  goal.clipRect.setAttribute('id', 'finishClipRect' + i);
  goal.clipRect.setAttribute('width', spriteWidth);
  goal.clipRect.setAttribute('height', spriteHeight);
  goal.clipPath.appendChild(goal.clipRect);
  // Safari workaround: Clip paths work better when descendant of an SVGGElement.
  spriteLayer.appendChild(goal.clipPath);

  goal.marker = document.createElementNS(SVG_NS, 'image');
  goal.marker.setAttribute('id', 'spriteFinish' + i);
  goal.marker.setAttribute('width', spritesheetWidth);
  goal.marker.setAttribute('height', spritesheetHeight);
  if (!skin.disableClipRectOnGoals) {
    goal.marker.setAttribute('clip-path', 'url(#' + goal.clipPath.id + ')');
  }
  goal.marker.setAttribute('x', goal.x + offsetX);
  goal.marker.setAttribute('y', goal.y + offsetY);
  goal.marker.setAttributeNS(
    'http://www.w3.org/1999/xlink',
    'xlink:href',
    Studio.getGoalAssetFromSkin()
  );
  goal.marker.setAttribute('opacity', 1);
  goal.clipRect.setAttribute('x', goal.x + offsetX);
  goal.clipRect.setAttribute('y', goal.y + offsetY);
  svg.appendChild(goal.marker);
};

/** @type {ImageFilter} */
var goalFilterEffect = null;

/**
 * Apply the effect specified in skin.goalEffect to all of the goal objects
 * in the level.
 */
Studio.applyGoalEffect = function() {
  if (!goalFilterEffect) {
    var svg = document.getElementById('svgStudio');
    goalFilterEffect = new GlowFilter(svg);
  }

  if (goalFilterEffect) {
    Studio.allGoals_().forEach(function(goal) {
      goalFilterEffect.applyTo(goal.marker);
    });
  }
};

/**
 * Remove the effect specified in skin.goalEffect from all of the goal objects
 * in the level.
 */
Studio.removeGoalEffect = function() {
  if (!goalFilterEffect) {
    return;
  }

  Studio.allGoals_().forEach(function(goal) {
    goalFilterEffect.removeFrom(goal.marker);
  });
};

/**
 * @param scope Object :  The scope in which to execute the delegated function.
 * @param func Function : The function to execute
 * @param data Object or Array : The data to pass to the function. If the
 *   function is also passed arguments, the data is appended to the arguments
 *   list. If the data is an Array, each item is appended as a new argument.
 */
var delegate = function(scope, func, data) {
  return function() {
    var args = Array.prototype.slice.apply(arguments).concat(data);
    func.apply(scope, args);
  };
};

var calcMoveDistanceFromQueues = function(index, modifyQueues) {
  var totalDelta = {x: 0, y: 0};

  Studio.eventHandlers.forEach(function(handler) {
    var cmd = handler.cmdQueue[0];
    if (cmd && cmd.name === 'moveDistance' && cmd.opts.spriteIndex === index) {
      var distThisMove = Math.min(
        cmd.opts.queuedDistance || Infinity,
        Studio.sprite[cmd.opts.spriteIndex].speed
      );
      var moveDirection = utils.normalize(
        Direction.getUnitVector(cmd.opts.dir)
      );
      totalDelta.x += distThisMove * moveDirection.x;
      totalDelta.y += distThisMove * moveDirection.y;

      if (modifyQueues && (moveDirection.x !== 0 || moveDirection.y !== 0)) {
        cmd.opts.queuedDistance -= distThisMove;
        if ('0.00' === Math.abs(cmd.opts.queuedDistance).toFixed(2)) {
          handler.cmdQueue.shift();
        }
      }
    }
  });

  return totalDelta;
};

var cancelQueuedMovements = function(index, yAxis) {
  Studio.eventHandlers.forEach(function(handler) {
    var cmd = handler.cmdQueue[0];
    if (cmd && cmd.name === 'moveDistance' && cmd.opts.spriteIndex === index) {
      var dir = cmd.opts.dir;
      if (yAxis && (dir === Direction.NORTH || dir === Direction.SOUTH)) {
        cmd.opts.queuedDistance = 0;
      } else if (!yAxis && (dir === Direction.EAST || dir === Direction.WEST)) {
        cmd.opts.queuedDistance = 0;
      } else if (!CardinalDirections.includes(dir)) {
        cmd.opts.queuedDistance = 0;
      }
    }
  });
};

//
// Return the next position for this sprite on a given coordinate axis
// given the queued moves (yAxis === false means xAxis)
// NOTE: position values returned are not clamped to playspace boundaries
//

var getNextPosition = function(i, modifyQueues) {
  var delta = calcMoveDistanceFromQueues(i, modifyQueues);
  if (delta.x === 0 && delta.y === 0) {
    return Studio.sprite[i].getNextPosition();
  }
  return {
    x: Studio.sprite[i].x + delta.x,
    y: Studio.sprite[i].y + delta.y
  };
};

//
// Perform Queued Moves in the X and Y axes (called from inside onTick)
//
var performQueuedMoves = function(i) {
  var sprite = Studio.sprite[i];

  var origX = sprite.x;
  var origY = sprite.y;

  var nextPosition = getNextPosition(i, true);
  var newX, newY;

  if (Studio.allowSpritesOutsidePlayspace) {
    newX = nextPosition.x;
    newY = nextPosition.y;
  } else {
    var playspaceBoundaries = Studio.getPlayspaceBoundaries(sprite);

    // Clamp nextPosition.x to boundaries as newX:
    newX = Math.min(
      playspaceBoundaries.right,
      Math.max(playspaceBoundaries.left, nextPosition.x)
    );
    if (nextPosition.x !== newX) {
      cancelQueuedMovements(i, false);
    }

    // Clamp nextPosition.y to boundaries as newY:
    newY = Math.min(
      playspaceBoundaries.bottom,
      Math.max(playspaceBoundaries.top, nextPosition.y)
    );
    if (nextPosition.y !== newY) {
      cancelQueuedMovements(i, true);
    }
  }

  if (Studio.wallMapCollisions && (newX !== origX || newY !== origY)) {
    if (Studio.willSpriteTouchWall(sprite, newX, newY)) {
      if (!Studio.willSpriteTouchWall(sprite, newX, origY)) {
        newY = origY;
        cancelQueuedMovements(i, true);
      } else if (!Studio.willSpriteTouchWall(sprite, origX, newY)) {
        newX = origX;
        cancelQueuedMovements(i, false);
      } else {
        newX = origX;
        newY = origY;
        cancelQueuedMovements(i, false);
        cancelQueuedMovements(i, true);
      }
    }
  }

  sprite.x = newX;
  sprite.y = newY;

  // if sprite position changed, note it
  if (origX !== sprite.x || origY !== sprite.y) {
    sprite.lastMove = Studio.tickCount;
  }
};

//
// Set text into SVG text tspan elements (manual word wrapping)
// Thanks http://stackoverflow.com/questions/
//        7046986/svg-using-getcomputedtextlength-to-wrap-text
//
// opts.svgText: existing svg 'text' element
// opts.text: full-length text string
// opts.width: total width
// opts.maxWidth: max width to try, if the text doesn't fit in width
// opts.fullHeight: total height (fits maxLines of text)
// opts.maxLines: max number of text lines
// opts.lineHeight: height per line of text
// opts.topMargin: top margin
// opts.sideMargin: left & right margin (deducted from total width)
//

var setSvgText = (Studio.setSvgText = function(opts) {
  var width = opts.width;
  var words = opts.text.toString().split(' ');
  var longWord = false;

  while (width <= opts.maxWidth) {
    // Remove any children from the svgText node:
    while (opts.svgText.firstChild) {
      opts.svgText.removeChild(opts.svgText.firstChild);
    }

    var wordIndex = 0;
    for (var line = 1; line <= opts.maxLines; line++) {
      // Create new tspan element
      var tspan = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'tspan'
      );
      tspan.setAttribute('x', width / 2);
      tspan.setAttribute(
        'dy',
        opts.lineHeight + (line === 1 ? opts.topMargin : 0)
      );
      // Create text in tspan element
      var text_node = document.createTextNode(words[wordIndex]);
      wordIndex++;

      // Add text to tspan element
      tspan.appendChild(text_node);
      // Add tspan element to DOM
      opts.svgText.appendChild(tspan);

      if (
        tspan.getComputedTextLength &&
        tspan.getComputedTextLength() > width - 2 * opts.sideMargin &&
        width < opts.maxWidth
      ) {
        // We have a really long word, try to expand to fit it.
        width = Math.min(
          tspan.getComputedTextLength() + 2 * opts.sideMargin,
          opts.maxWidth
        );
        longWord = true;
        break;
      }

      var previousLength;
      do {
        if (wordIndex === words.length) {
          return {
            height: opts.fullHeight - (opts.maxLines - line) * opts.lineHeight,
            width: width
          };
        }

        // Find number of letters in string
        previousLength = tspan.firstChild.data.length;
        // Add next word
        tspan.firstChild.data += ' ' + words[wordIndex];
        wordIndex++;
      } while (
        tspan.getComputedTextLength &&
        tspan.getComputedTextLength() <= width - 2 * opts.sideMargin
      );

      // The last added word made the line too long, remove it
      tspan.firstChild.data = tspan.firstChild.data.slice(0, previousLength);
      wordIndex--;
    }

    if (longWord) {
      longWord = false;
    } else if (width < opts.maxWidth) {
      // Try again with a wider speech bubble
      width = Math.min((width * words.length) / wordIndex, opts.maxWidth);
    } else {
      return {
        height: opts.fullHeight,
        width: width
      };
    }
  }
});

/**
 * Execute the code for all of the event handlers that match an event name
 * @param {string} name Name of the handler we want to call
 * @param {boolean} allowQueueExension When true, we allow additional cmds to
 *  be appended to the queue
 * @param {Array} extraArgs Additional arguments passed into the virtual JS
 *  machine for consumption by the student's event-handling code.
 */
function callHandler(name, allowQueueExtension, extraArgs = []) {
  if (['when-up', 'when-down', 'when-left', 'when-right'].includes(name)) {
    let store = getStore();
    if (!store.getState().arrowDisplay.swipeOverlayHasBeenDismissed) {
      store.dispatch(dismissSwipeOverlay('buttonKeyPress'));
    }
  }
  if (level.autoArrowSteer) {
    var moveDir;
    switch (name) {
      case 'when-up':
        moveDir = Direction.NORTH;
        break;
      case 'when-down':
        moveDir = Direction.SOUTH;
        break;
      case 'when-left':
        moveDir = Direction.WEST;
        break;
      case 'when-right':
        moveDir = Direction.EAST;
        break;
    }
    if (moveDir) {
      Studio.queueCmd(null, 'move', {
        spriteIndex: Studio.protagonistSpriteIndex || 0,
        dir: moveDir
      });
    }
  }

  Studio.eventHandlers.forEach(function(handler) {
    if (studioApp().isUsingBlockly()) {
      // Note: we skip executing the code if we have not completed executing
      // the cmdQueue on this handler (checking for non-zero length)
      if (
        handler &&
        handler.name === name &&
        (allowQueueExtension || 0 === handler.cmdQueue.length)
      ) {
        Studio.currentCmdQueue = handler.cmdQueue;
        try {
          if (Studio.legacyRuntime) {
            handler.func(api, Studio.Globals, ...extraArgs);
          } else {
            handler.func(...extraArgs);
          }
        } catch (e) {
          // Do nothing
          console.error(e);
        }
        Studio.currentCmdQueue = null;
      }
    } else {
      // TODO (cpirich): support events with parameters
      if (handler && handler.name === name) {
        handler.func.apply(null, extraArgs);
      }
    }
  });
}

Studio.initAutoHandlers = function(map) {
  for (var funcName in map) {
    var func = Studio.JSInterpreter.findGlobalFunction(funcName);
    var nativeFunc = CustomMarshalingInterpreter.createNativeFunctionFromInterpreterFunction(
      func
    );
    if (func) {
      registerEventHandler(Studio.eventHandlers, map[funcName], nativeFunc);
    }
  }
};

/**
 * Performs movement on a list of Projectiles or Items. Removes items from the
 * list automatically when they move out of bounds
 * @param {Item[]|Projectile[]} list
 */
function performItemOrProjectileMoves(list) {
  for (var i = list.length - 1; i >= 0; i--) {
    list[i].moveToNextPosition();
    if (list[i].outOfBounds()) {
      list[i].removeElement();
      list.splice(i, 1);
    }
  }
}

/**
 * Triggers display update on a list of Sprites, Projectiles, or Items - for
 * updating position and/or animation frames.
 * @param {Collidable[]} list
 */
function displayCollidables(list) {
  for (var i = list.length - 1; i >= 0; i--) {
    list[i].display();
  }
}

/**
 * Sort the draw order of sprites, explosions, items, and tiles so that items
 * higher on the screen are drawn before the ones in front, for a simple form of
 * z-sorting.
 */
function sortDrawOrder() {
  if (!skin.sortDrawOrder) {
    return;
  }

  var spriteLayer = document.getElementById('spriteLayer');

  var drawArray = [];
  var drawItem;

  // Add items.
  for (var i = 0; i < Studio.items.length; i++) {
    drawItem = {
      element: Studio.items[i].getElement(),
      y:
        Studio.items[i].y +
        Studio.items[i].height / 2 +
        Studio.items[i].renderOffset.y
    };
    drawArray.push(drawItem);

    Studio.drawDebugRect(
      'itemLocation',
      Studio.items[i].x,
      Studio.items[i].y,
      4,
      4
    );
    Studio.drawDebugRect('itemBottom', Studio.items[i].x, drawItem.y, 4, 4);
  }

  // Add sprite elements (both legacy and normal) and explosions.
  for (i = 0; i < Studio.sprite.length; i++) {
    var sprite = Studio.sprite[i];
    var y = sprite.displayY + sprite.height;

    drawItem = {
      element: document.getElementById('explosion' + i),
      y: y
    };
    if (drawItem.element) {
      drawArray.push(drawItem);
    }

    drawItem = {
      element: sprite.getElement(),
      y: y
    };
    if (drawItem.element) {
      drawArray.push(drawItem);
    }

    drawItem = {
      element: sprite.getLegacyElement(),
      y: y
    };
    if (drawItem.element) {
      drawArray.push(drawItem);
    }

    Studio.drawDebugRect('spriteBottom', Studio.sprite[i].x, sprite.y, 4, 4);
  }

  // Add wall tiles.
  for (i = 0; i < Studio.tiles.length; i++) {
    drawArray.push({
      element: document.getElementById('tile_' + i),
      y: Studio.tiles[i].bottomY
    });
  }

  // Add goals.
  var goalHeight = skin.goalCollisionRectHeight || Studio.MARKER_HEIGHT;
  Studio.allGoals_().forEach(function(goal) {
    drawArray.push({
      element: goal.marker,
      y: goal.y + goalHeight
    });
  });

  // Now sort everything by y.
  drawArray = _.sortBy(drawArray, 'y');

  // Carefully place the elements back in the DOM starting at the end of the
  // spriteLayer and, one by one, insert them before the previous one
  // (this prevents flashing in Safari vs. an in-order appendChild() loop)
  var prevNode;
  for (i = drawArray.length - 1; i >= 0; i--) {
    if (prevNode) {
      spriteLayer.insertBefore(drawArray[i].element, prevNode);
    } else {
      spriteLayer.appendChild(drawArray[i].element);
    }
    prevNode = drawArray[i].element;
  }
}

/**
 * This is a little weird, but is effectively a way for us to call api code
 * (i.e. the methods in studio/api.js) so that we can essentially simulate
 * generated code. It does this by creating an event handler for the given name,
 * calling the handler - which results in func being executed to generate a
 * command queue - and then executing the command queue.
 */
Studio.callApiCode = function(name, func) {
  registerEventHandler(Studio.eventHandlers, name, func);
  // generate the cmdQueue
  callHandler(name);
  Studio.executeQueue(name);
};

Studio.onTick = function() {
  Studio.tickCount++;
  var i;

  Studio.clearDebugElements();

  if (Studio.tickCount === constants.CAPTURE_TICK_COUNT) {
    captureThumbnailFromSvg(document.getElementById('svgStudio'));
  }

  var animationOnlyFrame =
    Studio.pauseInterpreter ||
    0 !== (Studio.tickCount - 1) % Studio.slowExecutionFactor;

  if (!animationOnlyFrame && Studio.yieldExecutionTicks > 0) {
    Studio.yieldExecutionTicks--;
  }

  if (Studio.customLogic) {
    Studio.customLogic.onTick();
  }

  if (Studio.tickCount === 1) {
    callHandler('whenGameStarts');
  }

  if (!animationOnlyFrame) {
    Studio.executeQueue('whenGameStarts');

    callHandler('repeatForever');
    Studio.executeQueue('repeatForever');

    for (i = 0; i < Studio.spriteCount; i++) {
      Studio.executeQueue('whenSpriteClicked-' + i);
    }

    // Run key event handlers for any keys that are down:
    for (var key in KeyCodes) {
      if (
        Studio.keyState[KeyCodes[key]] &&
        Studio.keyState[KeyCodes[key]] === 'keydown'
      ) {
        switch (KeyCodes[key]) {
          case KeyCodes.LEFT:
            callHandler('when-left');
            break;
          case KeyCodes.UP:
            callHandler('when-up');
            break;
          case KeyCodes.RIGHT:
            callHandler('when-right');
            break;
          case KeyCodes.DOWN:
            callHandler('when-down');
            break;
        }
      }
    }

    for (var btn in ArrowIds) {
      if (
        Studio.btnState[ArrowIds[btn]] &&
        Studio.btnState[ArrowIds[btn]] === ButtonState.DOWN
      ) {
        switch (ArrowIds[btn]) {
          case ArrowIds.LEFT:
            callHandler('when-left');
            break;
          case ArrowIds.UP:
            callHandler('when-up');
            break;
          case ArrowIds.RIGHT:
            callHandler('when-right');
            break;
          case ArrowIds.DOWN:
            callHandler('when-down');
            break;
        }
      }
    }

    for (var gesture in Studio.gesturesObserved) {
      switch (gesture) {
        case 'left':
          callHandler('when-left');
          break;
        case 'up':
          callHandler('when-up');
          break;
        case 'right':
          callHandler('when-right');
          break;
        case 'down':
          callHandler('when-down');
          break;
      }
      if (0 === Studio.gesturesObserved[gesture]--) {
        delete Studio.gesturesObserved[gesture];
      }
    }

    Studio.executeQueue('when-left');
    Studio.executeQueue('when-up');
    Studio.executeQueue('when-right');
    Studio.executeQueue('when-down');

    // Run any callbacks from blocks, including "ask" blocks and "if"
    // blocks
    for (let i = 0; i < Studio.callbackQueueIndex; i++) {
      Studio.executeQueue(`callbackQueue${i}`);
    }

    updateItems();

    checkForCollisions();
  }

  if (
    Studio.JSInterpreter &&
    !animationOnlyFrame &&
    Studio.yieldExecutionTicks === 0
  ) {
    Studio.JSInterpreter.executeInterpreter(Studio.tickCount === 1);
  }

  var spritesNeedMoreAnimationFrames = false;

  for (i = 0; i < Studio.spriteCount; i++) {
    if (!animationOnlyFrame) {
      performQueuedMoves(i);
    }

    const sprite = Studio.sprite[i];

    // After 5 ticks of no movement, turn sprite forward.
    if (
      sprite.shouldFaceSouthOnIdle() &&
      Studio.tickCount - sprite.lastMove > Studio.ticksBeforeFaceSouth
    ) {
      sprite.setDirection(Direction.NONE);
      Studio.movementAudioOff();
    }

    // Display sprite:
    Studio.displaySprite(i);

    if (sprite.hasActions()) {
      spritesNeedMoreAnimationFrames = true;
    }

    Studio.drawDebugRect(
      'spriteCenter',
      Studio.sprite[i].x,
      Studio.sprite[i].y,
      5,
      5
    );
  }

  // Animate goals
  Studio.animateGoals();

  // Animate clouds
  Studio.animateClouds();

  if (!animationOnlyFrame) {
    performItemOrProjectileMoves(Studio.projectiles);
    performItemOrProjectileMoves(Studio.items);
  }
  displayCollidables(Studio.sprite);
  displayCollidables(Studio.projectiles);
  displayCollidables(Studio.items);

  Studio.updateFloatingScore();

  Studio.drawTimeoutRect();

  sortDrawOrder();

  var currentTime = new Date().getTime();

  if (!Studio.succeededTime && checkFinished()) {
    Studio.succeededTime = currentTime;
  }

  if (!animationOnlyFrame) {
    Studio.executeQueue('whenTouchGoal');
  }

  if (
    Studio.succeededTime &&
    !spritesNeedMoreAnimationFrames &&
    (!level.delayCompletion ||
      currentTime > Studio.succeededTime + level.delayCompletion)
  ) {
    Studio.onPuzzleComplete();
  }

  // We want to make sure any queued event code related to all goals being visited is executed
  // before we evaluate conditions related to this event.  For example, if score is incremented
  // as a result of all goals being visited, recording allGoalsVisited here allows the score
  // to be incremented before we check for a completion condition that looks for both all
  // goals visited, and the incremented score, on the next tick.
  if (Studio.allGoalsVisited()) {
    Studio.trackedBehavior.allGoalsVisited = true;
  }

  // And we don't want a timeout to be used in evaluating conditions before the all goals visited
  // events are processed (as described above), so also record that here.  This is particularly
  // relevant to levels which "time out" immediately when all when_run code is complete.
  if (Studio.timedOut()) {
    Studio.trackedBehavior.timedOut = true;
  }
};

/**
 * Returns the distance between two sprites on the specified axis.
 * @param {number} i1 The index of the first sprite.
 * @param {number} i2 The index of the second sprite.
 * @param {boolean} Whether this is for the Y axis.  If false, then X axis.
 */
function spriteCollisionDistance(i1, i2, yAxis) {
  var sprite1Width = skin.spriteCollisionRectWidth || Studio.sprite[i1].width;
  var sprite1Height =
    skin.spriteCollisionRectHeight || Studio.sprite[i1].height;
  var sprite2Width = skin.spriteCollisionRectWidth || Studio.sprite[i2].width;
  var sprite2Height =
    skin.spriteCollisionRectHeight || Studio.sprite[i2].height;

  var dim1 = yAxis ? sprite1Height : sprite1Width;
  var dim2 = yAxis ? sprite2Height : sprite2Width;
  return (constants.SPRITE_COLLIDE_DISTANCE_SCALING * (dim1 + dim2)) / 2;
}

/**
 * Returns the distance between a sprite and a collidable on the specified axis.
 * @param {number} i1 The index of the sprite.
 * @param {number} i2 The index of the collidable.
 * @param {boolean} Whether this is for the Y axis.  If false, then X axis.
 */
function spriteCollidableCollisionDistance(iS, collidable, yAxis) {
  var spriteWidth = skin.spriteCollisionRectWidth || Studio.sprite[iS].width;
  var spriteHeight = skin.spriteCollisionRectHeight || Studio.sprite[iS].height;
  var collidableWidth = skin.itemCollisionRectWidth || collidable.width;
  var collidableHeight = skin.itemCollisionRectHeight || collidable.height;
  var dim1 = yAxis ? spriteHeight : spriteWidth;
  var dim2 = yAxis ? collidableHeight : collidableWidth;
  return (constants.SPRITE_COLLIDE_DISTANCE_SCALING * (dim1 + dim2)) / 2;
}

/**
 * Returns the distance between a collidable and an edge on the specified axis.
 * @param {number} i1 The index of the collidable.
 * @param {string} i2 The name of the edge.
 * @param {boolean} Whether this is for the Y axis.  If false, then X axis.
 */
function edgeCollidableCollisionDistance(collidable, edgeName, yAxis) {
  var dim1 = yAxis ? collidable.height : collidable.width;
  var dim2;
  if (edgeName === 'left' || edgeName === 'right') {
    dim2 = yAxis ? Studio.MAZE_HEIGHT : 0;
  } else {
    dim2 = yAxis ? 0 : Studio.MAZE_WIDTH;
  }
  return (dim1 + dim2) / 2;
}

/* Checks for collisions between an actor and a list of projectiles or items.
 * Calls startCollision/endCollision and handleCollision for className, but not
 * executeCollision, which is expected to be called afterwards by the caller.
 */
function handleActorCollisionsWithCollidableList(
  spriteIndex,
  xCenter,
  yCenter,
  list,
  autoDisappear
) {
  var collidable, next, className, numItemsOfClass;
  var distanceScaling = constants.SPRITE_COLLIDE_DISTANCE_SCALING;

  // For collisions, only consider sprites/items that are not already fading out.
  var activeCollidables = list.filter(function(collidable) {
    return !(collidable.isFading && collidable.isFading());
  });

  // Traverse the list in reverse order because we may remove elements from the
  // list while inside the loop:
  for (var i = activeCollidables.length - 1; i >= 0; i--) {
    collidable = activeCollidables[i];
    next = collidable.getNextPosition();

    Studio.drawDebugRect(
      'itemCollision',
      next.x,
      next.y,
      distanceScaling * (skin.itemCollisionRectWidth || collidable.width),
      distanceScaling * (skin.itemCollisionRectHeight || collidable.height)
    );
    Studio.drawDebugRect(
      'spriteCollision',
      xCenter,
      yCenter,
      distanceScaling *
        (skin.spriteCollisionRectWidth || Studio.sprite[spriteIndex].width),
      distanceScaling *
        (skin.spriteCollisionRectHeight || Studio.sprite[spriteIndex].height)
    );

    if (
      collisionTest(
        xCenter,
        next.x,
        spriteCollidableCollisionDistance(spriteIndex, collidable, false),
        yCenter,
        next.y,
        spriteCollidableCollisionDistance(spriteIndex, collidable, true)
      )
    ) {
      if (collidable.startCollision(spriteIndex)) {
        Studio.currentEventParams = {eventObject: collidable};
        // Allow cmdQueue extension (pass true) since this handler
        // may be called for multiple collidables before executing the queue
        // below

        // NOTE: not using collideSpriteWith() because collision state is
        // tracked on the collidable in this case
        handleCollision(spriteIndex, collidable.className, true);
        Studio.currentEventParams = null;

        // Make the projectile/item disappear automatically if this parameter
        // is set:
        if (autoDisappear) {
          if (list === Studio.items) {
            // NOTE: we do this only for the Item list (not projectiles)

            // NOTE: if items are allowed to move outOfBounds(), this may never
            // be called because the last item may not be removed here.

            if (activeCollidables.length === 1) {
              callHandler('whenGetAllItems');
              Studio.trackedBehavior.gotAllItems = true;
            }

            className = collidable.className;
            numItemsOfClass = activeCollidables.reduce(function(sum, nextItem) {
              return sum + (className === nextItem.className ? 1 : 0);
            }, 0);

            if (numItemsOfClass === 1) {
              callHandler('whenGetAll-' + className);
            }
          }

          if (collidable.beginRemoveElement) {
            collidable.beginRemoveElement();
          } else {
            collidable.removeElement();
            list.splice(list.indexOf(collidable), 1);
          }
          activeCollidables.splice(i, 1);
        }
      }
    } else {
      collidable.endCollision(spriteIndex);
    }
  }
}

/* Checks for collisions between a collidable and all of the edges.
 * Calls startCollision and endCollision on the projectile. The caller
 * should pass in a function to handle the case when a new collision is
 * detected. executeCollision() is expected to be called later by the caller.
 */
function handleEdgeCollisions(collidable, xPos, yPos, onCollided) {
  for (
    var i = 0;
    i < EdgeClassNames.length && !Studio.allowSpritesOutsidePlayspace;
    i++
  ) {
    var edgeXCenter, edgeYCenter;
    var edgeClass = EdgeClassNames[i];
    switch (edgeClass) {
      case 'top':
        edgeXCenter = Studio.MAZE_WIDTH / 2;
        edgeYCenter = 0;
        break;
      case 'left':
        edgeXCenter = 0;
        edgeYCenter = Studio.MAZE_HEIGHT / 2;
        break;
      case 'bottom':
        edgeXCenter = Studio.MAZE_WIDTH / 2;
        edgeYCenter = Studio.MAZE_HEIGHT;
        break;
      case 'right':
        edgeXCenter = Studio.MAZE_WIDTH;
        edgeYCenter = Studio.MAZE_HEIGHT / 2;
        break;
    }
    if (
      collisionTest(
        xPos,
        edgeXCenter,
        edgeCollidableCollisionDistance(collidable, edgeClass, false),
        yPos,
        edgeYCenter,
        edgeCollidableCollisionDistance(collidable, edgeClass, true)
      )
    ) {
      if (collidable.startCollision(edgeClass)) {
        onCollided(edgeClass);
      }
    } else {
      collidable.endCollision(edgeClass);
    }
  }
}

/* Create an edge collision handler callback for a specific spriteIndex
 */
function createActorEdgeCollisionHandler(spriteIndex) {
  return function(edgeClass) {
    handleCollision(spriteIndex, edgeClass);
  };
}

/* Check for collisions (note that we use the positions they are about
 * to attain with queued moves - this allows the moves to be canceled before
 * the actual movements take place)
 */
function checkForCollisions() {
  checkForItemCollisions();

  for (var i = 0; i < Studio.spriteCount; i++) {
    var sprite = Studio.sprite[i];
    var iHalfWidth = sprite.width / 2;
    var iHalfHeight = sprite.height / 2;
    var iPos = getNextPosition(i, false);
    var iXCenter = iPos.x + iHalfWidth;
    var iYCenter = iPos.y + iHalfHeight;
    for (var j = 0; j < Studio.spriteCount; j++) {
      if (i === j || !sprite.visible || !Studio.sprite[j].visible) {
        // If either sprite isn't visible, only finish queues that have already
        // started.
        executeCollision(i, j);
        continue;
      }
      var jPos = getNextPosition(j, false);
      var jXCenter = jPos.x + Studio.sprite[j].width / 2;
      var jYCenter = jPos.y + Studio.sprite[j].height / 2;
      if (
        collisionTest(
          iXCenter,
          jXCenter,
          spriteCollisionDistance(i, j, false),
          iYCenter,
          jYCenter,
          spriteCollisionDistance(i, j, true)
        )
      ) {
        Studio.collideSpriteWith(i, j);
      } else {
        sprite.endCollision(j);
      }
      executeCollision(i, j);
    }
    if (sprite.visible) {
      handleActorCollisionsWithCollidableList(
        i,
        iXCenter,
        iYCenter,
        Studio.projectiles
      );
      handleActorCollisionsWithCollidableList(
        i,
        iXCenter,
        iYCenter,
        Studio.items,
        level.removeItemsWhenActorCollides
      );

      handleEdgeCollisions(
        sprite,
        iXCenter,
        iYCenter,
        createActorEdgeCollisionHandler(i)
      );

      if (Studio.wallMapCollisions) {
        if (Studio.willSpriteTouchWall(sprite, iPos.x, iPos.y)) {
          cancelQueuedMovements(i, false);
          cancelQueuedMovements(i, true);

          // Since we never overlap the wall/obstacle when blockMovingIntoWalls
          // is set, throttle the event so it doesn't fire every frame while
          // attempting to move into a wall:

          Studio.throttledCollideSpriteWithWallFunctions[i]();
        } else {
          sprite.endCollision('wall');
        }
      }
    }

    // Don't execute actor collision queue(s) until we've handled all
    // wall, projectile, item, and edge collisions. Not sure this is strictly
    // necessary, but it preserves behavior that student code may depend upon.
    executeCollision(i, 'wall');
    for (j = 0; j < EdgeClassNames.length; j++) {
      executeCollision(i, EdgeClassNames[j]);
    }
    for (j = 0; j < skin.ProjectileClassNames.length; j++) {
      executeCollision(i, skin.ProjectileClassNames[j]);
    }
    for (j = 0; j < skin.ItemClassNames.length; j++) {
      executeCollision(i, skin.ItemClassNames[j]);
      if (level.removeItemsWhenActorCollides) {
        Studio.executeQueue('whenGetAll-' + skin.ItemClassNames[j]);
      }
    }
    if (level.removeItemsWhenActorCollides) {
      Studio.executeQueue('whenGetAllItems');
    }
  }
}

/* Create an edge collision handler callback for a specific item
 */
function createItemEdgeCollisionHandler(item) {
  return function(edgeClass) {
    Studio.currentEventParams = {eventObject: item};
    // Allow cmdQueue extension (pass true) since this handler
    // may be called for multiple items before executing the queue
    // below
    handleItemCollision(item.className, edgeClass, true);
    Studio.currentEventParams = null;
  };
}

/* Calls each item's update function
 */
function updateItems() {
  // Traverse the list in reverse order because we may remove elements from the
  // list while inside the loop:
  for (var i = Studio.items.length - 1; i >= 0; i--) {
    var item = Studio.items[i];

    item.update();

    if (item.hasCompletedFade()) {
      item.removeElement();
      Studio.items.splice(i, 1);
    }
  }
  Studio.sprite.forEach(sprite => {
    sprite.update();
  });
}

function checkForItemCollisions() {
  for (var i = 0; i < Studio.items.length; i++) {
    var item = Studio.items[i];
    var next = item.getNextPosition();

    if (item.isFading && item.isFading()) {
      continue;
    }

    if (Studio.wallMapCollisions) {
      if (Studio.walls.willCollidableTouchWall(item, next.x, next.y)) {
        Studio.currentEventParams = {eventObject: item};
        // Allow cmdQueue extension (pass true) since this handler
        // may be called for multiple items before executing the queue
        // below
        Studio.collideItemWith(item, 'wall', true);
        Studio.currentEventParams = null;
      } else {
        item.endCollision('wall');
      }
    }

    if (!Studio.allowSpritesOutsidePlayspace) {
      handleEdgeCollisions(
        item,
        next.x,
        next.y,
        createItemEdgeCollisionHandler(item)
      );
    }

    // After collisions have been handled for these items, now execute the
    // command queues for this item:
    executeItemCollision(item.className, 'wall');
    for (var j = 0; j < EdgeClassNames.length; j++) {
      executeItemCollision(item.className, EdgeClassNames[j]);
    }
  }
}

/**
 * Test to see if an actor sprite will be touching a wall given particular X/Y
 * position coordinates (top-left)
 */
Studio.willSpriteTouchWall = function(sprite, xPos, yPos) {
  var xCenter = xPos + sprite.width / 2;
  var yCenter = yPos + sprite.height / 2;
  return Studio.walls.willCollidableTouchWall(sprite, xCenter, yCenter);
};

/**
 * Test to see if an actor sprite will be beyond its given playspace boundaries
 * if it is moved to a given X/Y position.
 * @param {Sprite} sprite
 * @param {number} xPos
 * @param {number} yPos
 */
Studio.willSpriteLeavePlayspace = function(sprite, xPos, yPos) {
  var boundary = Studio.getPlayspaceBoundaries(sprite);
  return (
    xPos < boundary.left ||
    xPos > boundary.right ||
    yPos < boundary.top ||
    yPos > boundary.bottom
  );
};

/**
 * Get a wall value (either a SquareType.WALL value or a specific row/col tile
 * from a 16x16 grid shifted into bits 16-23).
 */

Studio.getWallValue = function(row, col) {
  if (row < 0 || row >= Studio.ROWS || col < 0 || col >= Studio.COLS) {
    return 0;
  }

  if (Studio.wallMap) {
    return skin[Studio.wallMap]
      ? skin[Studio.wallMap][row][col] << constants.WallCoordsShift
      : 0;
  } else {
    return Studio.map[row][col].getTileType() & constants.WallAnyMask;
  }
};

Studio.onSvgDrag = function(e) {
  if (Studio.tickCount > 0) {
    Studio.gesturesObserved[e.gesture.direction] = Math.round(
      e.gesture.distance / DRAG_DISTANCE_TO_MOVE_RATIO
    );
    e.gesture.preventDefault();
  }
};

Studio.onKey = function(e) {
  // Store the most recent event type per-key
  Studio.keyState[e.keyCode] = e.type;

  // If we are actively running our tick loop, suppress default event handling
  if (
    Studio.tickCount > 0 &&
    e.keyCode >= KeyCodes.LEFT &&
    e.keyCode <= KeyCodes.DOWN
  ) {
    e.preventDefault();
  }
};

Studio.onArrowButtonDown = function(e, idBtn) {
  // Store the most recent event type per-button
  Studio.btnState[idBtn] = ButtonState.DOWN;
  e.preventDefault(); // Stop normal events so we see mouseup later.
};

Studio.onSpriteClicked = function(e, spriteIndex) {
  // If we are "running", call the event handler if registered.
  if (Studio.tickCount > 0) {
    callHandler('whenSpriteClicked-' + spriteIndex);
  }
  e.preventDefault(); // Stop normal events.
};

Studio.onSvgClicked = function(e) {
  if (
    level.tapSvgToRunAndReset &&
    Studio.gameState === Studio.GameStates.WAITING
  ) {
    Studio.runButtonClick();
  } else if (
    level.tapSvgToRunAndReset &&
    Studio.gameState === Studio.GameStates.OVER
  ) {
    studioApp().resetButtonClick();
  } else if (Studio.tickCount > 0) {
    // If we are "running", check the cmdQueues.
    // Check the first command in all of the cmdQueues to see if there is a
    // pending "wait for click" command
    Studio.eventHandlers.forEach(function(handler) {
      var cmd = handler.cmdQueue[0];

      if (cmd && cmd.opts.waitForClick && !cmd.opts.complete) {
        if (cmd.opts.waitCallback) {
          cmd.opts.waitCallback();
        }
        cmd.opts.complete = true;
      }
    });
  }
  e.preventDefault(); // Stop normal events.
};

Studio.onArrowButtonUp = function(e, idBtn) {
  // Store the most recent event type per-button
  Studio.btnState[idBtn] = ButtonState.UP;
};

Studio.onMouseUp = function(e) {
  // Reset btnState on mouse up
  Studio.btnState = {};
};

Studio.initSprites = function() {
  Studio.spriteCount = 0;
  Studio.sprite = [];
  Studio.startTime = null;

  Studio.spriteGoals_ = [];

  let spriteOverrides = {};

  // Locate the start and finish positions.
  for (var row = 0; row < Studio.ROWS; row++) {
    for (var col = 0; col < Studio.COLS; col++) {
      if (Studio.map[row][col].getTileType() & SquareType.SPRITEFINISH) {
        Studio.spriteGoals_.push({
          x: col * Studio.SQUARE_SIZE,
          y: row * Studio.SQUARE_SIZE,
          finished: false
        });
      } else if (Studio.map[row][col].getTileType() & SquareType.SPRITESTART) {
        let cell = Studio.map[row][col].serialize();
        if (0 === Studio.spriteCount) {
          Studio.spriteStart_ = [];
        }
        if (cell.sprite !== undefined) {
          let adjustedSprite = cell.sprite - (level.firstSpriteIndex || 0);
          if (adjustedSprite < 0) {
            adjustedSprite += Studio.startAvatars.length;
          }
          spriteOverrides[Studio.spriteCount] =
            Studio.startAvatars[adjustedSprite];
        }
        Studio.spriteStart_[Studio.spriteCount] = Object.assign({}, cell, {
          x: col * Studio.SQUARE_SIZE,
          y: row * Studio.SQUARE_SIZE
        });
        Studio.spriteCount++;
      }
    }
  }

  Object.assign(Studio.startAvatars, spriteOverrides);

  if (studioApp().isUsingBlockly()) {
    // Update the sprite count in the blocks:
    blocks.setSpriteCount(Blockly, Studio.spriteCount);
    blocks.setStartAvatars(Studio.startAvatars);

    if (level.projectileCollisions) {
      blocks.enableProjectileCollisions(Blockly);
    }
  }
};

/**
 * Initialize Blockly and Studio for read-only (blocks feedback).
 * Called on iframe load for read-only.
 */
Studio.initReadonly = function(config) {
  // Do some minimal level loading and sprite initialization so that
  // we can ensure that the blocks are appropriately modified for this level
  skin = config.skin;
  level = config.level;

  // Initialize paramLists with skin and level data:
  paramLists.initWithSkinAndLevel(skin, level);

  Studio.loadLevel();

  config.appMsg = studioMsg;

  Studio.initSprites();

  studioApp().initReadonly(config);
};

/**
 * Initialize Blockly and the Studio app.  Called on page load.
 */
Studio.init = function(config) {
  // replace studioApp() methods with our own
  studioApp().reset = this.reset.bind(this);
  studioApp().runButtonClick = this.runButtonClick.bind(this);

  // Set focus on the run button so key events can be handled
  // right from the start without requiring the user to adjust focus.
  // (Required for IE11 at least, and takes focus away from text mode editor
  // in droplet.)
  $(window).on('run_button_pressed', function() {
    document.getElementById('runButton').focus();
  });

  Studio.projectiles = [];
  Studio.items = [];
  Studio.itemSpeed = {};
  Studio.itemActivity = {};
  Studio.eventHandlers = [];
  Studio.perExecutionTimeouts = [];
  Studio.tickIntervalId = null;
  Studio.tiles = [];
  Studio.tilesDrawn = false;

  Studio.spriteGoals_ = [];
  Studio.dynamicSpriteGoals_ = [];

  Studio.cloudStep = 0;

  Studio.clearEventHandlersKillTickLoop();
  skin = config.skin;
  level = config.level;

  consoleLogger = new JsInterpreterLogger(window.console);
  // Set up an error handler for student errors and warnings
  // in JavaScript/Droplet mode.
  injectErrorHandler(
    new JavaScriptModeErrorHandler(() => Studio.JSInterpreter, consoleLogger)
  );

  // Allow any studioMsg string to be re-mapped on a per-level basis:
  for (var prop in level.msgStringOverrides) {
    studioMsg[prop] = studioMsg[level.msgStringOverrides[prop]];
  }

  // Initialize paramLists with skin and level data:
  paramLists.initWithSkinAndLevel(skin, level);

  // In our Algebra course, we want to gray out undeletable blocks. I'm not sure
  // whether or not that's desired in our other courses.
  var isAlgebraLevel = !!level.useContractEditor;
  config.grayOutUndeletableBlocks = isAlgebraLevel;

  Studio.loadLevel();

  Studio.background = getDefaultBackgroundName();

  if (Studio.customLogic) {
    // We don't want icons in instructions for our custom logic base games
    skin.staticAvatar = null;
    skin.smallStaticAvatar = null;
    skin.failureAvatar = null;
    skin.winAvatar = null;
  }

  window.addEventListener('keydown', Studio.onKey, false);
  window.addEventListener('keyup', Studio.onKey, false);

  var levelTracks = [];
  if (level.music && skin.musicMetadata) {
    levelTracks = skin.musicMetadata.filter(function(trackMetadata) {
      return level.music.indexOf(trackMetadata.name) !== -1;
    });
  }

  Studio.makeThrottledPlaySound();

  /**
   * Helper that handles music loading/playing/crossfading for the level.
   * @type {MusicController}
   */
  Studio.musicController = new MusicController(
    Sounds.getSingleton(),
    skin.assetUrl,
    levelTracks
  );

  /**
   * Defines the set of possible movement sound effects for each playlab actor.
   * Populated just-in-time by setSprite to avoid preparing audio for actors
   * we never use.
   * @type {Object}
   */
  Studio.movementAudioEffects = {};

  config.loadAudio = function() {
    var soundFileNames = [];
    // We want to load the built-in sounds in the skin
    soundFileNames.push.apply(soundFileNames, skin.builtinSounds);
    // We also want to load the student accessible list of effects available in the skin
    soundFileNames.push.apply(soundFileNames, skin.sounds);
    // We also want to load the movement sounds used in hoc2015
    soundFileNames.push.apply(
      soundFileNames,
      Studio.getMovementSoundFileNames(skin)
    );
    // No need to load anything twice, so de-dupe our list.
    soundFileNames = _.uniq(soundFileNames);

    skin.soundFiles = {};
    soundFileNames.forEach(function(sound) {
      sound = sound.toLowerCase();
      skin.soundFiles[sound] = [
        skin.assetUrl(sound + '.mp3'),
        skin.assetUrl(sound + '.ogg')
      ];
      studioApp().loadAudio(skin.soundFiles[sound], sound);
    });

    // Handle music separately - the music controller does its own preloading.
    Studio.musicController.preload();
  };

  // Add a post-video hook to start the background music, if available.
  config.level.afterVideoBeforeInstructionsFn = showInstructions => {
    Sounds.getSingleton().whenAudioUnlocked(() =>
      Studio.musicController.play()
    );
    showInstructions();
  };

  config.afterInject = function() {
    // Connect up arrow button event handlers
    for (var btn in ArrowIds) {
      dom.addMouseUpTouchEvent(
        document.getElementById(ArrowIds[btn]),
        delegate(this, Studio.onArrowButtonUp, ArrowIds[btn])
      );
      dom.addMouseDownTouchEvent(
        document.getElementById(ArrowIds[btn]),
        delegate(this, Studio.onArrowButtonDown, ArrowIds[btn])
      );
    }
    document.addEventListener('mouseup', Studio.onMouseUp, false);

    if (studioApp().isUsingBlockly()) {
      /**
       * The richness of block colours, regardless of the hue.
       * MOOC blocks should be brighter (target audience is younger).
       * Must be in the range of 0 (inclusive) to 1 (exclusive).
       * Blockly's default is 0.45.
       */
      Blockly.HSV_SATURATION = 0.6;

      Blockly.SNAP_RADIUS *= Studio.scale.snapRadius;

      if (Blockly.contractEditor) {
        Blockly.contractEditor.registerTestHandler(
          Studio.getStudioExampleFailure
        );
      }
    }

    drawMap();
  };

  config.afterClearPuzzle = function() {
    studioApp().resetButtonClick();
  };

  // Since we allow "show code" for some blockly levels with move blocks,
  // we supply a polishCodeHook function here to make the generated code look
  // more readable:
  config.polishCodeHook = function(code) {
    if (studioApp().isUsingBlockly()) {
      var regexpMoveUpBlock = /Studio.move\('\S*', 0, 1\);/g;
      code = code.replace(regexpMoveUpBlock, 'moveUp();');
      var regexpMoveRightBlock = /Studio.move\('\S*', 0, 2\);/g;
      code = code.replace(regexpMoveRightBlock, 'moveRight();');
      var regexpMoveDownBlock = /Studio.move\('\S*', 0, 4\);/g;
      code = code.replace(regexpMoveDownBlock, 'moveDown();');
      var regexpMoveLeftBlock = /Studio.move\('\S*', 0, 8\);/g;
      code = code.replace(regexpMoveLeftBlock, 'moveLeft();');
    }
    return code;
  };

  if (project.getStandaloneApp() === 'playlab') {
    // Only apply special remixing to vanilla playlab
    config.prepareForRemix = Studio.prepareForRemix;
  }

  config.twitter = skin.twitterOptions || twitterOptions;

  // for this app, show make your own button if on share page
  config.makeYourOwn = config.share;

  config.makeString = studioMsg.makeYourOwn();
  config.makeUrl = 'http://code.org/studio';
  config.makeImage = studioApp().assetUrl('media/promo.png');

  // Disable "show code" button in feedback dialog and workspace if blockly,
  // unless the level specifically requests it
  config.enableShowCode = studioApp().editCode
    ? true
    : utils.valueOr(level.enableShowCode, false);
  config.varsInGlobals = true;
  config.dropletConfig = dropletConfig;
  config.dropIntoAceAtLineStart = true;
  config.showDropdownInPalette = true;
  config.unusedConfig = [];
  for (prop in skin.AutohandlerTouchItems) {
    AUTO_HANDLER_MAP[prop] =
      'whenSpriteCollided-' +
      (Studio.protagonistSpriteIndex || 0) +
      '-' +
      skin.AutohandlerTouchItems[prop];
  }
  for (prop in skin.AutohandlerGetAllItems) {
    AUTO_HANDLER_MAP[prop] = 'whenGetAll-' + skin.AutohandlerGetAllItems[prop];
  }
  for (prop in level.autohandlerOverrides) {
    AUTO_HANDLER_MAP[prop] = level.autohandlerOverrides[prop];
  }
  for (var handlerName in AUTO_HANDLER_MAP) {
    config.unusedConfig.push(handlerName);
  }

  config.appMsg = studioMsg;

  Studio.initSprites();

  Studio.makeThrottledSpriteWallCollisionHelpers();

  var onMount = function() {
    studioApp().init(config);

    var finishButton = document.getElementById('finishButton');
    if (finishButton) {
      dom.addClickTouchEvent(finishButton, Studio.onPuzzleComplete);
    }

    // pre-load images asynchronously
    // (to reduce the likelihood that there is a delay when images
    //  are changed at runtime)
    if (config.skin.preloadAssets) {
      preloadActorImages();
      preloadProjectileAndItemImages();
      preloadBackgroundImages();
    }
  };

  // Override Page constants
  const appSpecificConstants = {
    hideCoordinateOverlay:
      !level.toolbox || !level.toolbox.match(/studio_setSpriteXY/)
  };

  // for hoc2015x, we only have permission to show the Rey avatar for approved
  // scripts. For all others, we override the avatars with an empty image
  if (
    config.skin.avatarAllowedScripts &&
    !config.skin.avatarAllowedScripts.includes(config.scriptName)
  ) {
    appSpecificConstants.smallStaticAvatar = config.skin.blankAvatar;
    appSpecificConstants.failureAvatar = config.skin.blankAvatar;
  }
  studioApp().setPageConstants(config, appSpecificConstants);
  var isRtl = getStore().getState().isRtl;
  var visualizationColumn = (
    <StudioVisualizationColumn
      isRtl={isRtl}
      finishButton={!level.isProjectLevel}
    />
  );

  ReactDOM.render(
    <Provider store={getStore()}>
      <AppView visualizationColumn={visualizationColumn} onMount={onMount} />
    </Provider>,
    document.getElementById(config.containerId)
  );
};

Studio.prepareForRemix = function() {
  if (
    !level.initializationBlocks &&
    REMIX_PROPS.every(group =>
      Object.keys(group.defaultValues).every(
        prop =>
          level[prop] === undefined || level[prop] === group.defaultValues[prop]
      )
    )
  ) {
    // Do nothing if all the props match the defaults
    return Promise.resolve();
  }

  const blocksDom = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
  const blocksDocument = blocksDom.ownerDocument;

  let whenRun = blocksDom.querySelector('block[type="when_run"]');
  if (!whenRun) {
    whenRun = blocksDocument.createElement('block');
    whenRun.setAttribute('type', 'when_run');
    blocksDom.appendChild(whenRun);
  }
  let next = whenRun.querySelector('next');
  if (next) {
    whenRun.removeChild(next);
  }

  const insertBeforeNext = block => {
    if (next) {
      block.appendChild(next);
    }
    next = blocksDocument.createElement('next');
    next.appendChild(block);
  };

  for (let group of REMIX_PROPS) {
    let customized = false;
    const blockArgs = {};
    for (let prop in group.defaultValues) {
      const value = level[prop];
      if (value !== undefined && value !== group.defaultValues[prop]) {
        customized = true;
        blockArgs[prop] = value;
      } else {
        blockArgs[prop] = group.defaultValues[prop];
      }
    }
    if (!customized) {
      continue;
    }
    const newBlocks = group.generateBlocks(blockArgs);
    // insertBeforeNext adds blocks to the top, just below when_run. Insert the
    // blocks in reverse order so that they stay in the same order as newBlocks
    for (let i = newBlocks.length - 1; i >= 0; i--) {
      insertBeforeNext(newBlocks[i]);
    }
  }

  if (level.initializationBlocks) {
    const root = parseElement(level.initializationBlocks);
    const topNodes = root.childNodes;
    for (let i = topNodes.length - 1; i >= 0; i--) {
      const topBlock = topNodes[i];
      if (
        topBlock.getAttribute &&
        topBlock.getAttribute('type') === 'when_run'
      ) {
        let lastBlock = topBlock;
        let firstBlock = null;
        let foundNextBlock = true;
        while (foundNextBlock) {
          foundNextBlock = false;
          for (let block of lastBlock.childNodes) {
            if (block.tagName && block.tagName.toLowerCase() === 'next') {
              for (let j = 0; j < block.childNodes.length; j++) {
                const childBlock = block.childNodes[j];
                if (
                  childBlock.tagName &&
                  childBlock.tagName.toLowerCase() === 'block'
                ) {
                  lastBlock = childBlock;
                  break;
                }
              }
              foundNextBlock = true;
              if (firstBlock === null) {
                firstBlock = lastBlock;
              }
              break;
            }
          }
        }
        if (lastBlock === topBlock) {
          continue;
        }
        lastBlock.appendChild(next);
        const newNext = blocksDocument.createElement('next');
        newNext.appendChild(firstBlock);
        next = newNext;
      } else {
        root.removeChild(topBlock);
        blocksDom.appendChild(topBlock);
      }
    }
  }

  whenRun.appendChild(next);
  cleanBlocks(blocksDom);

  Blockly.mainBlockSpace.clear();
  Blockly.Xml.domToBlockSpace(Blockly.mainBlockSpace, blocksDom);
  return Promise.resolve();
};

/**
 * Get a flattened list of all the sound file names (sans extensions)
 * specified in the skin for avatar movement (these may be omitted from the
 * skin.sounds list because we don't want them accessible to the player).
 * @param {Object} level skin from which to extract sound effect names.
 * @returns {string[]} which may contain duplicates but will not have any
 *          undefined entries.
 */
Studio.getMovementSoundFileNames = function(fromSkin) {
  var avatarList = fromSkin.avatarList || [];
  return avatarList
    .map(function(avatarName) {
      var movementAudio = fromSkin[avatarName].movementAudio || [];
      return movementAudio.reduce(function(memo, nextOption) {
        return memo.concat([nextOption.begin, nextOption.loop, nextOption.end]);
      }, []);
    })
    .reduce(function(memo, next) {
      return memo.concat(next);
    }, [])
    .filter(function(fileName) {
      return fileName !== undefined;
    });
};

var preloadImage = function(url) {
  if (url) {
    var img = new Image();
    img.src = url;
  }
};

var preloadBackgroundImages = function() {
  var imageChoices = skin.backgroundChoicesK1;
  for (var i = 0; i < imageChoices.length; i++) {
    preloadImage(imageChoices[i][0]);
  }
};

var preloadProjectileAndItemImages = function() {
  for (var i = 0; i < skin.ProjectileClassNames.length; i++) {
    preloadImage(skin[skin.ProjectileClassNames[i]]);
  }
  for (i = 0; i < skin.ItemClassNames.length; i++) {
    preloadImage(skin[skin.ItemClassNames[i]]);
  }
};

var preloadActorImages = function() {
  for (var i = 0; i < skin.avatarList.length; i++) {
    preloadImage(skin[skin.avatarList[i]].sprite);
    preloadImage(skin[skin.avatarList[i]].walk);
  }
};

/**
 * Clean up a list of Items or Projectiles.
 */
function resetItemOrProjectileList(list) {
  for (var i = 0; i < list.length; i++) {
    list[i].removeElement();
  }
  // Set length because list = [] will not modify array passed in by reference
  list.length = 0;
}

/**
 * Clear the event handlers and stop the onTick timer.
 */
Studio.clearEventHandlersKillTickLoop = function() {
  // Check the first command in all of the cmdQueues and clear the timeout
  // if there is a pending wait command
  Studio.eventHandlers.forEach(function(handler) {
    var cmd = handler.cmdQueue[0];

    if (cmd && cmd.opts && cmd.opts.waitTimeout && !cmd.opts.complete) {
      // Note: not calling waitCallback() or setting complete = true
      window.clearTimeout(cmd.opts.waitTimeout);
    }
  });
  Studio.eventHandlers = [];
  Studio.perExecutionTimeouts.forEach(function(timeout) {
    clearTimeout(timeout);
  });
  Studio.pauseExecution();
  Studio.perExecutionTimeouts = [];
  Studio.tickCount = 0;
  Studio.callbackQueueIndex = 0;
  for (var i = 0; i < Studio.spriteCount; i++) {
    if (Studio.sprite[i] && Studio.sprite[i].bubbleTimeout) {
      window.clearTimeout(Studio.sprite[i].bubbleTimeout);
    }
  }
};

/**
 * Return the name (can be dereferenced as skin[name]) of the default background
 * (1st priority is to force to grid if specified by the level, the 2nd priority
 * is to honor the level-specific background value, the 3rd priority is to
 * fall back to the skin's value, which is also used for the blockly block).
 */
function getDefaultBackgroundName() {
  return level.coordinateGridBackground
    ? 'grid'
    : level.background || skin.defaultBackground;
}

function getDefaultMapName() {
  return Studio.wallMapCollisions ? level.wallMap : undefined;
}

/**
 * Reset the app to the start position and kill any pending animation tasks.
 * @param {boolean} first True if an opening animation is to be played.
 */
Studio.reset = function(first) {
  var i;
  Studio.clearEventHandlersKillTickLoop();
  Studio.hideInputPrompt();
  Studio.gameState = Studio.GameStates.WAITING;

  resetItemOrProjectileList(Studio.projectiles);
  resetItemOrProjectileList(Studio.items);

  var svg = document.getElementById('svgStudio');

  if (Studio.customLogic) {
    Studio.customLogic.reset();
  }

  // Soft buttons
  var softButtonCount = 0;
  for (i = 0; i < Studio.softButtons_.length; i++) {
    document.getElementById(Studio.softButtons_[i]).style.display = 'inline';
    softButtonCount++;
  }
  if (softButtonCount) {
    getStore().dispatch(showArrowButtons());
    $('#soft-buttons').addClass('soft-buttons-' + softButtonCount);
  }

  // True if we should fail before execution, even if freeplay
  Studio.preExecutionFailure = false;
  Studio.message = null;
  Studio.pauseInterpreter = false;

  // True if we have set testResults using level progressConditions
  Studio.progressConditionTestResult = false;

  // Reset the score and title screen.
  Studio.playerScore = 0;
  Studio.scoreText = null;
  Studio.victoryText = '';
  document.getElementById('score').setAttribute('visibility', 'hidden');
  document.getElementById('victoryText').setAttribute('visibility', 'hidden');
  if (dom.isMobile() || dom.isWindowsTouch()) {
    var resetTextA = document.getElementById('resetTextA');
    var resetTextB = document.getElementById('resetTextB');
    if (level.tapSvgToRunAndReset) {
      resetTextA.textContent = studioMsg.tapToPlay();
      resetTextB.textContent = studioMsg.swipeToMove();
      resetTextA.setAttribute('visibility', 'visible');
      resetTextB.setAttribute('visibility', 'visible');
      $('#overlayGroup *').attr('visibility', 'visible');
    } else {
      resetTextA.setAttribute('visibility', 'hidden');
      resetTextB.setAttribute('visibility', 'hidden');
      $('#overlayGroup *').attr('visibility', 'hidden');
    }
  } else {
    var resetText = document.getElementById('resetText');
    if (level.tapSvgToRunAndReset) {
      resetText.textContent = studioMsg.tapOrClickToPlay();
      resetText.setAttribute('visibility', 'visible');
    } else {
      resetText.setAttribute('visibility', 'hidden');
    }
  }
  if (level.floatingScore) {
    document
      .getElementById('floatingScore')
      .setAttribute('visibility', 'hidden');
  }
  document
    .getElementById('titleScreenTitle')
    .setAttribute('visibility', 'hidden');
  document
    .getElementById('titleScreenTextGroup')
    .setAttribute('visibility', 'hidden');

  // Reset configurable variables
  Studio.background = null;
  Studio.wallMap = null;
  Studio.wallMapRequested = null;
  Studio.walls.setWallMapRequested(null);
  Studio.setBackground({value: getDefaultBackgroundName()});
  var wallOverlay = document.getElementById('wallOverlay');
  if (wallOverlay) {
    wallOverlay.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'xlink:href',
      ''
    );
  }

  // Reset currentCmdQueue and various counts:
  Studio.gesturesObserved = {};
  Studio.currentCmdQueue = null;
  // Number of things that have been said.  Used to validate level completion.
  Studio.sayComplete = 0;
  Studio.playSoundCount = 0;

  // More things used to validate level completion.
  Studio.trackedBehavior = {
    removedItemCount: 0,
    touchedHazardCount: 0,
    setActivityRecord: null,
    hasSetSprite: false,
    hasSetDroidSpeed: false,
    hasSetBackground: false,
    hasSetMap: false,
    hasAddedItem: false,
    hasWonGame: false,
    hasLostGame: false,
    allGoalsVisited: false,
    timedOut: false,
    gotAllItems: false,
    removedItems: {},
    createdItems: {},
    hasSetEmotion: false,
    hasThrownProjectile: false
  };

  // Reset goal successState:
  if (level.goal) {
    level.goal.successState = {};
  }

  // Reset the Globals object used to contain program variables:
  Studio.Globals = {};

  if (consoleLogger) {
    consoleLogger.detach();
  }

  // Reset execution state:
  Studio.yieldExecutionTicks = 0;
  if (studioApp().editCode) {
    Studio.executionError = null;
    if (Studio.JSInterpreter) {
      Studio.JSInterpreter.deinitialize();
      Studio.JSInterpreter = null;
    }
  }

  var renderOffset = {
    x: 0,
    y: 0
  };
  if (skin.gridAlignedMovement) {
    renderOffset.x = skin.gridSpriteRenderOffsetX || 0;
    renderOffset.y = skin.gridSpriteRenderOffsetY || 0;
  }
  // Move sprites into position.
  for (i = 0; i < Studio.spriteCount; i++) {
    if (Studio.sprite[i]) {
      Studio.sprite[i].removeElement();
    }
    var spriteStart = Studio.spriteStart_[i];
    Studio.sprite[i] = new Sprite({
      x: spriteStart.x,
      y: spriteStart.y,
      displayX: spriteStart.x,
      displayY: spriteStart.y,
      loop: true,
      speed: spriteStart.speed || constants.DEFAULT_SPRITE_SPEED,
      size: spriteStart.size || constants.DEFAULT_SPRITE_SIZE,
      dir: spriteStart.direction || Direction.NONE,
      displayDir: spriteStart.direction || Direction.NONE,
      emotion: spriteStart.emotion || level.defaultEmotion || Emotions.NORMAL,
      renderOffset: renderOffset,
      // tickCount of last time sprite moved,
      lastMove: Infinity,
      // overridden as soon as we call setSprite
      visible: !level.spritesHiddenToStart
    });
    Studio.lastMoveSingleDir = spriteStart.direction;

    var sprite = i % Studio.startAvatars.length;

    var opts = {
      spriteIndex: i,
      value: Studio.startAvatars[sprite],
      forceHidden: level.spritesHiddenToStart
    };
    Studio.setSprite(opts);
    Studio.displaySprite(i);
    document
      .getElementById('speechBubble' + i)
      .setAttribute('visibility', 'hidden');

    Studio.sprite[i].setOpacity(1);

    var explosion = document.getElementById('explosion' + i);
    if (explosion) {
      explosion.setAttribute('visibility', 'hidden');
    }
  }

  Studio.itemSpeed = {};
  for (var className in skin.specialItemProperties) {
    Studio.itemSpeed[className] = skin.specialItemProperties[className].speed;
  }
  Studio.itemActivity = {};
  for (className in skin.specialItemProperties) {
    Studio.itemActivity[className] =
      skin.specialItemProperties[className].activity;
  }
  // Create Items that are specified on the map:
  Studio.createLevelItems(svg);

  // Now that sprites are in place, we can set up a map, which might move
  // sprites around.
  var defaultMap = getDefaultMapName();
  if (defaultMap) {
    Studio.setMap({value: getDefaultMapName()});
  }

  // Setting up walls might have moved the sprites, so draw them once more.
  for (i = 0; i < Studio.spriteCount; i++) {
    Studio.displaySprite(i);
  }
  this.resetGoalSprites();
  sortDrawOrder();

  // A little flag for script-based code to consume.
  Studio.levelRestarted = true;

  // Reset whether level has succeeded.
  Studio.succeededTime = null;

  // Stop any current movement sounds
  Studio.movementAudioOff();
};

/**
 * Move all goal sprites to their original positions, and reset their completion
 * state, both visual and logical.
 */
Studio.resetGoalSprites = function() {
  Studio.touchAllGoalsEventFired = false;

  var goalOverride = utils.valueOr(level.goalOverride, {});
  var offsetX = utils.valueOr(
    goalOverride.goalRenderOffsetX,
    utils.valueOr(skin.goalRenderOffsetX, 0)
  );
  var offsetY = utils.valueOr(
    goalOverride.goalRenderOffsetY,
    utils.valueOr(skin.goalRenderOffsetY, 0)
  );

  var goal, i;

  for (i = 0; i < Studio.spriteGoals_.length; i++) {
    goal = Studio.spriteGoals_[i];

    // Mark each finish as incomplete.
    goal.finished = false;
    goal.startFadeTime = null;

    // Move the finish icons into position.
    goal.marker.setAttribute('x', goal.x + offsetX);
    goal.marker.setAttribute('y', goal.y + offsetY);
    goal.marker.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'xlink:href',
      Studio.getGoalAssetFromSkin()
    );
    goal.marker.setAttribute('opacity', 1);
    goal.clipRect.setAttribute('x', goal.x + offsetX);
    goal.clipRect.setAttribute('y', goal.y + offsetY);
  }

  for (i = 0; i < Studio.dynamicSpriteGoals_.length; i++) {
    goal = Studio.dynamicSpriteGoals_[i];
    goal.marker.parentNode.removeChild(goal.marker);
    goal.clipPath.parentNode.removeChild(goal.clipPath);
  }
  Studio.dynamicSpriteGoals_ = [];
};

/** @returns {string} URL of the asset to use for goal objects */
Studio.getGoalAssetFromSkin = function() {
  var goalAsset = skin.goal;
  if (level.goalOverride) {
    if (level.goalOverride.goalAnimation) {
      goalAsset = skin[level.goalOverride.goalAnimation];
    } else if (level.goalOverride.goalImage) {
      goalAsset = skin[level.goalOverride.goalImage];
    }
  }
  return goalAsset;
};

/**
 * Runs test of a given example
 * @param exampleBlock
 * @returns {string} string to display after example execution
 */
Studio.getStudioExampleFailure = function(exampleBlock) {
  try {
    var actualBlock = exampleBlock.getInputTargetBlock('ACTUAL');
    var expectedBlock = exampleBlock.getInputTargetBlock('EXPECTED');

    studioApp().feedback_.throwOnInvalidExampleBlocks(
      actualBlock,
      expectedBlock
    );

    var defCode = Blockly.Generator.blockSpaceToCode('JavaScript', [
      'functional_definition'
    ]);
    var exampleCode = Blockly.Generator.blocksToCode('JavaScript', [
      exampleBlock
    ]);
    if (exampleCode) {
      var resultBoolean = CustomMarshalingInterpreter.evalWith(
        defCode + '; return' + exampleCode,
        {
          Studio: api,
          Globals: Studio.Globals
        },
        {legacy: true}
      );
      return resultBoolean ? null : 'Does not match definition.';
    } else {
      return 'No example code.';
    }
  } catch (error) {
    return 'Execution error: ' + error.message;
  }
};

/**
 * Click the run button.  Start the program.
 */
// XXX This is the only method used by the templates!
Studio.runButtonClick = function() {
  if (level.edit_blocks) {
    Studio.onPuzzleComplete();
  }
  var runButton = document.getElementById('runButton');
  var resetButton = document.getElementById('resetButton');
  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton.style.minWidth) {
    resetButton.style.minWidth = runButton.offsetWidth + 'px';
  }
  studioApp().toggleRunReset('reset');
  if (studioApp().isUsingBlockly()) {
    Blockly.mainBlockSpace.traceOn(true);
  }

  // Stop the music the first time the run button is pressed (hoc2015)
  Studio.musicController.fadeOut();
  // Remove goal filter effects the first time the run button is pressed
  Studio.removeGoalEffect();

  studioApp().reset(false);
  studioApp().attempts++;
  Studio.startTime = new Date();
  Studio.execute();
  Studio.gameState = Studio.GameStates.ACTIVE;

  if (
    level.freePlay &&
    !level.isProjectLevel &&
    (!studioApp().hideSource || level.showFinish)
  ) {
    var shareCell = document.getElementById('share-cell');
    if (shareCell.className !== 'share-cell-enabled') {
      shareCell.className = 'share-cell-enabled';
      studioApp().onResize();

      // Fire a custom event on the document so that other code can respond
      // to the finish button being shown.
      var event = document.createEvent('Event');
      event.initEvent('finishButtonShown', true, true);
      document.dispatchEvent(event);
    }
  }

  if (level.showZeroScore) {
    Studio.displayScore();
  }
};

/**
 * App specific displayFeedback function that calls into
 * studioApp().displayFeedback when appropriate
 */
Studio.displayFeedback = function() {
  var tryAgainText;
  // For free play, show keep playing, unless it's a big game level
  if (
    (level.freePlay ||
      Studio.testResults >= TestResults.MINIMUM_OPTIMAL_RESULT) &&
    !(Studio.customLogic instanceof BigGameLogic)
  ) {
    tryAgainText = commonMsg.keepPlaying();
  } else {
    tryAgainText = commonMsg.tryAgain();
  }

  // Let the level override feedback dialog strings.
  var stringFunctions = Object.assign(
    {
      continueText: level.freePlay ? commonMsg.nextPuzzle : function() {},
      reinfFeedbackMsg: studioMsg.reinfFeedbackMsg,
      sharingText: studioMsg.shareGame
    },
    level.appStringsFunctions
  );
  var appStrings = {
    continueText: stringFunctions.continueText(),
    reinfFeedbackMsg: stringFunctions.reinfFeedbackMsg({
      backButton: tryAgainText
    }),
    sharingText: stringFunctions.sharingText()
  };

  if (!Studio.waitingForReport) {
    const saveToProjectGallery = PUBLISHABLE_SKINS.includes(skin.id);
    const isSignedIn =
      getStore().getState().currentUser.signInState === SignInState.SignedIn;

    studioApp().displayFeedback({
      feedbackType: Studio.testResults,
      executionError: Studio.executionError,
      tryAgainText: tryAgainText,
      continueText: appStrings.continueText,
      response: Studio.response,
      level: level,
      showingSharing:
        !level.disableSharing &&
        level.freePlay &&
        !Studio.preExecutionFailure &&
        !level.projectTemplateLevelName,
      feedbackImage: Studio.feedbackImage,
      twitter: skin.twitterOptions || twitterOptions,
      // save to the project gallery
      saveToProjectGallery: saveToProjectGallery,
      disableSaveToGallery: !isSignedIn,
      message: Studio.message,
      appStrings: appStrings,
      disablePrinting: level.disablePrinting
    });
  }
};

/**
 * Function to be called when the service report call is complete
 * @param {MilestoneResponse} response - JSON response (if available)
 */
Studio.onReportComplete = function(response) {
  Studio.response = response;
  Studio.waitingForReport = false;
  studioApp().onReportComplete(response);
  Studio.displayFeedback();
};

var registerEventHandler = function(handlers, name, func) {
  handlers.push({
    name: name,
    func: func,
    cmdQueue: []
  });
};

var registerHandlersForCode = function(handlers, blockName, code, args = []) {
  if (Studio.legacyRuntime) {
    registerEventHandler(
      handlers,
      blockName,
      new Function('Studio', 'Globals', ...args, code)
    );
  } else {
    const event = Studio.interpretedHandlers[blockName];
    if (event) {
      if (!_.isEqual(event.args, args)) {
        throw "Can't register two event handlers that take different arguments.";
      }
      // Combine code with the existing event.
      Studio.interpretedHandlers[blockName].code.push(code);
    } else {
      Studio.interpretedHandlers[blockName] = {code: [code], args};
    }
  }
};

var registerHandlers = function(
  handlers,
  blockName,
  eventNameBase,
  nameParam1,
  matchParam1Val,
  nameParam2,
  matchParam2Val,
  argNames
) {
  var blocks = Blockly.mainBlockSpace.getTopBlocks();
  for (var x = 0; blocks[x]; x++) {
    var block = blocks[x];
    // default title values to '0' for case when there is only one sprite
    // and no title value is set through a dropdown
    var titleVal1 = block.getTitleValue(nameParam1) || '0';
    var titleVal2 = block.getTitleValue(nameParam2) || '0';
    if (
      block.type === blockName &&
      (!nameParam1 || matchParam1Val === titleVal1) &&
      (!nameParam2 || matchParam2Val === titleVal2)
    ) {
      var code = Blockly.Generator.blocksToCode('JavaScript', [block]);
      if (code) {
        var eventName = eventNameBase;
        if (nameParam1) {
          eventName += '-' + utils.stripQuotes(matchParam1Val);
        }
        if (nameParam2) {
          eventName += '-' + utils.stripQuotes(matchParam2Val);
        }
        registerHandlersForCode(handlers, eventName, code, argNames);
      }
    }
  }
};

var registerHandlersWithSingleSpriteParam = function(
  handlers,
  blockName,
  eventNameBase,
  blockParam
) {
  for (var i = 0; i < Studio.spriteCount; i++) {
    registerHandlers(handlers, blockName, eventNameBase, blockParam, String(i));
  }
};

var registerHandlersWithTitleParam = function(
  handlers,
  blockName,
  eventNameBase,
  titleParam,
  values
) {
  for (var i = 0; i < values.length; i++) {
    registerHandlers(handlers, blockName, eventNameBase, titleParam, values[i]);
  }
};

var registerHandlersWithMultipleSpriteParams = function(
  handlers,
  blockName,
  eventNameBase,
  blockParam1,
  blockParam2
) {
  var i;
  var registerHandlersForClassName = function(className) {
    registerHandlers(
      handlers,
      blockName,
      eventNameBase,
      blockParam1,
      String(i),
      blockParam2,
      className
    );
  };
  for (i = 0; i < Studio.spriteCount; i++) {
    for (var j = 0; j < Studio.spriteCount; j++) {
      if (i === j) {
        continue;
      }
      registerHandlers(
        handlers,
        blockName,
        eventNameBase,
        blockParam1,
        String(i),
        blockParam2,
        String(j)
      );
    }
    skin.ProjectileClassNames.forEach(registerHandlersForClassName);
    skin.ItemClassNames.forEach(registerHandlersForClassName);
    EdgeClassNames.forEach(registerHandlersForClassName);
    registerHandlers(
      handlers,
      blockName,
      eventNameBase,
      blockParam1,
      String(i),
      blockParam2,
      'any_actor'
    );
    registerHandlers(
      handlers,
      blockName,
      eventNameBase,
      blockParam1,
      String(i),
      blockParam2,
      'any_edge'
    );
    registerHandlers(
      handlers,
      blockName,
      eventNameBase,
      blockParam1,
      String(i),
      blockParam2,
      'any_projectile'
    );
    registerHandlers(
      handlers,
      blockName,
      eventNameBase,
      blockParam1,
      String(i),
      blockParam2,
      'anything'
    );
    registerHandlers(
      handlers,
      blockName,
      eventNameBase,
      blockParam1,
      String(i),
      blockParam2,
      'goal'
    );
    registerHandlers(
      handlers,
      blockName,
      eventNameBase,
      blockParam1,
      String(i),
      blockParam2,
      'wall'
    );
  }
};

var registerHandlersWithSpriteAndGroupParams = function(
  handlers,
  blockName,
  eventNameBase,
  blockParam1,
  blockParam2,
  argNames
) {
  var spriteNames = skin.spriteChoices
    .filter(
      opt =>
        opt[1] !== constants.HIDDEN_VALUE && opt[1] !== constants.RANDOM_VALUE
    )
    .map(opt => opt[1]);
  for (var i = 0; i < Studio.spriteCount; i++) {
    for (var j = 0; j < spriteNames.length; j++) {
      registerHandlers(
        handlers,
        blockName,
        eventNameBase,
        blockParam1,
        String(i),
        blockParam2,
        spriteNames[j],
        argNames
      );
    }
  }
};

//
// Generates code with user-generated function definitions and evals that code
// so these can be called from event handlers. This should be called for each
// block type that defines functions.
//

var defineProcedures = function(blockType) {
  var code = Blockly.Generator.blockSpaceToCode('JavaScript', blockType);
  try {
    CustomMarshalingInterpreter.evalWith(
      code,
      {
        Studio: api,
        Globals: Studio.Globals
      },
      {legacy: true}
    );
  } catch (e) {}
};

/**
 * Looks for failures that should prevent execution in blockly mode.
 * @returns {boolean} True if we have a pre-execution failure
 */
Studio.checkForBlocklyPreExecutionFailure = function() {
  if (studioApp().hasUnfilledFunctionalBlock()) {
    Studio.result = false;
    Studio.testResults = TestResults.EMPTY_FUNCTIONAL_BLOCK;
    // Some of our levels (i.e. big game) have a different top level block, but
    // those should be undeletable/unmovable and not hit this. If they do,
    // they'll still get the generic unfilled block message
    Studio.message = studioApp().getUnfilledFunctionalBlockError(
      'functional_start_setValue'
    );
    Studio.preExecutionFailure = true;
    return true;
  }

  if (studioApp().hasUnwantedExtraTopBlocks()) {
    Studio.result = false;
    Studio.testResults = TestResults.EXTRA_TOP_BLOCKS_FAIL;
    Studio.preExecutionFailure = true;
    return true;
  }

  if (studioApp().hasEmptyFunctionOrVariableName()) {
    Studio.result = false;
    Studio.testResults = TestResults.EMPTY_FUNCTION_NAME;
    Studio.message = commonMsg.unnamedFunction();
    Studio.preExecutionFailure = true;
    return true;
  }

  var outcome = Studio.checkExamples_();
  if (outcome.result !== undefined) {
    Object.assign(Studio, outcome);
    Studio.preExecutionFailure = true;
    return true;
  }

  return false;
};

/**
 * @returns {Object} outcome
 * @returns {boolean} outcome.result
 * @returns {number} outcome.testResults
 * @returns {string} outcome.message
 */
Studio.checkExamples_ = function() {
  var outcome = {};
  if (!level.examplesRequired) {
    return outcome;
  }

  var exampleless = studioApp().getFunctionWithoutTwoExamples();
  if (exampleless) {
    outcome.result = ResultType.FAILURE;
    outcome.testResults = TestResults.EXAMPLE_FAILED;
    outcome.message = commonMsg.emptyExampleBlockErrorMsg({
      functionName: exampleless
    });
    return outcome;
  }

  var unfilled = studioApp().getUnfilledFunctionalExample();
  if (unfilled) {
    outcome.result = ResultType.FAILURE;
    outcome.testResults = TestResults.EXAMPLE_FAILED;

    var name = unfilled
      .getRootBlock()
      .getInputTargetBlock('ACTUAL')
      .getTitleValue('NAME');
    outcome.message = commonMsg.emptyExampleBlockErrorMsg({functionName: name});
    return outcome;
  }

  var failingBlockName = studioApp().checkForFailingExamples(
    Studio.getStudioExampleFailure
  );
  if (failingBlockName) {
    outcome.result = false;
    outcome.testResults = TestResults.EXAMPLE_FAILED;
    outcome.message = commonMsg.exampleErrorMessage({
      functionName: failingBlockName
    });
  }

  return outcome;
};

/**
 * Looks for failures that should prevent execution in editCode mode.
 * @returns {boolean} True if we have a pre-execution failure
 */
Studio.checkForEditCodePreExecutionFailure = function() {
  var funcName = Studio.hasUnexpectedFunction_();
  if (funcName) {
    Studio.result = false;
    Studio.testResults = TestResults.EXTRA_FUNCTION_FAIL;
    Studio.message = studioMsg.extraFunction({
      funcName: funcName + '()'
    });
    Studio.preExecutionFailure = true;
    return true;
  }

  funcName = Studio.hasUnexpectedLocalFunction_();
  if (funcName) {
    Studio.result = false;
    Studio.testResults = TestResults.LOCAL_FUNCTION_FAIL;
    Studio.message = studioMsg.localFunction({
      funcName: funcName + '()'
    });
    Studio.preExecutionFailure = true;
    return true;
  }

  return false;
};

/**
 * @returns {string} the name of the first unexpected function found
 */
Studio.hasUnexpectedFunction_ = function() {
  if (
    studioApp().editCode &&
    level.preventUserDefinedFunctions &&
    Studio.JSInterpreter
  ) {
    var funcNames = Studio.JSInterpreter.getGlobalFunctionNames();
    for (var name in AUTO_HANDLER_MAP) {
      var index = funcNames.indexOf(name);
      if (index !== -1) {
        funcNames.splice(index, 1);
      }
    }
    if (funcNames.length > 0) {
      return funcNames[0];
    }
  }
};

/**
 * @returns {string} the name of the first unexpected local function found
 */
Studio.hasUnexpectedLocalFunction_ = function() {
  if (studioApp().editCode && Studio.JSInterpreter) {
    var funcNames = Studio.JSInterpreter.getLocalFunctionNames();
    for (var name in AUTO_HANDLER_MAP) {
      var index = funcNames.indexOf(name);
      if (index !== -1) {
        return name;
      }
    }
  }
};

function handleExecutionError(err, lineNumber, outputString) {
  outputError(outputString, lineNumber);
  Studio.executionError = {err: err, lineNumber: lineNumber};

  // Call onPuzzleComplete() if syntax error or any time we're not on a freeplay level:
  if (err instanceof SyntaxError) {
    // Mark preExecutionFailure and testResults immediately so that an error
    // message always appears, even on freeplay:
    Studio.preExecutionFailure = true;
    Studio.testResults = TestResults.SYNTAX_ERROR_FAIL;
    Studio.onPuzzleComplete();
  } else if (!level.freePlay) {
    Studio.onPuzzleComplete();
  }
}

/**
 * Execute the story
 */
Studio.execute = function() {
  Studio.result = studioApp().UNSET;
  Studio.testResults = TestResults.NO_TESTS_RUN;
  Studio.waitingForReport = false;
  Studio.response = null;

  var handlers = [];
  if (studioApp().isUsingBlockly()) {
    if (Studio.checkForBlocklyPreExecutionFailure()) {
      return Studio.onPuzzleComplete();
    }

    Studio.interpretedHandlers = {};

    if (studioApp().initializationBlocks) {
      studioApp().initializationBlocks.forEach(function(topBlock) {
        // by default, blocks are queued to run once at game start.
        // Repeat forever blocks, however, need their own handler.
        const handlerType =
          topBlock.type === 'studio_repeatForever'
            ? 'repeatForever'
            : 'whenGameStarts';
        const code = Blockly.Generator.blocksToCode('JavaScript', [topBlock]);
        registerHandlersForCode(handlers, handlerType, code);
      });
    }

    registerHandlers(handlers, 'when_run', 'whenGameStarts');
    registerHandlers(handlers, 'functional_start_setSpeeds', 'whenGameStarts');
    registerHandlers(
      handlers,
      'functional_start_setBackgroundAndSpeeds',
      'whenGameStarts'
    );
    registerHandlers(handlers, 'functional_start_setFuncs', 'whenGameStarts');
    registerHandlers(handlers, 'functional_start_setValue', 'whenGameStarts');
    registerHandlers(handlers, 'studio_whenLeft', 'when-left');
    registerHandlers(handlers, 'studio_whenRight', 'when-right');
    registerHandlers(handlers, 'studio_whenUp', 'when-up');
    registerHandlers(handlers, 'studio_whenDown', 'when-down');
    registerHandlersWithTitleParam(
      handlers,
      'studio_whenArrow',
      'when',
      'VALUE',
      ['left', 'right', 'up', 'down']
    );
    registerHandlers(handlers, 'studio_repeatForever', 'repeatForever');
    registerHandlers(
      handlers,
      'studio_whenTouchCharacter',
      'whenSpriteCollided-' + (Studio.protagonistSpriteIndex || 0) + '-any_item'
    );
    registerHandlers(
      handlers,
      'studio_whenGetAllCharacters',
      'whenGetAllItems'
    );
    registerHandlersWithTitleParam(
      handlers,
      'studio_whenGetAllCharacterClass',
      'whenGetAll',
      'VALUE',
      skin.ItemClassNames
    );
    registerHandlersWithTitleParam(
      handlers,
      'studio_whenGetCharacter',
      'whenSpriteCollided-' + (Studio.protagonistSpriteIndex || 0),
      'VALUE',
      ['any_item'].concat(skin.ItemClassNames)
    );
    registerHandlers(handlers, 'studio_whenTouchGoal', 'whenTouchGoal');
    if (Studio.wallMapCollisions) {
      registerHandlers(
        handlers,
        'studio_whenTouchObstacle',
        'whenSpriteCollided-' + (Studio.protagonistSpriteIndex || 0) + '-wall'
      );
    }
    registerHandlersWithSingleSpriteParam(
      handlers,
      'studio_whenSpriteClicked',
      'whenSpriteClicked',
      'SPRITE'
    );
    registerHandlersWithMultipleSpriteParams(
      handlers,
      'studio_whenSpriteCollided',
      'whenSpriteCollided',
      'SPRITE1',
      'SPRITE2'
    );
    registerHandlersWithSpriteAndGroupParams(
      handlers,
      'studio_whenSpriteAndGroupCollideSimple',
      'whenSpriteCollided',
      'SPRITE',
      'SPRITENAME'
    );
    registerHandlersWithSpriteAndGroupParams(
      handlers,
      'studio_whenSpriteAndGroupCollide',
      'whenSpriteCollided',
      'SPRITE',
      'SPRITENAME',
      ['touchedSpriteIndex']
    );
  }

  if (utils.valueOr(level.playStartSound, true)) {
    Studio.playSound({soundName: 'start'});
  }

  studioApp().reset(false);
  studioApp().clearAndAttachRuntimeAnnotations();

  if (level.editCode) {
    var codeWhenRun = studioApp().getCode();
    Studio.JSInterpreter = new JSInterpreter({
      studioApp: studioApp()
    });
    Studio.JSInterpreter.onExecutionError.register(handleExecutionError);
    if (consoleLogger) {
      consoleLogger.attachTo(Studio.JSInterpreter);
    }
    Studio.JSInterpreter.parse({
      code: codeWhenRun,
      blocks: dropletConfig.blocks,
      blockFilter: level.executePaletteApisOnly && level.codeFunctions,
      enableEvents: true
    });
    if (!Studio.JSInterpreter.initialized()) {
      return;
    }
    if (Studio.checkForEditCodePreExecutionFailure()) {
      return Studio.onPuzzleComplete();
    }
    Studio.initAutoHandlers(AUTO_HANDLER_MAP);
  } else {
    // Define any top-level procedures the user may have created
    // (must be after reset(), which resets the Studio.Globals namespace)
    if (Studio.legacyRuntime) {
      defineProcedures('procedures_defreturn');
      defineProcedures('procedures_defnoreturn');
      defineProcedures('functional_definition');
    } else {
      const generator = Blockly.Generator.blockSpaceToCode.bind(
        Blockly.Generator,
        'JavaScript'
      );
      const code = [
        'procedures_defreturn',
        'procedures_defnoreturn',
        'functional_definition'
      ]
        .map(generator)
        .join(';');

      Studio.interpretedHandlers.getGlobals = {code: `return Globals;`};

      const {hooks, interpreter} = CustomMarshalingInterpreter.evalWithEvents(
        {Studio: api, Globals: Studio.Globals},
        Studio.interpretedHandlers,
        code
      );
      Studio.interpreter = interpreter;
      hooks.forEach(hook => {
        if (hook.name === 'getGlobals') {
          // Expose `Studio.Globals` to success/failure functions. Setter is a no-op.
          Object.defineProperty(Studio, 'Globals', {
            get: () => {
              return hook.func() || {};
            },
            set: () => {},
            configurable: true
          });
        } else {
          registerEventHandler(handlers, hook.name, hook.func);
        }
      });
    }

    // Set event handlers and start the onTick timer
    Studio.eventHandlers = handlers;
  }

  $('#resetText, #resetTextA, #resetTextB, #overlayGroup *').attr(
    'visibility',
    'hidden'
  );

  Studio.perExecutionTimeouts = [];
  Studio.resumeExecution();
};

/**
 * Pause calling `Studio.onTick`.
 */
Studio.pauseExecution = function() {
  Studio.paused = true;
  window.clearInterval(Studio.tickIntervalId);
};

/**
 * Resume calling `Studio.onTick`.
 */
Studio.resumeExecution = function() {
  Studio.paused = false;
  Studio.tickIntervalId = window.setInterval(
    Studio.onTick,
    Studio.scale.stepSpeed
  );
};

Studio.feedbackImage = '';
Studio.encodedFeedbackImage = '';

Studio.onPuzzleComplete = function() {
  if (Studio.executionError) {
    Studio.result = ResultType.ERROR;
  } else if (
    studioApp().hasContainedLevels ||
    (level.freePlay && !Studio.preExecutionFailure)
  ) {
    Studio.result = ResultType.SUCCESS;
  }

  // Stop everything on screen
  Studio.clearEventHandlersKillTickLoop();
  Studio.movementAudioOff();

  if (skin.gridAlignedMovement && Studio.JSInterpreter) {
    // If we've been selecting code as we run, we need to call selectCurrentCode()
    // one last time to remove the highlight on the last line of code:
    Studio.JSInterpreter.selectCurrentCode();
  }

  // If we know they succeeded, mark levelComplete true
  var levelComplete = Studio.result === ResultType.SUCCESS;

  // If preExecutionFailure or progressConditionTestResult, then testResults
  // should already be set
  if (!Studio.preExecutionFailure && !Studio.progressConditionTestResult) {
    // If the current level is a free play, always return the free play
    // result type
    Studio.testResults = level.freePlay
      ? TestResults.FREE_PLAY
      : studioApp().getTestResults(levelComplete, {
          executionError: Studio.executionError
        });
  }

  if (Studio.testResults >= TestResults.TOO_MANY_BLOCKS_FAIL) {
    studioApp().playAudioOnWin();
  } else {
    studioApp().playAudioOnFailure();
  }

  if (studioApp().hasContainedLevels && !level.edit_blocks) {
    postContainedLevelAttempt(studioApp());
    runAfterPostContainedLevel(() => {
      Studio.message = getContainedLevelResultInfo().feedback;
      Studio.onReportComplete();
    });
    return;
  }

  var program;
  if (level.editCode) {
    // If we want to "normalize" the JavaScript to avoid proliferation of nearly
    // identical versions of the code on the service, we could do either of these:

    // do an acorn.parse and then use escodegen to generate back a "clean" version
    // or minify (uglifyjs) and that or js-beautify to restore a "clean" version

    program = studioApp().getCode();
  } else {
    var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
    program = Blockly.Xml.domToText(xml);
  }

  Studio.waitingForReport = true;

  var sendReport = function() {
    studioApp().report({
      app: 'studio',
      level: level.id,
      result: Studio.result === ResultType.SUCCESS,
      testResult: Studio.testResults,
      program: encodeURIComponent(program),
      image: Studio.encodedFeedbackImage,
      onComplete: Studio.onReportComplete
    });
  };

  // don't try it if function is not defined, which should probably only be
  // true in our test environment
  if (typeof document.getElementById('svgStudio').toDataURL === 'undefined') {
    sendReport();
  } else {
    document.getElementById('svgStudio').toDataURL('image/jpeg', {
      callback: function(imageDataUrl) {
        Studio.feedbackImage = imageDataUrl;
        Studio.encodedFeedbackImage = encodeURIComponent(
          Studio.feedbackImage.split(',')[1]
        );

        sendReport();
      }
    });
  }
};

/* Return the frame count for items or projectiles
 */
function getFrameCount(className, exceptionList, defaultCount) {
  if (/.gif$/.test(skin[className])) {
    return 1;
  } else if (
    exceptionList &&
    exceptionList[className] &&
    exceptionList[className].frames
  ) {
    return exceptionList[className].frames;
  }
  return defaultCount;
}

/**
 * Draw a debug rectangle centered on the given location, using the given
 * CSS class name.
 */

Studio.drawDebugRect = function(className, x, y, width, height) {
  if (!showDebugInfo) {
    return;
  }

  var svg = document.getElementById('svgStudio');
  var group = document.createElementNS(SVG_NS, 'g');
  group.setAttribute('class', className + ' debugRect');
  var background = document.createElementNS(SVG_NS, 'rect');
  background.setAttribute('width', width);
  background.setAttribute('height', height);
  background.setAttribute('x', x - width / 2);
  background.setAttribute('y', y - height / 2);
  background.setAttribute('fill', 'rgba(255, 255, 255, 0.5)');
  background.setAttribute('stroke', '#000000');
  background.setAttribute('stroke-width', 1);
  group.appendChild(background);
  svg.appendChild(group);
};

/**
 * Draw a debug line from point to point using the given CSS class name.
 * @param {string} className
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {string} [color] - defaults to black
 */
Studio.drawDebugLine = function(className, x1, y1, x2, y2, color) {
  if (!showDebugInfo) {
    return;
  }

  color = utils.valueOr(color, '#000000');

  var svg = document.getElementById('svgStudio');
  var group = document.createElementNS(SVG_NS, 'g');
  group.setAttribute('class', className + ' debugLine');
  var line = document.createElementNS(SVG_NS, 'line');
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  line.setAttribute('stroke', color);
  line.setAttribute('stroke-width', 2);
  group.appendChild(line);
  svg.appendChild(group);
};

/**
 * Draw a timeout rectangle across the bottom of the play area.
 * It doesn't appear until halfway through the level, and briefly fades in
 * when first appearing.
 * level.showTimeoutRect should be a valid color that can be passed to an SVG
 * 'fill'.
 */
Studio.drawTimeoutRect = function() {
  if (!level.showTimeoutRect || Studio.timeoutFailureTick === Infinity) {
    return;
  }

  $('.timeoutRect').remove();

  // The fraction of the entire level duration that we start and end the
  // fade-in.
  var startFadeInAt = 0.5;
  var endFadeInAt = 0.4;

  var timeRemaining = Studio.timeoutFailureTick - Studio.tickCount;
  var currentFraction = timeRemaining / Studio.timeoutFailureTick;

  if (currentFraction <= startFadeInAt) {
    var opacity =
      currentFraction < endFadeInAt
        ? 1
        : 1 - (currentFraction - endFadeInAt) / (startFadeInAt - endFadeInAt);

    var width =
      (timeRemaining * Studio.MAZE_WIDTH) /
      (Studio.timeoutFailureTick * startFadeInAt);
    var height = 6;

    if (width > 0) {
      var svg = document.getElementById('svgStudio');
      var group = document.createElementNS(SVG_NS, 'g');
      group.setAttribute('class', 'timeoutRect');
      var background = document.createElementNS(SVG_NS, 'rect');
      background.setAttribute('opacity', opacity);
      background.setAttribute('width', width);
      background.setAttribute('height', height);
      background.setAttribute('x', 0);
      background.setAttribute('y', Studio.MAZE_HEIGHT - height);
      background.setAttribute('fill', level.showTimeoutRect);
      group.appendChild(background);
      svg.appendChild(group);
    }
  }
};

/**
 * Draw an image with 0.5 opacity over the entire play area. Only allow one
 * at a time.
 */
Studio.drawDebugOverlay = function(src) {
  if (showDebugInfo && $('.debugImage').length === 0) {
    const svg = document.getElementById('svgStudio');
    const group = document.createElementNS(SVG_NS, 'g');
    group.setAttribute('class', 'walls debugImage');
    const mapImage = document.createElementNS(SVG_NS, 'image');
    mapImage.setAttribute('width', Studio.MAZE_WIDTH);
    mapImage.setAttribute('height', Studio.MAZE_HEIGHT);
    mapImage.setAttribute('x', 0);
    mapImage.setAttribute('y', 0);
    mapImage.setAttribute('opacity', '0.5');
    mapImage.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', src);
    group.appendChild(mapImage);
    svg.appendChild(group);
  }
};

/**
 * Clear the debug rectangles.
 */

Studio.clearDebugElements = function() {
  $('.debugRect').remove();
  $('.debugLine').remove();
  $('.debugImage').remove();
};

Studio.drawWallTile = function(svg, wallVal, row, col) {
  var srcRow, srcCol;

  // Defaults for regular tiles:
  var tiles = skin.tiles;
  var srcWallType = 0;
  var tileSize = Studio.SQUARE_SIZE;
  var addOffset = 0; // Added to X & Y to offset drawn tile.
  var numSrcRows = 8;
  var numSrcCols = 8;

  // We usually won't try jumbo size.
  var jumboSize = false;

  if (wallVal === SquareType.WALL) {
    // use a random coordinate
    // TODO (cpirich): these should probably be chosen once at level load time
    // and we should allow the level/skin to set specific row/col max values
    // to ensure that reasonable tiles are chosen at random
    srcRow = Math.floor(Math.random() * constants.WallRandomCoordMax);
    // Since [0,0] is not a valid wall tile, ensure that we avoid column zero
    // when row zero was chosen at random
    srcCol = srcRow
      ? Math.floor(Math.random() * constants.WallRandomCoordMax)
      : 1 + Math.floor(Math.random() * (constants.WallRandomCoordMax - 1));
  } else {
    // This wall value has been explicitly set.  It encodes the row & col from
    // the spritesheet of wall tile images.
    srcRow =
      (wallVal & constants.WallCoordRowMask) >> constants.WallCoordRowShift;
    srcCol =
      (wallVal & constants.WallCoordColMask) >> constants.WallCoordColShift;
    srcWallType = (wallVal & constants.WallTypeMask) >> constants.WallTypeShift;

    if (srcWallType === constants.WallType.JUMBO_SIZE) {
      // Jumbo tiles come from a separate sprite sheet which has oversize tiles
      // which are drawn in an overlapping fashion, though centered on the
      // regular tiles' centers.
      jumboSize = true;
      tileSize = skin[Studio.background].jumboTilesSize;
      numSrcRows = skin[Studio.background].jumboTilesRows;
      numSrcCols = skin[Studio.background].jumboTilesCols;
    } else if (srcWallType === constants.WallType.DOUBLE_SIZE) {
      // Double-size tiles are just a regular tile expanded to cover 2x2 tiles.
      tileSize = 2 * Studio.SQUARE_SIZE;
    }
  }

  // Attempt to load tiles that match the current background, if specified.
  if (Studio.background && !jumboSize && skin[Studio.background].tiles) {
    tiles = skin[Studio.background].tiles;
  } else if (
    Studio.background &&
    jumboSize &&
    skin[Studio.background].jumboTiles
  ) {
    tiles = skin[Studio.background].jumboTiles;
    addOffset = skin[Studio.background].jumboTilesAddOffset;
  }

  var clipPath = document.createElementNS(SVG_NS, 'clipPath');
  var clipId = 'tile_clippath_' + Studio.tiles.length;
  clipPath.setAttribute('id', clipId);
  clipPath.setAttribute('class', 'tile');
  var rect = document.createElementNS(SVG_NS, 'rect');
  rect.setAttribute('width', tileSize);
  rect.setAttribute('height', tileSize);
  rect.setAttribute('x', col * Studio.SQUARE_SIZE + addOffset);
  rect.setAttribute('y', row * Studio.SQUARE_SIZE + addOffset);
  clipPath.appendChild(rect);
  svg.appendChild(clipPath);

  var tile = document.createElementNS(SVG_NS, 'image');
  var tileId = 'tile_' + Studio.tiles.length;
  tile.setAttribute('id', tileId);
  tile.setAttribute('class', 'tileClip');
  tile.setAttribute('width', numSrcCols * tileSize);
  tile.setAttribute('height', numSrcRows * tileSize);
  tile.setAttribute(
    'x',
    col * Studio.SQUARE_SIZE - srcCol * tileSize + addOffset
  );
  tile.setAttribute(
    'y',
    row * Studio.SQUARE_SIZE - srcRow * tileSize + addOffset
  );
  tile.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', tiles);
  svg.appendChild(tile);

  tile.setAttribute('clip-path', 'url(#' + clipId + ')');

  var tileEntry = {};
  tileEntry.bottomY = row * Studio.SQUARE_SIZE + addOffset + tileSize;
  Studio.tiles.push(tileEntry);
};

Studio.createLevelItems = function(svg) {
  for (var row = 0; row < Studio.ROWS; row++) {
    for (var col = 0; col < Studio.COLS; col++) {
      var mapVal = Studio.map[row][col].getTileType();
      for (var index = 0; index < skin.ItemClassNames.length; index++) {
        if (constants.squareHasItemClass(index, mapVal)) {
          // Create item:
          var classOptions = Studio.getItemOptionsForItemClass(
            skin.ItemClassNames[index]
          );
          var itemOptions = Object.assign({}, classOptions, {
            x: Studio.HALF_SQUARE + Studio.SQUARE_SIZE * col,
            y: Studio.HALF_SQUARE + Studio.SQUARE_SIZE * row
          });
          var item = new Item(itemOptions);

          item.createElement(svg);
          // Display immediately (we can't assume it will be updated in onTick
          // right away since this is called after 'Reset' as well as 'Run'
          item.display();
          Studio.items.push(item);
        }
      }
    }
  }
};

Studio.drawMapTiles = function(svg) {
  // If we're just using the level's own map, then draw it only once.
  if (!Studio.wallMap && Studio.tilesDrawn) {
    return;
  }

  Studio.tilesDrawn = true;

  var row, col;

  var tilesDrawn = [];
  for (row = 0; row < Studio.ROWS; row++) {
    tilesDrawn[row] = [];
    for (col = 0; col < Studio.COLS; col++) {
      tilesDrawn[row][col] = false;
    }
  }

  var backgroundLayer = document.getElementById('backgroundLayer');

  var overlayURI = Studio.walls.getWallOverlayURI();
  if (overlayURI) {
    var wallOverlay = document.getElementById('wallOverlay');
    if (!wallOverlay) {
      wallOverlay = document.createElementNS(SVG_NS, 'image');
      wallOverlay.setAttribute('id', 'wallOverlay');
      wallOverlay.setAttribute('height', Studio.MAZE_HEIGHT);
      wallOverlay.setAttribute('width', Studio.MAZE_WIDTH);
      wallOverlay.setAttribute('x', 0);
      wallOverlay.setAttribute('y', 0);
      backgroundLayer.appendChild(wallOverlay);
    }
    wallOverlay.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'xlink:href',
      overlayURI
    );
  }

  for (row = 0; row < Studio.ROWS; row++) {
    for (col = 0; col < Studio.COLS; col++) {
      var wallVal = Studio.getWallValue(row, col);
      if (wallVal) {
        // Skip if we've already drawn a large tile that covers this square.
        if (tilesDrawn[row][col]) {
          continue;
        }

        var srcWallType =
          (wallVal & constants.WallTypeMask) >> constants.WallTypeShift;

        if (srcWallType === constants.WallType.DOUBLE_SIZE) {
          tilesDrawn[row][col] = true;
          tilesDrawn[row][col + 1] = true;
          tilesDrawn[row + 1][col] = true;
          tilesDrawn[row + 1][col + 1] = true;
        }

        Studio.drawWallTile(backgroundLayer, wallVal, row, col);
      }
    }
  }
};

var updateSpeechBubblePath = function(element) {
  var height = +element.getAttribute('height');
  var width = +element.getAttribute('width');
  var onTop = 'true' === element.getAttribute('onTop');
  var onRight = 'true' === element.getAttribute('onRight');
  var tipOffset = +element.getAttribute('tipOffset');
  element.setAttribute(
    'd',
    createSpeechBubblePath(
      0,
      0,
      width,
      height,
      SPEECH_BUBBLE_RADIUS,
      onTop,
      onRight,
      tipOffset
    )
  );
};

Studio.displaySprite = function(i) {
  var sprite = Studio.sprite[i];

  // avoid lots of unnecessary changes to hidden sprites
  if (sprite.value === 'hidden') {
    return;
  }

  if (sprite.hasActions()) {
    sprite.updateActions();
  } else {
    // TODO (cpirich): move this into Sprite object

    var newDir = Direction.NONE;
    var lastDrawPos = sprite.lastDrawPosition;

    sprite.displayX = sprite.x;
    sprite.displayY = sprite.y;

    var curDrawPos = sprite.getCurrentDrawPosition();

    if (curDrawPos.x !== lastDrawPos.x || curDrawPos.y !== lastDrawPos.y) {
      if (curDrawPos.x < lastDrawPos.x) {
        newDir |= Direction.WEST;
      } else if (curDrawPos.x > lastDrawPos.x) {
        newDir |= Direction.EAST;
      }
      if (curDrawPos.y < lastDrawPos.y) {
        newDir |= Direction.NORTH;
      } else if (curDrawPos.y > lastDrawPos.y) {
        newDir |= Direction.SOUTH;
      }
    }

    if (newDir !== Direction.NONE || sprite.lastMove === Infinity) {
      // Don't change to Direction.NONE here once we've captured a lastMove
      // value, allow the ticksBeforeFaceSouth code to handle that later...
      sprite.setDirection(newDir);
    }
  }

  // Turn sprite toward target direction after evaluating actions.
  if (sprite.dir !== sprite.displayDir) {
    // Every other frame, assign a new displayDir from state table
    // (only one turn at a time):
    if (Studio.tickCount && 0 === Studio.tickCount % 2) {
      sprite.displayDir = NextTurn[sprite.displayDir][sprite.dir];
    }
  }

  // TODO (cpirich): (may be redundant with displayCollidables(Studio.sprite)
  // in onTick loop)
  sprite.display();

  if (sprite.bubbleVisible) {
    Studio.renderSpeechBubble(i);
  }
};

Studio.renderSpeechBubble = function(i) {
  var sprite = Studio.sprite[i];

  var speechBubble = document.getElementById('speechBubble' + i);
  var speechBubblePath = document.getElementById('speechBubblePath' + i);
  var oldTipOffset = +speechBubblePath.getAttribute('tipOffset');
  var wasOnTop = 'true' === speechBubblePath.getAttribute('onTop');
  var wasOnRight = 'true' === speechBubblePath.getAttribute('onRight');
  var bubbleHeight = +speechBubblePath.getAttribute('height');
  var bubbleWidth = +speechBubblePath.getAttribute('width');

  var newBubblePosition = Studio.calculateBubblePosition(
    sprite,
    bubbleHeight,
    bubbleWidth,
    Studio.MAZE_WIDTH
  );

  speechBubblePath.setAttribute('onTop', newBubblePosition.onTop);
  speechBubblePath.setAttribute('onRight', newBubblePosition.onRight);
  speechBubblePath.setAttribute('tipOffset', newBubblePosition.tipOffset);

  if (
    wasOnTop !== newBubblePosition.onTop ||
    wasOnRight !== newBubblePosition.onRight ||
    oldTipOffset !== newBubblePosition.tipOffset
  ) {
    updateSpeechBubblePath(speechBubblePath);
  }

  speechBubble.setAttribute(
    'transform',
    `translate(${newBubblePosition.xSpeech}, ${newBubblePosition.ySpeech})`
  );
};

Studio.calculateBubblePosition = function(
  sprite,
  bubbleHeight,
  bubbleWidth,
  studioWidth
) {
  let onTop = true;
  let ySpeech = sprite.y - (bubbleHeight + SPEECH_BUBBLE_PADDING);
  if (ySpeech < SPEECH_BUBBLE_TOP_MARGIN) {
    ySpeech = sprite.y + sprite.height + SPEECH_BUBBLE_PADDING;
    onTop = false;
  }

  let onRight;
  let xSpeech;
  let tipOffset = 0;
  if (sprite.x > (studioWidth - sprite.width) / 2) {
    onRight = false;
    xSpeech = sprite.x + sprite.width - (bubbleWidth + SPEECH_BUBBLE_H_OFFSET);
    if (xSpeech < SPEECH_BUBBLE_SIDE_MARGIN) {
      tipOffset = SPEECH_BUBBLE_SIDE_MARGIN - xSpeech;
      xSpeech = SPEECH_BUBBLE_SIDE_MARGIN;
    }
  } else {
    onRight = true;
    xSpeech = sprite.x + SPEECH_BUBBLE_H_OFFSET;
    const maxXSpeech = studioWidth - bubbleWidth - SPEECH_BUBBLE_SIDE_MARGIN;
    if (xSpeech > maxXSpeech) {
      tipOffset = xSpeech - maxXSpeech;
      xSpeech = maxXSpeech;
    }
  }

  return {
    onTop,
    onRight,
    tipOffset,
    xSpeech,
    ySpeech
  };
};

Studio.displayScore = function() {
  var score = document.getElementById('score');
  if (Studio.scoreText) {
    score.textContent = Studio.scoreText;
  } else {
    score.textContent = studioMsg.scoreText({
      playerScore: Studio.playerScore
    });
  }
  score.setAttribute('visibility', 'visible');
};

Studio.displayVictoryText = function() {
  var victoryText = document.getElementById('victoryText');
  victoryText.textContent = Studio.victoryText;
  victoryText.setAttribute('visibility', 'visible');
  if (level.tapSvgToRunAndReset) {
    if (dom.isMobile() || dom.isWindowsTouch()) {
      var resetTextA = document.getElementById('resetTextA');
      var resetTextB = document.getElementById('resetTextB');
      resetTextB.textContent = studioMsg.tapToReset();
      resetTextA.setAttribute('visibility', 'hidden');
      resetTextB.setAttribute('visibility', 'visible');
      $('#overlayGroup image, #overlayGroup rect').attr('visibility', 'hidden');
    } else {
      var resetText = document.getElementById('resetText');
      resetText.textContent = studioMsg.tapOrClickToReset();
      resetText.setAttribute('visibility', 'visible');
    }
  }
};

Studio.animateGoals = function() {
  var currentTime = new Date();

  var animate = level.goalOverride && level.goalOverride.goalAnimation;
  var fade = skin.fadeOutGoal;

  var elapsed, numFrames, frameDuration, frameWidth;

  if (animate) {
    elapsed = currentTime - Studio.startTime;
    numFrames = skin.animatedGoalFrames;
    frameDuration = skin.timePerGoalAnimationFrame;
    frameWidth = skin.goalSpriteWidth;
  }

  // We want each goal animation to play at an offset so they're not all in
  // sync.  By offsetting the frame by (goal index * 7) we ensure that each goal's
  // animation is significantly out of sync.
  var animationOffset = 7;

  Studio.allGoals_().forEach(function(goal, i) {
    // Keep animating the goal unless it's finished and we're not fading out.
    if (!goal.finished || goal.startFadeTime) {
      if (animate) {
        var baseX = parseInt(goal.clipRect.getAttribute('x'), 10);
        var frame =
          (i * animationOffset + Math.floor(elapsed / frameDuration)) %
          numFrames;

        goal.marker.setAttribute('x', baseX - frame * frameWidth);
      }

      if (fade) {
        var fadeTime = constants.GOAL_FADE_TIME;

        if (goal.startFadeTime) {
          var opacity = 1 - (currentTime - goal.startFadeTime) / fadeTime;

          if (opacity < 0) {
            opacity = 0;
            goal.startFadeTime = null;
          }

          goal.marker.setAttribute('opacity', opacity);
        }
      }
    }
  });
};

/**
 * Load clouds for the current background if it features them, or hide
 * them if they shouldn't currently be shown.
 */
Studio.loadClouds = function() {
  var cloud, i;
  var showClouds = Studio.background && skin[Studio.background].clouds;

  if (!showClouds) {
    // Hide the clouds offscreen.
    for (i = 0; i < constants.MAX_NUM_CLOUDS; i++) {
      cloud = document.getElementById('cloud' + i);
      cloud.setAttribute('x', -constants.CLOUD_SIZE);
      cloud.setAttribute('y', -constants.CLOUD_SIZE);
    }
  } else {
    // Set up the right clouds.
    for (i = 0; i < skin[Studio.background].clouds.length; i++) {
      cloud = document.getElementById('cloud' + i);
      cloud.setAttribute('width', constants.CLOUD_SIZE);
      cloud.setAttribute('height', constants.CLOUD_SIZE);
      cloud.setAttributeNS(
        'http://www.w3.org/1999/xlink',
        'xlink:href',
        skin[Studio.background].clouds[i]
      );
      cloud.setAttribute('opacity', constants.CLOUD_OPACITY);

      var location = Studio.getCloudLocation(i);
      cloud.setAttribute('x', location.x);
      cloud.setAttribute('y', location.y);
    }
  }
};

/**
 * Animate clouds if the current background features them.
 */
Studio.animateClouds = function() {
  var showClouds = Studio.background && skin[Studio.background].clouds;
  if (!showClouds) {
    return;
  }

  Studio.cloudStep++;

  for (var i = 0; i < skin[Studio.background].clouds.length; i++) {
    var location = Studio.getCloudLocation(i);
    var cloud = document.getElementById('cloud' + i);
    cloud.setAttribute('x', Math.round(location.x));
    cloud.setAttribute('y', Math.round(location.y));
  }
};

/** Gets the current location of a specified cloud.
 * @param {number} cloudIndex
 * @returns {Object} location
 * @returns {number} location.x
 * @returns {number} location.y
 */
Studio.getCloudLocation = function(cloudIndex) {
  // How many milliseconds to move one pixel.  Higher values mean slower clouds,
  // and making them different causes the clouds to animate out of sync.
  var intervals = [50, 60];

  // How many pixels a cloud moves before it loops.  This value is big enough to
  // make a cloud move entirely aross the game area, looping when completely
  // out of view.
  var distance = Studio.MAZE_WIDTH + constants.CLOUD_SIZE;

  var totalTime = Studio.cloudStep * 30;
  var xOffset = (totalTime / intervals[cloudIndex]) % distance;

  var x, y;

  if (cloudIndex === 0) {
    // The first cloud animates from top-left to bottom-right, in the upper-right
    // half of the screen.
    x = xOffset - Studio.MAZE_WIDTH / 4;
    y = x - Studio.MAZE_HEIGHT / 2;
  } else {
    // The second cloud animates from bottom-right to top-left, in the lower-left
    // half of the screen.
    x = Studio.MAZE_WIDTH - xOffset;
    y = x + Studio.MAZE_HEIGHT / 2;
  }

  return {x: x, y: y};
};

/**
 * Start showing an upwards-floating score at the location of sprite 0.
 * The floatingScore level property should only be set to true if this
 * is desired.
 @param {number} changeValue The value that is displayed.
 */

Studio.displayFloatingScore = function(changeValue) {
  if (!level.floatingScore) {
    return;
  }

  var sprite = Studio.sprite[0];
  var floatingScore = document.getElementById('floatingScore');
  floatingScore.textContent = changeValue > 0 ? '+' + changeValue : changeValue;
  floatingScore.setAttribute('x', sprite.x + sprite.width / 2);
  floatingScore.setAttribute('y', sprite.y + sprite.height / 2);
  floatingScore.setAttribute('opacity', 1);
  floatingScore.setAttribute('visibility', 'visible');
};

Studio.updateFloatingScore = function() {
  if (!level.floatingScore) {
    return;
  }

  var floatingScore = document.getElementById('floatingScore');
  var y = parseInt(floatingScore.getAttribute('y'));
  var opacity = parseFloat(floatingScore.getAttribute('opacity'));
  if (opacity > 0) {
    opacity += constants.floatingScoreChangeOpacity;
    floatingScore.setAttribute('opacity', opacity);
    y += constants.floatingScoreChangeY;
    floatingScore.setAttribute('y', y);
  }
};

Studio.showCoordinates = function() {
  var sprite = Studio.sprite[Studio.protagonistSpriteIndex || 0];
  if (!sprite) {
    return;
  }
  // convert to math coordinates, with the origin at the bottom left
  // corner of the grid, and distances measured from the center of the
  // sprite.
  var x = sprite.x + 50;
  var y = 350 - sprite.y;
  Studio.setScoreText({text: 'x: ' + x + ' y: ' + y});
};

Studio.queueCmd = function(id, name, opts) {
  var cmd = {
    id: id,
    name: name,
    opts: opts
  };
  if (studioApp().isUsingBlockly() && Studio.currentCmdQueue) {
    if (Studio.currentEventParams) {
      for (var prop in Studio.currentEventParams) {
        cmd.opts[prop] = Studio.currentEventParams[prop];
      }
    }
    Studio.currentCmdQueue.push(cmd);
  } else {
    // in editCode/interpreter mode or if we don't have a current cmdQueue
    // (e.g. move from autoArrowSteer), commands are executed immediately:
    Studio.callCmd(cmd);
  }
};

//
// Execute an entire command queue (specified with the name parameter)
//
// If Studio.yieldExecutionTicks is positive, execution of commands will stop
//

Studio.executeQueue = function(name, oneOnly) {
  Studio.eventHandlers.forEach(function(handler) {
    if (Studio.paused || Studio.yieldExecutionTicks > 0) {
      return;
    }
    if (handler && handler.name === name && handler.cmdQueue.length) {
      for (var cmd = handler.cmdQueue[0]; cmd; cmd = handler.cmdQueue[0]) {
        if (Studio.callCmd(cmd)) {
          // Command executed immediately, remove from queue and continue
          handler.cmdQueue.shift();
        } else {
          break;
        }
        if (Studio.paused || Studio.yieldExecutionTicks > 0) {
          break;
        }
      }
    }
  });
};

//
// Execute a command from a command queue
//
// Return false if the command is not complete (it will remain in the queue)
// and this function will be called again with the same command later
//
// Return true if the command is complete
//

Studio.callCmd = function(cmd) {
  switch (cmd.name) {
    case 'endGame':
      studioApp().highlight(cmd.id);
      Studio.endGame(cmd.opts);
      break;
    case 'setBackground':
      studioApp().highlight(cmd.id);
      Studio.setBackground(cmd.opts);
      Studio.trackedBehavior.hasSetBackground = true;
      break;
    case 'setMap':
      studioApp().highlight(cmd.id);
      Studio.setMap(cmd.opts);
      Studio.trackedBehavior.hasSetMap = true;
      break;
    case 'setMapAndColor':
      studioApp().highlight(cmd.id);
      Studio.setMap(cmd.opts);
      Studio.trackedBehavior.hasSetMap = true;
      break;
    case 'setAllowSpritesOutsidePlayspace':
      studioApp().highlight(cmd.id);
      Studio.allowSpritesOutsidePlayspace = cmd.opts.value;
      break;
    case 'setSprite':
      studioApp().highlight(cmd.id);
      Studio.setSprite(cmd.opts);
      Studio.trackedBehavior.hasSetSprite = true;
      break;
    case 'getSpriteValue':
      studioApp().highlight(cmd.id);
      Studio.getSpriteValue(cmd.opts);
      break;
    case 'getSpriteVisibility':
      studioApp().highlight(cmd.id);
      Studio.getSpriteVisibility(cmd.opts);
      break;
    case 'saySprite':
      if (!cmd.opts.started) {
        studioApp().highlight(cmd.id);
      }
      return Studio.saySprite(cmd.opts);
    case 'setSpriteEmotion':
      studioApp().highlight(cmd.id);
      Studio.setSpriteEmotion(cmd.opts);
      Studio.trackedBehavior.hasSetEmotion = true;
      break;
    case 'getSpriteEmotion':
      studioApp().highlight(cmd.id);
      Studio.getSpriteEmotion(cmd.opts);
      break;
    case 'setSpriteSpeed':
      studioApp().highlight(cmd.id);
      Studio.setSpriteSpeed(cmd.opts);
      break;
    case 'setDroidSpeed':
      studioApp().highlight(cmd.id);
      Studio.setDroidSpeed(cmd.opts);
      Studio.trackedBehavior.hasSetDroidSpeed = true;
      break;
    case 'setSpriteSize':
      studioApp().highlight(cmd.id);
      Studio.setSpriteSize(cmd.opts);
      break;
    case 'setSpritePosition':
      studioApp().highlight(cmd.id);
      Studio.setSpritePosition(cmd.opts);
      break;
    case 'setSpriteXY':
      studioApp().highlight(cmd.id);
      Studio.setSpriteXY(cmd.opts);
      break;
    case 'getSpriteXY':
      studioApp().highlight(cmd.id);
      Studio.getSpriteXY(cmd.opts);
      break;
    case 'setSpriteBehavior':
      studioApp().highlight(cmd.id);
      Studio.setSpriteBehavior(cmd.opts);
      break;
    case 'setSpritesWander':
      studioApp().highlight(cmd.id);
      Studio.setSpritesWander(cmd.opts);
      break;
    case 'setSpritesStop':
      studioApp().highlight(cmd.id);
      Studio.setSpritesStop(cmd.opts);
      break;
    case 'setSpritesChase':
      studioApp().highlight(cmd.id);
      Studio.setSpritesChase(cmd.opts);
      break;
    case 'setSpritesFlee':
      studioApp().highlight(cmd.id);
      Studio.setSpritesFlee(cmd.opts);
      break;
    case 'setSpritesSpeed':
      studioApp().highlight(cmd.id);
      Studio.setSpritesSpeed(cmd.opts);
      break;
    case 'addGoal':
      studioApp().highlight(cmd.id);
      Studio.addGoal(cmd.opts);
      break;
    case 'playSound':
      studioApp().highlight(cmd.id);
      Studio.playSound(cmd.opts);
      break;
    case 'showTitleScreen':
      if (!cmd.opts.started) {
        studioApp().highlight(cmd.id);
      }
      return Studio.showTitleScreen(cmd.opts);
    case 'move':
      studioApp().highlight(cmd.id);
      Studio.moveSingle(cmd.opts);
      break;
    case 'moveRight':
      studioApp().highlight(cmd.id);
      Studio.moveSingle({
        spriteIndex: Studio.protagonistSpriteIndex || 0,
        dir: Direction.EAST
      });
      break;
    case 'moveLeft':
      studioApp().highlight(cmd.id);
      Studio.moveSingle({
        spriteIndex: Studio.protagonistSpriteIndex || 0,
        dir: Direction.WEST
      });
      break;
    case 'moveUp':
      studioApp().highlight(cmd.id);
      Studio.moveSingle({
        spriteIndex: Studio.protagonistSpriteIndex || 0,
        dir: Direction.NORTH
      });
      break;
    case 'moveDown':
      studioApp().highlight(cmd.id);
      Studio.moveSingle({
        spriteIndex: Studio.protagonistSpriteIndex || 0,
        dir: Direction.SOUTH
      });
      break;
    case 'moveForward':
      studioApp().highlight(cmd.id);
      Studio.moveSingle({
        spriteIndex: Studio.protagonistSpriteIndex || 0,
        dir: Studio.lastMoveSingleDir
      });
      break;
    case 'moveBackward':
      studioApp().highlight(cmd.id);
      Studio.moveSingle({
        spriteIndex: Studio.protagonistSpriteIndex || 0,
        dir: Studio.lastMoveSingleDir,
        backward: true
      });
      break;
    case 'turnRight':
      studioApp().highlight(cmd.id);
      Studio.turnSingle({
        spriteIndex: Studio.protagonistSpriteIndex || 0,
        dir: turnRight90(Studio.lastMoveSingleDir)
      });
      break;
    case 'turnLeft':
      studioApp().highlight(cmd.id);
      Studio.turnSingle({
        spriteIndex: Studio.protagonistSpriteIndex || 0,
        dir: turnLeft90(Studio.lastMoveSingleDir)
      });
      break;
    case 'moveDistance':
      if (!cmd.opts.started) {
        studioApp().highlight(cmd.id);
      }
      return Studio.moveDistance(cmd.opts);
    case 'stop':
      studioApp().highlight(cmd.id);
      Studio.stop(cmd.opts);
      break;
    case 'throwProjectile':
      if (!cmd.opts.started) {
        studioApp().highlight(cmd.id);
      }
      Studio.trackedBehavior.hasThrownProjectile = true;
      return Studio.throwProjectile(cmd.opts);
    case 'makeProjectile':
      studioApp().highlight(cmd.id);
      Studio.makeProjectile(cmd.opts);
      break;
    case 'changeScore':
      studioApp().highlight(cmd.id);
      Studio.changeScore(cmd.opts);
      break;
    case 'reduceScore':
      studioApp().highlight(cmd.id);
      Studio.reduceScore(cmd.opts);
      break;
    case 'displayScore':
      studioApp().highlight(cmd.id);
      Studio.displayScore(cmd.opts);
      break;
    case 'setScoreText':
      studioApp().highlight(cmd.id);
      Studio.setScoreText(cmd.opts);
      break;
    case 'showCoordinates':
      studioApp().highlight(cmd.id);
      Studio.showCoordinates();
      break;
    case 'wait':
      if (!cmd.opts.started) {
        studioApp().highlight(cmd.id);
      }
      return Studio.wait(cmd.opts);
    case 'vanish':
      studioApp().highlight(cmd.id);
      Studio.vanishActor(cmd.opts);
      break;
    case 'addItem':
      studioApp().highlight(cmd.id);
      Studio.addItem(cmd.opts);
      Studio.trackedBehavior.hasAddedItem = true;
      break;
    case 'setItemActivity':
      studioApp().highlight(cmd.id);
      Studio.setItemActivity(cmd.opts);
      break;
    case 'setItemSpeed':
      studioApp().highlight(cmd.id);
      Studio.setItemSpeed(cmd.opts);
      break;
    case 'showDebugInfo':
      studioApp().highlight(cmd.id);
      Studio.showDebugInfo(cmd.opts);
      break;
    case 'onEvent':
      studioApp().highlight(cmd.id);
      Studio.onEvent(cmd.opts);
      break;
    case 'askForInput':
      studioApp().highlight(cmd.id);
      if (Studio.paused) {
        return false;
      }
      Studio.askForInput(cmd.opts.question, cmd.opts.callback);
      break;
  }
  return true;
};

Studio.makeThrottledPlaySound = function() {
  Studio.throttledPlaySound = _.throttle(
    studioApp().playAudio.bind(studioApp()),
    constants.SOUND_THROTTLE_TIME
  );
};

Studio.makeThrottledSpriteWallCollisionHelpers = function() {
  Studio.throttledCollideSpriteWithWallFunctions = [];

  var makeCollideHelper = function(spriteIndex) {
    return function() {
      // For the case where this is used (blockMovingIntoWalls), we prevented
      // the wall collision, so we need to queue a wall collision event and
      // immediately reset the collision state since we didn't actually overlap:
      Studio.collideSpriteWith(spriteIndex, 'wall');
      Studio.sprite[spriteIndex].endCollision('wall');
    };
  };

  for (var i = 0; i < Studio.spriteCount; i++) {
    Studio.throttledCollideSpriteWithWallFunctions[i] = _.throttle(
      makeCollideHelper(i),
      constants.TOUCH_OBSTACLE_THROTTLE_TIME
    );
  }
};

Studio.playSound = function(opts) {
  if (typeof opts.soundName !== 'string') {
    throw new TypeError('Incorrect parameter: ' + opts.soundName);
  }

  var soundVal = opts.soundName.toLowerCase().trim();
  // Get all non-random values
  var allValues = paramLists.getPlaySoundValues(false);

  if (soundVal === constants.RANDOM_VALUE) {
    // Choose a sound at random:
    soundVal = allValues[
      Math.floor(Math.random() * allValues.length)
    ].toLowerCase();
  } else {
    var isInAllValues = function(value) {
      return allValues.indexOf(value) !== -1;
    };
    for (var group in skin.soundGroups) {
      var groupData = skin.soundGroups[group];
      if (soundVal === groupData.randomValue.toLowerCase()) {
        // Choose a sound at random from this group (intersect sounds in this group
        // based on the suffix range with the allValues array)
        var groupValues = [];
        for (
          var suffix = groupData.minSuffix;
          suffix <= groupData.maxSuffix;
          suffix++
        ) {
          groupValues.push(group + suffix);
        }
        groupValues.filter(isInAllValues);
        soundVal = groupValues[
          Math.floor(Math.random() * groupValues.length)
        ].toLowerCase();
        break;
      }
    }
  }

  if (!skin.soundFiles[soundVal]) {
    throw new RangeError('Incorrect parameter: ' + opts.soundName);
  }

  var skinSoundMetadata = utils.valueOr(skin.soundMetadata, []);
  var playbackOptions = Object.assign(
    {
      volume: 1.0
    },
    _.find(skinSoundMetadata, function(metadata) {
      return metadata.name.toLowerCase().trim() === soundVal;
    })
  );

  Studio.throttledPlaySound(soundVal, playbackOptions);
  Studio.playSoundCount++;
};

/**
 * De-duplicated legwork of finding appropriate options for the given item
 * class.  Does not set things like position and direction - those should
 * be applied on top of the returned options object.
 * @param {string} itemClass
 * @returns {Object} options object that can be passed to item constructor.
 */
Studio.getItemOptionsForItemClass = function(itemClass) {
  var classProperties = utils.valueOr(
    skin.specialItemProperties[itemClass],
    {}
  );
  return {
    className: itemClass,
    image: skin[itemClass],
    frames: getFrameCount(
      itemClass,
      skin.specialItemProperties,
      skin.itemFrames
    ),
    loop: true,
    width: classProperties.width,
    height: classProperties.height,
    dir: Direction.NONE,
    speed: Studio.itemSpeed[itemClass],
    normalSpeed: classProperties.speed,
    activity: utils.valueOr(
      Studio.itemActivity[itemClass],
      constants.BEHAVIOR_WANDER
    ),
    isHazard: classProperties.isHazard,
    spritesCounterclockwise: classProperties.spritesCounterclockwise,
    renderOffset: utils.valueOr(classProperties.renderOffset, {x: 0, y: 0}),
    renderScale: utils.valueOr(classProperties.scale, 1),
    animationFrameDuration: classProperties.animationFrameDuration
  };
};

Studio.addItem = function(opts) {
  if (typeof opts.className !== 'string') {
    throw new TypeError('Incorrect parameter: ' + opts.className);
  }

  var itemClass = opts.className.toLowerCase().trim();

  if (itemClass === constants.RANDOM_VALUE) {
    itemClass =
      skin.ItemClassNames[
        Math.floor(Math.random() * skin.ItemClassNames.length)
      ];
  }

  var skinItem = skin[itemClass];
  if (!skinItem) {
    throw new RangeError('Incorrect parameter: ' + opts.className);
  }

  var directions = [
    Direction.NORTH,
    Direction.EAST,
    Direction.SOUTH,
    Direction.WEST,
    Direction.NORTHEAST,
    Direction.SOUTHEAST,
    Direction.SOUTHWEST,
    Direction.NORTHWEST
  ];

  // Create stationary, grid-aligned items when skin.gridAlignedMovement,
  // otherwise, create randomly placed items travelling in a random direction.
  // Assumes that sprite[0] is in use, and avoids placing the item too close
  // to that sprite.

  var generateRandomItemPosition = function() {
    // TODO (cpirich): check for edge collisions? (currently avoided by placing
    // the items within the coordinate space (x/y min of Studio.HALF_SQUARE,
    // max of max - Studio.HALF_SQUARE)

    var pos = {};
    if (level.itemGridAlignedMovement) {
      pos.x =
        Studio.HALF_SQUARE +
        Studio.SQUARE_SIZE * Math.floor(Math.random() * Studio.COLS);
      pos.y =
        Studio.HALF_SQUARE +
        Studio.SQUARE_SIZE * Math.floor(Math.random() * Studio.ROWS);
    } else {
      pos.x =
        Studio.HALF_SQUARE +
        Math.floor(Math.random() * (Studio.MAZE_WIDTH - Studio.SQUARE_SIZE));
      pos.y =
        Studio.HALF_SQUARE +
        Math.floor(Math.random() * (Studio.MAZE_HEIGHT - Studio.SQUARE_SIZE));
    }
    return pos;
  };

  var pos = generateRandomItemPosition();
  var dir = level.itemGridAlignedMovement
    ? Direction.NONE
    : directions[Math.floor(Math.random() * directions.length)];
  var itemOptions = Object.assign(
    {},
    Studio.getItemOptionsForItemClass(itemClass),
    {
      x: pos.x,
      y: pos.y,
      dir: dir
    }
  );
  var item = new Item(itemOptions);

  if (Studio.wallMapCollisions) {
    // TODO (cpirich): just move within the map looking for open spaces instead
    // of randomly retrying random numbers

    var numTries = 0;
    var minDistanceFromSprite = 100;
    while (
      Studio.walls.willCollidableTouchWall(item, item.x, item.y) ||
      Studio.getDistance(
        Studio.sprite[0].x + Studio.sprite[0].width / 2,
        Studio.sprite[0].y + Studio.sprite[0].height / 2,
        item.x,
        item.y
      ) < minDistanceFromSprite
    ) {
      var newPos = generateRandomItemPosition();
      item.x = newPos.x;
      item.y = newPos.y;
      numTries++;
      if (numTries > 100) {
        break;
      }
    }
  }

  item.createElement(document.getElementById('spriteLayer'));
  Studio.items.push(item);
};

Studio.getDistance = function(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

Studio.setItemActivity = function(opts) {
  if (typeof opts.className !== 'string') {
    throw new TypeError('Incorrect parameter: ' + opts.className);
  }

  var itemClass = opts.className.toLowerCase().trim();

  if (itemClass === constants.RANDOM_VALUE) {
    itemClass =
      skin.ItemClassNames[
        Math.floor(Math.random() * skin.ItemClassNames.length)
      ];
  }

  var skinItem = skin[itemClass];
  if (!skinItem) {
    throw new RangeError('Incorrect parameter: ' + opts.className);
  }

  if (
    opts.type === constants.BEHAVIOR_WANDER ||
    opts.type === constants.BEHAVIOR_CHASE ||
    opts.type === constants.BEHAVIOR_FLEE ||
    opts.type === constants.BEHAVIOR_STOP
  ) {
    // retain this activity type for items of this class created in the future:
    Studio.itemActivity[itemClass] = opts.type;
    Studio.items.forEach(function(item) {
      if (item.className === itemClass) {
        item.setActivity(opts.type, 0);

        // For verifying success, record this combination of activity type and
        // item type.

        if (!Studio.trackedBehavior.setActivityRecord) {
          Studio.trackedBehavior.setActivityRecord = [];
        }

        if (!Studio.trackedBehavior.setActivityRecord[itemClass]) {
          Studio.trackedBehavior.setActivityRecord[itemClass] = [];
        }

        Studio.trackedBehavior.setActivityRecord[itemClass][opts.type] = true;
      }
    });
  }
};

Studio.setItemSpeed = function(opts) {
  if (typeof opts.className !== 'string') {
    throw new TypeError('Incorrect parameter: ' + opts.className);
  }

  var itemClass = opts.className.toLowerCase().trim();

  if (itemClass === constants.RANDOM_VALUE) {
    itemClass =
      skin.ItemClassNames[
        Math.floor(Math.random() * skin.ItemClassNames.length)
      ];
  }

  var skinItem = skin[itemClass];
  if (!skinItem) {
    throw new RangeError('Incorrect parameter: ' + opts.className);
  }

  // convert speed string parameter to appropriate numerical speed for this class:
  var newSpeed = utils.valueOr(
    skin.specialItemProperties[itemClass].speed,
    constants.DEFAULT_ITEM_SPEED
  );

  if (opts.speed.toLowerCase() === 'fast') {
    newSpeed = Math.floor(newSpeed * 2);
  } else if (opts.speed.toLowerCase() === 'slow') {
    newSpeed = Math.floor(newSpeed / 2);
  }

  // retain this speed value for items of this class created in the future:
  Studio.itemSpeed[itemClass] = newSpeed;
  Studio.items.forEach(function(item) {
    if (item.className === itemClass) {
      item.setSpeed(newSpeed);
    }
  });
};

Studio.showDebugInfo = function(opts) {
  showDebugInfo = opts.value;
};

Studio.vanishActor = function(opts) {
  var spriteLayer = document.getElementById('spriteLayer');

  var spriteIndex = opts.spriteIndex;
  if (spriteIndex < 0 || spriteIndex >= Studio.spriteCount) {
    throw new RangeError('Incorrect parameter: ' + spriteIndex);
  }
  var sprite = Studio.sprite[spriteIndex];
  var spriteShowing = sprite.visible || sprite.isFading();

  if (!spriteShowing) {
    return;
  }

  var explosion = document.getElementById('explosion' + spriteIndex);
  var explosionClipRect;
  if (!explosion) {
    var explosionClipPath = document.createElementNS(SVG_NS, 'clipPath');
    explosionClipPath.setAttribute('id', 'explosionClipPath' + spriteIndex);
    explosionClipRect = document.createElementNS(SVG_NS, 'rect');
    explosionClipRect.setAttribute('id', 'explosionClipRect' + spriteIndex);
    // TODO (cpirich): sprite size may change later, so this needs to be fixed
    explosionClipRect.setAttribute('width', sprite.height);
    explosionClipRect.setAttribute('height', sprite.width);
    explosionClipPath.appendChild(explosionClipRect);
    spriteLayer.appendChild(explosionClipPath);

    explosion = document.createElementNS(SVG_NS, 'image');
    explosion.setAttribute('id', 'explosion' + spriteIndex);
    explosion.setAttribute('visibility', 'hidden');
    explosion.setAttribute(
      'clip-path',
      'url(#explosionClipPath' + spriteIndex + ')'
    );
    spriteLayer.insertBefore(
      explosion,
      sprite.getElement() || sprite.getLegacyElement()
    );
  }

  // TODO (cpirich): use displayWidth / displayHeight to make vanish explosions
  // compatible with sprites that are scaled
  var frameWidth = sprite.width;
  var numFrames = skin.explosionFrames;

  var centerPos = sprite.getCurrentDrawPosition();
  var topLeftPos = {
    x: centerPos.x - sprite.width / 2,
    y: centerPos.y - sprite.height / 2
  };

  explosion.setAttribute('height', sprite.height);
  explosion.setAttribute('width', numFrames * frameWidth);
  explosion.setAttribute('x', topLeftPos.x);
  explosion.setAttribute('y', topLeftPos.y);

  explosion.setAttribute('visibility', 'visible');

  explosionClipRect = document.getElementById(
    'explosionClipRect' + spriteIndex
  );
  explosionClipRect.setAttribute('x', topLeftPos.x);
  explosionClipRect.setAttribute('y', topLeftPos.y);

  if (skin.fadeExplosion) {
    sprite.startFade(skin.explosionFrames * skin.timePerExplosionFrame);
  } else {
    Studio.setSprite({
      spriteIndex: spriteIndex,
      value: 'hidden'
    });
  }

  _.range(0, numFrames).forEach(function(i) {
    Studio.perExecutionTimeouts.push(
      setTimeout(function() {
        explosion.setAttribute('x', topLeftPos.x - i * frameWidth);
      }, i * skin.timePerExplosionFrame)
    );
  });
  Studio.perExecutionTimeouts.push(
    setTimeout(function() {
      explosion.setAttribute('visibility', 'hidden');
      if (skin.fadeExplosion) {
        // hide the sprite
        Studio.setSprite({
          spriteIndex: spriteIndex,
          value: 'hidden'
        });
        // restore the normal opacity
        sprite.setOpacity(1);
      }
    }, skin.timePerExplosionFrame * (numFrames + 1))
  );

  // we append the url with the spriteIndex so that each sprites explosion gets
  // treated as being different, otherwise chrome will animate all existing
  // explosions anytime we try to animate one of them
  explosion.setAttributeNS(
    'http://www.w3.org/1999/xlink',
    'xlink:href',
    skin.explosion + '?spriteIndex=' + spriteIndex
  );
};

Studio.setSpriteEmotion = function(opts) {
  let sprite = Studio.sprite[opts.spriteIndex];
  if (sprite === undefined) {
    return;
  }
  sprite.emotion = opts.value;
};

Studio.getSpriteEmotion = function(opts) {
  let sprite = Studio.sprite[opts.spriteIndex];
  if (sprite === undefined) {
    return;
  }
  let emotion = sprite.emotion;
  Studio.queueCallback(opts.callback, [emotion]);
};

Studio.setSpriteSpeed = function(opts) {
  var speed = Math.min(
    Math.max(opts.value, constants.SpriteSpeed.SLOW),
    constants.SpriteSpeed.VERY_FAST
  );
  let sprite = Studio.sprite[opts.spriteIndex];
  if (sprite === undefined) {
    return;
  }
  sprite.setSpeed(speed);
};

var DROID_SPEEDS = {
  slow: constants.SpriteSpeed.SLOW,
  normal: constants.SpriteSpeed.NORMAL,
  fast: constants.SpriteSpeed.VERY_FAST
};

Studio.setDroidSpeed = function(opts) {
  if (typeof opts.value !== 'string') {
    throw new TypeError('Incorrect parameter: ' + opts.value);
  }

  var speedValue = opts.value.toLowerCase().trim();

  if (speedValue === constants.RANDOM_VALUE) {
    speedValue = utils.randomKey(DROID_SPEEDS);
  }

  var speedNumericVal = DROID_SPEEDS[speedValue];
  if (typeof speedNumericVal === 'undefined') {
    throw new RangeError('Incorrect parameter: ' + opts.value);
  }

  opts.value = speedNumericVal;
  opts.spriteIndex = Studio.protaganistSpriteIndex || 0;
  Studio.setSpriteSpeed(opts);
};

Studio.setSpriteSize = function(opts) {
  var sprite = Studio.sprite[opts.spriteIndex];
  if (sprite === undefined) {
    return;
  }
  if (sprite.size === opts.value) {
    return;
  }

  sprite.size = opts.value;
  var curSpriteValue = sprite.value;

  if (curSpriteValue !== 'hidden') {
    // Unset .image and .legacyImage so that setSprite's calls to
    // setImage and setLegacyImage will complete.
    // In the future, an implementation that allows for setSpriteSize to
    // update the display more precisely would be valuable.
    // TODO because we skip this step when the sprite is hidden, the
    // following case will not work:
    //    setSprite 'witch'
    //    setSprite 'hidden'
    //    setSpriteSize 0.5
    //    setSprite 'visible'
    // Since setSpriteSize and 'visible' are currently never in the same
    // level, this is not a problem right now, but it would be good to
    // eventually address.
    sprite.image = undefined;
    sprite.legacyImage = undefined;
    // call setSprite with existing index/value now that we changed the size
    Studio.setSprite({
      spriteIndex: opts.spriteIndex,
      value: curSpriteValue
    });

    if (sprite.bubbleVisible) {
      createSpeechBubble(opts.spriteIndex, sprite.bubbleText);
    }
  }
};

Studio.changeScore = function(opts) {
  Studio.adjustScore(Studio.paramAsNumber(opts.value));
};

Studio.reduceScore = function(opts) {
  Studio.adjustScore(-1 * Studio.paramAsNumber(opts.value));
};

Studio.setScore = function(value) {
  Studio.adjustScore(Studio.paramAsNumber(value) - Studio.playerScore);
};

Studio.paramAsNumber = function(value) {
  if (
    typeof value !== 'number' &&
    (typeof value !== 'string' || isNaN(value))
  ) {
    throw new TypeError('Incorrect parameter: ' + value);
  }
  return Number(value);
};

Studio.adjustScore = function(value) {
  Studio.playerScore += value;

  Studio.displayFloatingScore(value);

  if (Studio.playerScore - value < 1000 && Studio.playerScore >= 1000) {
    callHandler('whenScore1000');
  }
};

Studio.setScoreText = function(opts) {
  Studio.scoreText = opts.text;
  Studio.displayScore();
};

Studio.setVictoryText = function(opts) {
  Studio.victoryText = opts.text;
  Studio.displayVictoryText();
};

Studio.endGame = function(opts) {
  if (typeof opts.value !== 'string') {
    throw new TypeError('Incorrect parameter: ' + opts.value);
  }

  var winValue = opts.value.toLowerCase().trim();

  if (winValue === 'win') {
    Studio.trackedBehavior.hasWonGame = true;
    Studio.setVictoryText({text: studioMsg.winMessage()});
  } else if (winValue === 'lose') {
    Studio.trackedBehavior.hasLostGame = true;
    Studio.setVictoryText({text: studioMsg.loseMessage()});
  } else {
    throw new RangeError('Incorrect parameter: ' + opts.value);
  }

  Studio.gameState = Studio.GameStates.OVER;
};

Studio.setBackground = function(opts) {
  if (typeof opts.value !== 'string') {
    throw new TypeError('Incorrect parameter: ' + opts.value);
  }

  var backgroundValue = opts.value.toLowerCase().trim();

  if (backgroundValue === constants.RANDOM_VALUE) {
    // NOTE: never select the last item from backgroundChoicesK1, since it is
    // presumed to be the "random" item for blockly
    // NOTE: the [1] index in the array contains the name parameter with an
    // additional set of quotes
    var quotedBackground =
      skin.backgroundChoicesK1[
        Math.floor(Math.random() * (skin.backgroundChoicesK1.length - 1))
      ][1];
    // Remove the outer quotes:
    backgroundValue = quotedBackground.replace(/^"(.*)"$/, '$1');
  }

  var skinBackground = skin[backgroundValue];
  if (!skinBackground) {
    throw new RangeError('Incorrect parameter: ' + opts.value);
  }

  if (backgroundValue !== Studio.background) {
    Studio.background = backgroundValue;
    Studio.walls.setBackground(backgroundValue);

    var element = document.getElementById('background');
    element.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'xlink:href',
      skinBackground.background
    );

    // Draw the tiles (again) now that we know which background we're using.
    if (Studio.wallMapCollisions) {
      // Changing background can cause a change in the map used internally,
      // since we might use a different map to suit this background, so set
      // the map again.
      if (Studio.wallMapRequested) {
        Studio.setMap({value: Studio.wallMapRequested, forceRedraw: true});
      }
    }

    Studio.loadClouds();
  }
};

/**
 * Set the wall map.
 * @param {string} opts.value - The name of the wall map.
 * @param {boolean} opts.forceRedraw - Force drawing map, even if it's already set.
 * @param {string} opts.color - The color to draw the wall, for collisionMaskWalls
 */
Studio.setMap = function(opts) {
  if (typeof opts.value !== 'string') {
    throw new TypeError('Incorrect parameter: ' + opts.value);
  }

  var mapValue = opts.value.toLowerCase().trim();

  if (mapValue === constants.RANDOM_VALUE) {
    // NOTE: never select the first item from mapChoices, since it is
    // presumed to be the "random" item for blockly
    // NOTE: the [1] index in the array contains the name parameter with an
    // additional set of quotes
    var quotedMap =
      skin.mapChoices[
        Math.floor(1 + Math.random() * (skin.mapChoices.length - 1))
      ][1];
    // Remove the outer quotes:
    mapValue = quotedMap.replace(/^"(.*)"$/, '$1');
  }

  var useMap;

  if (mapValue === 'default') {
    // Treat 'default' as resetting to the level's map (Studio.wallMap = null)
    useMap = null;
  } else if (skin.getMap) {
    // Give the skin a chance to adjust the map name depending upon the
    // background name.
    useMap = skin.getMap(Studio.background, mapValue);
  } else {
    useMap = mapValue;
  }

  if (
    useMap !== null &&
    !skin[useMap] &&
    !(skin.wallMaps && skin.wallMaps[useMap])
  ) {
    throw new RangeError('Incorrect parameter: ' + opts.value);
  }

  if (
    !opts.forceRedraw &&
    useMap === Studio.wallMap &&
    (!opts.color || opts.color === Studio.wallColor)
  ) {
    return;
  }

  // Use the actual map for collisions, rendering, etc.
  Studio.wallMap = useMap;
  Studio.wallMapCollisions = true;
  Studio.walls.setWallMapRequested(mapValue);

  // Remember the requested name so that we can reuse it next time the
  // background is changed.
  Studio.wallMapRequested = opts.value;

  if (opts.color && Studio.wallColor !== opts.color) {
    Studio.wallColor = opts.color;
    Studio.walls.setColor(opts.color);
  }

  // Draw the tiles (again) now that we know which background we're using.
  $('.tileClip').remove();
  $('.tile').remove();
  Studio.tiles = [];
  Studio.drawMapTiles();

  Studio.fixSpriteLocation();

  sortDrawOrder();
};

/**
 * A call to setMap might place a wall on top of the sprite.  In that case,
 * find a new nearby location for the sprite that doesn't have a wall.
 * Currently a work in progress with known issues.
 */
Studio.fixSpriteLocation = function() {
  if (Studio.wallMapCollisions) {
    for (
      var spriteIndex = 0;
      spriteIndex < Studio.sprite.length;
      spriteIndex++
    ) {
      var sprite = Studio.sprite[spriteIndex];
      var position = getNextPosition(spriteIndex, false);

      if (Studio.willSpriteTouchWall(sprite, position.x, position.y)) {
        // Let's assume that one of the surrounding 8 squares is available.
        // (Note: this is a major assumption predicated on level design.)

        var xCenter = position.x + sprite.width / 2;
        var yCenter = position.y + sprite.height / 2;

        xCenter +=
          skin.wallCollisionRectOffsetX + skin.wallCollisionRectWidth / 2;
        yCenter +=
          skin.wallCollisionRectOffsetY + skin.wallCollisionRectHeight / 2;

        var xGrid = Math.floor(xCenter / Studio.SQUARE_SIZE);
        var yGrid = Math.floor(yCenter / Studio.SQUARE_SIZE);

        var minRow = Math.max(yGrid - 1, 0);
        var maxRow = Math.min(yGrid + 1, Studio.ROWS - 1);
        var minCol = Math.max(xGrid - 1, 0);
        var maxCol = Math.min(xGrid + 1, Studio.COLS - 1);

        for (var row = minRow; row <= maxRow; row++) {
          for (var col = minCol; col <= maxCol; col++) {
            var tryX =
              Studio.HALF_SQUARE +
              Studio.SQUARE_SIZE * col -
              sprite.width / 2 -
              skin.wallCollisionRectOffsetX;
            var tryY =
              Studio.HALF_SQUARE +
              Studio.SQUARE_SIZE * row -
              sprite.height / 2 -
              skin.wallCollisionRectOffsetY;
            if (!Studio.willSpriteTouchWall(sprite, tryX, tryY)) {
              sprite.x = tryX;
              sprite.y = tryY;
              sprite.setDirection(Direction.NONE);
              return;
            }
          }
        }
      }
    }
  }
};

/**
 * Sets an actor to be a specific sprite, or alternatively to be hidden.
 * @param opts.value {string} Name of sprite, or 'hidden'
 * @param opts.spriteIndex {number} Index of the sprite
 */
Studio.setSprite = function(opts) {
  if (typeof opts.value !== 'string') {
    throw new TypeError('Incorrect parameter: ' + opts.value);
  }

  var spriteValue = opts.value.toLowerCase().trim();

  if (spriteValue === constants.RANDOM_VALUE) {
    spriteValue =
      skin.avatarList[Math.floor(Math.random() * skin.avatarList.length)];
  }

  var skinSprite = skin[spriteValue];
  if (!skinSprite && spriteValue !== 'hidden' && spriteValue !== 'visible') {
    throw new RangeError('Incorrect parameter: ' + opts.value);
  }

  var spriteIndex = opts.spriteIndex;
  if (spriteIndex < 0 || spriteIndex >= Studio.spriteCount) {
    throw new RangeError('Incorrect parameter: ' + spriteIndex);
  }
  var sprite = Studio.sprite[spriteIndex];

  sprite.visible = spriteValue !== 'hidden' && !opts.forceHidden;

  sprite.value = opts.forceHidden ? 'hidden' : spriteValue;
  if (spriteValue === 'hidden' || spriteValue === 'visible') {
    return;
  }

  sprite.imageName = spriteValue;
  sprite.frameCounts = skinSprite.frameCounts;
  sprite.setNormalFrameDuration(skinSprite.animationFrameDuration);
  sprite.drawScale = utils.valueOr(skinSprite.drawScale, 1);
  // Reset height and width:
  if (skin.gridAlignedMovement) {
    // This mode only works properly with square sprites
    sprite.height = sprite.width = Studio.SQUARE_SIZE;
    sprite.size = sprite.width / skin.spriteWidth;

    sprite.drawHeight = sprite.drawScale * sprite.size * skin.spriteHeight;
    sprite.drawWidth = sprite.drawScale * sprite.size * skin.spriteWidth;
  } else {
    sprite.drawHeight = sprite.height =
      sprite.drawScale * sprite.size * skin.spriteHeight;
    sprite.drawWidth = sprite.width =
      sprite.drawScale * sprite.size * skin.spriteWidth;
  }
  if (skin.projectileSpriteHeight) {
    sprite.projectileSpriteHeight = sprite.size * skin.projectileSpriteHeight;
  }
  if (skin.projectileSpriteWidth) {
    sprite.projectileSpriteWidth = sprite.size * skin.projectileSpriteWidth;
  }

  sprite.setImage(skinSprite.walk, sprite.frameCounts);
  sprite.setLegacyImage(skinSprite.sprite, sprite.frameCounts);

  sprite.createElement(document.getElementById('spriteLayer'));

  var element = sprite.getLegacyElement();
  if (element) {
    dom.addMouseDownTouchEvent(
      sprite.getLegacyElement(),
      delegate(this, Studio.onSpriteClicked, spriteIndex)
    );
  }
  element = sprite.getElement();
  if (element) {
    dom.addMouseDownTouchEvent(
      sprite.getElement(),
      delegate(this, Studio.onSpriteClicked, spriteIndex)
    );
  }

  // Set up movement audio for the selected sprite (clips should be preloaded)
  // First, stop any movement audio for the current character.
  Studio.movementAudioOff();
  if (!Studio.movementAudioEffects[spriteValue] && skin.avatarList) {
    var spriteSkin = skin[spriteValue] || {};
    var audioConfig = spriteSkin.movementAudio || [];
    Studio.movementAudioEffects[spriteValue] = [];
    Studio.movementAudioEffects[spriteValue] = audioConfig.map(function(
      audioOption
    ) {
      return new ThreeSliceAudio(Sounds.getSingleton(), audioOption);
    });
  }
  Studio.currentSpriteMovementAudioEffects =
    Studio.movementAudioEffects[spriteValue];

  // call display right away since the frame number may have changed:
  Studio.displaySprite(spriteIndex);
};

Studio.getSpriteVisibility = function(opts) {
  let sprite = Studio.sprite[opts.spriteIndex];
  if (sprite === undefined) {
    return;
  }
  Studio.queueCallback(opts.callback, [sprite.visible]);
};

Studio.getSpriteValue = function(opts) {
  let sprite = Studio.sprite[opts.spriteIndex];
  if (sprite === undefined) {
    return;
  }
  Studio.queueCallback(opts.callback, [sprite.value]);
};

var moveAudioState = false;
Studio.isMovementAudioOn = function() {
  return moveAudioState;
};

Studio.movementAudioOn = function() {
  Studio.movementAudioOff();
  Studio.currentMovementAudio =
    Studio.currentSpriteMovementAudioEffects[
      Math.floor(
        Math.random() * Studio.currentSpriteMovementAudioEffects.length
      )
    ];
  if (Studio.currentMovementAudio) {
    Studio.currentMovementAudio.on();
  }
  moveAudioState = true;
};

Studio.movementAudioOff = function() {
  if (Studio.currentMovementAudio) {
    Studio.currentMovementAudio.off();
  }
  moveAudioState = false;
};

var p = function(x, y) {
  return x + ' ' + y + ' ';
};

var TIP_HEIGHT = 15;
var TIP_WIDTH = 25;
var TIP_X_SHIFT = 10;

//
// createSpeechBubblePath creates a SVG path that looks like a rounded rect
// plus a 'tip' that points back to the sprite.
//
// x, y is the top left position. w, h, r are width/height/radius (for corners)
// onTop, onRight are booleans that are used to tell this function if the
// bubble is appearing on top and on the right of the sprite, tipOffset is how
// far in from the corner to draw the tip.
//
// Thanks to Remy for the original rounded rect path function
/*
http://www.remy-mellet.com/blog/179-draw-rectangle-with-123-or-4-rounded-corner/
*/

var createSpeechBubblePath = function(
  x,
  y,
  w,
  h,
  r,
  onTop,
  onRight,
  tipOffset
) {
  var strPath = 'M' + p(x + r, y); //A
  if (!onTop) {
    if (onRight) {
      strPath += 'L' + p(x + r + tipOffset, y);
      strPath +=
        'L' +
        p(x + r - TIP_X_SHIFT + tipOffset, y - TIP_HEIGHT) +
        'L' +
        p(x + r + TIP_WIDTH + tipOffset, y);
    } else {
      strPath +=
        'L' +
        p(x + w - r - TIP_WIDTH - tipOffset, y) +
        'L' +
        p(x + w - TIP_X_SHIFT - tipOffset, y - TIP_HEIGHT);
      strPath += 'L' + p(x + w - r - tipOffset, y);
    }
  }
  strPath += 'L' + p(x + w - r, y);
  strPath += 'Q' + p(x + w, y) + p(x + w, y + r); //B
  strPath +=
    'L' + p(x + w, y + h - r) + 'Q' + p(x + w, y + h) + p(x + w - r, y + h); //C
  if (onTop) {
    if (onRight) {
      strPath +=
        'L' +
        p(x + r + TIP_WIDTH + tipOffset, y + h) +
        'L' +
        p(x + r - TIP_X_SHIFT + tipOffset, y + h + TIP_HEIGHT);
      strPath += 'L' + p(x + r + tipOffset, y + h);
    } else {
      strPath += 'L' + p(x + w - r - tipOffset, y + h);
      strPath +=
        'L' +
        p(x + w - TIP_X_SHIFT - tipOffset, y + h + TIP_HEIGHT) +
        'L' +
        p(x + w - r - TIP_WIDTH - tipOffset, y + h);
    }
  }
  strPath += 'L' + p(x + r, y + h);
  strPath += 'Q' + p(x, y + h) + p(x, y + h - r); //D
  strPath += 'L' + p(x, y + r) + 'Q' + p(x, y) + p(x + r, y); //A
  strPath += 'Z';
  return strPath;
};

var onWaitComplete = function(opts) {
  if (!opts.complete) {
    if (opts.waitCallback) {
      opts.waitCallback();
    }
    opts.complete = true;
  }
};

Studio.wait = function(opts) {
  if (!opts.started) {
    opts.started = true;

    // opts.value is the number of milliseconds to wait - or 'click' which means
    // "wait for click"
    if ('click' === opts.value) {
      opts.waitForClick = true;
    } else {
      opts.waitTimeout = window.setTimeout(
        delegate(this, onWaitComplete, opts),
        opts.value
      );
    }
  }

  return opts.complete;
};

Studio.hideTitleScreen = function(opts) {
  var tsTitle = document.getElementById('titleScreenTitle');
  var tsTextGroup = document.getElementById('titleScreenTextGroup');
  tsTitle.setAttribute('visibility', 'hidden');
  tsTextGroup.setAttribute('visibility', 'hidden');

  opts.complete = true;
};

Studio.showTitleScreen = function(opts) {
  if (!opts.started) {
    opts.started = true;
    var tsTitle = document.getElementById('titleScreenTitle');
    var tsTextGroup = document.getElementById('titleScreenTextGroup');
    var tsText = document.getElementById('titleScreenText');
    var tsTextRect = document.getElementById('titleScreenTextRect');
    tsTitle.textContent = opts.title;
    var svgTextOpts = {
      svgText: tsText,
      text: opts.text,
      width: TITLE_SCREEN_TEXT_WIDTH,
      maxWidth: TITLE_SCREEN_TEXT_WIDTH,
      lineHeight: TITLE_SCREEN_TEXT_LINE_HEIGHT,
      topMargin: TITLE_SCREEN_TEXT_TOP_MARGIN,
      sideMargin: TITLE_SCREEN_TEXT_SIDE_MARGIN,
      maxLines: TITLE_SCREEN_TEXT_MAX_LINES,
      fullHeight: TITLE_SCREEN_TEXT_HEIGHT
    };
    var tsTextHeight = setSvgText(svgTextOpts).height;
    tsTextRect.setAttribute('height', tsTextHeight);

    tsTitle.setAttribute('visibility', 'visible');
    tsTextGroup.setAttribute('visibility', 'visible');

    // Wait for a click or a timeout
    opts.waitForClick = true;
    opts.waitCallback = delegate(this, Studio.hideTitleScreen, opts);
    opts.waitTimeout = window.setTimeout(
      delegate(this, onWaitComplete, opts),
      TITLE_SCREEN_TIMEOUT
    );
  }

  return opts.complete;
};

Studio.isCmdCurrentInQueue = function(cmdName, queueName) {
  var foundCmd = false;
  Studio.eventHandlers.forEach(function(handler) {
    if (handler && handler.name === queueName) {
      var cmd = handler.cmdQueue[0];

      if (cmd && cmd.name === cmdName) {
        foundCmd = true;
        // would like to break, but can't do that in forEach
      }
    }
  });
  return foundCmd;
};

/**
 * Helper for Studio methods which read state. Because they must
 * implement callbacks to correctly read and handle that state in the
 * user's program, they need to be able to schedule the execution of
 * those callbacks at the appropriate time.
 *
 * @param {function} the method to be queued
 * @param {Array} the arguments to be passed to that method
 */
Studio.queueCallback = function(callback, args) {
  let handlerName = `callbackQueue${Studio.callbackQueueIndex}`;
  Studio.callbackQueueIndex++;

  // Shift a CallExpression node on the stack that already has its func_,
  // arguments, and other state populated:
  args = args || [''];
  const intArgs = args.map(arg => Studio.interpreter.createPrimitive(arg));
  var state = {
    node: {
      type: 'CallExpression',
      arguments: intArgs /* this just needs to be an array of the same size */,
      // give this node an end so that the interpreter doesn't treat it
      // like polyfill code and do weird weird scray terrible things.
      end: 1
    },
    doneCallee_: true,
    func_: callback,
    arguments_: intArgs,
    n_: intArgs.length
  };

  registerEventHandler(Studio.eventHandlers, handlerName, () => {
    // remove the last argument because stepCallExpression always wants to push it back on.
    if (state.arguments_.length > 0) {
      state.value = state.arguments_.pop();
    }

    const depth = Studio.interpreter.pushStackFrame(state);
    Studio.interpreter.paused_ = false;
    while (Studio.interpreter.getStackDepth() >= depth) {
      Studio.interpreter.step();
    }
    Studio.interpreter.paused_ = true;
  });
  callHandler(handlerName);
};

/**
 * Pause execution and display a prompt for user input. When the user presses
 * enter or clicks "Submit", resume execution.
 * @param question
 * @param callback
 */
Studio.askForInput = function(question, callback) {
  Studio.pauseExecution();

  const viz = document.getElementById('visualization');
  const target = document.createElement('div');
  Object.assign(target.style, {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '400px',
    height: '400px'
  });
  viz.appendChild(target);
  studioApp().resizeVisualization();

  Studio.inputPromptElement = target;

  function onInputReceived(value) {
    Studio.resumeExecution();
    Studio.hideInputPrompt();
    Studio.queueCallback(callback, [value]);
  }

  ReactDOM.render(
    <InputPrompt question={question} onInputReceived={onInputReceived} />,
    target
  );
};

Studio.hideInputPrompt = function() {
  const target = Studio.inputPromptElement;

  if (target) {
    ReactDOM.unmountComponentAtNode(target);
    target.parentNode.removeChild(target);
    Studio.inputPromptElement = null;
  }
};

Studio.hideSpeechBubble = function(opts) {
  let sprite = Studio.sprite[opts.spriteIndex];
  if (sprite === undefined) {
    return;
  }
  var speechBubble = document.getElementById('speechBubble' + opts.spriteIndex);
  speechBubble.setAttribute('visibility', 'hidden');
  speechBubble.removeAttribute('onTop');
  speechBubble.removeAttribute('onRight');
  speechBubble.removeAttribute('height');
  opts.complete = true;
  sprite.bubbleVisible = false;
  delete sprite.bubbleTimeoutFunc;
  Studio.sayComplete++;
};

Studio.saySprite = function(opts) {
  if (opts.started) {
    return opts.complete;
  }

  var spriteIndex = opts.spriteIndex;
  var sprite = Studio.sprite[spriteIndex];
  if (!sprite) {
    return;
  }

  opts.started = true;

  // Remove any existing speech bubble on this sprite:
  if (sprite.bubbleTimeoutFunc) {
    sprite.bubbleTimeoutFunc();
  }
  window.clearTimeout(sprite.bubbleTimeout);

  if (!sprite.visible) {
    opts.complete = true;
    return opts.complete;
  }

  createSpeechBubble(spriteIndex, opts.text);

  // displaySprite will reposition the bubble
  Studio.displaySprite(opts.spriteIndex);
  var speechBubble = document.getElementById('speechBubble' + spriteIndex);
  speechBubble.setAttribute('visibility', 'visible');

  sprite.bubbleVisible = true;
  sprite.bubbleText = opts.text;
  sprite.bubbleTimeoutFunc = delegate(this, Studio.hideSpeechBubble, opts);
  sprite.bubbleTimeout = window.setTimeout(
    sprite.bubbleTimeoutFunc,
    opts.seconds * 1000
  );

  return opts.complete;
};

var createSpeechBubble = function(spriteIndex, text) {
  // Start creating the new speech bubble:
  var bblText = document.getElementById('speechBubbleText' + spriteIndex);
  var sprite = Studio.sprite[spriteIndex];

  var availableHeight = (Studio.MAZE_HEIGHT - sprite.height) / 2;
  var maxLines = Math.floor(
    (availableHeight -
      2 * SPEECH_BUBBLE_PADDING -
      2 * SPEECH_BUBBLE_TOP_MARGIN) /
      SPEECH_BUBBLE_LINE_HEIGHT
  );
  var svgTextOpts = {
    svgText: bblText,
    text: text,
    width: SPEECH_BUBBLE_MIN_WIDTH,
    maxWidth: SPEECH_BUBBLE_MAX_WIDTH,
    lineHeight: SPEECH_BUBBLE_LINE_HEIGHT,
    topMargin: SPEECH_BUBBLE_TOP_MARGIN,
    sideMargin: SPEECH_BUBBLE_SIDE_MARGIN,
    maxLines: maxLines,
    fullHeight:
      maxLines * SPEECH_BUBBLE_LINE_HEIGHT +
      2 * SPEECH_BUBBLE_PADDING +
      2 * SPEECH_BUBBLE_TOP_MARGIN
  };
  var bblSize = setSvgText(svgTextOpts);
  var speechBubblePath = document.getElementById(
    'speechBubblePath' + spriteIndex
  );

  speechBubblePath.setAttribute('height', bblSize.height);
  speechBubblePath.setAttribute('width', bblSize.width);
  updateSpeechBubblePath(speechBubblePath);
};

Studio.stop = function(opts) {
  let sprite = Studio.sprite[opts.spriteIndex];
  if (sprite === undefined) {
    return;
  }
  cancelQueuedMovements(opts.spriteIndex, true);
  cancelQueuedMovements(opts.spriteIndex, false);
  sprite.setActivity(constants.BEHAVIOR_STOP);

  if (!opts.dontResetCollisions) {
    // Reset collisionMasks so the next movement will fire another collision
    // event against the same sprite if needed. This makes it easier to write code
    // that says "when sprite X touches Y" => "stop sprite X", and have it do what
    // you expect it to do...
    sprite.clearCollisions();
    for (var i = 0; i < Studio.spriteCount; i++) {
      if (i === opts.spriteIndex) {
        continue;
      }
      Studio.sprite[i].endCollision(opts.spriteIndex);
    }
  }
};

/**
 * Launch a projectile from the sprite at options.spriteIndex. If the source
 * sprite isn't visible, do nothing.
 */
Studio.throwProjectile = function(options) {
  if (options.started) {
    return options.complete;
  }
  options.started = true;
  options.complete = false;
  window.setTimeout(function() {
    options.complete = true;
  }, MIN_TIME_BETWEEN_PROJECTILES);

  var sourceSprite = Studio.sprite[options.spriteIndex];
  if (!sourceSprite.visible) {
    return;
  }

  var preventLoop =
    skin.preventProjectileLoop && skin.preventProjectileLoop(options.className);

  var projectileOptions = {
    frames: getFrameCount(
      options.className,
      skin.specialProjectileProperties,
      skin.projectileFrames
    ),
    className: options.className,
    dir: options.dir,
    image: skin[options.className],
    loop: !preventLoop,
    spriteX: sourceSprite.x,
    spriteY: sourceSprite.y,
    spriteHeight: sourceSprite.projectileSpriteHeight || sourceSprite.height,
    spriteWidth: sourceSprite.projectileSpriteWidth || sourceSprite.width
  };

  var projectile = new Projectile(projectileOptions);
  projectile.createElement(document.getElementById('svgStudio'));
  Studio.projectiles.push(projectile);
};

//
// Internal helper to handle makeProjectile calls on a single projectile
//
// Return value: true if projectile was removed from the projectiles array
//

var doMakeProjectile = function(projectile, action) {
  if (action === 'bounce') {
    projectile.bounce();
  } else if (action === 'disappear') {
    projectile.removeElement();
    var pos = Studio.projectiles.indexOf(projectile);
    if (-1 !== pos) {
      Studio.projectiles.splice(pos, 1);
      return true;
    }
  } else {
    throw 'unknown action in doMakeProjectile';
  }
  return false;
};

Studio.makeProjectile = function(opts) {
  // opts.eventObject will be set when we've had a collision with a particular
  // projectile, otherwise we operate all all of that class
  if (opts.eventObject) {
    doMakeProjectile(opts.eventObject, opts.action);
  } else {
    // No "current" projectile, so apply action to all of them of this class
    for (var i = 0; i < Studio.projectiles.length; i++) {
      if (
        Studio.projectiles[i].className === opts.className &&
        doMakeProjectile(Studio.projectiles[i], opts.action)
      ) {
        // if this returned true, the projectile was deleted

        // decrement i because we just removed an item from the array. We want
        // to keep i as the same value for the next iteration through this loop
        i--;
      }
    }
  }
};

/**
 * Actors have a class name in the form "0". Returns true if this class is
 * an actor
 */
function isActorClass(className) {
  return /^\d*$/.test(className);
}

function isEdgeClass(className) {
  return EdgeClassNames.indexOf(className) !== -1;
}

function isProjectileClass(className) {
  return skin.ProjectileClassNames.indexOf(className) !== -1;
}

function isItemClass(className) {
  return skin.ItemClassNames.indexOf(className) !== -1;
}

/**
 * Call the handler for an actor (src) colliding with target
 */
function handleCollision(src, target, allowQueueExtension) {
  var prefix = 'whenSpriteCollided-' + src + '-';

  callHandler(prefix + target, allowQueueExtension);
  callHandler(prefix + 'anything', allowQueueExtension);
  // If dest is just a number, we're colliding with another actor
  if (isActorClass(target)) {
    callHandler(prefix + 'any_actor', allowQueueExtension);
    callHandler(prefix + Studio.sprite[target].imageName, false, [target]);
  } else if (isEdgeClass(target)) {
    callHandler(prefix + 'any_edge', allowQueueExtension);
  } else if (isProjectileClass(target)) {
    callHandler(prefix + 'any_projectile', allowQueueExtension);
  } else if (isItemClass(target)) {
    callHandler(prefix + 'any_item', allowQueueExtension);
  }
}

/**
 * Call the handler for an item colliding with target
 */
function handleItemCollision(src, target, allowQueueExtension) {
  var prefix = 'whenItemCollided-' + src + '-';

  callHandler(prefix + target, allowQueueExtension);

  if (isEdgeClass(target)) {
    callHandler(prefix + 'any_edge', allowQueueExtension);
  }
}

/**
 * Execute the code for an item colliding with target
 */
function executeItemCollision(src, target) {
  var prefix = 'whenItemCollided-' + src + '-';

  Studio.executeQueue(prefix + target);

  if (isEdgeClass(target)) {
    Studio.executeQueue(prefix + 'any_edge');
  }
}

/**
 * Execute the code for an actor (src) colliding with target
 */
function executeCollision(src, target) {
  var srcPrefix = 'whenSpriteCollided-' + src + '-';

  Studio.executeQueue(srcPrefix + target);
  if (isActorClass(target)) {
    Studio.executeQueue(srcPrefix + Studio.sprite[target].imageName);
  }

  // src is always an actor
  Studio.executeQueue(srcPrefix + 'any_actor');
  Studio.executeQueue(srcPrefix + 'anything');
  Studio.executeQueue(srcPrefix + 'goal');

  if (isEdgeClass(target)) {
    Studio.executeQueue(srcPrefix + 'any_edge');
  } else if (isProjectileClass(target)) {
    Studio.executeQueue(srcPrefix + 'any_projectile');
  } else if (isItemClass(target)) {
    Studio.executeQueue(srcPrefix + 'any_item');
  }
}

/**
 * Looks to see if the item is already colliding with target.  If it
 * isn't, it starts the collision and calls the relevant code.
 * @param {Collidable} item colliding
 * @param {string/number} target Class name of the target. String for classes,
 *   index if colliding with another sprite.
 * @param {boolean} allowQueueExtension Passed on to callHandler
 */
Studio.collideItemWith = function(item, target, allowQueueExtension) {
  if (item.startCollision(target)) {
    handleItemCollision(item.className, target, allowQueueExtension);
  }
};

/**
 * Looks to see if the sprite is already colliding with target.  If it isn't, it
 * starts the collision and calls the relevant code.
 * @param {Collidable} spriteIndex colliding
 * @param {string/number} target Class name of the target. String for classes,
 *   index if colliding with another sprite.
 * @param {boolean} allowQueueExtension Passed on to callHandler
 */
Studio.collideSpriteWith = function(spriteIndex, target, allowQueueExtension) {
  var sprite = Studio.sprite[spriteIndex];
  if (sprite.startCollision(target)) {
    handleCollision(spriteIndex, target, allowQueueExtension);
  }
};

Studio.setSpritePosition = function(opts) {
  var sprite = Studio.sprite[opts.spriteIndex];
  if (sprite === undefined) {
    return;
  }
  if (opts.value) {
    // fill in .x and .y from the constants.Position value in opts.value
    opts.x = utils.xFromPosition(opts.value, Studio.MAZE_WIDTH, sprite.width);
    opts.y = utils.yFromPosition(opts.value, Studio.MAZE_HEIGHT, sprite.height);
  }
  var samePosition = sprite.x === opts.x && sprite.y === opts.y;

  // Don't reset collisions inside stop() if we're in the same position
  Studio.stop({
    spriteIndex: opts.spriteIndex,
    dontResetCollisions: samePosition
  });
  sprite.displayX = sprite.x = opts.x;
  sprite.displayY = sprite.y = opts.y;
  // Reset to "no direction" so no turn animation will take place
  sprite.setDirection(Direction.NONE);
};

Studio.setSpriteXY = function(opts) {
  var sprite = Studio.sprite[opts.spriteIndex];
  if (sprite === undefined) {
    return;
  }
  var x = opts.x - sprite.width / 2;
  var y = opts.y - sprite.height / 2;
  var samePosition = sprite.x === x && sprite.y === y;

  // Don't reset collisions inside stop() if we're in the same position
  Studio.stop({
    spriteIndex: opts.spriteIndex,
    dontResetCollisions: samePosition
  });
  sprite.displayX = sprite.x = x;
  sprite.displayY = sprite.y = y;
  // Reset to "no direction" so no turn animation will take place
  sprite.setDirection(Direction.NONE);
};

Studio.getSpriteXY = function(opts) {
  let sprite = Studio.sprite[opts.spriteIndex];
  if (sprite === undefined) {
    return;
  }
  Studio.queueCallback(opts.callback, [sprite.x, sprite.y]);
};

function getSpritesByName(name) {
  return Studio.sprite.filter(
    sprite => sprite.imageName === name && sprite.visible
  );
}

Studio.setSpriteBehavior = function(opts) {
  const sprite = Studio.sprite[opts.spriteIndex];
  if (sprite) {
    sprite.setActivity(opts.behavior, opts.targetSpriteIndex);
  }
};

Studio.setSpritesWander = function(opts) {
  getSpritesByName(opts.spriteName).forEach(sprite =>
    sprite.setActivity(constants.BEHAVIOR_WANDER)
  );
};

Studio.setSpritesStop = function(opts) {
  getSpritesByName(opts.spriteName).forEach(sprite =>
    sprite.setActivity(constants.BEHAVIOR_STOP)
  );
};

Studio.setSpritesChase = function(opts) {
  if (Studio.sprite[opts.targetSpriteIndex]) {
    getSpritesByName(opts.spriteName).forEach(sprite =>
      sprite.setActivity(constants.BEHAVIOR_CHASE, opts.targetSpriteIndex)
    );
  }
};

Studio.setSpritesFlee = function(opts) {
  if (Studio.sprite[opts.targetSpriteIndex]) {
    getSpritesByName(opts.spriteName).forEach(sprite =>
      sprite.setActivity(constants.BEHAVIOR_FLEE, opts.targetSpriteIndex)
    );
  }
};

Studio.setSpritesSpeed = function(opts) {
  getSpritesByName(opts.spriteName).forEach(
    sprite => (sprite.speed = opts.speed)
  );
};

Studio.addGoal = function(opts) {
  if (opts.value) {
    var sprite = {
      width: utils.valueOr(skin.goalSpriteWidth, Studio.MARKER_WIDTH),
      height: utils.valueOr(skin.goalSpriteHeight, Studio.MARKER_HEIGHT)
    };
    // fill in .x and .y from the constants.Position value in opts.value
    opts.x = utils.xFromPosition(opts.value, Studio.MAZE_WIDTH, sprite.width);
    opts.y = utils.yFromPosition(opts.value, Studio.MAZE_HEIGHT, sprite.height);
  }

  var goal = {
    finished: false,
    x: opts.x,
    y: opts.y
  };

  Studio.createGoalElements(Studio.allGoals_().length, goal);
  Studio.dynamicSpriteGoals_.push(goal);
  sortDrawOrder();
};

Studio.getPlayspaceBoundaries = function(sprite) {
  var boundaries;

  if (
    skin.wallCollisionRectWidth &&
    skin.wallCollisionRectHeight &&
    !skin.gridAlignedMovement
  ) {
    boundaries = {
      top:
        0 -
        (sprite.height - skin.wallCollisionRectHeight) / 2 -
        skin.wallCollisionRectOffsetY,
      right:
        Studio.MAZE_WIDTH -
        skin.wallCollisionRectWidth -
        (sprite.width - skin.wallCollisionRectWidth) / 2 -
        skin.wallCollisionRectOffsetX,
      bottom:
        Studio.MAZE_HEIGHT -
        skin.wallCollisionRectHeight -
        (sprite.height - skin.wallCollisionRectHeight) / 2 -
        skin.wallCollisionRectOffsetY,
      left:
        0 -
        (sprite.width - skin.wallCollisionRectWidth) / 2 -
        skin.wallCollisionRectOffsetX
    };
  } else {
    boundaries = {
      top: 0,
      right: Studio.MAZE_WIDTH - sprite.width,
      bottom: Studio.MAZE_HEIGHT - sprite.height,
      left: 0
    };
  }

  return boundaries;
};

Studio.getSkin = function() {
  return skin;
};

/**
 * For grid-aligned movement, we want a single movement action to take place
 * over several ticks (as opposed to normal movement, which takes place on a
 * per-tick basis). We therefore yield control for the movement duration.
 *
 * @see Studio.turnSingle
 * @see Studio.moveSingle
 */
Studio.yieldGridAlignedTicks = function() {
  Studio.yieldExecutionTicks += 1 + Studio.gridAlignedExtraPauseSteps;
  if (Studio.JSInterpreter) {
    // Stop executing the interpreter in a tight loop and yield the current
    // execution tick:
    Studio.JSInterpreter.yield();
    // Highlight the code in the editor so the student can see the progress
    // of their program:
    Studio.JSInterpreter.selectCurrentCode();
  }

  Studio.movementAudioOn();
};

/**
 * For executing a single "goLeft" or "goNorth" sort of command in student code.
 * Moves the avatar by a different amount.
 * Has slightly different behaviors depending on whether the level is configured
 * for discrete, grid-based movement or free movement.
 * @param {Object} opts
 * @param {Direction} opts.dir - The direction in which the sprite should move.
 * @param {number} opts.spriteIndex
 * @param {boolean} opts.backward - whether the sprite should move toward
 *        (default) or away from the given direction
 */
Studio.turnSingle = function(opts) {
  if (!skin.gridAlignedMovement) {
    throw new TypeError('Studio.turnSingle is only valid in grid-aligned mode');
  }

  const sprite = Studio.sprite[opts.spriteIndex];
  if (sprite === undefined) {
    return;
  }
  sprite.lastMove = Studio.tickCount;
  sprite.setActivity(constants.BEHAVIOR_GRID_ALIGNED);
  sprite.addAction(new GridTurn(opts.dir, skin.slowExecutionFactor));

  Studio.yieldGridAlignedTicks();
  Studio.lastMoveSingleDir = opts.dir;
};

/**
 * For executing a single "goLeft" or "goNorth" sort of command in student code.
 * Moves the avatar by a different amount.
 * Has slightly different behaviors depending on whether the level is configured
 * for discrete, grid-based movement or free movement.
 * @param {Object} opts
 * @param {Direction} opts.dir - The direction in which the sprite should move.
 * @param {number} opts.spriteIndex
 * @param {boolean} opts.backward - whether the sprite should move toward
 *        (default) or away from the given direction
 */
Studio.moveSingle = function(opts) {
  var sprite = Studio.sprite[opts.spriteIndex];
  if (sprite === undefined) {
    return;
  }
  sprite.lastMove = Studio.tickCount;
  var distance = skin.gridAlignedMovement ? Studio.SQUARE_SIZE : sprite.speed;
  var wallCollision = false;
  var playspaceEdgeCollision = false;
  var deltaX = 0,
    deltaY = 0;

  switch (opts.dir) {
    case Direction.NORTH:
      deltaY = -distance;
      break;
    case Direction.EAST:
      deltaX = distance;
      break;
    case Direction.SOUTH:
      deltaY = distance;
      break;
    case Direction.WEST:
      deltaX = -distance;
      break;
  }

  if (opts.backward) {
    deltaX *= -1;
    deltaY *= -1;
  }

  var projectedX = sprite.x + deltaX;
  var projectedY = sprite.y + deltaY;

  if (
    Studio.wallMapCollisions &&
    Studio.willSpriteTouchWall(sprite, projectedX, projectedY)
  ) {
    wallCollision = true;

    // Since we never overlap the wall/obstacle when blockMovingIntoWalls
    // is set, throttle the event so it doesn't fire every frame while
    // attempting to move into a wall:

    Studio.throttledCollideSpriteWithWallFunctions[opts.spriteIndex]();
  }

  if (
    !Studio.allowSpritesOutsidePlayspace &&
    Studio.willSpriteLeavePlayspace(sprite, projectedX, projectedY)
  ) {
    playspaceEdgeCollision = true;
  }

  if (skin.gridAlignedMovement) {
    sprite.setActivity(constants.BEHAVIOR_GRID_ALIGNED);
    if (wallCollision || playspaceEdgeCollision) {
      sprite.addAction(
        new GridMoveAndCancel(
          deltaX,
          deltaY,
          skin.slowExecutionFactor,
          opts.backward
        )
      );
    } else {
      sprite.addAction(
        new GridMove(deltaX, deltaY, skin.slowExecutionFactor, opts.backward)
      );
    }

    Studio.yieldGridAlignedTicks();
  } else {
    if (!wallCollision) {
      if (playspaceEdgeCollision) {
        var boundary = Studio.getPlayspaceBoundaries(sprite);
        projectedX = Math.max(
          boundary.left,
          Math.min(boundary.right, projectedX)
        );
        projectedY = Math.max(
          boundary.top,
          Math.min(boundary.bottom, projectedY)
        );
      }
      sprite.x = projectedX;
      sprite.y = projectedY;
    }

    if (!Studio.isMovementAudioOn()) {
      Studio.movementAudioOn();
    }
  }

  Studio.lastMoveSingleDir = opts.dir;
};

Studio.moveDistance = function(opts) {
  if (!opts.started) {
    opts.started = true;
    if (skin.gridAlignedMovement) {
      opts.distance =
        Math.ceil(opts.distance / Studio.SQUARE_SIZE) * Studio.SQUARE_SIZE;
    }
    opts.queuedDistance = opts.distance;
  }

  return 0 === opts.queuedDistance;
};

Studio.onEvent = function(opts) {
  registerEventHandler(Studio.eventHandlers, opts.eventName, opts.func);
};

/**
 * Return true if all of the blocks underneath when_run blocks have had their
 * commands executed
 */
Studio.allWhenRunBlocksComplete = function() {
  for (var i = 0; i < Studio.eventHandlers.length; i++) {
    if (
      Studio.eventHandlers[i] &&
      Studio.eventHandlers[i].name === 'whenGameStarts' &&
      Studio.eventHandlers[i].cmdQueue.length !== 0
    ) {
      return false;
    }
  }
  return true;
};

Studio.timedOut = function() {
  if (level.timeoutAfterWhenRun) {
    if (level.editCode) {
      // If the interpreter has started handling events, the main body of the
      // program is complete:
      return Studio.JSInterpreter && Studio.JSInterpreter.startedHandlingEvents;
    } else if (
      Studio.eventHandlers.length === 0 ||
      (Studio.eventHandlers.length === 1 &&
        Studio.eventHandlers[0] &&
        Studio.eventHandlers[0].name === 'whenGameStarts' &&
        Studio.allWhenRunBlocksComplete())
    ) {
      // If the only event block that had children is when_run, and those commands
      // are finished executing, don't wait for the timeout.
      // If we have additional event blocks that DO have children, we don't timeout
      // until timeoutFailureTick
      return true;
    }
  }

  return Studio.tickCount > Studio.timeoutFailureTick;
};

/**
 * Tests whether the sprite is currently at the goal sprite.
 */
function spriteAtGoal(sprite, goal) {
  var goalWidth = utils.valueOr(skin.goalSpriteWidth, Studio.MARKER_WIDTH);
  var goalHeight = utils.valueOr(skin.goalSpriteHeight, Studio.MARKER_HEIGHT);

  var goalCollisionWidth = skin.goalCollisionRectWidth || Studio.MARKER_WIDTH;
  var goalCollisionHeight =
    skin.goalCollisionRectHeight || Studio.MARKER_HEIGHT;

  var spriteCollisionWidth = skin.itemCollisionRectWidth || sprite.width;
  var spriteCollisionHeight = skin.itemCollisionRectHeight || sprite.height;

  var xSpriteCenter = sprite.x + sprite.width / 2;
  var ySpriteCenter = sprite.y + sprite.height / 2;

  var xFinCenter =
    goal.x + goalWidth / 2 + utils.valueOr(skin.goalRenderOffsetX, 0);
  var yFinCenter =
    goal.y + goalHeight / 2 + utils.valueOr(skin.goalRenderOffsetY, 0);

  var distanceScaling = utils.valueOr(
    skin.finishCollideDistanceScaling,
    constants.FINISH_COLLIDE_DISTANCE_SCALING
  );

  Studio.drawDebugRect(
    'goalCollisionSprite',
    xSpriteCenter,
    ySpriteCenter,
    distanceScaling * spriteCollisionWidth,
    distanceScaling * spriteCollisionHeight
  );

  Studio.drawDebugRect(
    'goalCollisionGoal',
    xFinCenter,
    yFinCenter,
    distanceScaling * goalCollisionWidth,
    distanceScaling * goalCollisionHeight
  );

  var finishCollisionDistance = function(yAxis) {
    var dim1 = yAxis ? spriteCollisionHeight : spriteCollisionWidth;
    var dim2 = yAxis ? goalCollisionHeight : goalCollisionWidth;

    return (distanceScaling * (dim1 + dim2)) / 2;
  };

  return collisionTest(
    xSpriteCenter,
    xFinCenter,
    finishCollisionDistance(false),
    ySpriteCenter,
    yFinCenter,
    finishCollisionDistance(true)
  );
}

Studio.allGoalsVisited = function() {
  var playSound;
  // If protagonistSpriteIndex is set, the sprite with this index must navigate
  // to the goals.  Otherwise any sprite can navigate to each goal.
  var protagonistSprite = Studio.sprite[Studio.protagonistSpriteIndex];
  var finishedGoals = 0;

  // Can't visit all goals if we don't have any
  if (Studio.allGoals_().length === 0) {
    return false;
  }

  // Can't visit all the goals if the specified sprite doesn't exist
  if (Studio.protagonistSpriteIndex && !protagonistSprite) {
    return false;
  }

  Studio.allGoals_().forEach(function(goal) {
    if (!goal.finished) {
      if (protagonistSprite) {
        var wasGoalFinished = goal.finished;

        goal.finished = spriteAtGoal(protagonistSprite, goal);

        // If goal was just finished, then call the "when actor touches anything handler"
        if (!wasGoalFinished && goal.finished) {
          var allowQueueExtension = false;
          var prefix =
            'whenSpriteCollided-' + Studio.protagonistSpriteIndex + '-';
          callHandler(prefix + 'anything', allowQueueExtension);
          callHandler(prefix + 'goal', allowQueueExtension);
        }
      } else {
        goal.finished = false;
        for (var j = 0; j < Studio.sprite.length; j++) {
          if (
            Studio.sprite[j].visible &&
            spriteAtGoal(Studio.sprite[j], goal)
          ) {
            goal.finished = true;
            if (skin.fadeOutGoal) {
              goal.startFadeTime = new Date().getTime();
            }

            callHandler('whenTouchGoal');
            callHandler('whenSpriteCollided-' + j + '-goal');

            break;
          }
        }
      }
      playSound = goal.finished;
    }

    if (goal.finished) {
      finishedGoals++;

      // Play a sound unless we've hit the last flag (though that can be
      // overridden by the skin)
      if (
        playSound &&
        (finishedGoals !== Studio.spriteGoals_.length ||
          skin.playFinalGoalSound)
      ) {
        Studio.playSound({soundName: 'flag'});
      }

      if (skin.goalSuccess) {
        // Change the finish icon to goalSuccess.
        var successAsset = skin.goalSuccess;
        if (level.goalOverride && level.goalOverride.successImage) {
          successAsset = skin[level.goalOverride.successImage];
        }
        goal.marker.setAttributeNS(
          'http://www.w3.org/1999/xlink',
          'xlink:href',
          successAsset
        );
      }
    }
  });

  var retVal = finishedGoals === Studio.allGoals_().length;

  if (retVal && !Studio.touchAllGoalsEventFired) {
    Studio.touchAllGoalsEventFired = true;
    callHandler('whenTouchAllGoals');
  }

  return retVal;
};

/**
 * Returns true if the specified criteria, provided as an Object, is satisfied.
 */
Studio.conditionSatisfied = function(required) {
  var tracked = Studio.trackedBehavior;
  var valueNames = Object.keys(required);

  for (var k = 0; k < valueNames.length; k++) {
    var valueName = valueNames[k];
    var value = required[valueName];

    if (valueName === 'timedOut' && tracked.timedOut !== value) {
      return false;
    }

    if (
      valueName === 'collectedItemsAtOrAbove' &&
      tracked.removedItemCount < value
    ) {
      return false;
    }

    if (
      valueName === 'collectedItemsBelow' &&
      tracked.removedItemCount >= value
    ) {
      return false;
    }

    if (
      valueName === 'collectedSpecificItemsAtOrAbove' &&
      (tracked.removedItems[value.className] === undefined ||
        tracked.removedItems[value.className] < value.count)
    ) {
      return false;
    }

    if (
      valueName === 'collectedSpecificItemsBelow' &&
      tracked.removedItems[value.className] !== undefined &&
      tracked.removedItems[value.className] >= value.count
    ) {
      return false;
    }

    if (
      valueName === 'createdSpecificItemsAtOrAbove' &&
      (tracked.createdItems[value.className] === undefined ||
        tracked.createdItems[value.className] < value.count)
    ) {
      return false;
    }

    if (
      valueName === 'createdSpecificItemsBelow' &&
      tracked.createdItems[value.className] !== undefined &&
      tracked.createdItems[value.className] >= value.count
    ) {
      return false;
    }

    if (valueName === 'gotAllItems' && tracked.gotAllItems !== value) {
      return false;
    }

    if (
      valueName === 'touchedHazardsAtOrAbove' &&
      tracked.touchedHazardCount < value
    ) {
      return false;
    }

    if (valueName === 'currentPointsAtOrAbove' && Studio.playerScore < value) {
      return false;
    }

    if (valueName === 'currentPointsBelow' && Studio.playerScore >= value) {
      return false;
    }

    if (valueName === 'allGoalsVisited' && tracked.allGoalsVisited !== value) {
      return false;
    }

    if (valueName === 'setMap' && tracked.hasSetMap !== value) {
      return false;
    }

    if (valueName === 'setSprite' && tracked.hasSetSprite !== value) {
      return false;
    }

    if (valueName === 'setDroidSpeed' && tracked.hasSetDroidSpeed !== value) {
      return false;
    }

    if (
      valueName === 'throwProjectile' &&
      tracked.hasThrownProjectile !== value
    ) {
      return false;
    }

    if (valueName === 'setEmotion' && tracked.hasSetEmotion !== value) {
      return false;
    }
  }

  return true;
};

/**
 * @typedef {Object} ProgressConditionOutcome
 * @property {boolean} success
 * @property {string} message
 */

/**
 * A level can provide zero or more progress conditions which are special cases
 * that we test to see if the level has succeeded or failed.  This function
 * evaluates the state of these criteria.  It returns false if none of the
 * criteria affects progress, otherwise an object that contains information
 * about the specific succeeding or failing criteria.
 *
 * @param {Array} conditions.
 * @returns {ProgressConditionOutcome|null}
 */
Studio.checkProgressConditions = function() {
  if (!level.progressConditions) {
    return null;
  }

  for (var i = 0; i < level.progressConditions.length; i++) {
    var condition = level.progressConditions[i];

    if (Studio.conditionSatisfied(condition.required)) {
      return condition.result;
    }
  }

  return null;
};

var checkFinished = function() {
  var hasGoals = Studio.allGoals_().length !== 0;
  var achievedGoals = Studio.allGoalsVisited();
  var progressConditionResult = Studio.checkProgressConditions();
  var hasSuccessCondition =
    level.goal && level.goal.successCondition ? true : false;
  var achievedOptionalSuccessCondition =
    !hasSuccessCondition ||
    utils.valueOr(level.goal.successCondition(studioMsg), true);
  var achievedRequiredSuccessCondition =
    hasSuccessCondition &&
    utils.valueOr(level.goal.successCondition(studioMsg), false);

  if (progressConditionResult) {
    Studio.result = progressConditionResult.success
      ? ResultType.SUCCESS
      : ResultType.FAILURE;
    if (!progressConditionResult.success && progressConditionResult.canPass) {
      Studio.testResults = TestResults.APP_SPECIFIC_ACCEPTABLE_FAIL;
      Studio.progressConditionTestResult = true;
    }
    var progressMessage = progressConditionResult.message;
    if (studioApp().isUsingBlockly()) {
      progressMessage =
        progressConditionResult.blocklyMessage || progressMessage;
    }
    Studio.message = utils.valueOr(progressMessage, null);
    Studio.pauseInterpreter = utils.valueOr(
      progressConditionResult.pauseInterpreter,
      false
    );
    return true;
  }

  // Levels with goals (usually images that need to be touched) can have an optional success
  // condition that can explicitly return false to prevent the level from completing.
  // In very rare cases, a level might have goals but not care whether they're touched or not
  // to succeed, relying instead solely on the success function.  In such a case, the level should
  // have completeOnSuccessConditionNotGoals set to true.
  // In the remainder of levels which do not have goals, they simply require a success condition
  // that returns true.

  if (
    (hasGoals && achievedGoals && achievedOptionalSuccessCondition) ||
    (hasGoals &&
      level.completeOnSuccessConditionNotGoals &&
      achievedRequiredSuccessCondition) ||
    (!hasGoals && achievedRequiredSuccessCondition)
  ) {
    Studio.result = ResultType.SUCCESS;
    return true;
  }

  if (
    level.goal &&
    level.goal.failureCondition &&
    level.goal.failureCondition()
  ) {
    Studio.result = ResultType.FAILURE;
    return true;
  }

  // Don't process timedOut condition here if we have progressConditions to take care of
  // things, which can include a timedOut.  This avoids having this condition kick in earlier
  // than level.progressConditions can take care of a timedOut.
  if (!level.progressConditions) {
    if (Studio.timedOut()) {
      Studio.result = ResultType.FAILURE;
      return true;
    }
  }

  return false;
};

if (IN_UNIT_TEST) {
  module.exports.setLevel = newLevel => {
    level = newLevel;
  };
}
