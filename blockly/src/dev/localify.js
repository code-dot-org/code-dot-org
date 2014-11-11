// A browserify transform which converts "locale/current" locale paths to the resolved locale.
// See https://github.com/substack/node-browserify#btransformopts-tr
// "If transform is a function, it will be called with transform(file) and it should return a
// [through-stream](https://github.com/substack/stream-handbook#through) that takes the raw file contents and produces the transformed source."
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
