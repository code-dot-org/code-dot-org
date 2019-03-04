function setupSim(s1n, s1c, s1s, s2n, s2c, s2s, s3n, s3c) {
  function spriteMovement(this_sprite, speed) {
    if (math_random_int(0, 5) == 0) {
      changePropBy(this_sprite, "direction", math_random_int(-25, 25));
    }
    moveForward(this_sprite, speed);
    if (isTouchingEdges(this_sprite)) {
      edgesDisplace(this_sprite);
      changePropBy(this_sprite, "direction", math_random_int(135, 225));
    }
  }

  for (var i=0; i< s1n; i++) {
    makeNewSpriteAnon(s1c, randomLocation());
  }
  addBehaviorSimple(allSpritesWithAnimation(slc), new Behavior(spriteMovement, [sls]));

  for (i=0; i< s2n; i++) {
    makeNewSpriteAnon(s2c, randomLocation());
  }
  addBehaviorSimple(allSpritesWithAnimation(slc), new Behavior(spriteMovement, [s2s]));

  for (i=0; i< s3n; i++) {
    makeNewSpriteAnon(s3c, randomLocation());
  }
}