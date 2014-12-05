// Define methods that blocks call here
exports.log = function (id) {
  BlocklyApps.highlight(id);
  alert('log');
  console.log('');
};

exports.playSound = function(id, soundName) {
  BlocklyApps.highlight(id);
  BlocklyApps.playAudio(soundName);
};

exports.setGravity = function(id, gravityValue) {
  BlocklyApps.highlight(id);
  window.game.controls.target().forces[1] = gravityValue;
};

exports.setSpeed = function(id, speedValue) {
  BlocklyApps.highlight(id);
  window.game.controls.walk_max_speed = speedValue;
};

exports.setBlock = function(value, x, y, z, id) {
  BlocklyApps.highlight(id);
  window.game.setBlock([x,y,z], value);
};
