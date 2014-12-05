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

exports.getAdjacentTargetX = function() {
  return window.game.plugins.get('voxel-reach').currentTarget.adjacent[0];
};
exports.getAdjacentTargetY = function() {
  return window.game.plugins.get('voxel-reach').currentTarget.adjacent[1];
};
exports.getAdjacentTargetZ = function() {
  return window.game.plugins.get('voxel-reach').currentTarget.adjacent[2];
};

exports.getSelectedTargetX = function() {
  return window.game.plugins.get('voxel-reach').currentTarget.voxel[0];
};
exports.getSelectedTargetY = function() {
  return window.game.plugins.get('voxel-reach').currentTarget.voxel[1];
};
exports.getSelectedTargetZ = function() {
  return window.game.plugins.get('voxel-reach').currentTarget.voxel[2];
};
