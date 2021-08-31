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
      jumpTo({name: 'temporarySprite'}, locationAt(math_random_int(0, 400), math_random_int(450, 650)));
      setProp({name: 'temporarySprite'}, "rotation", math_random_int(0, 359));
      addBehaviorSimple({name: 'temporarySprite'}, new Behavior(rainEffectBehavior, []));
    }
    else if(effect=="burst"){
      setProp({name: 'temporarySprite'}, "speed", math_random_int(5, 15));
      setProp({name: 'temporarySprite'}, "delay", math_random_int(1, 60));
      setProp({name: 'temporarySprite'}, "scale", 0);
      setProp({name: 'temporarySprite'}, "direction", math_random_int(0, 359));
      setProp({name: 'temporarySprite'}, "rotation", math_random_int(0, 359));
      addBehaviorSimple({name: 'temporarySprite'}, new Behavior(burstEffectBehavior, []));
    }
    else {
      destroy({name: 'temporarySprite'});
    }
  }
}

function burstEffectBehavior(this_sprite) {
  console.log(getProp(this_sprite, "delay"));
  if(getProp(this_sprite, "delay")>0){
    changePropBy(this_sprite, "delay", -1);
  } else if(getProp(this_sprite, "delay")===0){
    setProp({name: 'temporarySprite'}, "scale", 10);
  } else{
  moveForward(this_sprite, getProp(this_sprite, "speed"));
  changePropBy(this_sprite, "scale", 2);
  changePropBy(this_sprite, "rotation", 1);
  if (getProp(this_sprite, "y") < -100 || 
     getProp(this_sprite, "y") > 500 || 
     getProp(this_sprite, "x") < -100 || 
     getProp(this_sprite, "x") > 500) {
    destroy(this_sprite);
  }
  }
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
  changePropBy(this_sprite, "rotation", 5);
  if (getProp(this_sprite, "y") < -100) {
    destroy(this_sprite);
  }
}