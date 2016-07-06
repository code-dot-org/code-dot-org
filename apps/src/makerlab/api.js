exports.pinMode = function (pin, mode) {
  return Applab.executeCmd(null,
      'pinMode',
      {
        'pin': pin,
        'mode': mode
      });
};

exports.digitalWrite = function (pin, value) {
  return Applab.executeCmd(null,
      'digitalWrite',
      {
        'pin': pin,
        'value': value
      });
};

exports.digitalRead = function (pin, callback) {
  return Applab.executeCmd(null,
      'digitalRead',
      {
        'pin': pin,
        'callback': callback
      });
};

exports.analogWrite = function (pin, value) {
  return Applab.executeCmd(null,
      'analogWrite',
      {
        'pin': pin,
        'value': value
      });
};

exports.analogRead = function (pin, callback) {
  return Applab.executeCmd(null,
      'analogRead',
      {
        'pin': pin,
        'callback': callback
      });
};

exports.onBoardEvent = function (component, event, callback) {
  var extraArgs = Array.prototype.slice.call(arguments).slice(3);
  return Applab.executeCmd(null,
      'onBoardEvent',
      {
        'component': component,
        'event': event,
        'callback': callback,
        'extraArgs': extraArgs
      });
};
