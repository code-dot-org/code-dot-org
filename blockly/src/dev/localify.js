// A browserify transform which converts resolves "current" locale paths.
module.exports = function(locale) {

  var through = require('through');

  return function(file) {
    var buffer = '';
    return through(function(data) {
      buffer += data;
    }, function() {
      var rewritten = buffer.replace(/locale\/current/g, 'locale/' + locale);
      this.queue(rewritten);
      this.queue(null);
    });
  };

};
