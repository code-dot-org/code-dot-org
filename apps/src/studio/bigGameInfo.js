
var BigGameInfo = function () {
  this.functionNames = {};

  this.playerSpriteIndex = 0;
  this.targetSpriteIndex = 1;
  this.dangerSpriteIndex = 2;
};

BigGameInfo.prototype.onTick = function () {
   // Don't start until the title is over
  if (document.getElementById('titleScreenTitle').getAttribute('visibility') !== "hidden") {
    return;
  }

  // Update target


  // Studio.sprite[this.targetSpriteIndex].update();
  // Studio.sprite[this.dangerSpriteIndex].update();
};

/**
 * @returns the user provided update_target function, or no-op if none was
 *   provided.
 */
BigGameInfo.prototype.update_target = function (x) {
  return this.getPassedFunction_('update-target')(x);
};


BigGameInfo.prototype.update_danger = function (x) {
  return this.getPassedFunction_('update-danger')(x);
};

BigGameInfo.prototype.update_player = function (key, y) {
  return this.getPassedFunction_('update-player')(key, y);
};

BigGameInfo.prototype.onscreen = function (x) {
  return this.getPassedFunction_('onscreen?')(x);
};

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
