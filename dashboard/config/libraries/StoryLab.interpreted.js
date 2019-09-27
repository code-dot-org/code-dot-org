//var s = createNewSprite("bear", "bear", {x: 100, y: 100});
//var s2 = createNewSprite("bear2", "bear", {x: 250, y: 250});
var setupCode = [];
var currentSceneNumber = 0;
var scenes = [];

function addBehaviorUntilBoolean(spriteID, behavior, condition) {
  if (spriteID && behavior) {
    behavior.checkTerminate = condition;
    addBehaviorSimple(spriteID, behavior);
  }
}

function scene(sceneNumber, code) {
  //code = function() {
  	//setTimeout(function(){ return waitCode.apply(waitCode); }, 2000);
  //};
  scenes.push({sceneNumber: sceneNumber, code: code});
}

function setupStory(code) {
  console.log(code.valueOf());
  for(var i = 0; i < code.length; i++) {
  	console.log(code[i]);
  }
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
    removeAllBehaviors(animation);
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
  if(setupCode.length > 0) {
  	runSetup();
  }
  getCurrentScene().code();
  //getCurrentScene().code = function(){};
  executeDrawLoopAndCallbacks();
}