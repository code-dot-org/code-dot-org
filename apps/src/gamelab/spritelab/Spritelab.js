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
  this.commands = {};

  this.commands.executeDrawLoopAndCallbacks = function() {
    drawBackground.apply(this);
    spriteUtils.runBehaviors.apply(this);
    spriteUtils.runEvents.apply(this);
    this.drawSprites();
    updateTitle.apply(this);
  };

  // ACTION commands
  this.commands.changePropBy = function(spriteId, prop, val) {
    commands.changePropBy(spriteId, prop, val);
  };
  this.commands.edgesDisplace = function(spriteId) {
    commands.edgesDisplace.apply(this, [spriteId]);
  };
  this.commands.jumpTo = function(spriteId, location) {
    commands.jumpTo.apply(this, [spriteId, location]);
  };
  this.commands.mirrorSprite = function(spriteId, direction) {
    commands.mirrorSprite.apply(this, [spriteId, direction]);
  };
  this.commands.moveInDirection = function(spriteId, distance, direction) {
    commands.moveInDirection.apply(this, [spriteId, distance, direction]);
  };
  this.commands.moveToward = function(spriteId, distance, target) {
    commands.moveToward.apply(this, [spriteId, distance, target]);
  };
  this.commands.setProp = function(spriteId, prop, val) {
    commands.setProp.apply(this, [spriteId, prop, val]);
  };
  this.commands.turn = function(spriteId, n, direction) {
    commands.turn.apply(this, [spriteId, n, direction]);
  };

  // BEHAVIOR commands
  this.commands.addBehaviorSimple = function(spriteId, behavior) {
    commands.addBehavior.apply(this, [spriteId, behavior]);
  };
  this.commands.Behavior = function(callback, extraArgs) {
    return commands.Behavior.apply(this, [callback, extraArgs]);
  };

  // EVENT commands
  this.commands.checkTouching = function(
    condition,
    sprite1,
    sprite2,
    callback
  ) {
    commands.checkTouching.apply(this, [condition, sprite1, sprite2, callback]);
  };
  this.commands.keyPressed = function(condition, key, callback) {
    commands.keyPressed.apply(this, [condition, key, callback]);
  };
  this.commands.spriteClicked = function(condition, spriteId, callback) {
    commands.spriteClicked.apply(this, [condition, spriteId, callback]);
  };

  // LOCATION commands
  this.commands.locationAt = function(x, y) {
    return commands.locationAt.apply(this, [x, y]);
  };
  this.commands.locationMouse = function() {
    return commands.locationMouse.apply(this, []);
  };
  this.commands.locationOf = function(spriteId) {
    return commands.locationOf.apply(this, [spriteId]);
  };
  this.commands.randomLocation = function() {
    return commands.randomLocation.apply(this, []);
  };

  // SPRITE commands
  this.commands.makeNewSpriteAnon = function(animation, location) {
    commands.makeSprite.apply(this, [animation, location]);
  };

  this.commands.createNewSprite = function(name, animation, location) {
    return commands.makeSprite.apply(this, [animation, location]);
  };

  this.commands.setAnimation = function(spriteId, animation) {
    commands.setAnimation.apply(this, [spriteId, animation]);
  };

  this.commands.getProp = function(spriteId, prop) {
    return commands.getProp.apply(this, [spriteId, prop]);
  };

  this.commands.destroy = function(spriteId) {
    commands.destroy.apply(this, [spriteId]);
  };
  this.commands.displace = function(spriteId, targetSpriteIndex) {
    commands.dispalce.apply(this, [spriteId, targetSpriteIndex]);
  };

  // WORLD commands
  this.commands.hideTitleScreen = function() {
    commands.hideTitleScreen.apply(this, []);
  };
  this.commands.randColor = function() {
    return commands.randColor.apply(this, []);
  };
  this.commands.setBackground = function(color) {
    commands.setBackground.apply(this, [color]);
  };
  this.commands.setBackgroundImage = function(img) {
    commands.setBackgroundImage.apply(this, [img]);
  };
  this.commands.showTitleScreen = function(title, subtitle) {
    commands.showTitleScreen.apply(this, [title, subtitle]);
  };
  this.commands.setTint = function(spriteId, color) {
    commands.setTint.apply(this, [spriteId, color]);
  };
  this.commands.removeTint = function(spriteId) {
    commands.removeTint.apply(this, [spriteId]);
  };

  // OTHER
  this.commands.comment = function(text) {
    commands.comment.apply(this, [text]);
  };
};

module.exports = Spritelab;
