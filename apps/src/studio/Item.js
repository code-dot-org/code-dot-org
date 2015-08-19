var Collidable = require('./collidable');
var Direction = require('./constants').Direction;
var constants = require('./constants');

var SVG_NS = "http://www.w3.org/2000/svg";

// uniqueId that increments by 1 each time an element is created
var uniqueId = 0;

/**
 * An Item is a type of Collidable.
 * Note: x/y represent x/y of center in gridspace
 */
var Item = function (options) {
  // call collidable constructor
  Collidable.apply(this, arguments);

  this.height = options.height || 50;
  this.width = options.width || 50;
  this.speed = options.speed || constants.DEFAULT_SPRITE_SPEED / 2;
  this.animationFrames = options.animationFrames || 1;

  this.currentFrame_ = 0;
  this.animator_ = window.setInterval(function () {
    if (this.dir === Direction.NONE) {
      return;
    }
    if (this.loop || this.currentFrame_ + 1 < this.frames) {
      this.currentFrame_ = (this.currentFrame_ + 1) % this.frames;
    }
  }.bind(this), 50);
};

// inherit from Collidable
Item.prototype = new Collidable();

module.exports = Item;

/**
 * Returns the frame of the spritesheet for the current walking direction.
 */
Item.prototype.getDirectionFrame = function() {
  return constants.frameDirTableWalking[this.dir];
};

/**
 * Test only function so that we can start our id count over.
 */
Item.__resetIds = function () {
  uniqueId = 0;
};

/**
 * Create an image element with a clip path
 */
Item.prototype.createElement = function (parentElement) {
  var nextId = (uniqueId++);

  // create our clipping path/rect
  this.clipPath = document.createElementNS(SVG_NS, 'clipPath');
  var clipId = 'item_clippath_' + nextId;
  this.clipPath.setAttribute('id', clipId);
  var rect = document.createElementNS(SVG_NS, 'rect');
  rect.setAttribute('width', this.width);
  rect.setAttribute('height', this.height);
  this.clipPath.appendChild(rect);

  parentElement.appendChild(this.clipPath);
  var itemId = 'item_' + nextId;
  this.element = document.createElementNS(SVG_NS, 'image');
  this.element.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
    this.image);
  this.element.setAttribute('id', itemId);
  this.element.setAttribute('height', this.height * this.animationFrames);
  this.element.setAttribute('width', this.width * this.frames);
  parentElement.appendChild(this.element);

  this.element.setAttribute('clip-path', 'url(#' + clipId + ')');
};

/**
 * Remove our element/clipPath/animator
 */
Item.prototype.removeElement = function () {
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
 * Display our item at its current location
 */
Item.prototype.display = function () {
  var topLeft = {
    x: this.x - this.width / 2,
    y: this.y - this.height / 2
  };

  var directionFrame = this.getDirectionFrame();

  this.element.setAttribute('x', topLeft.x - this.width * directionFrame);
  this.element.setAttribute('y', topLeft.y - this.height * this.currentFrame_);

  var clipRect = this.clipPath.childNodes[0];
  clipRect.setAttribute('x', topLeft.x);
  clipRect.setAttribute('y', topLeft.y);
};

Item.prototype.getNextPosition = function () {
  var unit = Direction.getUnitVector(this.dir);
  return {
    x: this.x + this.speed * unit.x,
    y: this.y + this.speed * unit.y
  };
};

Item.prototype.moveToNextPosition = function () {
  var next = this.getNextPosition();
  this.x = next.x;
  this.y = next.y;
};
