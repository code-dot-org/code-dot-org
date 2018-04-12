import {getStore} from '../redux';
import {allAnimationsSingleFrameSelector} from './animationListModule';
var gameLabSprite = require('./GameLabSprite');
var gameLabGroup = require('./GameLabGroup');
import * as assetPrefix from '../assetManagement/assetPrefix';
var GameLabWorld = require('./GameLabWorld');

const defaultFrameRate = 30;

/**
 * An instantiable GameLabP5 class that wraps p5 and p5play and patches it in
 * specific places to enable GameLab functionality
 */
var GameLabP5 = function () {
  this.p5 = null;
  this.gameLabWorld = null;
  this.p5decrementPreload = null;
  this.p5eventNames = [
    'mouseMoved', 'mouseDragged', 'mousePressed', 'mouseReleased',
    'mouseClicked', 'mouseWheel',
    'keyPressed', 'keyReleased', 'keyTyped'
  ];
  this.p5specialFunctions = ['preload', 'draw', 'setup'].concat(this.p5eventNames);
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

  this.setLoop = (shouldLoop) => {
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

module.exports = GameLabP5;

GameLabP5.baseP5loadImage = null;

/**
 * Initialize this GameLabP5 instance.
 *
 * @param {!Object} options
 * @param {!Function} options.gameLab instance of parent GameLab object
 * @param {Number} [options.scale] Scale ratio of containing element (<1 is small)
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
  this.scale = options.scale || 1;

  var self = this;

  // Override p5.loadImage so we can modify the URL path param
  if (!GameLabP5.baseP5loadImage) {
    GameLabP5.baseP5loadImage = window.p5.prototype.loadImage;
    window.p5.prototype.loadImage = function (path) {
      // Make sure to pass all arguments through to loadImage, which can get
      // wrapped and take additional arguments during preload.
      arguments[0] = assetPrefix.fixPath(path);
      return GameLabP5.baseP5loadImage.apply(this, arguments);
    };
  }

  // Override p5.redraw to make it two-phase after userDraw()
  window.p5.prototype.redraw = function () {
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
  window.p5.prototype.afterUserDraw = function () {
    /*
     * Copied code from p5 from redraw()
     */
    const postMethods = this._registeredMethods.post;
    for (let i = 0; i < postMethods.length; i++) {
      postMethods[i].call(this);
    }
  };

  // Disable fullscreen() method:
  window.p5.prototype.fullscreen = function (val) {
    return false;
  };

  // Modify p5 to handle CSS transforms (scale) and ignore out-of-bounds
  // positions before reporting touch coordinates
  //
  // NOTE: _updateNextTouchCoords() is nearly identical, but calls a modified
  // getTouchInfo() function below that scales the touch postion with the play
  // space and can return undefined
  window.p5.prototype._updateNextTouchCoords = function (e) {
    var x = this.touchX;
    var y = this.touchY;
    if (e.type === 'mousedown' || e.type === 'mousemove' ||
        e.type === 'mouseup' || !e.touches) {
      x = this.mouseX;
      y = this.mouseY;
    } else {
      if (this._curElement !== null) {
        var touchInfo = getTouchInfo(this._curElement.elt, e, 0);
        if (touchInfo) {
          x = touchInfo.x;
          y = touchInfo.y;
        }

        var touches = [];
        var touchIndex = 0;
        for (var i = 0; i < e.touches.length; i++) {
          // Only some touches are valid - only push valid touches into the
          // array for the `touches` property.
          touchInfo = getTouchInfo(this._curElement.elt, e, i);
          if (touchInfo) {
            touches[touchIndex] = touchInfo;
            touchIndex++;
          }
        }
        this._setProperty('touches', touches);
      }
    }
    this._setProperty('touchX', x);
    this._setProperty('touchY', y);
    if (!this._hasTouchInteracted) {
      // For first draw, make previous and next equal
      this._updateTouchCoords();
      this._setProperty('_hasTouchInteracted', true);
    }
  };

  // NOTE: returns undefined if the position is outside of the valid range
  function getTouchInfo(canvas, e, i) {
    i = i || 0;
    var rect = canvas.getBoundingClientRect();
    var touch = e.touches[i] || e.changedTouches[i];
    var xPos = touch.clientX - rect.left;
    var yPos = touch.clientY - rect.top;
    if (xPos >= 0 && xPos < rect.width && yPos >= 0 && yPos < rect.height) {
      return {
        x: Math.round(xPos / self.scale),
        y: Math.round(yPos / self.scale),
        id: touch.identifier
      };
    }
  }

  // Modify p5 to handle CSS transforms (scale) and ignore out-of-bounds
  // positions before reporting mouse coordinates
  //
  // NOTE: _updateNextMouseCoords() is nearly identical, but calls a modified
  // getMousePos() function below that scales the mouse position with the play
  // space and can return undefined.
  window.p5.prototype._updateNextMouseCoords = function (e) {
    var x = this.mouseX;
    var y = this.mouseY;
    if (e.type === 'touchstart' || e.type === 'touchmove' ||
        e.type === 'touchend' || e.touches) {
      x = this.touchX;
      y = this.touchY;
    } else if (this._curElement !== null) {
      var mousePos = getMousePos(this._curElement.elt, e);
      if (mousePos) {
        x = mousePos.x;
        y = mousePos.y;
      }
    }
    this._setProperty('mouseX', x);
    this._setProperty('mouseY', y);
    this._setProperty('winMouseX', e.pageX);
    this._setProperty('winMouseY', e.pageY);
    if (!this._hasMouseInteracted) {
      // For first draw, make previous and next equal
      this._updateMouseCoords();
      this._setProperty('_hasMouseInteracted', true);
    }
  };

  // NOTE: returns undefined if the position is outside of the valid range
  function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    var xPos = evt.clientX - rect.left;
    var yPos = evt.clientY - rect.top;
    if (xPos >= 0 && xPos < rect.width && yPos >= 0 && yPos < rect.height) {
      return {
        x: Math.round(xPos / self.scale),
        y: Math.round(yPos / self.scale)
      };
    }
  }

  // Add new p5 methods:
  window.p5.prototype.mouseDidMove = function () {
    return this.pmouseX !== this.mouseX || this.pmouseY !== this.mouseY;
  };

  window.p5.prototype.mouseIsOver = function (sprite) {
    if (!sprite) {
      return false;
    }

    if (!sprite.collider) {
      sprite.setDefaultCollider();
    }

    var mousePosition;
    if (this.camera.active) {
      mousePosition = this.createVector(this.camera.mouseX, this.camera.mouseY);
    } else {
      mousePosition = this.createVector(this.mouseX, this.mouseY);
    }

    return sprite.collider.overlap(new window.p5.PointCollider(mousePosition));
  };

  window.p5.prototype.mousePressedOver = function (sprite) {
    return this.mouseIsPressed && this.mouseIsOver(sprite);
  };

  var styleEmpty = 'rgba(0,0,0,0)';

  window.p5.Renderer2D.prototype.regularPolygon = function (x, y, sides, size, rotation) {
    var ctx = this.drawingContext;
    var doFill = this._doFill, doStroke = this._doStroke;
    if (doFill && !doStroke) {
      if (ctx.fillStyle === styleEmpty) {
        return this;
      }
    } else if (!doFill && doStroke) {
      if (ctx.strokeStyle === styleEmpty) {
        return this;
      }
    }
    if (sides < 3) {
      return;
    }
    ctx.beginPath();
    ctx.moveTo(x + size * Math.cos(rotation), y + size * Math.sin(rotation));
    for (var i = 1; i < sides; i++) {
      var angle = rotation + (i * 2 * Math.PI / sides);
      ctx.lineTo(x + size * Math.cos(angle), y + size * Math.sin(angle));
    }
    ctx.closePath();
    if (doFill) {
      ctx.fill();
    }
    if (doStroke) {
      ctx.stroke();
    }
  };

  window.p5.prototype.regularPolygon = function (x, y, sides, size, rotation) {
    if (!this._renderer._doStroke && !this._renderer._doFill) {
      return this;
    }
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; ++i) {
      args[i] = arguments[i];
    }

    if (typeof rotation === 'undefined') {
      rotation = -(Math.PI / 2);
      if (0 === sides % 2) {
        rotation += Math.PI / sides;
      }
    } else if (this._angleMode === this.DEGREES) {
      rotation = this.radians(rotation);
    }

    // NOTE: only implemented for non-3D
    if (!this._renderer.isP3D) {
      this._validateParameters(
        'regularPolygon',
        args,
        [
          ['Number', 'Number', 'Number', 'Number'],
          ['Number', 'Number', 'Number', 'Number', 'Number']
        ]
      );
      this._renderer.regularPolygon(
        args[0],
        args[1],
        args[2],
        args[3],
        rotation
      );
    }
    return this;
  };

  window.p5.Renderer2D.prototype.shape = function () {
    var ctx = this.drawingContext;
    var doFill = this._doFill, doStroke = this._doStroke;
    if (doFill && !doStroke) {
      if (ctx.fillStyle === styleEmpty) {
        return this;
      }
    } else if (!doFill && doStroke) {
      if (ctx.strokeStyle === styleEmpty) {
        return this;
      }
    }
    var numCoords = arguments.length / 2;
    if (numCoords < 1) {
      return;
    }
    ctx.beginPath();
    ctx.moveTo(arguments[0], arguments[1]);
    for (var i = 1; i < numCoords; i++) {
      ctx.lineTo(arguments[i * 2], arguments[i * 2 + 1]);
    }
    ctx.closePath();
    if (doFill) {
      ctx.fill();
    }
    if (doStroke) {
      ctx.stroke();
    }
  };

  window.p5.prototype.shape = function () {
    if (!this._renderer._doStroke && !this._renderer._doFill) {
      return this;
    }
    // NOTE: only implemented for non-3D
    if (!this._renderer.isP3D) {
      // TODO: call this._validateParameters, once it is working in p5.js and
      // we understand if it can be used for var args functions like this
      this._renderer.shape.apply(this._renderer, arguments);
    }
    return this;
  };

  // Save the original implementation to allow for optional parameters.
  if (!window.p5.prototype.originalEllipse_) {
    window.p5.prototype.originalEllipse_ = window.p5.prototype.ellipse;
    window.p5.prototype.ellipse = function (x, y, w, h) {
      w = (w) ? w : 50;
      h = (w && !h) ? w : h;
      this.originalEllipse_(x, y, w, h);
    };
  }

  // Save the original implementation to allow for optional parameters.
  if (!window.p5.prototype.originalRect_) {
    window.p5.prototype.originalRect_ = window.p5.prototype.rect;
    window.p5.prototype.rect = function (x, y, w, h) {
      w = (w) ? w : 50;
      h = (w && !h) ? w : h;
      this.originalRect_(x, y, w, h);
    };
  }

  window.p5.prototype.rgb = function (r, g, b, a) {
    // convert a from 0 to 255 to 0 to 1
    if (!a) {
      a = 1;
    }
    a = a * 255;

    return this.color(r, g, b, a);
  };

  window.p5.prototype.createGroup = function () {
    return new this.Group();
  };

  // Override p5.createSprite so we can replace the AABBops() function and add
  // some new methods that are animation shortcuts:
  window.p5.prototype.createSprite = gameLabSprite.createSprite;

  // Override p5.Group so we can override the methods that take callback
  // parameters
  var baseGroupConstructor = window.p5.prototype.Group;
  window.p5.prototype.Group = gameLabGroup.Group.bind(null, baseGroupConstructor);

  window.p5.prototype.gamelabPreload = function () {
    this.p5decrementPreload = window.p5._getDecrementPreload.apply(this.p5, arguments);
  }.bind(this);

  // Returns a constant for a mouse state given a string.
  GameLabP5.prototype._clickKeyFromString = function (buttonCode) {
    if (this.CLICK_KEY[buttonCode]) {
      return this.CLICK_KEY[buttonCode];
    } else {
      return buttonCode;
    }
  };

  // Map of strings to constants for mouse states.
  GameLabP5.prototype.CLICK_KEY = {
    'leftButton': window.p5.prototype.LEFT,
    'rightButton': window.p5.prototype.RIGHT,
    'centerButton': window.p5.prototype.CENTER
  };

  // Overrride p5.play so we can use strings in addition to constants.
  const p5IsMouseButtonInState = window.p5.prototype._isMouseButtonInState;
  window.p5.prototype._isMouseButtonInState = function (buttonCode, state) {
    return p5IsMouseButtonInState.call(this.p5, this._clickKeyFromString(buttonCode), state);
  }.bind(this);

  window.p5.prototype.createEdgeSprites = function () {
    this.leftEdge = this.createSprite(-50, 200, 100, 400);
    this.rightEdge = this.createSprite(450, 200, 100, 400);
    this.topEdge = this.createSprite(200, -50, 400, 100);
    this.bottomEdge = this.createSprite(200, 450, 400, 100);

    this.edges = this.createGroup();
    this.edges.add(this.leftEdge);
    this.edges.add(this.rightEdge);
    this.edges.add(this.topEdge);
    this.edges.add(this.bottomEdge);

    return this.edges;
  };
};

