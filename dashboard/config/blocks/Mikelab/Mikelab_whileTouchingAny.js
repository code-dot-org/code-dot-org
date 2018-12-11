function whileTouchingAny(spriteGetter, event) {
  register(function () {
    var sprite = spriteGetter();
    sprite.overlap(World.allSprites,function (a,b){
      b.tint = "red";
      a.tint = "blue";
      event();
    });
  });
}