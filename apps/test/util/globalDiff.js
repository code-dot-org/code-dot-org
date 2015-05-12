/**
 * Diff the set of keys in the global variable, to track things being added.
 * Does not account for differences in existing keys
 */

var GlobalDiff = function () {
  this.lastGlobal = null;
};

GlobalDiff.prototype.cache = function () {
  this.lastGlobal = Object.keys(global);
};

/**
 * @param {bool} cache Will do a cache and diff if true
 */
GlobalDiff.prototype.diff = function (cache) {
  var self = this;
  var current = Object.keys(global);
  var diff = [];
  current.forEach(function(key) {
    if (self.lastGlobal.indexOf(key) === -1) {
      diff.push(key);
    }
  });
  if (cache) {
    self.lastGlobal = current;
  }
  return diff;
};

module.exports = GlobalDiff;
