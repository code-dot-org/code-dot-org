function statesOfMatter(behavior) {
	return behavior;
}

function solid(this_sprite) {
  //console.log(this_sprite);
  layoutGrid();
  withPercentChance(50, function () {
    setProp(this_sprite, "rotation", math_random_int(-1, 1));
  });
}

function liquid(this_sprite) {
 	if (getProp(this_sprite, "y") > 151) {
    setProp(this_sprite, "y", math_random_int(0, 151));
  }
  withPercentChance(20, function () {
    changePropBy(this_sprite, "direction", math_random_int(-25, 25));
  });
  moveForward(this_sprite, getProp(this_sprite, "speed") - 3);
  if (getProp(this_sprite, "y") > 150) {
    changePropBy(this_sprite, "direction", math_random_int(100, 200));
  }
  if (isTouchingEdges(this_sprite)) {
    edgesDisplace(this_sprite);
    changePropBy(this_sprite, "direction", math_random_int(135, 225));
  }
}