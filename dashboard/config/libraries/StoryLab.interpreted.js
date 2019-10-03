//var s = createNewSprite("bear", "bear", {x: 100, y: 100});
//var s2 = createNewSprite("bear2", "bear", {x: 250, y: 250});
var setupCode = [];
var currentSceneNumber = 0;
var scenes = [];

function addBehaviorUntilBoolean(spriteId, behavior, condition) {
  setProp(spriteId, behavior.name, JSON.stringify(function() { return condition; }));
  console.log(getProp(spriteId, behavior.name));
  addBehaviorSimple(spriteId, behavior);
}

function removeInvalidBehaviors() {
  getSpriteIdsInUse().forEach(function(spriteId) {
  	getBehaviorsForSpriteId(spriteId).forEach(function(behavior) {
      //console.log(JSON.parse(getProp(spriteId, behavior))());
      if(getProp(spriteId, behavior)()) {
        removeBehaviorSimple(spriteId, behavior);
      }
    });
  });
}

function scene(sceneNumber, code) {
  scenes.push({sceneNumber: sceneNumber, code: code});
}

function setupStory(code) {
  setupCode.push({code: code});
}

function runSetup() {
  setupCode.forEach(function(c) {
  	c.code();
  });
  setupCode = [];
}

function goToScene(sceneNumber) {
  getAnimationsInUse().forEach(function(animation) {
    removeAllBehaviors(animation);
  });
  currentSceneNumber = sceneNumber;
}

function getCurrentScene() {
  scenes.find(function(scene) {
  	return scene.sceneNumber === currentSceneNumber;
  });
  return {};
}

function draw() {
  /*
  if(setupCode.length > 0) {
  	runSetup();
  }
  */
  //getCurrentScene().code();
  //getCurrentScene().code = function(){};
  removeInvalidBehaviors();
  executeDrawLoopAndCallbacks();
}