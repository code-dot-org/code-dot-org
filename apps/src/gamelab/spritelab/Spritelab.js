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
};

module.exports = Spritelab;
