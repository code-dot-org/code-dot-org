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
