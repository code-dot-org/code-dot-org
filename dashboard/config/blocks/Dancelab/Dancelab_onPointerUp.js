function onPointerUp(callback) {
  register(function () {
    if (mouseWentUp('leftButton')) {
      callback();
    }
  });
}