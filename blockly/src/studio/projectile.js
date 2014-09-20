var Collidable = require('./collidable');
var Direction = require('./tiles').Direction;
var tiles = require('./tiles');

// uniqueId that increments by 1 each time an element is created
var uniqueId = 0;

// mapping of how much we should rotate based on direction
var DIR_TO_ROTATION = {};
DIR_TO_ROTATION[Direction.EAST] = 0;
DIR_TO_ROTATION[Direction.SOUTH] = 90;
DIR_TO_ROTATION[Direction.WEST] = 180;
DIR_TO_ROTATION[Direction.NORTH] = 270;

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


/**
 * A Projectile is a type of Collidable.
 * Note: x/y represent x/y of center in gridspace
 */
var Projectile = function (options) {
  // call collidable constructor
  Collidable.apply(this, arguments);

  this.height = options.height || 50;
  this.width = options.width || 50;
  this.speed = options.speed || tiles.DEFAULT_SPRITE_SPEED / 2;

  this.isFireball_ = this.className.indexOf('fireball') !== -1;
  this.frames = this.isFireball_ ? 8 : 1;

  this.currentFrame_ = 0;
  var self = this;
  this.animator_ = window.setInterval(function () {
    self.currentFrame_ = (self.currentFrame_ + 1) % self.frames;
  }, 50);

  // origin is at an offset from sprite location
  this.x = options.spriteX + OFFSET_CENTER[options.dir].x +
            (options.spriteWidth * OFFSET_FROM_SPRITE[options.dir].x);
  this.y = options.spriteY + OFFSET_CENTER[options.dir].y +
            (options.spriteHeight * OFFSET_FROM_SPRITE[options.dir].y);
};

// inherit from Collidable
Projectile.prototype = new Collidable();

module.exports = Projectile;

/**
 * Create an image element with a clip path
 */
Projectile.prototype.createElement = function (parentElement) {
  // create our clipping path/rect
  this.clipPath = document.createElementNS(Blockly.SVG_NS, 'clipPath');
  var clipId = 'projectile_clippath_' + (uniqueId++);
  this.clipPath.setAttribute('id', clipId);
  var rect = document.createElementNS(Blockly.SVG_NS, 'rect');
  rect.setAttribute('width', this.width);
  rect.setAttribute('height', this.height);
  this.clipPath.appendChild(rect);

  parentElement.appendChild(this.clipPath);

  this.element = document.createElementNS(Blockly.SVG_NS, 'image');
  this.element.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
    this.image);
  this.element.setAttribute('height', this.height);
  this.element.setAttribute('width', this.width * this.frames);
  parentElement.appendChild(this.element);

  this.element.setAttribute('clip-path', 'url(#' + clipId + ')');
};

/**
 * Remove our element/clipPath/animator
 */
Projectile.prototype.removeElement = function () {
  if (this.element) {
    this.element.parentNode.removeChild(this.element);
    this.element = null;
  }

  // remove clip path element
  if (this.clipPath) {
    this.clipPath.parentNode.removeChild(this.clipPath);
    this.clipPath = null;
  }

  if (this.animator_) {
    window.clearInterval(this.animator_);
    this.animator_ = null;
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

  this.element.setAttribute('x', topLeft.x - this.width * this.currentFrame_);
  this.element.setAttribute('y', topLeft.y);

  var clipRect = this.clipPath.childNodes[0];
  clipRect.setAttribute('x', topLeft.x);
  clipRect.setAttribute('y', topLeft.y);

  if (this.isFireball_) {
    this.element.setAttribute('transform', 'rotate(' + DIR_TO_ROTATION[this.dir] +
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
