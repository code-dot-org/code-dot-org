var Collidable = require('./collidable');
var Direction = require('./constants').Direction;
var constants = require('./constants');
var utils = require('../utils');
var StudioAnimation = require('./StudioAnimation');
var StudioSpriteSheet = require('./StudioSpriteSheet');

// mapping of how much we should rotate based on direction
var DIR_TO_ROTATION = {};
DIR_TO_ROTATION[Direction.EAST] = 0;
DIR_TO_ROTATION[Direction.SOUTH] = 90;
DIR_TO_ROTATION[Direction.WEST] = 180;
DIR_TO_ROTATION[Direction.NORTH] = 270;
DIR_TO_ROTATION[Direction.NORTHEAST] = 45;
DIR_TO_ROTATION[Direction.SOUTHEAST] = 135;
DIR_TO_ROTATION[Direction.SOUTHWEST] = 225;
DIR_TO_ROTATION[Direction.NORTHWEST] = 315;

/**
 * An Actor is a type of Collidable.
 * Note: x/y represent x/y of center in gridspace
 * @extends {Collidable}
 */
var Actor = function (options) {
  // call collidable constructor
  Collidable.apply(this, arguments);

  this.height = options.height || 100;
  this.width = options.width || 100;
  this.speed = options.speed || constants.DEFAULT_SPRITE_SPEED / 2;

  /** @private {StudioSpriteSheet} */
  this.spriteSheet_ = new StudioSpriteSheet($.extend({}, options, {
    width: options.spriteWidth,
    height: options.spriteHeight,
    horizontalAnimation: true,
    totalAnimations: 1
  }));

  /** @private {StudioAnimation} */
  this.animation_ = new StudioAnimation($.extend({}, options, {
    spriteSheet: this.spriteSheet_
  }));
};
Actor.inherits(Collidable);
module.exports = Actor;

/** @returns {SVGImageElement} */
Actor.prototype.getElement = function () {
  return this.animation_.getElement();
};

/**
 * Create an image element with a clip path
 */
Actor.prototype.createElement = function (parentElement) {
  this.animation_.createElement(parentElement);
};

/**
 * Remove our element/clipPath/animator
 */
Actor.prototype.removeElement = function () {
  this.animation_.removeElement();
};

/**
 * Display our actor at it's current location, rotating as necessary
 */
Actor.prototype.display = function () {
  var topLeft = {
    x: this.x - this.width / 2,
    y: this.y - this.height / 2
  };

  this.animation_.redrawCenteredAt({
    x: this.x,
    y: this.y
  });

  if (this.spriteSheet_.framesPerAnimation > 1) {
    this.getElement().setAttribute('transform', 'rotate(' + DIR_TO_ROTATION[this.dir] +
     ', ' + this.x + ', ' + this.y + ')');
  }
};

Actor.prototype.getNextPosition = function () {
  var unit = Direction.getUnitVector(this.dir);
  return {
    x: this.x + this.speed * unit.x,
    y: this.y + this.speed * unit.y
  };
};

Actor.prototype.moveToNextPosition = function () {
  var next = this.getNextPosition();
  this.x = next.x;
  this.y = next.y;
};

/**
 * Change visible opacity of this actor.
 * @param {number} newOpacity (between 0 and 1)
 * @override
 */
Actor.prototype.setOpacity = function (newOpacity) {
  this.animation_.setOpacity(newOpacity);
};
