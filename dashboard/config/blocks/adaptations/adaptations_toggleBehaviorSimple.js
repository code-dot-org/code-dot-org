function toggleBehaviorSimple(sprite, toggle, behavior) {
  if (toggle === "begins") {
    addBehaviorSimple(sprite, behavior);
  } else {
    removeBehaviorSimple(sprite, behavior);
  }
}