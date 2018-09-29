import {teardown} from './DanceLabP5';

/**
 * An instantiable GameLabP5 class that wraps p5 and p5play and patches it in
 * specific places to enable GameLab functionality
 */
var GameLabP5 = function () {
  this.p5 = null;
  this.p5specialFunctions = ['preload', 'draw', 'setup'];
};

module.exports = GameLabP5;

/**
 * Initialize this GameLabP5 instance.
 *
 * @param {!Object} options
 * @param {!Function} options.onPreload callback to run during preload()
 * @param {!Function} options.onSetup callback to run during setup()
 * @param {!Function} options.onDraw callback to run during each draw()
 */
GameLabP5.prototype.init = function (options) {
  this.onPreload = options.onPreload;
  this.onSetup = options.onSetup;
  this.onDraw = options.onDraw;
};

/**
 * Reset GameLabP5 to its initial state. Called before each time it is used.
 */
GameLabP5.prototype.resetExecution = function () {
  teardown();

  if (this.p5) {
    this.p5.remove();
    this.p5 = null;
  }
};

/**
 * Instantiate a new p5 and start execution
 */
GameLabP5.prototype.startExecution = function () {
  new window.p5(function (p5obj) {
      this.p5 = p5obj;
      // Tell p5.play that we don't want it to have Sprite do anything
      // within _syncAnimationSizes()
      this.p5._fixedSpriteAnimationFrameSizes = true;

      p5obj.preload = this.onPreload.bind(this);

      p5obj.setup = this.onSetup.bind(this);

      p5obj.draw = this.onDraw.bind(this);
    }.bind(this),
    'divGameLab');
};
