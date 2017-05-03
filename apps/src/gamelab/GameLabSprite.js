import _ from 'lodash';

var jsInterpreter;
module.exports.injectJSInterpreter = function (jsi) {
  jsInterpreter = jsi;
};

/** @type {GameLabLevel} */
var level;
/**
 * Provide the current Game Lab level because it can customize default
 * sprite behaviors.
 * @param {!GameLabLevel} lvl
 */
module.exports.injectLevel = function (lvl) {
  level = lvl;
};

module.exports.createSprite = function (param1, param2, param3, param4, param5) {
  let animationName, x, y, width, height;
  if (typeof param1 === "string") {
    animationName = param1;
    x = param2;
    y = param3;
    width = param4;
    height = param5;
  } else {
    x = param1;
    y = param2;
    width = param3;
    height = param4;
  }
  /*
   * Copied code from p5play from createSprite()
   *
   * NOTE: this param not needed on this.Sprite() call as we're calling
   * through the bound constructor, which prepends the first arg.
   */
  var s = new this.Sprite(x, y, width, height);
  var p5Inst = this;
  addPropertyAliases(s);
  addMethodAliases(s);

  /*
   * @type {number}
   * @private
   * _horizontalStretch is the value to scale animation sprites in the X direction
   */
  s._horizontalStretch = 1;

  /*
   * @type {number}
   * @private
   * _verticalStretch is the value to scale animation sprites in the Y direction
   */
  s._verticalStretch = 1;

  s.setAnimation = function (animationName) {
    if (animationName === s.getAnimationLabel()) {
      return;
    }

    var animation = p5Inst.projectAnimations[animationName];
    if (typeof animation === 'undefined') {
      throw new Error('Unable to find an animation named "' + animationName +
          '".  Please make sure the animation exists.');
    }
    s.addAnimation(animationName, animation);
    s.changeAnimation(animationName);
    if (level.pauseAnimationsByDefault) {
      s.pause();
    }
  };

  s.frameDidChange = function () {
    return s.animation ? s.animation.frameChanged : false;
  };

  s.pointTo = function (x, y) {
    var yDelta = y - s.position.y;
    var xDelta = x - s.position.x;
    if (!isNaN(xDelta) && !isNaN(yDelta) && (xDelta !== 0 || yDelta !== 0)) {
      var radiansAngle = Math.atan2(yDelta, xDelta);
      s.rotation = 360 * radiansAngle / (2 * Math.PI);
    }
  };

  // The scale value should include the horizontal stretch for animations.
  s._getScaleX = function () {
    return s.scale * s._horizontalStretch;
  };

  // The scale value should include the vertical stretch for animations.
  s._getScaleY = function () {
    return s.scale * s._verticalStretch;
  };

  /*
   * @private
   * For game lab, don't update the animation sizes because all frames are the same size.
   */
  s._syncAnimationSizes = function (animations, currentAnimation) {};

  Object.defineProperty(s, 'frameDelay', {
    enumerable: true,
    get: function () {
      if (s.animation) {
        return s.animation.frameDelay;
      }
    },
    set: function (value) {
      if (s.animation) {
        s.animation.frameDelay = value;
      }
    }
  });

  // Overriding these allows users to set a width for
  // an animated sprite the same way they would an unanimated sprite.
  Object.defineProperty(s, 'width', {
    enumerable: true,
    configurable: true,
    get: function () {
      if (s._internalWidth === undefined) {
        return 100;
      } else if (s.animation) {
        return s._internalWidth * s._horizontalStretch;
      } else {
        return s._internalWidth;
      }
    },
    set: function (value) {
      if (s.animation) {
        s._horizontalStretch = value / s._internalWidth;
      } else {
        s._internalWidth = value;
      }
    }
  });

  // Overriding these allows users to set a height for
  // an animated sprite the same way they would an unanimated sprite.
  Object.defineProperty(s, 'height', {
    enumerable: true,
    configurable: true,
    get: function () {
      if (s._internalHeight === undefined) {
        return 100;
      } else if (s.animation) {
        return s._internalHeight * s._verticalStretch;
      } else {
        return s._internalHeight;
      }
    },
    set: function (value) {
      if (s.animation) {
        s._verticalStretch = value / s._internalHeight;
      } else {
        s._internalHeight =  value;
      }
    }
  });

  // p5.play stores width unscaled, but users in
  // Game Lab should have access to a scaled version.
  s.getScaledWidth = function () {
    return s.width * s.scale;
  };

  // p5.play stores height unscaled, but users in
  // Game Lab should have access to a scaled version.
  s.getScaledHeight = function () {
    return s.height * s.scale;
  };

  s.shapeColor = this.color(127, 127, 127);

  s._collideWith = _collideWith.bind(s, this);
  s._collideWithOne = _collideWithOne.bind(s, this);
  s.createGroupState = function (type, target, callback) {
    if (target instanceof Array) {
      // Colliding with a group.
      var state = jsInterpreter.getCurrentState();
      if (!state.__i) {
        state.__i = 0;
        state.__didCollide = false;
      }
      if (state.__i < target.size()) {
        if (!state.__subState) {
          // Before we call _collideWith (another stateful function), hang a __subState
          // off of state, so it can use that instead to track its state:
          state.__subState = { doneExec: true };
        }
        var didTouch = this._collideWith(type, target[state.__i], callback);
        if (state.__subState.doneExec) {
          state.__didCollide = didTouch || state.__didCollide;
          delete state.__subState;
          state.__i++;
        }
        state.doneExec = false;
      } else {
        state.doneExec = true;
        return state.__didCollide;
      }
    } else {
      return this._collideWith(type, target, callback);
    }
  };

  s.bounceOff = function (target, callback) {
    return this.createGroupState('bounceOff', target, callback);
  };

  /**
   * Returns whether or not this sprite will bounce or collide with another sprite
   * or group. Modifies the sprite's touching property object.
   * @method
   */
  s.isTouching = function (target) {
    return this.createGroupState('overlap', target);
  };

  // Overriding overlap, collide, displace, bounce, to work with our group states.
  s.overlap = function (target, callback) {
    return this.createGroupState('overlap', target, callback);
  };

  s.collide = function (target, callback) {
    return this.createGroupState('collide', target, callback);
  };

  s.displace = function (target, callback) {
    return this.createGroupState('displace', target, callback);
  };

  s.bounce = function (target, callback) {
    return this.createGroupState('bounce', target, callback);
  };

  s.depth = this.allSprites.maxDepth()+1;
  this.allSprites.add(s);

  /**
   * Plays/resumes the sprite's current animation.
   * If the animation is currently playing this has no effect.
   * If the animation has stopped at its last frame, this will start it over
   * at the beginning.
   */
  s.play = function () {
   // Normally this just sets the 'playing' flag without changing the animation
   // frame, which will cause the animation to continue on the next update().
   // If the animation is non-looping and is stopped at the last frame
   // we also rewind the animation to the beginning.
    if (!s.animation.looping && !s.animation.playing && s.animation.getFrame() === s.animation.images.length - 1) {
      s.animation.rewind();
    }
    s.animation.play();
  };

  // if an animation parameter was given, set it.
  if (animationName) {
    s.setAnimation(animationName);
  }
  return s;
};

