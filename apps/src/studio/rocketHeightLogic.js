var CustomGameLogic = require('./customGameLogic');
var studioConstants = require('./constants');
var Direction = studioConstants.Direction;
var codegen = require('../codegen');
var api = require('./api');
require('../utils'); // Provides Function.prototype.inherits

/**
 * Custom logic for the Rocket Height levels
 * @constructor
 * @implements CustomGameLogic
 */
var RocketHeightLogic = function (studio) {
  CustomGameLogic.apply(this, arguments);
  this.rocketIndex = 0;
  this.last = Date.now();
  this.seconds = 0;
  // rocket and height for use in success/failure checking
  this.rocket = null;
  this.height = 0;

  // Use by successCondition/failureCondition
  this.SECONDS_TO_RUN = 8;
};
RocketHeightLogic.inherits(CustomGameLogic);

RocketHeightLogic.prototype.onTick = function () {
  if (this.studio_.tickCount === 1) {
    // Make sure fields are properly initialized, for example if we've run
    // and then reset.
    this.last = Date.now();
    this.seconds = 0;
    this.rocket = this.studio_.sprite[this.rocketIndex];
    this.height = 0;
    this.studio_.setBackground({value: 'space'});
  }

  // Update the rocket once a second
  if (Date.now() - this.last < 1000) {
    return;
  }
  this.last = Date.now();
  this.seconds++;

  // Display the rocket height and time elapsed
  this.height = this.rocket_height(this.seconds) || 0;
  this.rocket.y = this.studio_.MAZE_HEIGHT - (this.height + this.rocket.height);
  this.rocket.dir = Direction.NONE;
  this.studio_.scoreText = 'Time: ' + this.seconds + ' | Height: ' + this.height;
  this.studio_.displayScore();
};

/**
 * Calls the user provided rocket-height function, or no-op if none was provided.
 * @param {number} seconds Time elapsed since rocket launch
 * @returns {number} Height of rocket after seconds
 */
RocketHeightLogic.prototype.rocket_height = function (seconds) {
  return this.resolveCachedBlock_('VALUE')(seconds);
};

module.exports = RocketHeightLogic;
