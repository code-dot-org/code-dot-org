import api from '../api';
import CustomMarshalingInterpreter from '@cdo/apps/lib/tools/jsinterpreter/CustomMarshalingInterpreter';

/**
 * Interface for a set of custom game logic for playlab
 * @param {Studio} studio Reference to global studio object
 * @interface CustomGameLogic
 */
var CustomGameLogic = function (studio) {
  this.studio_ = studio;
  this.cached_ = {};
};

/**
 * Logic to be run once per playlab tick
 *
 * @function
 * @name CustomGameLogic#onTick
 */

CustomGameLogic.prototype.onTick = function () {
  throw new Error('should be overridden by child');
};

/**
 * Logic to be run when game is reset
 */
CustomGameLogic.prototype.reset = function () {};

/**
 * Store a block in our cache, so that it can be called elsewhere
 */
CustomGameLogic.prototype.cacheBlock = function (key, block) {
  this.cached_[key] = block;
};

/**
 * Takes a cached block for a function of variable, and calculates the value
 * @returns The result of calling the code for the cached block. If the cached
 *   block was a function_pass, this means we get back a function that can
 *   now be called.
 */
CustomGameLogic.prototype.resolveCachedBlock_ = function (key) {
  var result = '';
  var block = this.cached_[key];
  if (!block) {
    return result;
  }

  var code = 'return ' + Blockly.JavaScript.blockToCode(block);
  result = CustomMarshalingInterpreter.evalWith(
    code,
    {
      Studio: api,
      Globals: Studio.Globals,
    },
    {legacy: true}
  );
  return result;
};

/**
 * getVar/getFunc just call resolveCachedBlock_, but are provided for clarity
 */
CustomGameLogic.prototype.getVar_ = function (key) {
  return this.resolveCachedBlock_(key);
};

CustomGameLogic.prototype.getFunc_ = function (key) {
  return this.resolveCachedBlock_(key) || function () {};
};

export default CustomGameLogic;
