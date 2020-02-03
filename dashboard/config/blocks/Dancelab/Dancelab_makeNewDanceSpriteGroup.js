function makeNewDanceSpriteGroup(n, costume, layout) {
  var tempGroup = createGroup();
  for (var i=0; i<n; i++) {
    tempGroup.add(makeNewDanceSprite(costume));
  }
  layoutSprites(tempGroup, layout);
}