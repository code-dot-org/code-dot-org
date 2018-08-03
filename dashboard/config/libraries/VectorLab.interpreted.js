var callbacks = [];

function register(callback) {
  callbacks.push(callback);
}

function draw() {
  background('#444');
  callbacks.forEach(function (callback) {
    callback();
  });
  drawSprites();
}
