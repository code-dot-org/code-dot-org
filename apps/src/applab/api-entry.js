// entry point for api that gets exposed.

// third party dependencies that are provided as globals in code-studio but
// which need to be explicitly required here.
window.React = require('react');
window.ReactDOM = require('react-dom');
window.$ = require('jquery');

window.Applab = require('./applab');
var applabCommands = require('./commands');
var api = require('./api');

// TODO: remove the below two monkey patches.
window.Applab.JSInterpreter = {getNearestUserCodeLine: function() {return 0;}};

window.Applab.callCmd = function (cmd) {
  var retVal = false;
  if (applabCommands[cmd.name] instanceof Function) {
    retVal = applabCommands[cmd.name](cmd.opts);
  }
  return retVal;
};

for (var key in api) {
  window[key] = api[key];
}
