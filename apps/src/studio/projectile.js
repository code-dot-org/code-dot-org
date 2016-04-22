var Collidable = require('./collidable');
var Direction = require('./constants').Direction;
var constants = require('./constants');
var utils = require('../utils'); // Provides Function.prototype.inherits
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

// Origin of projectile relative to sprite, based on direction
// (a scale factor to be multiplied by sprite width and height)
// fromSprite coords are left, top
var OFFSET_FROM_SPRITE = {};
OFFSET_FROM_SPRITE[Direction.NORTH] = {
  x: 0.5,
  y: 0
};
OFFSET_FROM_SPRITE[Direction.EAST] = {
  x: 1,
  y: 0.5
};
OFFSET_FROM_SPRITE[Direction.SOUTH] = {
  x: 0.5,
  y: 1
};
OFFSET_FROM_SPRITE[Direction.WEST] = {
  x: 0,
  y: 0.5
};
OFFSET_FROM_SPRITE[Direction.NORTHEAST] = {
  x: 1,
  y: 0
};
OFFSET_FROM_SPRITE[Direction.SOUTHEAST] = {
  x: 1,
  y: 1
};
OFFSET_FROM_SPRITE[Direction.SOUTHWEST] = {
  x: 0,
  y: 1
};
OFFSET_FROM_SPRITE[Direction.NORTHWEST] = {
  x: 0,
  y: 0
};

// Origin of projectile, based on direction
// assumes projectile is always 50x50 in size
// projectile coords are center, center
var OFFSET_CENTER = {};
OFFSET_CENTER[Direction.NORTH] = {
  x: 0,
  y: -25
};
OFFSET_CENTER[Direction.EAST] = {
  x: 25,
  y: 0
};
OFFSET_CENTER[Direction.SOUTH] = {
  x: 0,
  y: 25
};
OFFSET_CENTER[Direction.WEST] = {
  x: -25,
  y: 0
};
OFFSET_CENTER[Direction.NORTHEAST] = {
  x: 25,
  y: -25
};
OFFSET_CENTER[Direction.SOUTHEAST] = {
  x: 25,
  y: 25
};
OFFSET_CENTER[Direction.SOUTHWEST] = {
  x: -25,
  y: 25
};
OFFSET_CENTER[Direction.NORTHWEST] = {
  x: -25,
  y: -25
};


/**
 * A Projectile is a type of Collidable.
 * Note: x/y represent x/y of center in gridspace
 * @extends {Collidable}
 */
var Projectile = function (options) {
  // call collidable constructor
  Collidable.apply(this, arguments);

  this.height = options.height || 50;
  this.width = options.width || 50;
  this.speed = options.speed || constants.DEFAULT_PROJECTILE_SPEED;

  // origin is at an offset from sprite location
  this.x = options.spriteX + OFFSET_CENTER[options.dir].x +
            (options.spriteWidth * OFFSET_FROM_SPRITE[options.dir].x);
  this.y = options.spriteY + OFFSET_CENTER[options.dir].y +
            (options.spriteHeight * OFFSET_FROM_SPRITE[options.dir].y);

  /** @private {StudioSpriteSheet} */
  this.spriteSheet_ = new StudioSpriteSheet({
    frameWidth: options.spriteWidth,
    frameHeight: options.spriteHeight,
    defaultFramesPerAnimation: options.frames,
    assetPath: options.image,
    horizontalAnimation: true,
    totalAnimations: 1
  });

  /** @private {StudioAnimation} */
  this.animation_ = new StudioAnimation($.extend({}, options, {
    spriteSheet: this.spriteSheet_,
    animationFrameDuration: this.getAnimationFrameDuration()
  }));
};
Projectile.inherits(Collidable);
module.exports = Projectile;

/** @returns {SVGImageElement} */
Projectile.prototype.getElement = function () {
  return this.animation_.getElement();
};

/**
 * Create an image element with a clip path
 */
Projectile.prototype.createElement = function (parentElement) {
  this.animation_.createElement(parentElement);
};

/**
 * Retrieve animation speed (frames per tick)
 */
Projectile.prototype.getAnimationFrameDuration = function () {
  return constants.DEFAULT_PROJECTILE_ANIMATION_FRAME_DURATION *
      constants.DEFAULT_PROJECTILE_SPEED / this.speed;
};

/**
 * Remove our element/clipPath/animator
 */
Projectile.prototype.removeElement = function () {
  this.animation_.removeElement();
};

/**
 * Flip the direction of the projectile
 */
Projectile.prototype.bounce = function () {
  switch (this.dir) {
    case Direction.NORTH:
      this.dir = Direction.SOUTH;
      break;
    case Direction.WEST:
      this.dir = Direction.EAST;
      break;
    case Direction.SOUTH:
      this.dir = Direction.NORTH;
      break;
    case Direction.EAST:
      this.dir = Direction.WEST;
      break;
    case Direction.NORTHEAST:
      this.dir = Direction.SOUTHWEST;
      break;
    case Direction.SOUTHEAST:
      this.dir = Direction.NORTHWEST;
      break;
    case Direction.SOUTHWEST:
      this.dir = Direction.NORTHEAST;
      break;
    case Direction.NORTHWEST:
      this.dir = Direction.SOUTHEAST;
      break;
  }
};

/**
 * Display our projectile at it's current location, rotating as necessary
 */
Projectile.prototype.display = function () {
  var topLeft = {
    x: this.x - this.width / 2,
    y: this.y - this.height / 2
  };

  this.animation_.redrawCenteredAt({
        x: this.x,
        y: this.y
      },
      Studio.tickCount);

  if (this.spriteSheet_.defaultFramesPerAnimation > 1) {
    this.getElement().setAttribute('transform', 'rotate(' + DIR_TO_ROTATION[this.dir] +
     ', ' + this.x + ', ' + this.y + ')');
  }
};

Projectile.prototype.getNextPosition = function () {
  var unit = Direction.getUnitVector(this.dir);
  return {
    x: this.x + this.speed * unit.x,
    y: this.y + this.speed * unit.y
  };
};

Projectile.prototype.moveToNextPosition = function () {
  var next = this.getNextPosition();
  this.x = next.x;
  this.y = next.y;
};

/**
 * Change visible opacity of this projectile.
 * @param {number} newOpacity (between 0 and 1)
 * @override
 */
Projectile.prototype.setOpacity = function (newOpacity) {
  this.animation_.setOpacity(newOpacity);
};
