function doMoveOnce(sprite, move) {
  changeMove(sprite, move);
  sprite.animation.looping = false;
  sprite.animation.goToFrame(0);
  sprite.animation.play();
}