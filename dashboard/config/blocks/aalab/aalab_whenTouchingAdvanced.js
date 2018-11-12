function whenTouchingAdvanced(sprite1, sprite2, event) {
  var spriteGroup1 = spriteGroups[sprite1];
  var spriteGroup2 = spriteGroups[sprite2];
  spriteGroup1.collisionEvents.push({
    a: spriteGroup2,
    b: function() { return spriteGroup1; },
    event: event});
}