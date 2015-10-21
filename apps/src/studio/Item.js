var Collidable = require('./collidable');
var constants = require('./constants');
var Direction = constants.Direction;
var NextTurn = constants.NextTurn;
var utils = require('../utils');
var _ = utils.getLodash();

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

  /**
   * Rendering offset for item animation vs display position - applied as
   * late as possible.
   * @type {{x: number, y: number}}
   */
  this.renderOffset = options.renderOffset || { x: 0, y: 0 };

  this.speed = options.speed || constants.DEFAULT_ITEM_SPEED;
  this.renderScale = options.renderScale || 1;
  this.displayDir = Direction.SOUTH;
  this.startFadeTime = null;
  this.fadeTime = constants.ITEM_FADE_TIME;

  this.currentFrame_ = 0;
  this.animator_ = window.setInterval(function () {
    if (this.loop || this.currentFrame_ + 1 < this.frames) {
      this.currentFrame_ = (this.currentFrame_ + 1) % this.frames;
    }
  }.bind(this), 50);
};
Item.inherits(Collidable);
module.exports = Item;

/**
 * Returns the frame of the spritesheet for the current walking direction.
 */
Item.prototype.getDirectionFrame = function() {

  // Every other frame, if we aren't yet rendering in the correct direction,
  // assign a new displayDir from state table; only one turn at a time.

  if (this.dir !== this.displayDir && this.displayDir !== undefined) {
    if (Studio.tickCount && (0 === Studio.tickCount % 2)) {
      this.displayDir = NextTurn[this.displayDir][this.dir];
    }
  }

  return constants.frameDirTableWalkingWithIdle[this.displayDir];
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

  var numFacingAngles = 9;

  // create our clipping path/rect
  this.clipPath = document.createElementNS(SVG_NS, 'clipPath');
  var clipId = 'item_clippath_' + nextId;
  this.clipPath.setAttribute('id', clipId);
  var rect = document.createElementNS(SVG_NS, 'rect');
  rect.setAttribute('width', this.width * this.renderScale);
  rect.setAttribute('height', this.height * this.renderScale);
  this.clipPath.appendChild(rect);

  parentElement.appendChild(this.clipPath);
  var itemId = 'item_' + nextId;
  this.element = document.createElementNS(SVG_NS, 'image');
  this.element.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
    this.image);
  this.element.setAttribute('id', itemId);
  this.element.setAttribute('height', this.height * this.frames * this.renderScale);
  this.element.setAttribute('width', this.width * numFacingAngles * this.renderScale);
  parentElement.appendChild(this.element);

  this.element.setAttribute('clip-path', 'url(#' + clipId + ')');
};


/**
 * This function should be called every frame, and moves the item around.
 * It moves the item smoothly, but between fixed points on the grid.
 * Each time the item reaches its destination fixed point, it reevaluates
 * its next destination location based on the type of movement specified.
 * It generally evalutes all possible destination locations, prioritizes
 * the best possible moves, and chooses randomly between evenly-scored
 * options.
 */
