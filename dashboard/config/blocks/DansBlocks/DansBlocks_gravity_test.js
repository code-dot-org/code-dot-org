function fall_gravity_behavior(this_sprite) {
  if (!isTouchingEdges(this_sprite)) {
  	changePropBy(this_sprite, 'velocityY', 0.1);
  } else {
    edgesDisplace(this_sprite);
    setProp(this_sprite, 'velocityY', 0);
  }
}

function gravity_test(behavior){
  return behavior;
}