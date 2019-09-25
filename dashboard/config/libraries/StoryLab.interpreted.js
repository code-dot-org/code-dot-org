var s = createNewSprite("bear", "bear", {x: 100, y: 100});

function addBehaviorUntilBoolean(spriteID, behavior, condition) {
  if (spriteID && behavior) {
    behavior.checkTerminate = condition;
    addBehaviorSimple(spriteID, behavior);
  }
}

function Behavior(func, extraArgs) {
  if (!extraArgs) {
    extraArgs = [];
  }
  this.func = func;
  this.extraArgs = extraArgs;
  this.checkTerminate = function() {return false;};
  this.timeStarted = new Date().getTime();
  this.duration = Number.MAX_VALUE;
}