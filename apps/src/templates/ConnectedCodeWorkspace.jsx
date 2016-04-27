'use strict';

var CodeWorkspace = require('./CodeWorkspace');
var connect = require('react-redux').connect;

module.exports = connect(function propsFromStore(state) {
  return {
    localeDirection: state.level.localeDirection,
    readonlyWorkspace: state.level.isReadOnlyWorkspace,
    isRunning: state.isRunning
  };
})(CodeWorkspace);