/* eslint-disable */
/*
 * Override Sprite._collideWith so it can be called as a stateful nativeFunc by the
 * interpreter. This enables the native method to be called multiple times so
 * that it can go asynchronous every time it wants to execute a callback back
 * into interpreter code. The interpreter state object is retrieved by calling
 * jsInterpreter.getCurrentState().
 *
 * Additional properties can be set on the state object to track state across
 * the multiple executions. If the function wants to be called again, it should
 * set state.doneExec to false. When the function is complete and no longer
 * wants to be called in a loop by the interpreter, it should set state.doneExec
 * to true and return a value.
 */

/*
 * Copied code from p5play from Sprite() with targeted modifications that
 * use the additional state parameter to be compatible with the interpreter.
 */
var _collideWith = function (p5Inst, type, target, callback) {
  // Grab reference to p5.Sprite for instanceof check
  var Sprite = p5Inst.Sprite;

  // Stateful - get state and decide whether we're starting or resuming.
  var state = jsInterpreter.getCurrentState();
  if (state.__subState) {
    // If we're being called by another stateful function that hung a __subState
    // off of state, use that instead:
    state = state.__subState;
  }
  if (typeof state.__i === 'undefined') {
    // We've never called this before - start from the beginning.
    this.touching.left = false;
    this.touching.right = false;
    this.touching.top = false;
    this.touching.bottom = false;

    state.__i = 0;
    state.__result = false;
    state.__others = [];

    if (target instanceof Sprite) {
      state.__others.push(target);
    } else if (target instanceof Array) {
      if (p5Inst.quadTree !== undefined && p5Inst.quadTree.active) {
        state.__others = p5Inst.quadTree.retrieveFromGroup(this, target);
      }

      // If the quadtree is disabled -or- no sprites in this group are in the
      // quadtree yet (because their default colliders haven't been created)
      // we should just check all of them.
      if (state.__others.length === 0) {
        state.__others = target;
      }
    } else {
      throw('Error: overlap can only be checked between sprites or groups');
    }
  } else {
    state.__i++;
  }

  // Second half of this method: Check collision with _next_ Sprite in
  // state.__others and call callback if overlap happened.
  if (state.__i < state.__others.length) {
    state.__result = this._collideWithOne(type, state.__others[state.__i], callback) || state.__result;
    // Not done, unless we're on the last item in __others:
    state.doneExec = state.__i >= (state.__others.length - 1);
  } else {
    state.doneExec = true;
  }
  return state.__result;
};

