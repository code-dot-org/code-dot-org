import {commands} from './spritelabCommands';

var Spritelab = function() {
  window.p5.prototype.setBackground = function(color) {
    commands.setBackground.apply(this, [color]);
  };

  window.p5.prototype.makeNewSpriteAnon = function(animation, location) {
    commands.makeSprite.apply(this, [animation, location]);
  };

  window.p5.prototype.createNewSprite = function(name, animation, location) {
    return commands.makeSprite.apply(this, [animation, location]);
  };

  window.p5.prototype.executeDrawLoopAndCallbacks = function() {
    this.drawSprites();
  };

  window.p5.prototype.setAnimation = function(spriteIndex, animation) {
    commands.setAnimation.apply(this, [spriteIndex, animation]);
  };
};

module.exports = Spritelab;