Item.prototype.update = function () {
  
  // Do we have an active location in grid coords?  If not, determine it.
  if (this.gridX === undefined) {
    this.gridX = Math.floor(this.x / Studio.SQUARE_SIZE);
    this.gridY = Math.floor(this.y / Studio.SQUARE_SIZE);
  }

  // Have we reached the destination grid position?
  // If not, we're still sliding towards it.
  var reachedDestinationGridPosition = false;

  // Draw the item's current location.
  Studio.drawDebugRect("itemCenter", this.x, this.y, 3, 3);

  if (this.destGridX !== undefined) {
    // Draw the item's destination grid square.
    Studio.drawDebugRect(
      "roamGridDest", 
      this.destGridX * Studio.SQUARE_SIZE + Studio.HALF_SQUARE, 
      this.destGridY * Studio.SQUARE_SIZE + Studio.HALF_SQUARE, 
      Studio.SQUARE_SIZE, 
      Studio.SQUARE_SIZE);
  }

  // Has the item reached its destination grid position?
  // (There is a small margin of error to allow for per-update movements greater
  // than a single pixel.)
  var speed = utils.valueOr(this.speed, 0);
  if (this.destGridX !== undefined &&
      (Math.abs(this.x - (this.destGridX * Studio.SQUARE_SIZE + Studio.HALF_SQUARE)) <= speed &&
       Math.abs(this.y - (this.destGridY * Studio.SQUARE_SIZE + Studio.HALF_SQUARE)) <= speed)) {
    this.gridX = this.destGridX;
    this.gridY = this.destGridY;
    reachedDestinationGridPosition = true;
  }

  // Are we missing a destination location in grid coords?
  // Or have we already reached our prior destination location in grid coords?
  // If not, determine it.
  if (this.destGridX === undefined || reachedDestinationGridPosition) {

    if (this.activity === 'none') {
      this.dir = Direction.NONE;
      this.destGridX = undefined;
      this.destGridY = undefined;
      return;
    }

    var sprite = Studio.sprite[0];

    var spriteX = sprite.x + sprite.width/2;
    var spriteY = sprite.y + sprite.height/2;

    // let's try scoring each square
    var candidates = [];

    var bufferDistance = 60;

    // The item can just go up/down/left/right.. no diagonals.
    var candidateGridLocations = [ 
      {row: -1, col: 0}, 
      {row: +1, col: 0},
      {row: 0, col: -1}, 
      {row: 0, col: +1}];

    for (var candidateIndex = 0; candidateIndex < candidateGridLocations.length; candidateIndex++) {
      var candidateX = this.gridX + candidateGridLocations[candidateIndex].col;
      var candidateY = this.gridY + candidateGridLocations[candidateIndex].row;

      candidate = {gridX: candidateX, gridY: candidateY};
      candidate.score = 0;

      if (this.activity === "roam") {
        candidate.score ++;
      } else if (this.activity === "chase") {
        if (candidateY == this.gridY - 1 && spriteY < this.y - bufferDistance) {
          candidate.score += 2;
        } else if (candidateY == this.gridY + 1 && spriteY > this.y + bufferDistance) {
          candidate.score += 2;
        }
        else {
          candidate.score += 1;
        }

        if (candidateX == this.gridX - 1 && spriteX < this.x - bufferDistance) {
          candidate.score ++;
        } else if (candidateX == this.gridX + 1 && spriteX > this.x + bufferDistance) {
          candidate.score ++;
        }
      } else if (this.activity === "flee") {
        candidate.score = 1;
        if (candidateY == this.gridY - 1 && spriteY > this.y - bufferDistance) {
          candidate.score ++;
        } else if (candidateY == this.gridY + 1 && spriteY < this.y + bufferDistance) {
          candidate.score ++;
        }

        if (candidateX == this.gridX - 1 && spriteX > this.x - bufferDistance) {
          candidate.score ++;
        } else if (candidateX == this.gridX + 1 && spriteX < this.x + bufferDistance) {
          candidate.score ++;
        }
      }

      if (candidate.score > 0) {
        Studio.drawDebugRect(
          "roamGridPossibleDest", 
          candidateX * Studio.SQUARE_SIZE + Studio.HALF_SQUARE, 
          candidateY * Studio.SQUARE_SIZE + Studio.HALF_SQUARE, 
          Studio.SQUARE_SIZE, 
          Studio.SQUARE_SIZE);
      }
      candidates.push(candidate);
    }

    // cull candidates that won't be possible
    for (var i = candidates.length-1; i >= 0; i--) {
      var candidate = candidates[i];
      var atEdge = candidate.gridX < 0 || candidate.gridX >= Studio.COLS ||
                   candidate.gridY < 0 || candidate.gridY >= Studio.ROWS;
      var hasWall = !atEdge && Studio.getWallValue(candidate.gridY, candidate.gridX);
      if (atEdge || hasWall || candidate.score === 0) {
        candidates.splice(i, 1);
      }
    }

    if (candidates.length > 0) {
      // shuffle everything (so that even scored items are shuffled, even after the sort)
      candidates = _.shuffle(candidates);

      // then sort everything based on score.
      candidates.sort(function (a, b) {
        return b.score - a.score;
      });

      this.destGridX = candidates[0].gridX;
      this.destGridY = candidates[0].gridY;

      // update towards the next location
      if (this.destGridX > this.gridX && this.destGridY > this.gridY) {
        this.dir = Direction.SOUTHEAST;
      } else if (this.destGridX > this.gridX && this.destGridY < this.gridY) {
        this.dir = Direction.NORTHEAST;
      } else if (this.destGridX < this.gridX && this.destGridY > this.gridY) {
        this.dir = Direction.SOUTHWEST;
      } else if (this.destGridX < this.gridX && this.destGridY < this.gridY) {
        this.dir = Direction.NORTHWEST;
      } else if (this.destGridX > this.gridX) {
        this.dir = Direction.EAST;
      } else if (this.destGridX < this.gridX) {
        this.dir = Direction.WEST;
      } else if (this.destGridY > this.gridY) {
        this.dir = Direction.SOUTH;
      } else if (this.destGridY < this.gridY) {
        this.dir = Direction.NORTH;
      } else {
        this.dir = Direction.NONE;
      }
    } else {
      this.dir = Direction.NONE;
    }
  }
};

