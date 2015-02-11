
var BigGameInfo = function () {
  this.functionNames = {};

  this.playerSpriteIndex = 0;
  this.targetSpriteIndex = 1;
  this.dangerSpriteIndex = 2;
};

BigGameInfo.prototype.onTick = function () {
   // Don't start until the title is over
  var titleScreenTitle = document.getElementById('titleScreenTitle');
  if (Studio.tickCount <= 1 ||
      titleScreenTitle.getAttribute('visibility') === "visible") {
    return;
  }

  console.log('big game tick');

  // Update target, using onscreen and update_target
  // Update danger, using onscreen and update_danger

  // For every key and button down, call update_player

};

/**
 * Calls the user provided update_target function, or no-op if none was provided.
 * @param {number} x Current x location of target
 * @returns {number} New x location of target
 */
BigGameInfo.prototype.update_target = function (x) {
  return this.getPassedFunction_('update-target')(x);
};

/**
 * Calls the user provided update_danger function, or no-op if none was provided.
 * @param {number} x Current x location of the danger sprite
 * @returns {number} New x location of the danger target
 */
BigGameInfo.prototype.update_danger = function (x) {
  return this.getPassedFunction_('update-danger')(x);
};

/**
 * Calls the user provided update_player function, or no-op if none was provided.
 // TODO (brent) is key going away now that we have keycode?
 * @param {number} key KeyCode of key that is down
 * @param {number} y Current y location of player. (is this in an inverted coordinate space?)
 * @returns {number} New y location of the player
 */
BigGameInfo.prototype.update_player = function (key, y) {
  return this.getPassedFunction_('update-player')(key, y);
};

/**
 * Calls the user provided onscreen? function, or no-op if none was provided.
 * @param {number} x An x location
 * @returns {boolean} True if x location is onscreen?
 */
BigGameInfo.prototype.onscreen = function (x) {
  return this.getPassedFunction_('onscreen?')(x);
};

/**
 * Calls the user provided collide? function, or no-op if none was provided.
 * @param {number} px Player's x location
 * @param {number} py Player's y location
 * @param {number} cx Collider's x location
 * @param {number} cy Collider's y location
 * @returns {boolean} True if objects collide
 */
BigGameInfo.prototype.collide = function (px, py, cx, cy) {
  return this.getPassedFunction_('collide?')(px, py, cx, cy);
};

/**
 * @returns the user function that was passed in
 */
BigGameInfo.prototype.getPassedFunction_ = function (name) {
  var userFunctionName = this.functionNames[name];
  if (!userFunctionName) {
    return function () {}; // noop
  }

  var userFunction = Studio.Globals[userFunctionName];
  if (!userFunction) {
    throw new Error('Unexepcted');
  }

  return userFunction;
};

  // TODO - reset?

module.exports = BigGameInfo;
