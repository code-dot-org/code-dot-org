/**
 * A set of reducers that are used across all of our apps
 */

var runState = require('./runState');
var pageConstants = require('./pageConstants');

module.exports = {
  runState: runState.default,
  pageConstants: pageConstants.default
};
