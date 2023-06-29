//Equivalent of getSpriteIdsInUse({costume: costume})
function filterSprites(costume) {
  var spriteIds = getSpriteIdsInUse();
  var count = spriteIds.length;
  var matterSprites = [];
  //Filter by sprites that match out costume
  for(var j = 0; j < count; j++) {
    if(isCostumeEqual({id: spriteIds[j]}, costume)) {
      matterSprites.push(spriteIds[j]);
    }
  }
  return matterSprites;
}

//Equivalent of layoutAsGrid({costume: costume})
function helperGrid(costume) {
    spriteIds = filterSprites(costume);
    count = spriteIds.length;
    //Now this is essentially the same code as layoutGrid block
    var numRows = Math.ceil(Math.sqrt(count));
    var numCols = Math.ceil(count / numRows);
    for (var i = 0; i < count; i++) {
      var spriteIdArg = {id: spriteIds[i]};
      var row = Math.floor(i / numCols);
      var col = i % numCols;
      var colFraction = col / (numCols - 1) || 0;
      var x = MIN_XY + colFraction * (MAX_XY - MIN_XY);
      var rowFraction = row / (numRows - 1) || 0;
      var y = MIN_XY + rowFraction * (MAX_XY - MIN_XY);

      jumpTo(spriteIdArg, {x: x, y: y});
    }
}

function statesOfMatter2(costume, behaviorStr) {
    //For Validation
    if(typeof checkValidation === 'function' && checkValidation()) {
      var newBlockObj = {
        blockName: 'statesOfMatter',
        costume: costume,
        matter: behaviorStr
      };
      addParticlesBlock(newBlockObj);
    }
  
  if(behaviorStr == "solid"){
    helperGrid(costume);
    addBehaviorSimple(({costume: costume}), new Behavior(wobbling, []));
  } else if(behaviorStr == "liquid"){
    var liquidSprites = filterSprites(costume);
    for(var i = 0; i < liquidSprites.length; i++) {
    	setProp(({id: liquidSprites[i]}), "y", math_random_int(0, 151));
    }
    addBehaviorSimple(({costume: costume}), new Behavior(liquid2, []));
  } else if(behaviorStr == "gas"){
    addBehaviorSimple(({costume: costume}), new Behavior(wandering, []));
  }
}

function liquid2(this_sprite) {
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