var jsInterpreter;

module.exports.injectJSInterpreter = function (jsi) {
  jsInterpreter = jsi;
};

module.exports.createSprite = function (x, y, width, height) {
  /*
   * Copied code from p5play from createSprite()
   *
   * NOTE: this param not needed on this.Sprite() call as we're calling
   * through the bound constructor, which prepends the first arg.
   */
  var s = new this.Sprite(x, y, width, height);
  var p5Inst = this;

  s.setAnimation = function (animationName) {
    var animation = p5Inst.projectAnimations[animationName];
    if (typeof animation === 'undefined') {
      throw new Error('Unable to find an animation named "' + animationName +
          '".  Please make sure the animation exists.');
    }
    s.addAnimation(animationName, animation);
    s.changeAnimation(animationName);
  };

  s.setFrame = function (frame) {
    if (s.animation) {
      s.animation.setFrame(frame);
    }
  };

  s.nextFrame = function () {
    if (s.animation) {
      s.animation.nextFrame();
    }
  };

  s.previousFrame = function () {
    if (s.animation) {
      s.animation.previousFrame();
    }
  };

  s.play = function () {
    if (s.animation) {
      s.animation.play();
    }
  };

  s.pause = function () {
    if (s.animation) {
      s.animation.stop();
    }
  };

  s.frameDidChange = function () {
    return s.animation ? s.animation.frameChanged : false;
  };

  s.setColor = function (colorString) {
    s.shapeColor = colorString;
  };

  s.destroy = function () {
    s.remove();
  };

  s.pointTo = function (x, y) {
    var yDelta = y - s.position.y;
    var xDelta = x - s.position.x;
    if (!isNaN(xDelta) && !isNaN(yDelta) && (xDelta !== 0 || yDelta !== 0)) {
      var radiansAngle = Math.atan2(yDelta, xDelta);
      s.rotation = 360 * radiansAngle / (2 * Math.PI);
    }
  };

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

  Object.defineProperty(s, 'x', {
    enumerable: true,
    get: function () {
      return s.position.x;
    },
    set: function (value) {
      s.position.x = value;
    }
  });

  Object.defineProperty(s, 'y', {
    enumerable: true,
    get: function () {
      return s.position.y;
    },
    set: function (value) {
      s.position.y = value;
    }
  });

  Object.defineProperty(s, 'velocityX', {
    enumerable: true,
    get: function () {
      return s.velocity.x;
    },
    set: function (value) {
      s.velocity.x = value;
    }
  });

  Object.defineProperty(s, 'velocityY', {
    enumerable: true,
    get: function () {
      return s.velocity.y;
    },
    set: function (value) {
      s.velocity.y = value;
    }
  });

  Object.defineProperty(s, 'lifetime', {
    enumerable: true,
    get: function () {
      return s.life;
    },
    set: function (value) {
      s.life = value;
    }
  });

  s.shapeColor = this.color(127, 127, 127);
  s.AABBops = AABBops.bind(s, this);
  s.bounceOff = s.AABBops.bind(s, 'bounceOff');
  s.isTouching = isTouching.bind(s, this);
  s.depth = this.allSprites.maxDepth()+1;
  this.allSprites.add(s);

  return s;
};

/* eslint-disable */
/*
 * Override Sprite.AABBops so it can be called as a stateful nativeFunc by the
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
 * use the additional state parameter
 */