/**
 * Begin a fade out.
 */
Item.prototype.beginRemoveElement = function () {
  this.startFadeTime = new Date().getTime();
};

/**
 * Remove our element/clipPath/animator
 */
Item.prototype.removeElement = function() {

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

  Studio.trackedBehavior.removedItemCount++;
};


/**
 * Returns true if the item is currently fading away.
 */
Item.prototype.isFading = function() {
  return !!this.startFadeTime;
};


/**
 * Returns true if the item has finished fading away.  The caller will usually
 * then call removeElement to destroy this item's assets.
 */
Item.prototype.hasCompletedFade = function() {
  var currentTime = new Date().getTime();

  return this.startFadeTime && currentTime > this.startFadeTime + this.fadeTime;
};

/**
 * Display our item at its current location
 */
Item.prototype.display = function () {
  var topLeft = {
    x: this.x + this.renderOffset.x - this.width / 2,
    y: this.y + this.renderOffset.y - this.height / 2
  };

  var currentTime = new Date().getTime();
  var opacity = 1;
  if (this.startFadeTime) {
    opacity = 1 - (currentTime - this.startFadeTime) / this.fadeTime;
    opacity = Math.max(opacity, 0);
  }

  var directionFrame = this.getDirectionFrame();
  this.element.setAttribute('x', topLeft.x - this.width * (directionFrame * this.renderScale + (this.renderScale-1)/2));
  this.element.setAttribute('y', topLeft.y - this.height * (this.currentFrame_ * this.renderScale + (this.renderScale-1)));
  this.element.setAttribute('opacity', opacity);

  var clipRect = this.clipPath.childNodes[0];
  clipRect.setAttribute('x', topLeft.x - this.width * (this.renderScale-1)/2);
  clipRect.setAttribute('y', topLeft.y - this.height * (this.renderScale-1));
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

/**
 * Mark that we're colliding with object represented by key.
 * Here, override base implemention to special on-collision logic for certain
 * item classes.
 * @param key A unique key representing the object we're colliding with
 * @returns {boolean} True if collision is started, false if we're already colliding
 * @override
 */
Item.prototype.startCollision = function (key) {
  var newCollisionStarted = Item.superPrototype.startCollision.call(this, key);
  if (newCollisionStarted) {
    if (this.className === 'hazard') {
      Studio.fail("Don't run into the guy!");
    }
  }
  return newCollisionStarted;
};
