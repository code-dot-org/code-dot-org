import {getStore} from '@cdo/apps/redux';
import {allAnimationsSingleFrameSelector} from './redux/animationList';
import p5 from '@code-dot-org/p5';
window.p5 = p5;
import '@code-dot-org/p5.play/lib/p5.play';
import p5SpriteWrapper from './P5SpriteWrapper';
import p5GroupWrapper from './P5GroupWrapper';
import {backgrounds} from './spritelab/backgrounds.json';
import * as assetPrefix from '@cdo/apps/assetManagement/assetPrefix';

const defaultFrameRate = 30;

/**
 * An instantiable P5Wrapper class that wraps p5 and p5play and patches it in
 * specific places to enable GameLab functionality
 */
var P5Wrapper = function() {
  this.p5 = null;
  this.p5decrementPreload = null;
  this.p5eventNames = [
    'mouseMoved',
    'mouseDragged',
    'mousePressed',
    'mouseReleased',
    'mouseClicked',
    'mouseWheel',
    'keyPressed',
    'keyReleased',
    'keyTyped'
  ];
  this.p5specialFunctions = ['preload', 'draw', 'setup'].concat(
    this.p5eventNames
  );
  this.stepSpeed = 1;

  this.setP5FrameRate = () => {
    if (!this.p5) {
      return;
    }
    if (this.stepSpeed < 1) {
      // TODO: properly handle overriding frameRate (this implementation doesn't
      // account for any calls to frameRate() that occur while we are in the
      // slow mode - we'll need to patch p5 to capture those and update
      // this.prevFrameRate)
      this.prevFrameRate = this.p5.frameRate();
      this.p5.frameRate(1);
    } else {
      this.p5.frameRate(this.prevFrameRate || defaultFrameRate);
    }
  };

  this.setLoop = shouldLoop => {
    if (!this.p5) {
      return;
    }
    if (shouldLoop) {
      // Calling p5.loop() invokes p5.draw(), but we might still be waiting for
      // animations to load.
      this.p5._loop = true;
    } else {
      this.p5.noLoop();
    }
  };
};

module.exports = P5Wrapper;

P5Wrapper.baseP5loadImage = null;

/**
 * Initialize this P5Wrapper instance.
 *
 * @param {!Object} options
 * @param {!Function} options.gameLab instance of parent GameLab object
 * @param {Number} [options.scale] Scale ratio of containing element (<1 is small)
 * @param {!Function} options.onExecutionStarting callback to run during p5 init
 * @param {!Function} options.onPreload callback to run during preload()
 * @param {!Function} options.onSetup callback to run during setup()
 * @param {!Function} options.onDraw callback to run during each draw()
 * @param {boolean} options.spritelab Whether this is a spritelab instance
 */
P5Wrapper.prototype.init = function(options) {
  this.onExecutionStarting = options.onExecutionStarting;
  this.onPreload = options.onPreload;
  this.onSetup = options.onSetup;
  this.onDraw = options.onDraw;
  this.scale = options.scale || 1;

  // Override p5.loadImage so we can modify the URL path param
  if (!P5Wrapper.baseP5loadImage) {
    P5Wrapper.baseP5loadImage = window.p5.prototype.loadImage;
    window.p5.prototype.loadImage = function(path) {
      // Make sure to pass all arguments through to loadImage, which can get
      // wrapped and take additional arguments during preload.
      arguments[0] = assetPrefix.fixPath(path);
      return P5Wrapper.baseP5loadImage.apply(this, arguments);
    };
  }

  // Override p5.redraw to make it two-phase after userDraw()
  window.p5.prototype.redraw = function() {
    /*
     * Copied code from p5 from redraw()
     */
    const userSetup = this.setup || window.setup;
    const userDraw = this.draw || window.draw;
    if (typeof userDraw === 'function') {
      this.resetMatrix();
      if (typeof userSetup === 'undefined') {
        this.scale(this.pixelDensity, this.pixelDensity);
      }
      const preMethods = this._registeredMethods.pre;
      for (let i = 0; i < preMethods.length; i++) {
        preMethods[i].call(this);
      }
      userDraw();
    }
  };

  // Create 2nd phase function afterUserDraw()
  window.p5.prototype.afterUserDraw = function() {
    /*
     * Copied code from p5 from redraw()
     */
    const postMethods = this._registeredMethods.post;
    for (let i = 0; i < postMethods.length; i++) {
      postMethods[i].call(this);
    }
  };

  // Disable fullscreen() method:
  // (we don't make this change in our fork of p5.play, as we want this restriction
  //  only while running within Code Studio)
  window.p5.prototype.fullscreen = function(val) {
    return false;
  };

  if (!options.spritelab) {
    // Override p5.createSprite and p5.Group so we can override the methods that
    // take callback parameters
    window.p5.prototype.createSprite = p5SpriteWrapper.createSprite;
    var baseGroupConstructor = window.p5.prototype.Group;
    window.p5.prototype.Group = p5GroupWrapper.Group.bind(
      null,
      baseGroupConstructor
    );
  }

  window.p5.prototype.gamelabPreload = function() {
    this.p5decrementPreload = window.p5._getDecrementPreload.apply(
      this.p5,
      arguments
    );
  }.bind(this);
};

