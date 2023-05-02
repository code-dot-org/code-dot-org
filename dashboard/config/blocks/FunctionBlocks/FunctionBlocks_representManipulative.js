function representManipulative(var1, s1costume, behavior) {
  
  //For Validation
  if(typeof checkValidation === 'function' && checkValidation()) {
    var newBlockObj = {
      blockName: 'represent',
      input: var1,
      costume: s1costume
    };
    addFunctionBlock(newBlockObj);
  }
  
  //For ideal behavior: original sprites should be 40x40
  //to create 10x10 grid for students
  
  //destroy(({costume: s1costume}));
  var spriteIds = getSpriteIdsInUse();
  for(var i = 0; i < spriteIds.length; i++) {
    var val = getProp(({id: spriteIds[i]}), "isManipulative");
    if(val == 47) {
      destroy(({id: spriteIds[i]}));
    }
  }
  
  
  var x = 20;
  var y = 400-20;
  for (counter_i = 0; counter_i < var1; counter_i++) {
    var spriteId = createNewSprite({name: "manipulative" + counter_i}, s1costume, {"x": x, "y": y});
    setProp(({id: spriteId}), "isManipulative", 47);
    //makeNewSpriteAnon(s1costume, {"x": x, "y": y});
    x += 40;
    if(x >= 400) {
      x = 20;
      y += 40;
    }
    addBehaviorSimple(({id: spriteId}), new Behavior(northAndStop, []));
  }
}

function northAndStop(this_sprite) {
  //Copied code from moving north behavior
  moveInDirection(this_sprite, getProp(this_sprite, "speed"), "North");
  var yVal = getProp(this_sprite, "y");
  //console.log(yVal);
  if (yVal >= 400-20) {
    var cost = getProp(this_sprite, "costume");
    removeBehaviorSimple(({costume: cost}), new Behavior(northAndStop, []));
    addBehaviorSimple(({costume: cost}), draggable());
  }
  //if (isTouchingEdges(this_sprite)) {
    
  //}
}
