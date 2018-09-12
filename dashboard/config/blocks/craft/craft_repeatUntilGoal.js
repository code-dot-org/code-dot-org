var MAX_STEPS = 10;
function repeatUntilGoal(callback) {
  for (var i = 0; i < MAX_STEPS; i++) {
    if (isStandingOnMiniBlock()) {
      break;
    }
    callback();
  }
}