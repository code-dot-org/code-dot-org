function communicate(var1, s1costume) {
  var x = 20;
  var y = 400-70;
  for (counter_i = 0; counter_i < var1; counter_i++) {
    createNewSprite({name: "iceCream" + counter_i}, s1costume, {"x": x, "y": y});
    //makeNewSpriteAnon(s1costume, {"x": x, "y": y});
    x += 40;
    if(x >= 400) {
      x = 20;
      y += 70;
    }
  }
  addBehaviorSimple(({costume: s1costume}), new Behavior(northAndStop, []));
}

function northAndStop(this_sprite) {
  //Copied code from moving north behavior
  moveInDirection(this_sprite, getProp(this_sprite, "speed"), "North");
  var yVal = getProp(this_sprite, "y");
  //console.log(yVal);
  if (yVal >= 400-35) {
    var cost = getProp(this_sprite, "costume");
    removeBehaviorSimple(({costume: cost}), new Behavior(northAndStop, []));
  }
  //if (isTouchingEdges(this_sprite)) {
    
  //}
}

function northAndStopv2(this_sprite) {
  var currY = getProp(this_sprite, "y");
  setProp(this_sprite, "y", currY + 2);
  if (getProp(this_sprite, "y") >= 400-(70*spriteCount)) {
    removeBehaviorSimple(this_sprite, new Behavior(northAndStopv2, []));
  }
  //if (isTouchingEdges(this_sprite)) {
    
  //}
}