/**
 * Reset GameLabP5 to its initial state. Called before each time it is used.
 */
GameLabP5.prototype.resetExecution = function () {

  gameLabSprite.setCreateWithDebug(false);

  if (this.p5) {
    this.p5.remove();
    this.p5 = null;
    this.p5decrementPreload = null;
    this.gameLabWorld = null;
    this.running = false;
  }

  // Important to reset these after this.p5 has been removed above
  this.drawInProgress = false;
  this.setupInProgress = false;
};

/**
 * Register a p5 event handler function. The provided function replaces the
 * method stored on our p5 instance.
 */
GameLabP5.prototype.registerP5EventHandler = function (eventName, handler) {
  this.p5[eventName] = handler;
};

GameLabP5.prototype.changeStepSpeed = function (stepSpeed) {
  this.stepSpeed = stepSpeed;
  this.setP5FrameRate();
};

GameLabP5.prototype.drawDebugSpriteColliders = function () {
  if (this.p5) {
    this.p5.allSprites.forEach(sprite => {
      sprite.display(true);
    });
  }
};

/**
 * Instantiate a new p5 and start execution
 */
GameLabP5.prototype.startExecution = function () {
  this.running = true;
  new window.p5(function (p5obj) {
      this.p5 = p5obj;
      this.p5.useQuadTree(false);
      this.setP5FrameRate();
      this.gameLabWorld = new GameLabWorld(p5obj);

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
      p5obj._setup = function () {
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

      p5obj._setupEpiloguePhase1 = function () {
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
            delete(k.dataset.hidden);
          }
        }
      }.bind(p5obj);

      p5obj._setupEpiloguePhase2 = function () {
        /*
         * Modified code from p5 _setup()
         */
        this._setupDone = true;

      }.bind(p5obj);

      p5obj.preload = function () {
        // Create new camera.isActive() that maps to the readonly property:
        p5obj.camera.isActive = function () {
          return p5obj.camera.active;
        };

        // Create new camera.x and camera.y properties to alias camera.position:
        Object.defineProperty(p5obj.camera, 'x', {
          enumerable: true,
          get: function () {
            return p5obj.camera.position.x;
          },
          set: function (value) {
            p5obj.camera.position.x = value;
          }
        });

        Object.defineProperty(p5obj.camera, 'y', {
          enumerable: true,
          get: function () {
            return p5obj.camera.position.y;
          },
          set: function (value) {
            p5obj.camera.position.y = value;
          }
        });

        p5obj.angleMode(p5obj.DEGREES);
        // Set default frameRate to 30 instead of 60.
        p5obj.frameRate(defaultFrameRate);

        if (!this.onPreload()) {
          // If onPreload() returns false, it means that the preload phase has
          // not completed, so we need to grab increment p5's preloadCount by
          // calling the gamelabPreload() method.

          // Call our gamelabPreload() to force _start/_setup to wait.
          p5obj.gamelabPreload();
        }
      }.bind(this);

      p5obj.setup = function () {
        p5obj.createCanvas(400, 400);
        p5obj.fill(p5obj.color(127, 127, 127));

        this.onSetup();
      }.bind(this);

      p5obj.draw = this.onDraw.bind(this);

      this.onExecutionStarting();

    }.bind(this),
    'divGameLab');
};

