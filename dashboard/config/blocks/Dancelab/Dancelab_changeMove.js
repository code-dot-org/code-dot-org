function changeMove(sprite, move) {
  if (move == "rand") {
    move = randomNumber(0,3);
  }
  sprite.changeAnimation("anim" + move);
  sprite.frameDelay = sprite.dance_speed;
}