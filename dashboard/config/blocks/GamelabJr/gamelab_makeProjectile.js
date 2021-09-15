function makeProjectile(costume,location,speed,direction) {
  createNewSprite({name: 'temporarySprite'}, costume, location);
  setProp({name: 'temporarySprite'}, "speed", speed);
  setProp({name: 'temporarySprite'}, "direction", direction);
  setProp({name: 'temporarySprite'}, "scale", 25);
  addBehaviorSimple({name: 'temporarySprite'}, new Behavior(projectileBehavior, []));
}

function projectileBehavior(this_sprite) {
  moveForward(this_sprite, getProp(this_sprite, "speed"));
  if (getProp(this_sprite, "y") < -100 || 
      getProp(this_sprite, "y") > 500 || 
      getProp(this_sprite, "x") < -100 || 
      getProp(this_sprite, "x") > 500) {
    destroy(this_sprite);
  }
}