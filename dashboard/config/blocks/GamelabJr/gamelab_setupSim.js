function setupSim(s1n, s1c, s1s, s2n, s2c, s2s, s3n, s3c) {
  World.sprite1score = 0;
  World.sprite2score = 0;

  function spriteMovement(this_sprite, speed) {
    if (randomNumber(0, 5) == 0) {
      changePropBy(this_sprite, "direction", randomNumber(-25, 25));
    }
    moveForward(this_sprite, speed);
    if (isTouchingEdges(this_sprite)) {
      edgesDisplace(this_sprite);
      changePropBy(this_sprite, "direction", randomNumber(135, 225));
    }
  }

  for (i=0; i< s3n; i++) {
    makeNewSpriteAnon(s3c, randomLocation());
  }
  setProp(allSpritesWithAnimation(s3c), "scale", 50);

  for (var i=0; i< s1n; i++) {
    makeNewSpriteAnon(s1c, randomLocation());
  }
  addBehaviorSimple(allSpritesWithAnimation(s1c), new Behavior(spriteMovement, [s1s]));

  for (i=0; i< s2n; i++) {
    makeNewSpriteAnon(s2c, randomLocation());
  }
  addBehaviorSimple(allSpritesWithAnimation(s2c), new Behavior(spriteMovement, [s2s]));

  checkTouching("when", function () {
    return allSpritesWithAnimation(s1c);
  }, function () {
    return allSpritesWithAnimation(s3c);
  }, function () {
    (getThisSprite("other")).destroy();
    World.sprite1score++;
    printText(s1c + ' has collected ' + World.sprite1score);
    checkSimulationEnd();
  });

  checkTouching("when", function () {
    return allSpritesWithAnimation(s2c);
  }, function () {
    return allSpritesWithAnimation(s3c);
  }, function () {
    (getThisSprite("other")).destroy();
    World.sprite2score++;
    printText(s2c + ' has collected ' + World.sprite2score);
    checkSimulationEnd();
  });

  function checkSimulationEnd() {
    if (countByCostume(s3c) == 0) {
      (allSpritesWithAnimation(s1c)).destroy();
      (allSpritesWithAnimation(s2c)).destroy();
      printText(['The simulation has ended after ',World.seconds,'seconds'].join(''));
    printText(s1c + ' has collected ' + World.sprite1score);
    printText(s2c + ' has collected ' + World.sprite2score);
    }
  }
}