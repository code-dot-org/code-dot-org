function changeMove(sprite, move) {
  if (move == "rand") {
    var moves = ["_climb", "_duck", "_jump", "_walk"];
    move = moves[randomNumber(moves.length - 1)];
  }
  sprite.setAnimation(sprite.style + move);
}