/**
 * Helper collision method for colliding this sprite with one other sprite.
 *
 * Has the side effect of setting this.touching properties to TRUE if collisions
 * occur.
 *
 * This is copied from p5.play's Sprite class and has special modifcations
 * to change the behavior of certain collision types and add a new collision type.
 *
 * @private
 * @param {p5} p5Inst
 * @param {string} type - 'overlap', 'displace', 'collide' or 'bounce'
 *        +Code.org-specific modifictions:
 *        'bounceOff' is 'bounce' but with other treated as immovable.
 *        'collide' gets treated like 'bounce' when the other is immovable
 *            and using a restitution coefficient of zero.
 * @param {Sprite} other
 * @param {function} callback - if collision occurred
 * @return {boolean} true if a collision occurred
 */
function _collideWithOne(p5Inst, type, other, callback) {
  // Never collide with self
  if (other === this) {
    return false;
  }

  if (this.collider === undefined) {
    this.setDefaultCollider();
  }

  if (other.collider === undefined) {
    other.setDefaultCollider();
  }

  if (!this.collider || !other.collider) {
    // We were unable to create a collider for one of the sprites.
    // This usually means its animation is not available yet; it will be soon.
    // Don't collide for now.
    return false;
  }

  // Actually compute the overlap of the two colliders
  var displacement = this._findDisplacement(other);
  if (displacement.x === 0 && displacement.y === 0) {
    // These sprites are not overlapping.
    return false;
  }

  if (displacement.x > 0)
    this.touching.left = true;
  if (displacement.x < 0)
    this.touching.right = true;
  if (displacement.y < 0)
    this.touching.bottom = true;
  if (displacement.y > 0)
    this.touching.top = true;

  // Apply displacement out of collision
  if (type === 'displace' && !other.immovable) {
    other.position.sub(displacement);
  } else if ((type === 'collide' || type === 'bounce' || type === 'bounceOff') && !this.immovable) {
    this.position.add(displacement);
    this.previousPosition = p5Inst.createVector(this.position.x, this.position.y);
    this.newPosition = p5Inst.createVector(this.position.x, this.position.y);
    this.collider.updateFromSprite(this);
  }

  // Code.org Customizations:
  // Create special behaviors for certain collision types by temporarily
  // overriding type and sprite properties.
  // See another block near the end of this method that puts them back.
  var originalType = type;
  var originalThisImmovable = this.immovable;
  var originalOtherImmovable = other.immovable;
  var originalOtherRestitution = other.restitution;
  if (originalType === 'collide') {
    type = 'bounce';
    other.immovable = true;
    other.restitution = 0;
  } else if (originalType === 'bounceOff') {
    type = 'bounce';
    other.immovable = true;
  }

  // If this is a 'bounce' collision, determine the new velocities for each sprite
  if (type === 'bounce') {
    // We are concerned only with velocities parallel to the collision normal,
    // so project our sprite velocities onto that normal (captured in the
    // displacement vector) and use these throughout the calculation
    var thisInitialVelocity = p5.Vector.project(this.velocity, displacement);
    var otherInitialVelocity = p5.Vector.project(other.velocity, displacement);

    // We only care about relative mass values, so if one of the sprites
    // is considered 'immovable' treat the _other_ sprite's mass as zero
    // to get the correct results.
    var thisMass = this.mass;
    var otherMass = other.mass;
    if (this.immovable) {
      thisMass = 1;
      otherMass = 0;
    } else if (other.immovable) {
      thisMass = 0;
      otherMass = 1;
    }

    var combinedMass = thisMass + otherMass;
    var coefficientOfRestitution = this.restitution * other.restitution;
    var initialMomentum = p5.Vector.add(
      p5.Vector.mult(thisInitialVelocity, thisMass),
      p5.Vector.mult(otherInitialVelocity, otherMass)
    );
    var thisFinalVelocity = p5.Vector.sub(otherInitialVelocity, thisInitialVelocity)
      .mult(otherMass * coefficientOfRestitution)
      .add(initialMomentum)
      .div(combinedMass);
    var otherFinalVelocity = p5.Vector.sub(thisInitialVelocity, otherInitialVelocity)
      .mult(thisMass * coefficientOfRestitution)
      .add(initialMomentum)
      .div(combinedMass);
    // Remove velocity before and apply velocity after to both members.
    this.velocity.sub(thisInitialVelocity).add(thisFinalVelocity);
    other.velocity.sub(otherInitialVelocity).add(otherFinalVelocity);
  }

  // Code.org Customizations:
  // Restore sprite properties now that velocity changes have been made.
  // See another block before velocity changes that sets these up.
  type = originalType;
  this.immovable = originalThisImmovable;
  other.immovable = originalOtherImmovable;
  other.restitution = originalOtherRestitution;

  // Finally, for all collision types call the callback and record
  // that collision occurred.
  if (typeof callback === 'function') {
    callback.call(this, this, other);
  }
  return true;
}

