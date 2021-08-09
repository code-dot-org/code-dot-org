//This is the original library for the setupSim block that prints "collected" messages. Not translatable.

// Setup sim
function setupSim(
  s1number,
  s1costume,
  s1speed,
  s2number,
  s2costume,
  s2speed,
  s3number,
  s3costume,
  s3speed
) {
    if(!World.collisions){
      World.collisions = {};
      World.s3ToDelete = [];
      World.sprite1score = 0;
      World.sprite2score = 0;
    }


  // Wandering behavior at a certain speed, will be added to both s1 and s2 sprites.
  function movementBehavior(speed) {
    return function(spriteId) {
      if (randomNumber(0, 5) == 0) {
        changePropBy(spriteId, 'direction', randomNumber(-25, 25));
      }
      moveForward(spriteId, speed);
      if (isTouchingEdges(spriteId)) {
        edgesDisplace(spriteId);
        changePropBy(spriteId, 'direction', randomNumber(135, 225));
      }
    };
  }

  // Initialize sprites
  var counter_i = 0;
  for (counter_i = 0; counter_i < s1number; counter_i++) {
    makeNewSpriteAnon(s1costume, randomLocation());
  }
  addBehaviorSimple({costume: s1costume}, new Behavior(movementBehavior(s1speed)));

  for (counter_i = 0; counter_i < s2number; counter_i++) {
    makeNewSpriteAnon(s2costume, randomLocation());
  }
  addBehaviorSimple({costume: s2costume}, new Behavior(movementBehavior(s2speed)));

  for (counter_i = 0; counter_i < s3number; counter_i++) {
    makeNewSpriteAnon(s3costume, randomLocation());
  }
  setProp({costume: s3costume}, 'scale', 50);


    
  /**
  * We want to be able to randomize which sprite gets the point in the case of a tie. So the approach here is
  * to use checkTouching() to detect all the collisions, but delay until the next frame to actually give a point
  * and remove the s3 sprite. I'm using World.collisions to keep track of which s3 sprites should be deleted. The
  * format is an object whose keys are the ids of s3 sprites, and the value is a list indicating which sprites are
  * touching the given s3 sprite.
  *
  * Then to actually remove the s3 sprites and keep track of the score, I'm using a behavior. I have the behavior
  * attached to sprite id 0, but it doesn't really matter which sprite (as long as it's not an s3 sprite that
  * might get deleted). A behavior is just the simplest way to add a snippet of code that will get executed each frame.
  * The behavior goes through each s3 to delete and randomly chooses one element from its corresponding list to be
  * the sprite that "wins" the tie. (If there's only one item in the list, it means there was no tie, and that sprite
  * wins by default.) Then it just tallies the score, deletes the s3 sprites, and checks whether the
  * simulation should end. The one-frame delay isn't really noticeable since frames are so fast.
  */

  checkTouching('while', {costume: s1costume}, {costume: s3costume}, function(extraArgs) {
    if (World.collisions[extraArgs.objectSprite] == undefined) {
      // We don't have any recorded collisions for this s3 sprite yet. Add it to the collisions map and
      // to the list of s3 to delete next tick.
      World.collisions[extraArgs.objectSprite] = [];
      World.s3ToDelete.push(extraArgs.objectSprite);
    }
    World.collisions[extraArgs.objectSprite].push(s1costume);
  });

  checkTouching('while', {costume: s2costume}, {costume: s3costume}, function(extraArgs) {
    if (World.collisions[extraArgs.objectSprite] == undefined) {
      // We don't have any recorded collisions for this s3 sprite yet. Add it to the collisions map and
      // to the list of s3 to delete next tick.
      World.collisions[extraArgs.objectSprite] = [];
      World.s3ToDelete.push(extraArgs.objectSprite);
    }
    World.collisions[extraArgs.objectSprite].push(s2costume);
  });

  function collectBehavior() {
    for (var s3_counter = 0; s3_counter < World.s3ToDelete.length; s3_counter++) {
      var s3_sprite = World.s3ToDelete[s3_counter];
      var collidedSprites = World.collisions[s3_sprite];
      // Randomly pick one "winner" for the collision.
      var winnerIndex = randomNumber(0, collidedSprites.length - 1);
      if (collidedSprites[winnerIndex] == s1costume) {
        World.sprite1score += 1;
        printText(s1costume + ' has collected ' + World.sprite1score);
      }
      if (collidedSprites[winnerIndex] == s2costume) {
        World.sprite2score += 1;
        printText(s2costume + ' has collected ' + World.sprite2score);
      }
      destroy({id: s3_sprite});
    }
    // Reset collisions and s3ToDelete before the next tick
    World.collisions = {};
    World.s3ToDelete = [];
    checkSimulationEnd();
  }
  // We just need to run collectBehavior() each tick, doesn't actually matter which sprite it's attached to,
  // as long as it's not one of the s3 sprites that might get destroyed at some point.
  addBehaviorSimple({id: 0}, new Behavior(collectBehavior));

  function checkSimulationEnd() {
    if (countByAnimation({costume: s3costume}) === 0) {
      destroy({costume: s1costume});
      destroy({costume: s2costume});
      printText('The simulation has ended after ' + World.seconds + ' seconds');
      printText(s1costume + ' has collected ' + World.sprite1score);
      printText(s2costume + ' has collected ' + World.sprite2score);
    }
  }
}

other.push(setupSim);