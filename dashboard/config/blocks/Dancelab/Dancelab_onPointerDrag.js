function onPointerDrag(callback) {
  register(function () {
    if (mouseDown('leftButton') && mouseDidMove()) {
      callback();
    }
  });
}