//This is the new (2021) library that supports the setupSim block without any printing by drawing a scoreboard instead.

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
      World.s1costume=s1costume;
      World.s2costume=s2costume;
      World.s3costume=s3costume;
      World.endTime=0;
    }

    //Draw the scoreboard
    push();
    var box1x=0;
    var box1y=350;
    var box2x=200;
    var box2y=350;
    var boxWidth=200;
    var boxHeight=50;
    var scaler;
    fill("rgba(0,0,0,0.5)");
    rect(box1x,box1y,boxWidth,boxHeight);
    rect(box2x,box2y,boxWidth,boxHeight);
    var s1sprite = createSprite(box1x+(boxHeight/2), box1y+(boxHeight/2));
    s1sprite.setAnimation(World.s1costume);
    if(s1sprite.height>s1sprite.width){
      scaler=s1sprite.width/s1sprite.height;
      s1sprite.height=boxHeight*0.75;
      s1sprite.width=s1sprite.height*scaler;
    } else {
      scaler=s1sprite.height/s1sprite.width;
      s1sprite.width=boxHeight*0.75;
      s1sprite.height=s1sprite.width*scaler;
    }
    drawSprite(s1sprite);
    s1sprite.destroy();
    var s2sprite = createSprite(box2x+(boxHeight/2), box2y+(boxHeight/2));
    s2sprite.setAnimation(World.s2costume);
    if(s2sprite.height>s2sprite.width){
      scaler=s2sprite.width/s2sprite.height;
      s2sprite.height=boxHeight*0.75;
      s2sprite.width=s2sprite.height*scaler;
    } else {
      scaler=s2sprite.height/s2sprite.width;
      s2sprite.width=boxHeight*0.75;
      s2sprite.height=s2sprite.width*scaler;
    }
    drawSprite(s2sprite);
    s2sprite.destroy();
    var s3sprite = createSprite(box1x+(boxHeight*5/4), box1y+(boxHeight/2));
    s3sprite.setAnimation(World.s3costume);
    if(s3sprite.height>s3sprite.width){
      scaler=s3sprite.width/s3sprite.height;
      s3sprite.height=boxHeight*0.375;
      s3sprite.width=s3sprite.height*scaler;
    } else {
      scaler=s3sprite.height/s3sprite.width;
      s3sprite.width=boxHeight*0.375;
      s3sprite.height=s3sprite.width*scaler;
    }
    drawSprite(s3sprite);
    s3sprite.destroy();
    var s3sprite2 = createSprite(box2x+(boxHeight*5/4), box2y+(boxHeight/2));
    s3sprite2.setAnimation(World.s3costume);
    if(s3sprite2.height>s3sprite2.width){
      scaler=s3sprite2.width/s3sprite2.height;
      s3sprite2.height=boxHeight*0.375;
      s3sprite2.width=s3sprite2.height*scaler;
    } else {
      scaler=s3sprite2.height/s3sprite2.width;
      s3sprite2.width=boxHeight*0.375;
      s3sprite2.height=s3sprite2.width*scaler;
    }
    drawSprite(s3sprite2);
    s3sprite2.destroy();
    stroke("white");
    fill("white");
    textAlign(LEFT, CENTER);
    textSize(boxHeight/2);
    text(World.sprite1score,box1x+(boxHeight*3/2), box1y+(boxHeight/2));
    text(World.sprite2score,box2x+(boxHeight*3/2), box2y+(boxHeight/2));
    pop();

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
  setProp({costume: s3costume}, 'scale', 40);


    
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
        //printText(s1costume + ' has collected ' + World.sprite1score);
      }
      if (collidedSprites[winnerIndex] == s2costume) {
        World.sprite2score += 1;
        //printText(s2costume + ' has collected ' + World.sprite2score);
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
      //printText('The simulation has ended after ' + World.seconds + ' seconds');
      //printText(s1costume + ' has collected ' + World.sprite1score);
      //printText(s2costume + ' has collected ' + World.sprite2score);
      World.endTime=World.seconds;
    }
  }

    //draw the timer
    var timerTime=0;
    if(World.endTime){
      timerTime=World.endTime;
    }else{
      timerTime=World.seconds;
    }
    push();
    var timerX=375;
    var timerY=40;
    noStroke();
    fill("white");
    if(World.endTime){fill("rgba(0,0,0,0.2)");}
    ellipse(timerX,timerY,32,32);
    stroke("white");
    if(World.endTime){stroke("rgba(0,0,0,0.2)");}
    strokeWeight(7);
    line(timerX,timerY-22,timerX,timerY-10);
     stroke("black");
    strokeWeight(3);
    line(timerX,timerY-20,timerX,timerY-10);
    ellipse(timerX, timerY, 25, 25);
    fill("black");
    noStroke();
    var angle=timerTime%60*6;
    angle-=90;
    arc(timerX,timerY,18,18,270,angle+10);
    stroke("white");
    textAlign(RIGHT, CENTER);
    strokeWeight(1);
    textSize(25);
    text(timerTime,timerX-20,timerY);
    pop();
    
}

other.push(setupSim);