/**
 * Reset P5Wrapper to its initial state. Called before each time it is used.
 */
P5Wrapper.prototype.resetExecution = function() {
  p5SpriteWrapper.setCreateWithDebug(false);

  if (this.p5) {
    this.p5.remove();
    this.p5 = null;
    this.p5decrementPreload = null;
  }

  // Important to reset these after this.p5 has been removed above
  this.drawInProgress = false;
  this.setupInProgress = false;
};

/**
 * Register a p5 event handler function. The provided function replaces the
 * method stored on our p5 instance.
 */
P5Wrapper.prototype.registerP5EventHandler = function(eventName, handler) {
  this.p5[eventName] = handler;
};

P5Wrapper.prototype.changeStepSpeed = function(stepSpeed) {
  this.stepSpeed = stepSpeed;
  this.setP5FrameRate();
};

P5Wrapper.prototype.drawDebugSpriteColliders = function() {
  if (this.p5) {
    this.p5.allSprites.forEach(sprite => {
      sprite.display(true);
    });
  }
};

P5Wrapper.prototype.loadSound = function(url) {
  if (this.p5 && this.p5.loadSound) {
    return this.p5.loadSound(url);
  }
};

/**
 * Instantiate a new p5 and start execution
 */
P5Wrapper.prototype.startExecution = function() {
  new window.p5(
    function(p5obj) {
      this.p5 = p5obj;
      // Tell p5.play that we don't want it to have Sprite do anything
      // within _syncAnimationSizes()
      this.p5._fixedSpriteAnimationFrameSizes = true;

      this.setP5FrameRate();

      p5obj.registerPreloadMethod('gamelabPreload', window.p5.prototype);

      // Overload _draw function to make it two-phase
      p5obj._draw = function() {
        /*
         * Copied code from p5 _draw()
         */
        this._thisFrameTime = window.performance.now();
        var time_since_last = this._thisFrameTime - this._lastFrameTime;
        var target_time_between_frames = 1000 / this._targetFrameRate;

        // only draw if we really need to; don't overextend the browser.
        // draw if we're within 5ms of when our next frame should paint
        // (this will prevent us from giving up opportunities to draw
        // again when it's really about time for us to do so). fixes an
        // issue where the frameRate is too low if our refresh loop isn't
        // in sync with the browser. note that we have to draw once even
        // if looping is off, so we bypass the time delay if that
        // is the case.
        var epsilon = 5;
        if (
          !this._loop ||
          time_since_last >= target_time_between_frames - epsilon
        ) {
          //mandatory update values(matrixs and stack) for 3d
          if (this._renderer.isP3D) {
            this._renderer._update();
          }

          this._setProperty('frameCount', this.frameCount + 1);
          this.redraw();
          this._updateMouseCoords();
          this._updateTouchCoords();
        } else {
          this._drawEpilogue();
        }
      }.bind(p5obj);

      p5obj.afterRedraw = function() {
        /*
         * Copied code from p5 _draw()
         */
        this._frameRate = 1000.0 / (this._thisFrameTime - this._lastFrameTime);
        this._lastFrameTime = this._thisFrameTime;

        this._drawEpilogue();
      }.bind(p5obj);

      p5obj._drawEpilogue = function() {
        /*
         * Copied code from p5 _draw()
         */

        // get notified the next time the browser gives us
        // an opportunity to draw.
        if (this._loop) {
          this._requestAnimId = window.requestAnimationFrame(this._draw);
        }
      }.bind(p5obj);

      // Overload _setup function to make it two-phase
      p5obj._setup = function() {
        /*
         * Copied code from p5 _setup()
         */

        // return preload functions to their normal vals if switched by preload
        var context = this._isGlobal ? window : this;
        if (typeof context.preload === 'function') {
          for (var f in this._preloadMethods) {
            context[f] = this._preloadMethods[f][f];
            if (context[f] && this) {
              context[f] = context[f].bind(this);
            }
          }
        }

        // Short-circuit on this, in case someone used the library in "global"
        // mode earlier
        if (typeof context.setup === 'function') {
          context.setup();
        } else {
          this._setupEpiloguePhase1();
          this._setupEpiloguePhase2();
        }
      }.bind(p5obj);

      p5obj._setupEpiloguePhase1 = function() {
        /*
         * Modified code from p5 _setup() (safe to call multiple times in the
         * event that the debugger has slowed down the process of completing
         * the setup phase)
         */

        // unhide any hidden canvases that were created
        var canvases = document.getElementsByTagName('canvas');
        for (var i = 0; i < canvases.length; i++) {
          var k = canvases[i];
          if (k.dataset.hidden === 'true') {
            k.style.visibility = '';
            delete k.dataset.hidden;
          }
        }
      }.bind(p5obj);

      p5obj._setupEpiloguePhase2 = function() {
        /*
         * Modified code from p5 _setup()
         */
        this._setupDone = true;
      }.bind(p5obj);

      p5obj.preload = function() {
        if (!this.onPreload()) {
          // If onPreload() returns false, it means that the preload phase has
          // not completed, so we need to grab increment p5's preloadCount by
          // calling the gamelabPreload() method.

          // Call our gamelabPreload() to force _start/_setup to wait.
          p5obj.gamelabPreload();
        }
      }.bind(this);

      p5obj.setup = function() {
        this.onSetup();
      }.bind(this);

      p5obj.draw = this.onDraw.bind(this);

      this.onExecutionStarting();
    }.bind(this),
    'divGameLab'
  );
};

