console.log('hello world!');

var callbacks = [];

function register(callback) {
  callbacks.push(callback);
}

function draw() {
  callbacks.forEach(function (callback) {
    callback();
  });
}