var AABBops = function (p5Inst, type, target, callback) {

  // These 3 are utility p5 functions that don't depend on p5 instance state in
  // order to work properly, so we'll go ahead and make them easy to
  // access without needing to bind them to a p5 instance.
  var abs = p5.prototype.abs;
  var round = p5.prototype.round;
  var quadTree = p5Inst.quadTree;

  var createVector = p5Inst.createVector.bind(p5Inst);
  var AABB = p5Inst.AABB.bind(p5Inst);

  // These 2 are not bound as they are used for instanceof checks:
  var Sprite = p5Inst.Sprite;
  var CircleCollider = p5Inst.CircleCollider;

  var state = jsInterpreter.getCurrentState();
  if (state.__subState) {
    // If we're being called by another stateful function that hung a __subState
    // off of state, use that instead:
    state = state.__subState;
  }
  var result = false;
  if (typeof state.__i === 'undefined') {
    state.__i = 0;

    this.touching.left = false;
    this.touching.right = false;
    this.touching.top = false;
    this.touching.bottom = false;

    //if single sprite turn into array anyway
    state.__others = [];

    if(target instanceof Sprite)
      state.__others.push(target);
    else if(target instanceof Array)
    {
      if(quadTree !== undefined && quadTree.active)
        state.__others = quadTree.retrieveFromGroup( this, target);

      if(state.__others.length === 0)
        state.__others = target;

    }
    else
      throw('Error: overlap can only be checked between sprites or groups');

  } else {
    state.__i++;
  }
  if (state.__i < state.__others.length) {
    var i = state.__i;

    if(this !== state.__others[i] && !this.removed) //you can check collisions within the same group but not on itself
    {
      var displacement;
      var other = state.__others[i];

      if(this.collider === undefined)
        this.setDefaultCollider();

      if(other.collider === undefined)
        other.setDefaultCollider();

      /*
      if(this.colliderType=="default" && animations[currentAnimation]!=null)
      {
        print("busted");
        return false;
      }*/
      if(this.collider != undefined && other.collider != undefined)
      {
      if(type === 'overlap')  {
          var over;

          //if the other is a circle I calculate the displacement from here
          if(this.collider instanceof CircleCollider)
              over = other.collider.overlap(this.collider);
          else
              over = this.collider.overlap(other.collider);

          if(over)
          {

            result = true;

            if(callback !== undefined && typeof callback == 'function')
              callback.call(this, this, other);
          }
        }
      else if(type === 'collide' || type === 'bounce' || type == 'bounceOff')
        {
          displacement = createVector(0, 0);

          var otherImmovable = other.immovable || type === 'bounceOff';

          //if the sum of the speed is more than the collider i may
          //have a tunnelling problem
          var tunnelX = abs(this.velocity.x-other.velocity.x) >= other.collider.extents.x/2 && round(this.deltaX - this.velocity.x) === 0;

          var tunnelY = abs(this.velocity.y-other.velocity.y) >= other.collider.size().y/2 && round(this.deltaY - this.velocity.y) === 0;


          if(tunnelX || tunnelY)
          {
            //instead of using the colliders I use the bounding box
            //around the previous position and current position
            //this is regardless of the collider type

            //the center is the average of the coll centers
            var c = createVector(
              (this.position.x+this.previousPosition.x)/2,
              (this.position.y+this.previousPosition.y)/2);

            //the extents are the distance between the coll centers
            //plus the extents of both
            var e = createVector(
              abs(this.position.x -this.previousPosition.x) + this.collider.extents.x,
              abs(this.position.y -this.previousPosition.y) + this.collider.extents.y);

            /*
             * NOTE: this param not needed on AABB() call as we're calling
             * through the bound constructor, which prepends the first arg.
             */
            var bbox = new AABB(c, e, this.collider.offset);

            //bbox.draw();

            if(bbox.overlap(other.collider))
            {
              if(tunnelX) {

                //entering from the right
                if(this.velocity.x < 0)
                  displacement.x = other.collider.right() - this.collider.left() + 1;
                else if(this.velocity.x > 0 )
                  displacement.x = other.collider.left() - this.collider.right() -1;
                }

              if(tunnelY) {
                //from top
                if(this.velocity.y > 0)
                  displacement.y = other.collider.top() - this.collider.bottom() - 1;
                else if(this.velocity.y < 0 )
                  displacement.y = other.collider.bottom() - this.collider.top() + 1;

                }

            }//end overlap

          }
          else //non tunnel overlap
          {

            //if the other is a circle I calculate the displacement from here
            //and reverse it
            if(this.collider instanceof CircleCollider)
              {
              displacement = other.collider.collide(this.collider).mult(-1);
              }
            else
              displacement = this.collider.collide(other.collider);

          }

          if(displacement.x !== 0 || displacement.y !== 0 )
          {
            var newVelX1, newVelY1, newVelX2, newVelY2;

            if(!this.immovable)
            {
              this.position.add(displacement);
              this.previousPosition = createVector(this.position.x, this.position.y);
              this.newPosition = createVector(this.position.x, this.position.y);
            }

            if(displacement.x > 0)
              this.touching.left = true;
            if(displacement.x < 0)
              this.touching.right = true;
            if(displacement.y < 0)
              this.touching.bottom = true;
            if(displacement.y > 0)
              this.touching.top = true;

            if(type === 'bounce' || type === 'bounceOff')
            {
              if (this.collider instanceof CircleCollider && other.collider instanceof CircleCollider) {
                var dx1 = p5.Vector.sub(this.position, other.position);
                var dx2 = p5.Vector.sub(other.position, this.position);
                var magnitude = dx1.magSq();
                var totalMass = this.mass + other.mass;
                var m1 = 0, m2 = 0;
                if (this.immovable) {
                  m2 = 2;
                } else if (otherImmovable) {
                  m1 = 2;
                } else {
                  m1 = 2 * other.mass / totalMass;
                  m2 = 2 * this.mass / totalMass;
                }
                var newVel1 = dx1.mult(m1 * p5.Vector.sub(this.velocity, other.velocity).dot(dx1) / magnitude);
                var newVel2 = dx2.mult(m2 * p5.Vector.sub(other.velocity, this.velocity).dot(dx2) / magnitude);

                this.velocity.sub(newVel1.mult(this.restitution));
                other.velocity.sub(newVel2.mult(other.restitution));
              } else {
                if(otherImmovable)
                {
                  newVelX1 = -this.velocity.x+other.velocity.x;
                  newVelY1 = -this.velocity.y+other.velocity.y;
                }
                else
                {
                  newVelX1 = (this.velocity.x * (this.mass - other.mass) + (2 * other.mass * other.velocity.x)) / (this.mass + other.mass);
                  newVelY1 = (this.velocity.y * (this.mass - other.mass) + (2 * other.mass * other.velocity.y)) / (this.mass + other.mass);
                  newVelX2 = (other.velocity.x * (other.mass - this.mass) + (2 * this.mass * this.velocity.x)) / (this.mass + other.mass);
                  newVelY2 = (other.velocity.y * (other.mass - this.mass) + (2 * this.mass * this.velocity.y)) / (this.mass + other.mass);
                }

                //var bothCircles = (this.collider instanceof CircleCollider &&
                //                   other.collider  instanceof CircleCollider);

                //if(this.touching.left || this.touching.right || this.collider instanceof CircleCollider)

                //print(displacement);

                if(abs(displacement.x)>abs(displacement.y))
                {


                  if(!this.immovable)
                  {
                    this.velocity.x = newVelX1*this.restitution;

                  }

                  if(!otherImmovable)
                    other.velocity.x = newVelX2*other.restitution;

                }
                //if(this.touching.top || this.touching.bottom || this.collider instanceof CircleCollider)
                if(abs(displacement.x)<abs(displacement.y))
                {

                  if(!this.immovable)
                    this.velocity.y = newVelY1*this.restitution;

                  if(!otherImmovable)
                    other.velocity.y = newVelY2*other.restitution;
                }
              }
            }
            //else if(type == "collide")
              //this.velocity = createVector(0,0);

            if(callback !== undefined && typeof callback === 'function')
              callback.call(this, this, other);

            result = true;
          }



        }
        else if(type === 'displace') {

          //if the other is a circle I calculate the displacement from here
          //and reverse it
          if(this.collider instanceof CircleCollider)
            displacement = other.collider.collide(this.collider).mult(-1);
          else
            displacement = this.collider.collide(other.collider);


          if(displacement.x !== 0 || displacement.y !== 0 )
          {
            other.position.sub(displacement);

            if(displacement.x > 0)
              this.touching.left = true;
            if(displacement.x < 0)
              this.touching.right = true;
            if(displacement.y < 0)
              this.touching.bottom = true;
            if(displacement.y > 0)
              this.touching.top = true;

            if(callback != undefined && typeof callback == "function")
              callback.call(this, this, other);

            result = true;
          }
        }
      }//end collider exists
    }
    // Not done, unless we're on the last item in __others:
    state.doneExec = state.__i >= (state.__others.length - 1);
  } else {
    state.doneExec = true;
  }

  return result;
};

