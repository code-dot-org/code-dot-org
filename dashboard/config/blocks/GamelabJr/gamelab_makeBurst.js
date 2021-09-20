function makeBurst(num,costume,effect) {
  for (var count = 0; count < num; count++) {
    createNewSprite({name: 'temporarySprite'}, costume, ({"x":200,"y":200}));
    if(effect=="pop"){
      setProp({name: 'temporarySprite'}, "speed", math_random_int(10, 25));
      setProp({name: 'temporarySprite'}, "scale", 50);
      jumpTo({name: 'temporarySprite'}, locationAt(math_random_int(0, 400), math_random_int(-100, -50)));
      setProp({name: 'temporarySprite'}, "direction", math_random_int(225, 315));
      addBehaviorSimple({name: 'temporarySprite'}, new Behavior(popEffectBehavior, []));
    }
    else if(effect=="rain"){
      setProp({name: 'temporarySprite'}, "speed", 0);
      setProp({name: 'temporarySprite'}, "scale", 50);
      jumpTo({name: 'temporarySprite'}, locationAt(math_random_int(0, 400), math_random_int(450, 550)));
      setProp({name: 'temporarySprite'}, "rotation", math_random_int(-10, 10));
      addBehaviorSimple({name: 'temporarySprite'}, new Behavior(rainEffectBehavior, []));
    }
    else if(effect=="burst"){
      setProp({name: 'temporarySprite'}, "speed", math_random_int(10, 20));
      setProp({name: 'temporarySprite'}, "delay", math_random_int(1, 20));
      setProp({name: 'temporarySprite'}, "scale", 0);
      setProp({name: 'temporarySprite'}, "direction", math_random_int(0, 359));
      setProp({name: 'temporarySprite'}, "rotation", math_random_int(0, 359));
      addBehaviorSimple({name: 'temporarySprite'}, new Behavior(burstEffectBehavior, []));
    }
    else if(effect=="zigzag"){
      setProp({name: 'temporarySprite'}, "speed", math_random_int(10, 25)); 
      setProp({name: 'temporarySprite'}, "scale", 50);
      if (count%2 == 0) {
        jumpTo({name: 'temporarySprite'}, locationAt(math_random_int(-100, -50), math_random_int(0, 400)));
        setProp({name: 'temporarySprite'}, "direction", 0);
      } else {
        jumpTo({name: 'temporarySprite'}, locationAt(math_random_int(450, 500), math_random_int(0, 400)));
        setProp({name: 'temporarySprite'}, "direction", 180);
      }
      addBehaviorSimple({name: 'temporarySprite'}, new Behavior(zigzagEffectBehavior, []));
    }
    else {
      destroy({name: 'temporarySprite'});
    }
  }
}

function burstEffectBehavior(this_sprite) {
  if(getProp(this_sprite, "delay")===0){
    setProp(this_sprite, "scale", 40);
  } else if(getProp(this_sprite, "delay")<0){
    moveForward(this_sprite, getProp(this_sprite, "speed"));
    changePropBy(this_sprite, "scale", 1);
    changePropBy(this_sprite, "rotation", 1);
    if (getProp(this_sprite, "y") < -100 || 
        getProp(this_sprite, "y") > 500 || 
        getProp(this_sprite, "x") < -100 || 
        getProp(this_sprite, "x") > 500) {
      destroy(this_sprite);
    }
  }
  changePropBy(this_sprite, "delay", -1);
}

function popEffectBehavior(this_sprite) {
  moveForward(this_sprite, 5);
  changePropBy(this_sprite, "y", getProp(this_sprite, "speed"));
  changePropBy(this_sprite, "speed", -1);
  changePropBy(this_sprite, "rotation", (getProp(this_sprite, "direction") - 270) / 6);
  if (getProp(this_sprite, "y") < -100) {
    destroy(this_sprite);
  }
}

function rainEffectBehavior(this_sprite) {
  changePropBy(this_sprite, "y", getProp(this_sprite, "speed"));
  changePropBy(this_sprite, "speed", -0.5);
  changePropBy(this_sprite, "rotation", math_random_int(-5, 5));
  if (getProp(this_sprite, "y") < -100) {
    destroy(this_sprite);
  }
}

function zigzagEffectBehavior(this_sprite) {
  if (getProp(this_sprite, "x") >= 0 &&
      getProp(this_sprite, "x") <= 50 &&
      getProp(this_sprite, "direction") == 180 &&
     (getProp(this_sprite, "collisions")===undefined ||
      getProp(this_sprite, "collisions") < 2)) {
    if (getProp(this_sprite, "collisions")===undefined) {
      setProp(this_sprite, "collisions", 1);
    } else {
      changePropBy(this_sprite, "collisions", 1);
    }
    setProp(this_sprite, "direction", 0);
    changePropBy(this_sprite, "scale", 10);
  } else if (getProp(this_sprite, "x") <= 400 &&
             getProp(this_sprite, "x") >= 350 &&
             getProp(this_sprite, "direction") == 0 &&
             (getProp(this_sprite, "collisions")===undefined ||
              getProp(this_sprite, "collisions") < 2)) {
    if (getProp(this_sprite, "collisions")===undefined) {
      setProp(this_sprite, "collisions", 1);
    } else {
      changePropBy(this_sprite, "collisions", 1);
    }
    setProp(this_sprite, "direction", 180);
    changePropBy(this_sprite, "scale", 10);
  }

  moveForward(this_sprite, getProp(this_sprite, "speed"));
  changePropBy(this_sprite, "speed", 0.75);
  changePropBy(this_sprite, "rotation", math_random_int(-5, 5));
  if (getProp(this_sprite, "x") < -100 ||
     getProp(this_sprite, "x") > 500) {
    destroy(this_sprite);
  }
}