function onPointerDown(callback) {
  register(function () {
    if (mouseWentDown('leftButton')) {
      callback();
    }
  });
}