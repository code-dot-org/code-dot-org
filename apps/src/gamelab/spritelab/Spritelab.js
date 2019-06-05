var commands = require('./commands');
import * as spriteUtils from './spriteUtils';

var Spritelab = function() {
  this.reset = () => spriteUtils.reset();

  function drawBackground() {
    if (typeof spriteUtils.background === 'string') {
      this.background(spriteUtils.background);
    } else {
      this.background('white');
    }
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

  this.commands = {};

  this.commands.executeDrawLoopAndCallbacks = function() {
    this.createEdgeSprites();
    drawBackground.apply(this);
    spriteUtils.runBehaviors();
    spriteUtils.runEvents(this);
    this.drawSprites();
    updateTitle.apply(this);
  };

  // Action commands
  this.commands.changePropBy = function(spriteId, prop, val) {
    commands.changePropBy(spriteId, prop, val);
  };

  this.commands.edgesDisplace = function(spriteId) {
    commands.edgesDisplace.apply(this, [spriteId]);
  };

  this.commands.isTouchingEdges = function(spriteId) {
    return commands.isTouchingEdges.apply(this, [spriteId]);
  };

  this.commands.jumpTo = function(spriteId, location) {
    commands.jumpTo(spriteId, location);
  };

  this.commands.mirrorSprite = function(spriteId, direction) {
    commands.mirrorSprite(spriteId, direction);
  };

  this.commands.moveInDirection = function(spriteId, distance, direction) {
    commands.moveInDirection(spriteId, distance, direction);
  };

  this.commands.moveForward = function(spriteId, distance) {
    commands.moveForward(spriteId, distance);
  };

  this.commands.moveToward = function(spriteId, distance, target) {
    commands.moveToward(spriteId, distance, target);
  };

  this.commands.removeTint = function(spriteId) {
    commands.setProp(spriteId, 'tint', null);
  };

  this.commands.setProp = function(spriteId, prop, val) {
    commands.setProp.apply(this, [spriteId, prop, val]);
  };

  this.commands.setTint = function(spriteId, color) {
    commands.setProp(spriteId, 'tint', color);
  };

  this.commands.turn = function(spriteId, n, direction) {
    commands.turn(spriteId, n, direction);
  };

  // Behavior commands
  this.commands.addBehaviorSimple = function(spriteId, behavior) {
    commands.addBehavior(spriteId, behavior);
  };

  this.commands.Behavior = function(callback) {
    return commands.Behavior(callback);
  };

  this.commands.draggableFunc = function(spriteId) {
    return commands.draggableFunc(this);
  };

  this.commands.removeAllBehaviors = function(spriteId) {
    commands.removeAllBehaviors(spriteId);
  };

  this.commands.removeBehaviorSimple = function(spriteId, behavior) {
    commands.removeBehavior(spriteId, behavior);
  };

  // Event commands
  this.commands.checkTouching = function(
    condition,
    sprite1,
    sprite2,
    callback
  ) {
    commands.checkTouching(condition, sprite1, sprite2, callback);
  };

  this.commands.keyPressed = function(condition, key, callback) {
    commands.keyPressed(condition, key, callback);
  };

  this.commands.spriteClicked = function(condition, spriteId, callback) {
    commands.spriteClicked(condition, spriteId, callback);
  };

  // Location commands
  this.commands.locationAt = function(x, y) {
    return commands.locationAt(x, y);
  };

  this.commands.locationMouse = function() {
    return commands.locationMouse.apply(this);
  };

  this.commands.locationOf = function(spriteId) {
    return commands.locationOf(spriteId);
  };

  this.commands.randomLocation = function() {
    return commands.randomLocation();
  };

  // Sprite commands
  this.commands.countByAnimation = function(animation) {
    return commands.countByAnimation(animation);
  };

  this.commands.createNewSprite = function(name, animation, location) {
    return commands.makeSprite.apply(this, [animation, location]);
  };

  this.commands.destroy = function(spriteId) {
    commands.destroy(spriteId);
  };

  this.commands.displace = function(spriteId, targetSpriteIndex) {
    commands.displace(spriteId, targetSpriteIndex);
  };

  this.commands.getProp = function(spriteId, prop) {
    return commands.getProp(spriteId, prop);
  };

  this.commands.getThisSprite = function(which, extraArgs) {
    return commands.getThisSprite(which, extraArgs);
  };

  this.commands.makeNewSpriteAnon = function(animation, location) {
    commands.makeSprite.apply(this, [animation, location]);
  };

  this.commands.setAnimation = function(spriteId, animation) {
    commands.setAnimation(spriteId, animation);
  };

  // World commands
  this.commands.comment = function(text) {
    commands.comment(text);
  };

  this.commands.hideTitleScreen = function() {
    commands.hideTitleScreen();
  };

  this.commands.printText = function(text) {
    commands.printText(text);
  };

  this.commands.setBackground = function(color) {
    commands.setBackground(color);
  };
  this.commands.setBackgroundImage = function(img) {
    commands.setBackgroundImage.apply(this, [img]);
  };
  this.commands.showTitleScreen = function(title, subtitle) {
    commands.showTitleScreen(title, subtitle);
  };
};

module.exports = Spritelab;
