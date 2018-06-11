function moveToward(sprite,distance,target) {
  if (!sprite || distance === undefined || !target) {
    return;
  }
  var dx = target.x - sprite.x;
  var dy = target.y - sprite.y;
  if (dx * dx + dy * dy > distance * distance) {
    var angleOfMovement=Math.atan2(dy, dx);
    dx = distance*Math.cos(angleOfMovement);
    dy = distance*Math.sin(angleOfMovement);
  }
  sprite.x += dx;
  sprite.y += dy;
}