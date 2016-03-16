'use strict';
var gameLabSprite = require('./GameLabSprite');
var assetPrefix = require('../assetManagement/assetPrefix');

/**
 * An instantiable GameLabP5 class that wraps p5 and p5play and patches it in
 * specific places to enable GameLab functionality
 */
var GameLabP5 = function () {
  this.p5 = null;
  this.p5decrementPreload = null;
  this.p5eventNames = [
    'mouseMoved', 'mouseDragged', 'mousePressed', 'mouseReleased',
    'mouseClicked', 'mouseWheel',
    'keyPressed', 'keyReleased', 'keyTyped'
  ];
  this.p5specialFunctions = ['preload', 'draw', 'setup'].concat(this.p5eventNames);
};

module.exports = GameLabP5;

GameLabP5.baseP5loadImage = null;

/**
 * Initialize this GameLabP5 instance.
 *
 * @param {!Object} options
 * @param {!Function} options.gameLab instance of parent GameLab object
 * @param {!Function} options.onExecutionStarting callback to run during p5 init
 * @param {!Function} options.onPreload callback to run during preload()
 * @param {!Function} options.onSetup callback to run during setup()
 * @param {!Function} options.onDraw callback to run during each draw()
 */
GameLabP5.prototype.init = function (options) {

  this.onExecutionStarting = options.onExecutionStarting;
  this.onPreload = options.onPreload;
  this.onSetup = options.onSetup;
  this.onDraw = options.onDraw;

  window.p5.prototype.setupGlobalMode = function () {
    /*
     * Copied code from p5 for no-sketch Global mode
     */
    var p5 = window.p5;

    this._isGlobal = true;
    // Loop through methods on the prototype and attach them to the window
    for (var p in p5.prototype) {
      if(typeof p5.prototype[p] === 'function') {
        var ev = p.substring(2);
        if (!this._events.hasOwnProperty(ev)) {
          window[p] = p5.prototype[p].bind(this);
        }
      } else {
        window[p] = p5.prototype[p];
      }
    }
    // Attach its properties to the window
    for (var p2 in this) {
      if (this.hasOwnProperty(p2)) {
        window[p2] = this[p2];
      }
    }
  };

  // Override p5.loadImage so we can modify the URL path param
  if (!GameLabP5.baseP5loadImage) {
    GameLabP5.baseP5loadImage = window.p5.prototype.loadImage;
    window.p5.prototype.loadImage = function (path, successCallback, failureCallback) {
      path = assetPrefix.fixPath(path);
      return GameLabP5.baseP5loadImage.call(this, path, successCallback, failureCallback);
    };
  }

  // Override p5.redraw to make it two-phase after userDraw()
  window.p5.prototype.redraw = function () {
    /*
     * Copied code from p5 from redraw()
     */
    var userSetup = this.setup || window.setup;
    var userDraw = this.draw || window.draw;
    if (typeof userDraw === 'function') {
      this.push();
      if (typeof userSetup === 'undefined') {
        this.scale(this.pixelDensity, this.pixelDensity);
      }
      var self = this;
      this._registeredMethods.pre.forEach(function (f) {
        f.call(self);
      });
      userDraw();
    }
  };

  // Create 2nd phase function afterUserDraw()
  window.p5.prototype.afterUserDraw = function () {
    var self = this;
    /*
     * Copied code from p5 from redraw()
     */
    this._registeredMethods.post.forEach(function (f) {
      f.call(self);
    });
    this.pop();
  };

  // Override p5.createSprite so we can replace the AABBops() function
  window.p5.prototype.createSprite = function(x, y, width, height) {
    /*
     * Copied code from p5play from createSprite()
     */
    var s = new window.Sprite(x, y, width, height);
    s.AABBops = gameLabSprite.AABBops;
    s.depth = window.allSprites.maxDepth()+1;
    window.allSprites.add(s);
    return s;
  };

  // Override window.Group so we can override the methods that take callback
  // parameters
  var baseGroupConstructor = window.Group;
  window.Group = function () {
    var array = baseGroupConstructor();

    /*
     * Create new helper called callAABBopsForAll() which can be called as a
     * stateful nativeFunc by the interpreter. This enables the native method to
     * be called multiple times so that it can go asynchronous every time it
     * (or any native function that it calls, such as AABBops) wants to execute
     * a callback back into interpreter code. The interpreter state object is
     * retrieved by calling JSInterpreter.getCurrentState().
     *
     * Additional properties can be set on the state object to track state
     * across the multiple executions. If the function wants to be called again,
     * it should set state.doneExec to false. When the function is complete and
     * no longer wants to be called in a loop by the interpreter, it should set
     * state.doneExec to true and return a value.
     */
    array.callAABBopsForAll = function(type, target, callback) {
      var state = options.gameLab.JSInterpreter.getCurrentState();
      if (!state.__i) {
        state.__i = 0;
      }
      if (state.__i < this.size()) {
        if (!state.__subState) {
          // Before we call AABBops (another stateful function), hang a __subState
          // off of state, so it can use that instead to track its state:
          state.__subState = { doneExec: true };
        }
        this.get(state.__i).AABBops(type, target, callback);
        if (state.__subState.doneExec) {
          // Note: ignoring return value from each AABBops() call
          delete state.__subState;
          state.__i++;
        }
        state.doneExec = false;
      } else {
        state.doneExec = true;
      }
    };

    // Replace these four methods that take callback parameters to use the new
    // callAABBopsForAll() helper:

    array.overlap = function(target, callback) {
      this.callAABBopsForAll("overlap", target, callback);
    };

    array.collide = function(target, callback) {
      this.callAABBopsForAll("collide", target, callback);
    };

    array.displace = function(target, callback) {
      this.callAABBopsForAll("displace", target, callback);
    };

    array.bounce = function(target, callback) {
      this.callAABBopsForAll("bounce", target, callback);
    };

    return array;
  };

};

