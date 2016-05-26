'use strict';

var GameLabGame = function (p5Inst) {
  this.p5Inst = p5Inst;
};

var READONLY = true;

function createP5PropertyAlias(name, readonly) {
  var options = {
    enumerable: true,
    get: function () {
      return this.p5Inst[name];
    }
  };
  if (!readonly) {
    options.set = function (value) {
      this.p5Inst[name] = value;
    };
  }
  Object.defineProperty(GameLabGame.prototype, name, options);
}

createP5PropertyAlias('width', READONLY);
createP5PropertyAlias('height', READONLY);
createP5PropertyAlias('mouseX', READONLY);
createP5PropertyAlias('mouseY', READONLY);
createP5PropertyAlias('allSprites', READONLY);
createP5PropertyAlias('frameCount', READONLY);

// Transform p5play's frameRate() API into a property on the GameLabGame object:
Object.defineProperty(GameLabGame.prototype, 'frameRate', {
  enumerable: true,
  get: function () {
    return this.p5Inst.frameRate();
  },
  set: function (value) {
    this.p5Inst.frameRate(value);
  }
});

module.exports = GameLabGame;
