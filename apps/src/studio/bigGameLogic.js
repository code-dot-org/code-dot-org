var studioConstants = require('./constants');
var Direction = studioConstants.Direction;
var Position = studioConstants.Position;
var codegen = require('../codegen');
var api = require('./api');

/**
 * Interface for a set of custom game logic for playlab
 * @param {Studio} studio Reference to global studio object
 * @interface CustomGameLogic
 */
function CustomGameLogic(studio) {}

/**
 * Logic to be run once per playlab tick
 *
 * @function
 * @name CustomGameLogic#onTick
 */

/**
 * Custom logic for the MSM BigGame
 * @constructor
 * @implements CustomGameLogic
 */
var BigGameLogic = function (studio) {
  this.studio_ = studio;
  this.functionNames = {};
  this.cached_ = {};

  this.playerSpriteIndex = 0;
  this.targetSpriteIndex = 1;
  this.dangerSpriteIndex = 2;
};

BigGameLogic.prototype.onTick = function () {
  if (this.studio_.tickCount === 1) {
    this.onFirstTick_();
    return;
  }

   // Don't start until the title is over
  var titleScreenTitle = document.getElementById('titleScreenTitle');
  if (titleScreenTitle.getAttribute('visibility') === "visible") {
    return;
  }

  // Update target, using onscreen and update_target
  this.updateSpriteX_(this.targetSpriteIndex, this.update_target.bind(this));
  // Update danger, using onscreen and update_danger
  this.updateSpriteX_(this.dangerSpriteIndex, this.update_danger.bind(this));

  // For every key and button down, call update_player
  for (var key in this.studio_.keyState) {
    if (this.studio_.keyState[key] === 'keydown') {
      this.updatePlayer_(key);
    }
  }

  for (var btn in this.studio_.btnState) {
    if (this.studio_.btnState[btn]) {
      if (btn === 'leftButton') {
        this.updatePlayer_(37);
      } else if (btn === 'upButton') {
        this.updatePlayer_(38);
      } else if (btn === 'rightButton') {
        this.updatePlayer_(39);
      } else if (btn === 'downButton') {
        this.updatePlayer_(40);
      }
    }
  }
};

BigGameLogic.prototype.onFirstTick_ = function () {
  // create a queue, add a bunch of commands to it by calling the api methods,
  // then execute the queue.
  this.studio_.currentCmdQueue = [];
  api.setBackground(null, this.resolveVariable('background'));
  api.setSpritePosition(null, this.playerSpriteIndex, Position.MIDDLECENTER);
  api.setSprite(null, this.playerSpriteIndex, this.resolveVariable('player'));
  api.setSpritePosition(null, this.targetSpriteIndex, Position.TOPLEFT);
  api.setSprite(null, this.targetSpriteIndex, this.resolveVariable('target'));
  api.setSpritePosition(null, this.dangerSpriteIndex, Position.BOTTOMRIGHT);
  api.setSprite(null, this.dangerSpriteIndex, this.resolveVariable('danger'));
  api.showTitleScreen(null, this.resolveVariable('title'), this.resolveVariable('subtitle'));

  this.studio_.currentCmdQueue.forEach(function (cmd) {
    this.studio_.callCmd(cmd);
  }, this);
  this.studio_.currentCmdQueue = null;
};

/**
 * Update a sprite's x coordinates using the user updateFunction. If
 * sprite goes of screen, we reset to the other side of the screen.
 */
BigGameLogic.prototype.updateSpriteX_ = function (spriteIndex, updateFunction) {
  var sprite = this.studio_.sprite[spriteIndex];
  // sprite.x is the left. get the center
  var centerX = sprite.x + sprite.width / 2;

  var newCenterX = updateFunction(centerX);
  sprite.x = newCenterX - sprite.width / 2;

  // Current behavior is that as soon as we go offscreen, we reset to the other
  // side. We could add a delay if we want.
  if (!this.onscreen(newCenterX)) {
    // reset to other side
    if (sprite.dir === Direction.EAST) {
      sprite.x = 0 - sprite.width;
    } else {
      sprite.x = this.studio_.MAZE_WIDTH;
    }
    sprite.y = Math.floor(Math.random() * (this.studio_.MAZE_HEIGHT - sprite.height));
  }
};

/**
 * Update the player sprite, using the user provided function.
 */
BigGameLogic.prototype.updatePlayer_ = function (key) {
  var playerSprite = this.studio_.sprite[this.playerSpriteIndex];

  // invert Y
  var userSpaceY = this.studio_.MAZE_HEIGHT - playerSprite.y;

  var newUserSpaceY = this.update_player(key, userSpaceY);

  // reinvertY
  playerSprite.y = this.studio_.MAZE_HEIGHT - newUserSpaceY;
};

/**
 * Calls the user provided update_target function, or no-op if none was provided.
 * @param {number} x Current x location of target
 * @returns {number} New x location of target
 */
BigGameLogic.prototype.update_target = function (x) {
  return this.getPassedFunction_('update-target')(x);
};

/**
 * Calls the user provided update_danger function, or no-op if none was provided.
 * @param {number} x Current x location of the danger sprite
 * @returns {number} New x location of the danger target
 */
BigGameLogic.prototype.update_danger = function (x) {
  return this.getPassedFunction_('update-danger')(x);
};

/**
 * Calls the user provided update_player function, or no-op if none was provided.
 * @param {number} key KeyCode of key that is down
 * @param {number} y Current y location of player. (is this in an inverted coordinate space?)
 * @returns {number} New y location of the player
 */
BigGameLogic.prototype.update_player = function (key, y) {
  return this.getPassedFunction_('update-player')(key, y);
};

/**
 * Calls the user provided onscreen? function, or no-op if none was provided.
 * @param {number} x An x location
 * @returns {boolean} True if x location is onscreen?
 */
BigGameLogic.prototype.onscreen = function (x) {
  return this.getPassedFunction_('on-screen?')(x);
};

/**
 * Calls the user provided collide? function, or no-op if none was provided.
 * @param {number} px Player's x location
 * @param {number} py Player's y location
 * @param {number} cx Collider's x location
 * @param {number} cy Collider's y location
 * @returns {boolean} True if objects collide
 */
BigGameLogic.prototype.collide = function (px, py, cx, cy) {
  return this.getPassedFunction_('collide?')(px, py, cx, cy);
};

/**
 * @returns the user function that was passed in
 */
BigGameLogic.prototype.getPassedFunction_ = function (name) {
  var userFunctionName = this.functionNames[name];
  if (!userFunctionName) {
    return function () {}; // noop
  }

  var userFunction = this.studio_.Globals[userFunctionName];
  if (!userFunction) {
    throw new Error('Unexepcted');
  }

  return userFunction;
};

BigGameLogic.prototype.cacheBlock = function (key, block) {
  this.cached_[key] = block;
};

BigGameLogic.prototype.resolveVariable = function (key) {
  var result = '';
  var block = this.cached_[key];
  if (block) {
    var code = 'return ' + Blockly.JavaScript.blockToCode(block);

    result = codegen.evalWith(code, {
      Studio: api,
      Globals: Studio.Globals
    });
  }
  return result;
};

module.exports = BigGameLogic;
