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
  this.cached_ = {};

  this.playerSpriteIndex = 0;
  this.targetSpriteIndex = 1;
  this.dangerSpriteIndex = 2;
};

BigGameLogic.prototype.onTick = function () {
  if (this.studio_.tickCount === 1) {
    this.onFirstTick_();
    this.studio_.playerScore = 100;
    return;
  }

   // Don't start until the title is over
  var titleScreenTitle = document.getElementById('titleScreenTitle');
  if (titleScreenTitle.getAttribute('visibility') === "visible") {
    return;
  }
      
  var playerSprite = this.studio_.sprite[this.playerSpriteIndex];
  var targetSprite = this.studio_.sprite[this.targetSpriteIndex];
  var dangerSprite = this.studio_.sprite[this.dangerSpriteIndex];

  // Update target, using onscreen and update_target
  this.updateSpriteX_(this.targetSpriteIndex, this.update_target.bind(this));
  // Update danger, using onscreen and update_danger
  this.updateSpriteX_(this.dangerSpriteIndex, this.update_danger.bind(this));

  // For every key and button down, call update_player
  for (var key in this.studio_.keyState) {
    if (this.studio_.keyState[key] === 'keydown') {
      this.handleUpdatePlayer_(key);
    }
  }

  for (var btn in this.studio_.btnState) {
    if (this.studio_.btnState[btn]) {
      if (btn === 'leftButton') {
        this.handleUpdatePlayer_(37);
      } else if (btn === 'upButton') {
        this.handleUpdatePlayer_(38);
      } else if (btn === 'rightButton') {
        this.handleUpdatePlayer_(39);
      } else if (btn === 'downButton') {
        this.handleUpdatePlayer_(40);
      }
    }
  }
  
  if (playerSprite.visible && dangerSprite.visible &&
      this.collide(playerSprite.x, playerSprite.y,
                   dangerSprite.x, dangerSprite.y)) {
    this.studio_.vanishActor({spriteIndex:this.playerSpriteIndex});
    setTimeout((function ()  {
      this.studio_.setSprite({
        spriteIndex: this.playerSpriteIndex,
        value:"visible"
      });
    }).bind(this), 500);
    this.studio_.playerScore -= 20;

    // send sprite back offscreen
    this.resetSprite_(dangerSprite);
  }

  if (playerSprite.visible && targetSprite.visible &&
      this.collide(playerSprite.x, playerSprite.y,
                   targetSprite.x, targetSprite.y)) {
    this.studio_.playerScore += 10;

    // send sprite back offscreen
    this.resetSprite_(targetSprite);
}
  
  if (this.studio_.playerScore <= 0) {
    var score = document.getElementById('score');
    score.setAttribute('visibility', 'hidden');
    this.studio_.showTitleScreen({title:'Game Over', text:'Click Reset to Play Again'});
    for (var i = 0; i < this.studio_.spriteCount; i++) {
      this.studio_.vanishActor({spriteIndex:i});
    }
  } else {
    this.studio_.displayScore();
  }
};

/**
 * When game starts logic
 */
BigGameLogic.prototype.onFirstTick_ = function () {
  var func = function (StudioApp, Studio, Globals) {
    Studio.setBackground(null, this.getVar_('background'));
    Studio.setSpritePosition(null, this.playerSpriteIndex, Position.MIDDLECENTER);
    Studio.setSprite(null, this.playerSpriteIndex, this.getVar_('player'));
    Studio.setSpritePosition(null, this.targetSpriteIndex, Position.TOPLEFT);
    Studio.setSprite(null, this.targetSpriteIndex, this.getVar_('target'));
    Studio.setSpritePosition(null, this.dangerSpriteIndex, Position.BOTTOMRIGHT);
    Studio.setSprite(null, this.dangerSpriteIndex, this.getVar_('danger'));
    Studio.showTitleScreen(null, this.getVar_('title'), this.getVar_('subtitle'));
  }.bind(this);
  this.studio_.callApiCode('BigGame.onFirstTick', func);
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
    this.resetSprite_(sprite);
  }
};

/**
 * Update the player sprite, using the user provided function.
 */
BigGameLogic.prototype.handleUpdatePlayer_ = function (key) {
  var playerSprite = this.studio_.sprite[this.playerSpriteIndex];

  // invert Y
  var userSpaceY = this.studio_.MAZE_HEIGHT - playerSprite.y;

  var newUserSpaceY = this.update_player(key, userSpaceY);

  // reinvertY
  playerSprite.y = this.studio_.MAZE_HEIGHT - newUserSpaceY;
};

BigGameLogic.prototype.cacheBlock = function (key, block) {
  this.cached_[key] = block;
};

/**
 * Reset sprite to the opposite side of the screen
 */
BigGameLogic.prototype.resetSprite_ = function (sprite) {
  if (sprite.dir === Direction.EAST) {
    sprite.x = 0 - sprite.width;
  } else {
    sprite.x = this.studio_.MAZE_WIDTH;
  }
  sprite.y = Math.floor(Math.random() * (this.studio_.MAZE_HEIGHT - sprite.height));
};

/**
 * Takes a cached block for a function of variable, and calculates the value
 * @returns The result of calling the code for the cached block. If the cached
 *   block was a function_pass, this means we get back a function that can
 *   now be called.
 */
BigGameLogic.prototype.resolveCachedBlock_ = function (key) {
  var result = '';
  var block = this.cached_[key];
  if (!block) {
    return result;
  }

  var code = 'return ' + Blockly.JavaScript.blockToCode(block);
  result = codegen.evalWith(code, {
    Studio: api,
    Globals: Studio.Globals
  });
  return result;
};

/**
 * getVar/getFunc just call resolveCachedBlock_, but are provided for clarity
 */
BigGameLogic.prototype.getVar_ = function (key) {
  return this.resolveCachedBlock_(key);
};

BigGameLogic.prototype.getFunc_ = function (key) {
  return this.resolveCachedBlock_(key);
};

/**
 * Calls the user provided update_target function, or no-op if none was provided.
 * @param {number} x Current x location of target
 * @returns {number} New x location of target
 */
BigGameLogic.prototype.update_target = function (x) {
  return this.getFunc_('update-target')(x);
};

/**
 * Calls the user provided update_danger function, or no-op if none was provided.
 * @param {number} x Current x location of the danger sprite
 * @returns {number} New x location of the danger target
 */
BigGameLogic.prototype.update_danger = function (x) {
  return this.getFunc_('update-danger')(x);
};

/**
 * Calls the user provided update_player function, or no-op if none was provided.
 * @param {number} key KeyCode of key that is down
 * @param {number} y Current y location of player. (is this in an inverted coordinate space?)
 * @returns {number} New y location of the player
 */
BigGameLogic.prototype.update_player = function (key, y) {
  return this.getFunc_('update-player')(key, y);
};

/**
 * Calls the user provided onscreen? function, or no-op if none was provided.
 * @param {number} x An x location
 * @returns {boolean} True if x location is onscreen?
 */
BigGameLogic.prototype.onscreen = function (x) {
  return this.getFunc_('on-screen?')(x);
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
  return this.getFunc_('collide?')(px, py, cx, cy);
};


module.exports = BigGameLogic;