/**
 * Reset GameLabP5 to its initial state. Called before each time it is used.
 */
GameLabP5.prototype.resetExecution = function () {

  if (this.p5) {
    this.p5.remove();
    this.p5 = null;
    this.p5decrementPreload = null;

    /*
     * Copied code from various p5/p5play init code
     */

    // Clear registered methods on the prototype:
    for (var member in window.p5.prototype._registeredMethods) {
      delete window.p5.prototype._registeredMethods[member];
    }
    window.p5.prototype._registeredMethods = { pre: [], post: [], remove: [] };
    delete window.p5.prototype._registeredPreloadMethods.gamelabPreload;

    window.p5.prototype.allSprites = new window.Group();
    window.p5.prototype.spriteUpdate = true;

    window.p5.prototype.camera = new window.Camera(0, 0, 1);
    window.p5.prototype.camera.init = false;

    window.p5.prototype.quadTree = new window.Quadtree({
      x: 0,
      y: 0,
      width: 0,
      height: 0
    }, 4);

    //keyboard input
    window.p5.prototype.registerMethod('pre', window.p5.prototype.readPresses);

    //automatic sprite update
    window.p5.prototype.registerMethod('pre', window.p5.prototype.updateSprites);

    //quadtree update
    window.p5.prototype.registerMethod('post', window.updateTree);

    //camera push and pop
    window.p5.prototype.registerMethod('pre', window.cameraPush);
    window.p5.prototype.registerMethod('post', window.cameraPop);

  }

  // Important to reset these after this.p5 has been removed above
  this.drawInProgress = false;
  this.setupInProgress = false;

  window.p5.prototype.gamelabPreload = function () {
    this.p5decrementPreload = window.p5._getDecrementPreload.apply(this.p5, arguments);
  }.bind(this);
};

/**
 * Instantiate a new p5 and start execution
 */