/**
 * Called when the preload phase is complete. When a distinct setup() method is
 * provided, a student's global code must finish executing before this phase is
 * done. This allows us to release our "preload" count reference in p5, which
 * means that setup() can begin.
 */
P5Wrapper.prototype.notifyPreloadPhaseComplete = function() {
  if (this.p5decrementPreload) {
    this.p5decrementPreload();
    this.p5decrementPreload = null;
  }
};

P5Wrapper.prototype.notifyKeyCodeDown = function(keyCode) {
  // Synthesize an event and send it to the internal p5 handler for keydown
  if (this.p5) {
    this.p5._onkeydown({which: keyCode});
  }
};

P5Wrapper.prototype.notifyKeyCodeUp = function(keyCode) {
  // Synthesize an event and send it to the internal p5 handler for keyup
  if (this.p5) {
    this.p5._onkeyup({which: keyCode});
  }
};

P5Wrapper.prototype.getCustomMarshalGlobalProperties = function() {
  return {
    width: this.p5,
    height: this.p5,
    displayWidth: this.p5,
    displayHeight: this.p5,
    windowWidth: this.p5,
    windowHeight: this.p5,
    focused: this.p5,
    frameCount: this.p5,
    keyIsPressed: this.p5,
    key: this.p5,
    keyCode: this.p5,
    mouseX: this.p5,
    mouseY: this.p5,
    pmouseX: this.p5,
    pmouseY: this.p5,
    winMouseX: this.p5,
    winMouseY: this.p5,
    pwinMouseX: this.p5,
    pwinMouseY: this.p5,
    mouseButton: this.p5,
    mouseIsPressed: this.p5,
    touchX: this.p5,
    touchY: this.p5,
    ptouchX: this.p5,
    ptouchY: this.p5,
    touches: this.p5,
    touchIsDown: this.p5,
    pixels: this.p5,
    deviceOrientation: this.p5,
    accelerationX: this.p5,
    accelerationY: this.p5,
    accelerationZ: this.p5,
    pAccelerationX: this.p5,
    pAccelerationY: this.p5,
    pAccelerationZ: this.p5,
    rotationX: this.p5,
    rotationY: this.p5,
    rotationZ: this.p5,
    pRotationX: this.p5,
    pRotationY: this.p5,
    pRotationZ: this.p5,
    leftEdge: this.p5,
    rightEdge: this.p5,
    topEdge: this.p5,
    bottomEdge: this.p5,
    edges: this.p5
  };
};