/**
 * Returns whether or not this sprite will bounce or collide with another sprite
 * or group. Modifies the sprite's touching property object.
 * @method
 */

var isTouching = function (p5Inst, target) {

  /*
   * This code is a subset of the original AABBops method. It needs to be kept in
   * sync with p5play's method, much like our stateful async version of AABBops
   * above.
   */

  // These 3 are utility p5 functions that don't depend on p5 instance state in
  // order to work properly, so we'll go ahead and make them easy to
  // access without needing to bind them to a p5 instance.
  var abs = p5.prototype.abs;
  var round = p5.prototype.round;
  var quadTree = p5Inst.quadTree;

  var createVector = p5Inst.createVector.bind(p5Inst);
  var AABB = p5Inst.AABB.bind(p5Inst);

  // These 2 are not bound as they are used for instanceof checks:
  var Sprite = p5Inst.Sprite;
  var CircleCollider = p5Inst.CircleCollider;

  this.touching.left = false;
  this.touching.right = false;
  this.touching.top = false;
  this.touching.bottom = false;

  var result = false;

  //if single sprite turn into array anyway
  var others = [];

  if(target instanceof Sprite)
    others.push(target);
  else if(target instanceof Array)
  {
    if(quadTree !== undefined && quadTree.active)
      others = quadTree.retrieveFromGroup( this, target);

    if(others.length === 0)
      others = target;

  }
  else
    throw('Error: isTouching can only be checked between sprites or groups');

    for(var i=0; i<others.length; i++)
      if(this !== others[i] && !this.removed) //you can check collisions within the same group but not on itself
      {
        var displacement;
        var other = others[i];

        if(this.collider === undefined)
          this.setDefaultCollider();

        if(other.collider === undefined)
          other.setDefaultCollider();

        if(this.collider !== undefined && other.collider !== undefined)
        {
          displacement = createVector(0, 0);

          //if the sum of the speed is more than the collider i may
          //have a tunnelling problem
          var tunnelX = abs(this.velocity.x-other.velocity.x) >= other.collider.extents.x/2 && round(this.deltaX - this.velocity.x) === 0;

          var tunnelY = abs(this.velocity.y-other.velocity.y) >= other.collider.size().y/2 && round(this.deltaY - this.velocity.y) === 0;


          if(tunnelX || tunnelY)
          {
            //instead of using the colliders I use the bounding box
            //around the previous position and current position
            //this is regardless of the collider type

            //the center is the average of the coll centers
            var c = createVector(
                                 (this.position.x+this.previousPosition.x)/2,
                                 (this.position.y+this.previousPosition.y)/2);

            //the extents are the distance between the coll centers
            //plus the extents of both
            var e = createVector(
                                 abs(this.position.x -this.previousPosition.x) + this.collider.extents.x,
                                 abs(this.position.y -this.previousPosition.y) + this.collider.extents.y);

            var bbox = new AABB(p5Inst, c, e, this.collider.offset);

            //bbox.draw();

            if(bbox.overlap(other.collider))
            {
              if(tunnelX) {

                //entering from the right
                if(this.velocity.x < 0)
                  displacement.x = other.collider.right() - this.collider.left() + 1;
                else if(this.velocity.x > 0 )
                  displacement.x = other.collider.left() - this.collider.right() -1;
              }

              if(tunnelY) {
                //from top
                if(this.velocity.y > 0)
                  displacement.y = other.collider.top() - this.collider.bottom() - 1;
                else if(this.velocity.y < 0 )
                  displacement.y = other.collider.bottom() - this.collider.top() + 1;

              }

            }//end overlap

          }
          else //non tunnel overlap
          {
            /* First, check for adjacency using overlap method.
             *
             * We do this to ensure isTouching returns true for cases when
             * bounce, collide would return true and also when overlap would
             * return true.
             *
             * NOTE: this.touching will remain all false in the adjacent case,
             * but the function will return true.
             */

            //if the other is a circle I calculate the displacement from here
            //and reverse it
            if (this.collider instanceof CircleCollider) {
              if (other.collider.overlap(this.collider)) {
                result = true;
                displacement = other.collider.collide(this.collider).mult(-1);
              }
            }
            else if (this.collider.overlap(other.collider)) {
              result = true;
              displacement = this.collider.collide(other.collider);
            }
          }

          if(displacement.x !== 0 || displacement.y !== 0)
          {
            if(displacement.x > 0)
              this.touching.left = true;
            if(displacement.x < 0)
              this.touching.right = true;
            if(displacement.y < 0)
              this.touching.bottom = true;
            if(displacement.y > 0)
              this.touching.top = true;
          }
        }//end collider exists
      }//end this != others[i] && !this.removed

  return result;
};

/* eslint-enable */

