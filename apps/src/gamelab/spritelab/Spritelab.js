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
};

module.exports = Spritelab;
