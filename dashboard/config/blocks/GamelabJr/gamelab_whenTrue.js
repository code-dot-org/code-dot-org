function whenTrue(condition, handler) {
  forever(function () {
    if (condition()) {
      handler();
    }
  });
}