/**
 * Called when the preload phase is complete. When a distinct setup() method is
 * provided, a student's global code must finish executing before this phase is
 * done. This allows us to release our "preload" count reference in p5, which
 * means that setup() can begin.
 */
GameLabP5.prototype.notifyPreloadPhaseComplete = function () {
  if (this.p5decrementPreload) {
    this.p5decrementPreload();
    this.p5decrementPreload = null;
  }
};

GameLabP5.prototype.notifyKeyCodeDown = function (keyCode) {
  // Synthesize an event and send it to the internal p5 handler for keydown
  if (this.p5) {
    this.p5._onkeydown({ which: keyCode });
  }
};

GameLabP5.prototype.notifyKeyCodeUp = function (keyCode) {
  // Synthesize an event and send it to the internal p5 handler for keyup
  if (this.p5) {
    this.p5._onkeyup({ which: keyCode });
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
    pRotationZ: this.p5,
    leftEdge: this.p5,
    rightEdge: this.p5,
    topEdge: this.p5,
    bottomEdge: this.p5,
    edges: this.p5
  };
};

GameLabP5.prototype.getCustomMarshalBlockedProperties = function () {
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
    'loadXML',
  ];
};

GameLabP5.prototype.getCustomMarshalObjectList = function () {
  return [
    { instance: GameLabWorld },
    {
      instance: this.p5.Sprite,
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
    { instance: this.p5.Camera },
    { instance: this.p5.Animation },
    { instance: window.p5.Vector },
    { instance: window.p5.Color },
    { instance: window.p5.Image },
    { instance: window.p5.Renderer },
    { instance: window.p5.Graphics },
    { instance: window.p5.Font },
    { instance: window.p5.Table },
    { instance: window.p5.TableRow },
    // TODO: Maybe add collider types here?
  ];
};

/**
 * Names every property on the p5 instance except for those on custom marshal
 * lists or blacklisted properties.
 * @returns {Array.<string>}
 */
GameLabP5.prototype.getMarshallableP5Properties = function () {
  const blockedProps = this.getCustomMarshalBlockedProperties();
  const globalCustomMarshalProps = this.getCustomMarshalGlobalProperties();

  const propNames = [];
  for (const prop in this.p5) {
    if (-1 === blockedProps.indexOf(prop) &&
        -1 === this.p5specialFunctions.indexOf(prop) &&
        !globalCustomMarshalProps[prop]) {
      propNames.push(prop);
    }
  }
  return propNames;
};

GameLabP5.prototype.getGlobalPropertyList = function () {
  const propList = {};

  // Include every property on the p5 instance in the global property list
  // except those on the custom marshal lists:
  const p5PropertyNames = this.getMarshallableP5Properties();
  for (const prop of p5PropertyNames) {
    propList[prop] = [this.p5[prop], this.p5];
  }

  // Create a 'p5' object in the global namespace:
  propList.p5 = [{ Vector: window.p5.Vector }, window];

  // Create a 'Game' object in the global namespace
  // to make older blocks compatible:
  propList.Game = [this.gameLabWorld, this];

  // Create a 'World' object in the global namespace:
  propList.World = [this.gameLabWorld, this];

  return propList;
};

/**
 * Return the current frame rate
 */
GameLabP5.prototype.getFrameRate = function () {
  return this.p5 ? this.p5.frameRate() : 0;
};

/**
 * Mark all current and future sprites as debug=true.
 * @param {boolean} debugSprites - Enable or disable debug flag on all sprites
 */
GameLabP5.prototype.debugSprites = function (debugSprites) {
  if (this.p5) {
    gameLabSprite.setCreateWithDebug(debugSprites);
    this.p5.allSprites.forEach(sprite => {
      sprite.debug = debugSprites;
    });
  }
};

GameLabP5.prototype.afterDrawComplete = function () {
  this.p5.afterUserDraw();
  this.p5.afterRedraw();
};

/**
 * Setup has started and the debugger may be at a breakpoint. Run Phase1 of
 * of the epilogue so the student can see what they may be drawing in their
 * setup code while debugging.
 */
GameLabP5.prototype.afterSetupStarted = function () {
  this.p5._setupEpiloguePhase1();
};

/**
 * Setup has completed. Run Phase1 and Phase2 of the epilogue. It is safe to
 * call _setupEpiloguePhase1() multiple times in the event that it may already
 * have been called.
 */
GameLabP5.prototype.afterSetupComplete = function () {
  this.p5._setupEpiloguePhase1();
  this.p5._setupEpiloguePhase2();
};

/**
 * Given a collection of animation metadata for the project, preload each
 * animation, loading it onto the p5 object for use by the setAnimation method
 * later.
 * @param {AnimationList} animationList
 *
 * @return {Promise} promise that resolves when all animations are loaded
 */
GameLabP5.prototype.preloadAnimations = function (animationList) {
  // Preload project animations:
  this.p5.projectAnimations = {};
  return Promise.all(animationList.orderedKeys.map(key => {
    const props = animationList.propsByKey[key];
    const frameCount = allAnimationsSingleFrameSelector(getStore().getState()) ? 1 : props.frameCount;
    return new Promise(resolve => {
      const image = this.p5.loadImage(props.dataURI, () => {
        const spriteSheet = this.p5.loadSpriteSheet(
            image,
            props.frameSize.x,
            props.frameSize.y,
            frameCount
        );
        this.p5.projectAnimations[props.name] = this.p5.loadAnimation(spriteSheet);
        this.p5.projectAnimations[props.name].looping = props.looping;
        this.p5.projectAnimations[props.name].frameDelay = props.frameDelay;
        resolve();
      });
    });
  }));
};
