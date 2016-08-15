exports.pinMode = function (pin, mode) {
  return Applab.executeCmd(null, 'pinMode', {pin, mode});
};

exports.digitalWrite = function (pin, value) {
  return Applab.executeCmd(null, 'digitalWrite', {pin, value});
};

exports.digitalRead = function (pin, callback) {
  return Applab.executeCmd(null, 'digitalRead', {pin, callback});
};

exports.analogWrite = function (pin, value) {
  return Applab.executeCmd(null, 'analogWrite', {pin, value});
};

exports.analogRead = function (pin, callback) {
  return Applab.executeCmd(null, 'analogRead', {pin, callback});
};

exports.onBoardEvent = function (component, event, callback) {
  return Applab.executeCmd(null, 'onBoardEvent', {component, event, callback});
};
