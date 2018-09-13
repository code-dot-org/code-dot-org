function doMoveTaco(sprite, move, dir) {
  if (move == "next") {
    move = (sprite.current_move + 1) % dancers[sprite.style].length;
  } else if (move == "prev") {
    move = (sprite.current_move - 1) % dancers[sprite.style].length;
  } else if (move == "rand") {
    move = randomNumber(0, dancers[sprite.style].length - 1);
  }
  sprite.mirrorX(dir);
  sprite.changeAnimation("anim" + move);
  sprite.animation.looping = false;
  sprite.animation.changeFrame(24);
  sprite.animation.play();
}