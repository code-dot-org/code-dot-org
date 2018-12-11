var MAX_STEPS = 1000;
function repeatUntilConduit(callback) {
  for (var i = 0; i < MAX_STEPS; i++) {
    if (isFinished()) {
      break;
    }
    callback();
  }
}