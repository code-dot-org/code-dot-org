function doMoveFast(sprite, move) {
  if (move == "next") {
    move = (sprite.current_move + 1) % dancers[sprite.style].length;
  } else if (move == "prev") {
    move = (sprite.current_move - 1) % dancers[sprite.style].length;
  } else if (move == "rand") {
    move = randomNumber(0, dancers[sprite.style].length - 1);
  }
  sprite.changeAnimation("anim" + move);
  sprite.animation.looping = false;
  sprite.previous_speed = sprite.dance_speed;
  sprite.dance_speed = 2;
  sprite.animation.changeFrame(0);
  sprite.animation.play();
}