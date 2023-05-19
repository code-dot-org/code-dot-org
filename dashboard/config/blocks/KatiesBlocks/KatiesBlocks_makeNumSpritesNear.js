function makeNumSpritesNear(n, costume, location){
  var radius = 30;
  for(var i=0; i<n; i++) {
    var x, y;
    if(location.x && location.y) {
      x = Math.min(400, (Math.max(0, location.x - radius/2 + Math.random() * radius)));
      y = Math.min(400, (Math.max(0, location.y - radius/2 + Math.random() * radius)));
    }
    makeNewSpriteAnon(costume, {x: x, y: y});
  }
}