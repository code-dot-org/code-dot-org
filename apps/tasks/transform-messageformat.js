var MessageFormat = require('messageformat');
var stream = require('stream');
var os = require('os');
var path = require('path');

module.exports = function () {
  var t = new stream.Transform({ objectMode: true });
  t._transform = function (file, encoding, callback) {
    var output = transform(file);
    file.contents = output ? new Buffer(output) : null;
    return callback(null, file);
  };
  return t;
};

// Options: locale (required), global, namespace, prepend, append
function transform(file) {
  var filepath = file.path;
  var locale = path.basename(path.dirname(filepath));
  var app = path.basename(filepath, path.extname(filepath));
  var namespace = (app == 'common_locale' ? 'locale' : app);

  var contents = JSON.parse(file.contents.toString());
  return process(locale, namespace, contents);
}

function process(locale, namespace, json) {
  var mf;
  try {
    mf = new MessageFormat(locale, false, namespace);
  } catch (e) {
    // Fallback to en if locale is not found
    if(locale != 'en') {
      return process('en', namespace, json);
    } else {
      throw e;
    }
  }

  var EOL = os.EOL;
  try {
    return [
      'var ' + namespace + ' = ' + mf.functions() + ';',
      '(window.blockly = window.blockly || {}).' + namespace + ' = ' + mf.precompileObject(json) + ';'
    ].join(EOL);
  } catch (errs) {
    var message = '';
    if (errs.join) {
      message = errs.join('\n');
    } else {
      message = errs.name + ': ' +  errs.message;
    }
    console.log('Error (locale=' + locale + ': ' + message);
    return EOL;
  }
}
