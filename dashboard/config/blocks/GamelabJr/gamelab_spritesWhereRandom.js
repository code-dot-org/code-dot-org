function spritesWhereRandom(group) {
  var n = randomNumber(0, group.length - 1);
  if (window._DEBUG_) {
    console.log(n);
  }
  return group && group[n];
}