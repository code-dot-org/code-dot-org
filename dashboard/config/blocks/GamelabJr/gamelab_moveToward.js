function moveToward(sprite,distance,target) {
  if (!sprite || distance === undefined || !target) {
    return;
  }
  //The canvas coordinate system is different, hence the need to negate things
  var angleOfMovement=Math.atan2((-1*target.y+sprite.y),(-1*target.x+sprite.x));
  var dx = distance*Math.cos(angleOfMovement);
  var dy = distance*Math.sin(angleOfMovement);
  sprite.x-=dx;
  sprite.y-=dy;
}