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

var jsInterpreter;

module.exports.injectJSInterpreter = function (jsi) {
  jsInterpreter = jsi;
};

/*
 * Copied code from p5play from Sprite() with targeted modifications that
 * use the additional state parameter
 */
module.exports.AABBops = function(type, target, callback) {

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
      if(quadTree != undefined && quadTree.active)
        state.__others = quadTree.retrieveFromGroup( this, target);

      if(state.__others.length == 0)
        state.__others = target;

    }
    else
      throw("Error: overlap can only be checked between sprites or groups");

  } else {
    state.__i++;
  }
  if (state.__i < state.__others.length) {
    var i = state.__i;

    if(this != state.__others[i] && !this.removed) //you can check collisions within the same group but not on itself
    {
      var other = state.__others[i];

      if(this.collider == undefined)
        this.setDefaultCollider();

      if(other.collider == undefined)
        other.setDefaultCollider();

      /*
      if(this.colliderType=="default" && animations[currentAnimation]!=null)
      {
        print("busted");
        return false;
      }*/
      if(this.collider != undefined && other.collider != undefined)
      {
      if(type=="overlap")  {
          var over;

          //if the other is a circle I calculate the displacement from here
          if(this.collider instanceof CircleCollider)
              over = other.collider.overlap(this.collider);
          else
              over = this.collider.overlap(other.collider);

          if(over)
          {

            result = true;

            if(callback != undefined && typeof callback == "function")
              callback.call(this, this, other);
          }
        }
      else if(type=="collide" || type == "bounce")
        {
          var displacement = createVector(0,0);

          //if the sum of the speed is more than the collider i may
          //have a tunnelling problem
          var tunnelX = abs(this.velocity.x-other.velocity.x) >= other.collider.extents.x/2 && round(this.deltaX - this.velocity.x) == 0;

          var tunnelY = abs(this.velocity.y-other.velocity.y) >=  other.collider.size().y/2  && round(this.deltaY - this.velocity.y) == 0;


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

          if(displacement.x == 0 &&  displacement.y == 0 )
            result = false;
          else
          {

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

            if(type == "bounce")
            {
              if(other.immovable)
              {
                var newVelX1 = -this.velocity.x+other.velocity.x;
                var newVelY1 = -this.velocity.y+other.velocity.y;
              }
              else
              {
                //
                var newVelX1 = (this.velocity.x * (this.mass - other.mass) + (2 * other.mass * other.velocity.x)) / (this.mass + other.mass);

                var newVelY1 = (this.velocity.y * (this.mass - other.mass) + (2 * other.mass * other.velocity.y)) / (this.mass + other.mass);

                var newVelX2 = (other.velocity.x * (other.mass - this.mass) + (2 * this.mass * this.velocity.x)) / (this.mass + other.mass);

                var newVelY2 = (other.velocity.y * (other.mass - this.mass) + (2 * this.mass * this.velocity.y)) / (this.mass + other.mass);
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

                if(!other.immovable)
                  other.velocity.x = newVelX2*other.restitution;

              }
              //if(this.touching.top || this.touching.bottom || this.collider instanceof CircleCollider)
              if(abs(displacement.x)<abs(displacement.y))
              {

                if(!this.immovable)
                  this.velocity.y = newVelY1*this.restitution;

                if(!other.immovable)
                  other.velocity.y = newVelY2*other.restitution;
              }
            }
            //else if(type == "collide")
              //this.velocity = createVector(0,0);

            if(callback != undefined && typeof callback == "function")
              callback.call(this, this, other);

            result = true;
          }



        }
        else if(type=="displace")  {

          //if the other is a circle I calculate the displacement from here
          //and reverse it
          if(this.collider instanceof CircleCollider)
            displacement = other.collider.collide(this.collider).mult(-1);
          else
            displacement = this.collider.collide(other.collider);


          if(displacement.x == 0 &&  displacement.y == 0 )
            result = false;
          else
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
