function representManipulative_test(var1, s1costume, behavior) {
  /*for(var count_i = 0; count_i < var1; count_i++) { 
  makeNewSpriteAnon(s1costume); 
  }
    addBehaviorSimple(({costume: s1costume}), behavior);
  */
  
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
    var spriteId = makeNewSpriteAnon(s1costume, ({"x":x,"y":y}));
    //var spriteId = createNewSprite({name: "manipulative" + counter_i}, s1costume, {"x": x, "y": y});
    setProp(({id: spriteId}), "isManipulative", 47);
    //makeNewSpriteAnon(s1costume, {"x": x, "y": y});
    console.log();
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

//Playing around by taking out the xy: 200 piece. 
//function makeManipulative(var1, s1costume, behavior) {
  //for(var count_i = 0; count_i < var1; count_i++) { 
 // makeNewSpriteAnon(s1costume, {"x": 200, "y": 200}); 
    //addBehaviorSimple(({costume: s1costume}), behavior);
  //}
//}