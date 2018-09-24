function yLocationOf(sprite) {
  if (!sprite) {
    return undefined;
  } else{
  return 400-Number(sprite.y);
  }
}