//var s = createNewSprite("bear", "bear", {x: 100, y: 100});
//var s2 = createNewSprite("bear2", "bear", {x: 250, y: 250});
var setupCode = [];
var currentSceneNumber = 0;
var scenes = [];

function addBehaviorUntilBoolean(spriteId, behavior, condition) {
  setProp(spriteId, behavior.name, function() { return condition; });
  addBehaviorSimple(spriteId, behavior);
}

function removeInvalidBehaviors() {
  var spriteIds = getSpriteIdsInUse();
  for(var i = 0; i < spriteIds.length; i++) {
  	var behaviors = getBehaviorsForSpriteId(spriteIds[i]);
    for(var j = 0; j < behaviors.length; j++) {
      console.log(getProp(spriteIds[i], behaviors[j])());
      if(getProp(spriteIds[i], "x") >= 250) {
      //if(getProp(spriteIds[i], behaviors[j])()) {
        console.log("you got here");
      	removeBehaviorSimple(spriteIds[i], behaviors[j]);
        //removeAllBehaviors(spriteIds[i]);
      }
    }
  }
}

function scene(sceneNumber, code) {
  scenes.push({sceneNumber: sceneNumber, code: code});
}

function setupStory(code) {
  setupCode.push({code: code});
}

function runSetup() {
  for(var i = 0; i < setupCode.length; i++) {
  	setupCode[i].code();
  }
  setupCode = [];
}

function goToScene(sceneNumber) {
  getAnimationsInUse().forEach(function(animation) {
    //removeAllBehaviors(animation);
  });
  currentSceneNumber = sceneNumber;
}

function getCurrentScene() {
  for(var i = 0; i < scenes.length; i++) {
  	if(scenes[i].sceneNumber === currentSceneNumber) {
      return scenes[i];
    }
  }
}

function draw() {
  //if(setupCode.length > 0) {
  	//runSetup();
  //}
  getCurrentScene().code();
  removeInvalidBehaviors();
  //getCurrentScene().code = function(){};
  executeDrawLoopAndCallbacks();
}