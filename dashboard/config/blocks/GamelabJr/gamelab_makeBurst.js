function makeBurst(num,costume) {
  for (var count = 0; count < num; count++) {
    createNewSprite({name: 'temporaryBurstSprite'}, costume, ({"x":200,"y":200}));
    jumpTo({name: 'temporaryBurstSprite'}, locationAt(math_random_int(0, 400), math_random_int(-100, -50)));
    setProp({name: 'temporaryBurstSprite'}, "scale", 50);
    setProp({name: 'temporaryBurstSprite'}, "speed", math_random_int(10, 25));
    setProp({name: 'temporaryBurstSprite'}, "direction", math_random_int(225, 315));
    addBehaviorSimple({name: 'temporaryBurstSprite'}, new Behavior(burstBlockBehavior, []));
  }
}

function burstBlockBehavior(this_sprite) {
  moveForward(this_sprite, 5);
  changePropBy(this_sprite, "y", getProp(this_sprite, "speed"));
  changePropBy(this_sprite, "speed", -1);
  changePropBy(this_sprite, "rotation", (getProp(this_sprite, "direction") - 270) / 6);
  if (getProp(this_sprite, "y") < -100) {
    destroy(this_sprite);
  }
}