/* eslint-enable */

/**
 * Map from existing (deep) property names to new alias names we want to use
 * in GameLab.
 * @type {{string: string}}
 */
const ALIASED_PROPERTIES = {
  'position.x': 'x',
  'position.y': 'y',
  'velocity.x': 'velocityX',
  'velocity.y': 'velocityY',
  'life': 'lifetime',
  "restitution": 'bounciness'
};

/**
 * Alias p5.play sprite properties to new names
 * @param {Sprite} sprite
 */
function addPropertyAliases(sprite) {
  for (const originalPropertyName in ALIASED_PROPERTIES) {
    const newPropertyName = ALIASED_PROPERTIES[originalPropertyName];
    Object.defineProperty(sprite, newPropertyName, {
      enumerable: true,
      get: function () {
        return _.get(sprite, originalPropertyName);
      },
      set: function (value) {
        _.set(sprite, originalPropertyName, value);
      }
    });
  }
}

/**
 * Map from existing (deep) method names to new alias names we want to use
 * in GameLab.
 * @type {{string: string}}
 */
const ALIASED_METHODS = {
  'remove': 'destroy',
  'setSpeed': 'setSpeedAndDirection',
  'animation.changeFrame': 'setFrame',
  'animation.nextFrame': 'nextFrame',
  'animation.previousFrame': 'previousFrame',
  'animation.stop': 'pause'
};

/**
 * Alias p5.play sprite methods to new names
 * @param {Sprite} sprite
 */
function addMethodAliases(sprite) {
  for (const originalMethodName in ALIASED_METHODS) {
    sprite[ALIASED_METHODS[originalMethodName]] = function () {
      const originalMethod = _.get(sprite, originalMethodName);
      // The method must be bound against the second-to-last thing in the path;
      // or against the sprite itself, if there is no second-to-last thing.
      const bindTargetPath = originalMethodName.split('.').slice(0, -1).join('.');
      const bindTarget = _.get(sprite, bindTargetPath) || sprite;
      if (originalMethod) {
        originalMethod.apply(bindTarget, arguments);
      }
    };
  }
}
