function oceanSetup() {
function math_random_int(a, b) {
  if (a > b) {
    // Swap a and b to ensure a is smaller.
    var c = a;
    a = b;
    b = c;
  }
  return Math.floor(Math.random() * (b - a + 1) + a);
}

function wandering(this_sprite) {
  withPercentChance(20, function () {
    changePropBy(this_sprite, "direction", math_random_int(-25, 25));
  });
  moveForward(this_sprite, getProp(this_sprite, "speed"));
  if (isTouchingEdges(this_sprite)) {
    edgesDisplace(this_sprite);
    changePropBy(this_sprite, "direction", math_random_int(135, 225));
  }
  if (getProp(this_sprite, "direction") > 270 || getProp(this_sprite, "direction") < 90) {
    mirrorSprite(this_sprite, "right");
  } else {
    mirrorSprite(this_sprite, "left");
  }

}

function moving_east(this_sprite) {
  moveInDirection(this_sprite, getProp(this_sprite, "speed"), "East");
}

function spinning_left(this_sprite) {
  turn(this_sprite, 6, "left");
}

function spinning_right(this_sprite) {
  turn(this_sprite, 6, "right");
}

function shrinking(this_sprite) {
  changePropBy(this_sprite, "scale", -1);
}

function growing(this_sprite) {
  changePropBy(this_sprite, "scale", 1);
}

function moving_south(this_sprite) {
  moveInDirection(this_sprite, getProp(this_sprite, "speed"), "South");
}

function swimming_left_and_right(this_sprite) {
  if (getProp(this_sprite, "direction") == 0) {
    mirrorSprite(this_sprite, "right");
  } else if (getProp(this_sprite, "direction") == 180) {
    mirrorSprite(this_sprite, "left");
  }
  moveForward(this_sprite, getProp(this_sprite, "speed"));
  if (isTouchingEdges(this_sprite)) {
    edgesDisplace(this_sprite);
    changePropBy(this_sprite, "direction", 180);
  }
}

function moving_north(this_sprite) {
  moveInDirection(this_sprite, getProp(this_sprite, "speed"), "North");
}

function jittering(this_sprite) {
  changePropBy(this_sprite, "scale", math_random_int(-1, 1));
}

function moving_west(this_sprite) {
  moveInDirection(this_sprite, getProp(this_sprite, "speed"), "West");
}

function patrolling(this_sprite) {
  moveForward(this_sprite, getProp(this_sprite, "speed"));
  if (isTouchingEdges(this_sprite)) {
    edgesDisplace(this_sprite);
    changePropBy(this_sprite, "direction", 180);
  }
  if (getProp(this_sprite, "direction") > 270 || getProp(this_sprite, "direction") < 90) {
    mirrorSprite(this_sprite, "right");
  } else {
    mirrorSprite(this_sprite, "left");
  }

}

function moving_with_arrow_keys(this_sprite) {
  if (isKeyPressed("up")) {
    moveInDirection(this_sprite, getProp(this_sprite, "speed"), "North");
  }
  if (isKeyPressed("down")) {
    moveInDirection(this_sprite, getProp(this_sprite, "speed"), "South");
  }
  if (isKeyPressed("left")) {
    moveInDirection(this_sprite, getProp(this_sprite, "speed"), "West");
  }
  if (isKeyPressed("right")) {
    moveInDirection(this_sprite, getProp(this_sprite, "speed"), "East");
  }
}

function driving_with_arrow_keys(this_sprite) {
  if (isKeyPressed("up")) {
    moveForward(this_sprite, getProp(this_sprite, "speed"));
  }
  if (isKeyPressed("down")) {
    moveBackward(this_sprite, getProp(this_sprite, "speed"));
  }
  if (isKeyPressed("left")) {
    changePropBy(this_sprite, "direction", -5);
    changePropBy(this_sprite, "rotation", -5);
  }
  if (isKeyPressed("right")) {
    changePropBy(this_sprite, "direction", 5);
    changePropBy(this_sprite, "rotation", 5);
  }
  if (isTouchingEdges(this_sprite)) {
    edgesDisplace(this_sprite);
  }
}

function fluttering(this_sprite) {
  changePropBy(this_sprite, "y", math_random_int(-1, 1));
}

function wobbling(this_sprite) {
  withPercentChance(50, function () {
    setProp(this_sprite, "rotation", math_random_int(-1, 1));
  });
}

function moving_west_and_looping(this_sprite) {
  mirrorSprite(this_sprite, "left");
  moveInDirection(this_sprite, getProp(this_sprite, "speed"), "West");
  if (getProp(this_sprite, "x") < -50) {
    setProp(this_sprite, "x", 450);
  }
}

function moving_east_and_looping(this_sprite) {
  mirrorSprite(this_sprite, "right");
  moveInDirection(this_sprite, getProp(this_sprite, "speed"), "East");
  if (getProp(this_sprite, "x") > 450) {
    setProp(this_sprite, "x", -50);
  }
}

function moving_north_and_looping(this_sprite) {
  moveInDirection(this_sprite, getProp(this_sprite, "speed"), "North");
  if (getProp(this_sprite, "y") > 450) {
    setProp(this_sprite, "y", -50);
  }
}

function moving_south_and_looping(this_sprite) {
  moveInDirection(this_sprite, getProp(this_sprite, "speed"), "South");
  if (getProp(this_sprite, "y") < -50) {
    setProp(this_sprite, "y", 450);
  }
}

setBackgroundImageAs("background_underwater_17");
makeNewSpriteAnon("fishing_boat", ({"x":15,"y":40}));
setProp(({costume: "fishing_boat"}), "scale", 100);
makeNewSpriteAnon("underseadeco_25", ({"x":49,"y":349}));
makeNewSpriteAnon("underseadeco_25", ({"x":350,"y":351}));
makeNumSprites(6, "fish_10");
setProp(({costume: "fish_10"}), "scale", 40);
for (var count = 0; count < 23; count++) {
  makeNewSpriteAnon("green-sea-plant-2", locationAt(math_random_int(1, 400), math_random_int(1, 300)));
}
setProp(({costume: "green-sea-plant-2"}), "scale", 40);

setProp(({costume: "underseadeco_25"}), "scale", 120);
addBehaviorSimple(({costume: "fish_10"}), collectibleBehaviors(new Behavior(wandering, [])));
addBehaviorSimple(({costume: "fishing_boat"}), collectibleBehaviors(new Behavior(patrolling, [])));

  everyInterval(4, "seconds", function () {
makeNumSprites(3, "fish_10");
  setProp(({costume: "fish_10"}), "scale", 40);
    addBehaviorSimple(({costume: "fish_10"}), collectibleBehaviors(new Behavior(wandering, [])));
  });
everyInterval(2, "seconds", function () {
for (var count = 0; count < 6; count++) {
  makeNewSpriteAnon("green-sea-plant-2", locationAt(math_random_int(1, 400), math_random_int(1, 300)));
}
  setProp(({costume: "green-sea-plant-2"}), "scale", 40);
  
});
}
oceanSetup();