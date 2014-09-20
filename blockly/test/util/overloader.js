/**
 * Wraps require to do path replacement so that we can require files in our
 * src directory, and still properly require descendants
 */

var Module = require('module');

function Overloader(mapping, context) {
  this.mapping = mapping;
  this.verbose = false;
  this.context = context;
  this.originalRequire = Module.prototype.require;
}

Overloader.prototype.clearMap = function () {
  this.mapping = [];
};

Overloader.prototype.addMapping = function (search, replace) {
  this.mapping.push({search: search, replace: replace});
};

Overloader.prototype.require = function (path) {
  var self = this;

  // wrap require with our mapped version
  Module.prototype.require = function (path) {

    var mappedPath = path;

    // Right now we have the potential to match multiple pairs.  May want to
    // either limit to a single match, or allow for a caller to switch out
    // a switch/replace pair
    self.mapping.forEach(function (pair) {
      mappedPath = mappedPath.replace(pair.search, pair.replace);
    });
    mappedPath = mappedPath;

    var context = this.exports === Overloader ? self.context : this;
    if (self.verbose) {
      console.log("mapped " + path + " to " + mappedPath);
      console.log("context: " + context.filename);
    }

    return self.originalRequire.call(context, path[0] === '.' ? mappedPath : path);
  };

  // call our mapped version
  var module = require(path);

  // restore unmapped versin
  Module.prototype.require = self.originalRequire;

  // return the module we got
  return module;
};

module.exports = Overloader;
