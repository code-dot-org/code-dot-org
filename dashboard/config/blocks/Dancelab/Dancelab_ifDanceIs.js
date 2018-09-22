function ifDanceIs(sprite, dance, ifStatement, elseStatement) {
  if (!spriteExists(sprite)) return;
  if (sprite.current_dance == dance) {
    ifStatement();
  } else {
    elseStatement();
  }
}