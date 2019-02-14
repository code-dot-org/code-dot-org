function checkTouching(condition, a, b, event) {
  if(condition === "when") {
  	whenTouching(a, b, event);
  } else {
  	whileTouching(a, b, event);
  }
}