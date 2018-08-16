var callbacks = [];

function register(callback) {
  callbacks.push(callback);
}

function Sprite() {
  this.sprite = createSprite();
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

function draw() {
  background('#444');
  callbacks.forEach(function (callback) {
    callback();
  });
  drawSprites();
}
