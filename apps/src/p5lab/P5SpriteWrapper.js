var jsInterpreter;
module.exports.injectJSInterpreter = function(jsi) {
  jsInterpreter = jsi;
};

var createWithDebug;
module.exports.setCreateWithDebug = function(debug) {
  createWithDebug = debug;
};

module.exports.createSprite = function(x, y, width, height) {
  /*
   * Copied code from p5play from createSprite()
   *
   * NOTE: this param not needed on this.Sprite() call as we're calling
   * through the bound constructor, which prepends the first arg.
   */
  const s = new this.Sprite(x, y, width, height);
  if (createWithDebug) {
    s.debug = true;
  }

  // Define these native properties that may be called by the Sprite class
  // (ensures hasOwnProperty() will return true, signalling to CustomMarshaler
  // that we need this to be stored on the "native" object)
  s.onMouseOver = undefined;
  s.onMouseOut = undefined;
  s.onMousePressed = undefined;
  s.onMouseReleased = undefined;

  // Attach our custom/override methods to the sprite
  s._collideWith = _collideWith.bind(s, this);
  s._collideWithOne = _collideWithOne.bind(s, this);
  s.createGroupState = createGroupState;
  // Overriding bounceOff, isTouching, overlap, collide, displace, and bounce
  // to work with our group states.
  s.bounceOff = bounceOff;
  s.isTouching = isTouching;
  s.overlap = overlap;
  s.collide = collide;
  s.displace = displace;
  s.bounce = bounce;

  s.depth = this.allSprites.maxDepth() + 1;
  this.allSprites.add(s);

  return s;
};

function createGroupState(type, target, callback) {
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
        state.__subState = {doneExec_: true};
      }
      var didTouch = this._collideWith(type, target[state.__i], callback);
      if (state.__subState.doneExec_) {
        state.__didCollide = didTouch || state.__didCollide;
        delete state.__subState;
        state.__i++;
      }
      state.doneExec_ = false;
    } else {
      state.doneExec_ = true;
      return state.__didCollide;
    }
  } else {
    return this._collideWith(type, target, callback);
  }
}

/**
 * Returns whether or not this sprite will bounce or collide with another sprite
 * or group. Modifies the sprite's touching property object.
 * @method
 */
function isTouching(target) {
  return this.createGroupState('overlap', target);
}

function overlap(target, callback) {
  return this.createGroupState('overlap', target, callback);
}

function collide(target, callback) {
  return this.createGroupState('collide', target, callback);
}

function displace(target, callback) {
  return this.createGroupState('displace', target, callback);
}

function bounce(target, callback) {
  return this.createGroupState('bounce', target, callback);
}

function bounceOff(target, callback) {
  return this.createGroupState('bounceOff', target, callback);
}

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
 * set state.doneExec_ to false. When the function is complete and no longer
 * wants to be called in a loop by the interpreter, it should set state.doneExec_
 * to true and return a value.
 */

/*
 * Copied code from p5play from Sprite() with targeted modifications that
 * use the additional state parameter to be compatible with the interpreter.
 */
var _collideWith = function(p5Inst, type, target, callback) {
  if (this.removed) {
    return false;
  }

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
      throw 'Error: overlap can only be checked between sprites or groups';
    }
  } else {
    state.__i++;
  }

  // Second half of this method: Check collision with _next_ Sprite in
  // state.__others and call callback if overlap happened.
  if (state.__i < state.__others.length) {
    state.__result =
      this._collideWithOne(type, state.__others[state.__i], callback) ||
      state.__result;
    // Not done, unless we're on the last item in __others:
    state.doneExec_ = state.__i >= state.__others.length - 1;
  } else {
    state.doneExec_ = true;
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
 *        'isTouching' is the same as 'overlap' (no callback expected)
 *        'bounceOff' is 'bounce' but with other treated as immovable.
 *        'collide' gets treated like 'bounce' when the other is immovable
 *            and using a restitution coefficient of zero.
 * @param {Sprite} other
 * @param {function} callback - if collision occurred
 * @return {boolean} true if a collision occurred
 */
function _collideWithOne(p5Inst, type, other, callback) {
  // Never collide with self or removed sprites.
  if (other === this || other.removed) {
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

  if (displacement.x > 0) this.touching.left = true;
  if (displacement.x < 0) this.touching.right = true;
  if (displacement.y < 0) this.touching.bottom = true;
  if (displacement.y > 0) this.touching.top = true;

  // Apply displacement out of collision
  if (type === 'displace' && !other.immovable) {
    other.position.sub(displacement);
  } else if (
    (type === 'collide' || type === 'bounce' || type === 'bounceOff') &&
    !this.immovable
  ) {
    this.position.add(displacement);
    this.previousPosition = p5Inst.createVector(
      this.position.x,
      this.position.y
    );
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
    var thisFinalVelocity = p5.Vector.sub(
      otherInitialVelocity,
      thisInitialVelocity
    )
      .mult(otherMass * coefficientOfRestitution)
      .add(initialMomentum)
      .div(combinedMass);
    var otherFinalVelocity = p5.Vector.sub(
      thisInitialVelocity,
      otherInitialVelocity
    )
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

  // Finally, for all collision types except 'isTouching', call the callback
  // and record that collision occurred.
  if (typeof callback === 'function' && type !== 'isTouching') {
    callback.call(this, this, other);
  }
  return true;
}

/* eslint-enable */
