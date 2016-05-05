'use strict';

var CodeWorkspace = require('./CodeWorkspace');
var connect = require('react-redux').connect;

module.exports = connect(function propsFromStore(state) {
  return {
    editCode: state.pageConstants.isDroplet,
    localeDirection: state.pageConstants.localeDirection,
    readonlyWorkspace: state.pageConstants.isReadOnlyWorkspace,
    isRunning: state.runState.isRunning,
    showDebugger: state.pageConstants.showDebugButtons || state.pageConstants.showDebugConsole
  };
})(CodeWorkspace);
