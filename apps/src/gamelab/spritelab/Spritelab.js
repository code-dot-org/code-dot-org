var commands = require('./commands');
import * as spriteUtils from './spriteUtils.js';

function drawBackground() {
  this.background(spriteUtils.background || 'white');
  if (typeof spriteUtils.background === 'object') {
    spriteUtils.background.resize(400, 400);
    this.image(spriteUtils.background);
  }
}

function updateTitle() {
  this.fill('black');
  this.textAlign(this.CENTER, this.CENTER);
  this.textSize(50);
  this.text(spriteUtils.title, 0, 0, 400, 200);
  this.textSize(35);
  this.text(spriteUtils.subtitle, 0, 200, 400, 200);
}

var Spritelab = function() {
  this.reset = () => {
    spriteUtils.resetSpriteMap();
  };
  window.p5.prototype.executeDrawLoopAndCallbacks = function() {
    drawBackground.apply(this);
    spriteUtils.runEvents.apply(this);
    this.drawSprites();
    updateTitle.apply(this);
  };

  // ACTION commands
  window.p5.prototype.changePropBy = function(spriteId, prop, val) {
    commands.changePropBy.apply(this, [spriteId, prop, val]);
  };
  window.p5.prototype.edgesDisplace = function(spriteId) {
    commands.edgesDisplace.apply(this, [spriteId]);
  };
  window.p5.prototype.jumpTo = function(spriteId, location) {
    commands.jumpTo.apply(this, [spriteId, location]);
  };
  window.p5.prototype.mirrorSprite = function(spriteId, direction) {
    commands.mirrorSprite.apply(this, [spriteId, direction]);
  };
  window.p5.prototype.moveInDirection = function(
    spriteId,
    distance,
    direction
  ) {
    commands.moveInDirection.apply(this, [spriteId, distance, direction]);
  };
  window.p5.prototype.moveToward = function(spriteId, distance, target) {
    commands.moveToward.apply(this, [spriteId, distance, target]);
  };
  window.p5.prototype.pointInDirection = function(spriteId, direction) {
    commands.pointInDirection.apply(this, [spriteId, direction]);
  };
  window.p5.prototype.setProp = function(spriteId, prop, val) {
    commands.setProp.apply(this, [spriteId, prop, val]);
  };
  window.p5.prototype.setSizes = function(spriteId, prop, val) {
    commands.setProp.apply(this, [spriteId, prop, val]);
  };
  window.p5.prototype.turn = function(spriteId, n, direction) {
    commands.turn.apply(this, [spriteId, n, direction]);
  };

  // EVENT commands
  window.p5.prototype.checkTouching = function(
    condition,
    sprite1,
    sprite2,
    callback
  ) {
    commands.checkTouching.apply(this, [condition, sprite1, sprite2, callback]);
  };
  window.p5.prototype.keyPressed = function(condition, key, callback) {
    commands.keyPressed.apply(this, [condition, key, callback]);
  };
  window.p5.prototype.spriteClicked = function(condition, spriteId, callback) {
    commands.spriteClicked.apply(this, [condition, spriteId, callback]);
  };

  // LOCATION commands
  window.p5.prototype.locationAt = function(x, y) {
    return commands.locationAt.apply(this, [x, y]);
  };
  window.p5.prototype.locationMouse = function() {
    return commands.locationMouse.apply(this, []);
  };
  window.p5.prototype.locationOf = function(spriteId) {
    return commands.locationOf.apply(this, [spriteId]);
  };
  window.p5.prototype.randomLocation = function() {
    return commands.randomLocation.apply(this, []);
  };
  window.p5.prototype.xLocationOf = function(spriteId) {
    return commands.xLocationOf.apply(this, [spriteId]);
  };
  window.p5.prototype.yLocationOf = function(spriteId) {
    return commands.yLocationOf.apply(this, [spriteId]);
  };

  // SPRITE commands
  window.p5.prototype.makeNewSpriteAnon = function(animation, location) {
    commands.makeSprite.apply(this, [animation, location]);
  };

  window.p5.prototype.createNewSprite = function(name, animation, location) {
    return commands.makeSprite.apply(this, [animation, location]);
  };

  window.p5.prototype.setAnimation = function(spriteId, animation) {
    commands.setAnimation.apply(this, [spriteId, animation]);
  };

  window.p5.prototype.getProp = function(spriteId, prop) {
    return commands.getProp.apply(this, [spriteId, prop]);
  };

  window.p5.prototype.destroy = function(spriteId) {
    commands.destroy.apply(this, [spriteId]);
  };
  window.p5.prototype.displace = function(spriteId, targetSpriteIndex) {
    commands.dispalce.apply(this, [spriteId, targetSpriteIndex]);
  };

  // WORLD commands
  window.p5.prototype.hideTitleScreen = function() {
    commands.hideTitleScreen.apply(this, []);
  };
  window.p5.prototype.randColor = function() {
    return commands.randColor.apply(this, []);
  };
  window.p5.prototype.setBackground = function(color) {
    commands.setBackground.apply(this, [color]);
  };
  window.p5.prototype.setBackgroundImage = function(img) {
    commands.setBackgroundImage.apply(this, [img]);
  };
  window.p5.prototype.showTitleScreen = function(title, subtitle) {
    commands.showTitleScreen.apply(this, [title, subtitle]);
  };
  window.p5.prototype.setTint = function(spriteId, color) {
    commands.setTint.apply(this, [spriteId, color]);
  };
  window.p5.prototype.removeTint = function(spriteId) {
    commands.removeTint.apply(this, [spriteId]);
  };

  // OTHER
  window.p5.prototype.comment = function(text) {
    commands.comment.apply(this, [text]);
  };
};

module.exports = Spritelab;
