var callbacks = [];

function register(callback) {
  callbacks.push(callback);
}

function draw() {
  callbacks.forEach(function (callback) {
    callback();
  });

  background('#444');
  drawSprites();
}