P5Wrapper.prototype.getCustomMarshalBlockedProperties = function() {
  return [
    'arguments',
    'callee',
    'caller',
    'constructor',
    'eval',
    'prototype',
    'stack',
    'unwatch',
    'valueOf',
    'watch',
    '_userNode',
    '_elements',
    '_curElement',
    'elt',
    'canvas',
    'parent',
    'p5',
    'downloadFile',
    'writeFile',
    'httpGet',
    'httpPost',
    'httpDo',
    'loadJSON',
    'loadStrings',
    'loadTable',
    'loadXML'
  ];
};

P5Wrapper.prototype.getCustomMarshalObjectList = function() {
  return [
    {
      instance: this.p5.Sprite,
      ensureIdenticalMarshalInstances: true,
      methodOpts: {
        nativeCallsBackInterpreter: true
      }
    },
    // The p5play Group object should be custom marshalled, but its constructor
    // actually creates a standard Array instance with a few additional methods
    // added. We solve this by putting "Array" in this list, but with "draw" as
    // a requiredMethod:
    {
      instance: Array,
      requiredMethod: 'draw',
      methodOpts: {
        nativeCallsBackInterpreter: true
      }
    },
    {instance: window.p5},
    {instance: this.p5.Camera},
    {instance: this.p5.Animation},
    {instance: this.p5.SpriteSheet},
    {instance: window.p5.Vector},
    {instance: window.p5.Color},
    {instance: window.p5.Image},
    {instance: window.p5.Renderer},
    {instance: window.p5.Graphics},
    {instance: window.p5.Font},
    {instance: window.p5.Table},
    {instance: window.p5.TableRow}
    // TODO: Maybe add collider types here?
  ];
};

/**
 * Names every property on the p5 instance except for those on custom marshal
 * lists or blacklisted properties.
 * @returns {Array.<string>}
 */
P5Wrapper.prototype.getMarshallableP5Properties = function() {
  const blockedProps = this.getCustomMarshalBlockedProperties();
  const globalCustomMarshalProps = this.getCustomMarshalGlobalProperties();

  const propNames = [];
  for (const prop in this.p5) {
    if (
      -1 === blockedProps.indexOf(prop) &&
      -1 === this.p5specialFunctions.indexOf(prop) &&
      !globalCustomMarshalProps[prop]
    ) {
      propNames.push(prop);
    }
  }
  return propNames;
};

P5Wrapper.prototype.getGlobalPropertyList = function() {
  const propList = {};

  // Include every property on the p5 instance in the global property list
  // except those on the custom marshal lists:
  const p5PropertyNames = this.getMarshallableP5Properties();
  for (const prop of p5PropertyNames) {
    propList[prop] = [this.p5[prop], this.p5];
  }

  // Create a 'p5' object in the global namespace:
  propList.p5 = [{Vector: window.p5.Vector}, window];

  // Create a 'Game' object in the global namespace
  // to make older blocks compatible (alias to p5.World):
  propList.Game = [this.p5.World, this.p5];

  return propList;
};

/**
 * Return the current frame rate
 */
P5Wrapper.prototype.getFrameRate = function() {
  return this.p5 ? this.p5.frameRate() : 0;
};

/**
 * Mark all current and future sprites as debug=true.
 * @param {boolean} debugSprites - Enable or disable debug flag on all sprites
 */