GameLabP5.prototype.startExecution = function () {
  new window.p5(function (p5obj) {
      this.p5 = p5obj;

      p5obj.registerPreloadMethod('gamelabPreload', window.p5.prototype);

      // Overload _draw function to make it two-phase
      p5obj._draw = function () {
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
        if (!this._loop ||
            time_since_last >= target_time_between_frames - epsilon) {

          //mandatory update values(matrixs and stack) for 3d
          if(this._renderer.isP3D){
            this._renderer._update();
          }

          this._setProperty('frameCount', this.frameCount + 1);
          this._updateMouseCoords();
          this._updateTouchCoords();
          this.redraw();
        } else {
          this._drawEpilogue();
        }
      }.bind(p5obj);

      p5obj.afterRedraw = function () {
        /*
         * Copied code from p5 _draw()
         */
        this._frameRate = 1000.0/(this._thisFrameTime - this._lastFrameTime);
        this._lastFrameTime = this._thisFrameTime;

        this._drawEpilogue();
      }.bind(p5obj);

      p5obj._drawEpilogue = function () {
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
          this._setupEpilogue();
        }

      }.bind(p5obj);

      p5obj._setupEpilogue = function () {
        /*
         * Copied code from p5 _setup()
         */

        // // unhide hidden canvas that was created
        // this.canvas.style.visibility = '';
        // this.canvas.className = this.canvas.className.replace('p5_hidden', '');

        // unhide any hidden canvases that were created
        var reg = new RegExp(/(^|\s)p5_hidden(?!\S)/g);
        var canvases = document.getElementsByClassName('p5_hidden');
        for (var i = 0; i < canvases.length; i++) {
          var k = canvases[i];
          k.style.visibility = '';
          k.className = k.className.replace(reg, '');
        }
        this._setupDone = true;

      }.bind(p5obj);

      // Do this after we're done monkeying with the p5obj instance methods:
      p5obj.setupGlobalMode();

      window.preload = function () {
        // Call our gamelabPreload() to force _start/_setup to wait.
        window.gamelabPreload();

        /*
         * p5 "preload methods" were modified before this preload function was
         * called and substituted with wrapped version that increment a preload
         * count and will later decrement a preload count upon async load
         * completion. Since p5 is running in global mode, it only wrapped the
         * methods on the window object. We need to place the wrapped methods on
         * the p5 object as well before we marshal to the interpreter
         */
        for (var method in this.p5._preloadMethods) {
          this.p5[method] = window[method];
        }

        this.onPreload();

      }.bind(this);
      window.setup = function () {
        /*
         * p5 "preload methods" have now been restored and the wrapped version
         * are no longer in use. Since p5 is running in global mode, it only
         * restored the methods on the window object. We need to restore the
         * methods on the p5 object to match
         */
        for (var method in this.p5._preloadMethods) {
          this.p5[method] = window[method];
        }

        p5obj.createCanvas(400, 400);

        this.onSetup();

      }.bind(this);

      window.draw = this.onDraw.bind(this);

      this.onExecutionStarting();

    }.bind(this),
    'divGameLab');
};

/**
 * Called when all global code is done executing. This allows us to release
 * our "preload" count reference in p5, which means that setup() can begin.
 */
GameLabP5.prototype.notifyUserGlobalCodeComplete = function () {
  if (this.p5decrementPreload) {
    this.p5decrementPreload();
    this.p5decrementPreload = null;
  }
};

GameLabP5.prototype.getCustomMarshalGlobalProperties = function () {
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
    pRotationZ: this.p5
  };
};

GameLabP5.prototype.getCustomMarshalObjectList = function () {
  return [
    {
      instance: window.Sprite,
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
    { instance: window.p5 },
    { instance: window.Camera },
    { instance: window.Animation },
    { instance: window.p5.Vector },
    { instance: window.p5.Color },
    { instance: window.p5.Image },
    { instance: window.p5.Renderer },
    { instance: window.p5.Graphics },
    { instance: window.p5.Font },
    { instance: window.p5.Table },
    { instance: window.p5.TableRow },
    { instance: window.p5.Element },
  ];
};

GameLabP5.prototype.getGlobalPropertyList = function () {

  var propList = {};

  // Include every property on the p5 instance in the global property list:
  for (var prop in this.p5) {
    propList[prop] = [ this.p5[prop], this.p5 ];
  }
  // And the Group constructor from p5play:
  propList.Group = [ window.Group, window ];
  // And also create a 'p5' object in the global namespace:
  propList.p5 = [ { Vector: window.p5.Vector }, window ];

  return propList;
};

/**
 * Return the current frame rate
 */
GameLabP5.prototype.getFrameRate = function () {
  return this.p5 ? this.p5.frameRate() : 0;
};

GameLabP5.prototype.afterDrawComplete = function () {
  this.p5.afterUserDraw();
  this.p5.afterRedraw();
};

GameLabP5.prototype.afterSetupComplete = function () {
  this.p5._setupEpilogue();
};
