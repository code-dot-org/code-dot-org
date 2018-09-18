function changeMoveLR(sprite, move, dir) {
  if (move == "next") {
    move = 1 + ((sprite.current_move + 1) % (ANIMATIONS[sprite.style].length - 1));
  } else if (move == "prev") {
    move = 1 + ((sprite.current_move - 1) % (ANIMATIONS[sprite.style].length - 1));
  } else if (move == "rand") {
    // Make sure random switches to a new move
    move = sprite.current_move;
    while (move == sprite.current_move) {
    	move = randomNumber(0, ANIMATIONS[sprite.style].length - 1);
    }
  }
  sprite.mirroring = dir;
  sprite.mirrorX(dir);
  sprite.changeAnimation("anim" + move);
  if (sprite.animation.looping) sprite.looping_frame = 0;
  sprite.animation.looping = true;
  sprite.current_move = move;
}