P5Wrapper.prototype.debugSprites = function(debugSprites) {
  if (this.p5) {
    p5SpriteWrapper.setCreateWithDebug(debugSprites);
    this.p5.allSprites.forEach(sprite => {
      sprite.debug = debugSprites;
    });
  }
};

P5Wrapper.prototype.afterDrawComplete = function() {
  this.p5.afterUserDraw();
  this.p5.afterRedraw();
};

/**
 * Setup has started and the debugger may be at a breakpoint. Run Phase1 of
 * of the epilogue so the student can see what they may be drawing in their
 * setup code while debugging.
 */
P5Wrapper.prototype.afterSetupStarted = function() {
  this.p5._setupEpiloguePhase1();
};

/**
 * Setup has completed. Run Phase1 and Phase2 of the epilogue. It is safe to
 * call _setupEpiloguePhase1() multiple times in the event that it may already
 * have been called.
 */
P5Wrapper.prototype.afterSetupComplete = function() {
  this.p5._setupEpiloguePhase1();
  this.p5._setupEpiloguePhase2();
};

P5Wrapper.prototype.preloadBackgrounds = function() {
  if (!this.preloadBackgrounds_) {
    this.preloadedBackgrounds = {};
    this.preloadBackgrounds_ = Promise.all(
      backgrounds.map(background => {
        return new Promise(resolve => {
          this.p5.loadImage(
            background.sourceUrl,
            image => {
              this.preloadedBackgrounds[background.legacyParam] = image;
              resolve();
            },
            err => {
              console.log(err);
              resolve();
            }
          );
        });
      })
    );
  }
  return this.preloadBackgrounds_.then(
    () => (this.p5._preloadedBackgrounds = this.preloadedBackgrounds)
  );
};

P5Wrapper.prototype.preloadSpriteImages = function(animationList) {
  if (!this.preloadedSprites) {
    this.preloadedSprites = {};
  }
  this.preloadSpriteImages_ = Promise.all(
    animationList.orderedKeys.map(key => {
      const props = animationList.propsByKey[key];
      if (
        this.preloadedSprites[props.name] &&
        this.preloadedSprites[props.name].dataURI === props.dataURI
      ) {
        return Promise.resolve();
      }
      return new Promise(resolve => {
        this.p5.loadImage(
          props.dataURI,
          image => {
            this.preloadedSprites[props.name] = image;
            this.preloadedSprites[props.name].dataURI = props.dataURI;
            resolve();
          },
          err => {
            console.log(err);
            resolve();
          }
        );
      });
    })
  );

  return this.preloadSpriteImages_.then(
    () => (this.p5._predefinedSpriteAnimations = this.preloadedSprites)
  );
};

/**
 * Given a collection of animation metadata for the project, preload each
 * animation, loading it onto the p5 object for use by the setAnimation method
 * later.
 * @param {AnimationList} animationList
 * @param {Boolean} pauseAnimationsByDefault whether animations should be paused
 *
 * @return {Promise} promise that resolves when all animations are loaded
 */
P5Wrapper.prototype.preloadAnimations = function(
  animationList,
  pauseAnimationsByDefault
) {
  // Preload project animations as _predefinedSpriteAnimations:
  this.p5._predefinedSpriteAnimations = {};

  this.p5._pauseSpriteAnimationsByDefault = pauseAnimationsByDefault;
  return Promise.all(
    animationList.orderedKeys.map(key => {
      const props = animationList.propsByKey[key];
      const frameCount = allAnimationsSingleFrameSelector(getStore().getState())
        ? 1
        : props.frameCount;
      return new Promise(resolve => {
        const image = this.p5.loadImage(props.dataURI, () => {
          const spriteSheet = this.p5.loadSpriteSheet(
            image,
            props.frameSize.x,
            props.frameSize.y,
            frameCount
          );
          this.p5._predefinedSpriteAnimations[
            props.name
          ] = this.p5.loadAnimation(spriteSheet);
          this.p5._predefinedSpriteAnimations[props.name].looping =
            props.looping;
          this.p5._predefinedSpriteAnimations[props.name].frameDelay =
            props.frameDelay;
          resolve();
        });
      });
    })
  );
};
