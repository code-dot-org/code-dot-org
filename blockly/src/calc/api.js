var BlocklyApps = require('../base');

exports.log = [];

exports.draw = function(val, id) {
  this.log.push(['DRAW', val, id]);
};
