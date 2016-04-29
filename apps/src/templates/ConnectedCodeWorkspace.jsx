'use strict';

var CodeWorkspace = require('./CodeWorkspace');
var connect = require('react-redux').connect;

module.exports = connect(function propsFromStore(state) {
  return {
    editCode: true,
    localeDirection: state.level.localeDirection,
    readonlyWorkspace: state.level.isReadOnlyWorkspace,
    isRunning: state.isRunning,
    showDebugger: state.level.showDebugButtons || state.level.showDebugConsole
  };
})(CodeWorkspace);
