var callbacks = [];

function register(callback) {
  callbacks.push(callback);
}

function draw() {
  background('#444');
  callbacks.forEach(function (callback) {
    callback();
  });
  drawSprites();
}

/* `where` selector. */
function where(condition, value, callback) {
  allSprites.forEach(function (sprite) {
    if (isEqual(sprite[condition], value)) {
      callback.apply(sprite.wrapper);
    }
  });
}

function isEqual(a, b) {
  if (typeof a !== typeof b) {
    return false;
  }
  if (a._array || b._array) {
    a = color(a);
    b = color(b);
    for (var i = 0; i < 4; i++) {
      if (Math.abs(a._array[i] - b._array[i]) > 0.1) {
        return false;
      }
    }
    return true;
  }
  return a === b;
}

/* Sprite wrapper. */
function Sprite() {
  this.sprite = createSprite();
  this.sprite.wrapper = this;
}

Sprite.prototype.teleportTo = function (vector) {
  this.sprite.position = vector.copy();
};

Sprite.prototype.push = function (vector) {
  this.sprite.velocity = vector.copy();
};

Sprite.prototype.setColor = function (color) {
  this.sprite.shapeColor = color;
};

Sprite.prototype.setSize = function (width, height) {
  this.sprite.width = width;
  this.sprite.height = height;
};
