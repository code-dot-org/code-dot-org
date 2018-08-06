function changeMove(sprite, move) {
  //if (move == "rand") {
  //  move = randomNumber(1,4);
  //}
  sprite.changeAnimation("anim" + move);
  sprite.frameDelay = sprite.dance_speed;
}