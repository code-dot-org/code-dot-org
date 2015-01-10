// Options: locale (required), global, namespace, prepend, append
var transform = function(data) {
  var string = data.string;
  var options = data.options || {};
  if (!options.locale) {
    console.log('Error: Options `locale` is required.');
    return null;
  }
  options.namespace = options.namespace || 'i18n';
  options.global = options.global || 'this';
  var locale = options.locale;
  var namespace = options.namespace;
  if (!string) {
    return null;
  }

  var mf;
  var MessageFormat = require('messageformat');
  try {
    mf = new MessageFormat(locale, false, namespace);
  } catch (e) {
    // Fallback to English locale
    try {
      mf = new MessageFormat('en', false, namespace);
    } catch (e2) {
      console.log(e2.toString());
      return null;
    }
  }

  try {
    var str = [
      options.prepend,
      '(function(g){',
      'var ' + namespace + ' = ' + mf.functions() + ';',
      (namespace + '["' + namespace + '"] = ' + mf.precompileObject(JSON.parse(string)) + ';'),
      'return g["' + namespace + '"] = ' + namespace + ';',
      '})(' + options.global + ');',
      options.append
    ];
    return str.join(require('os').EOL);
  } catch (errs) {
    var message = '';
    if (errs.join) {
      message = errs.join('\n');
    } else {
      message = errs.name + ': ' +  errs.message;
    }
    console.log('Error (locale=' + locale + ': ' + message);
    return require('os').EOL;
  }
};

var path = require('path');
var messageFunc = function(file) {
  var filepath = file.path;
  var locale = path.basename(path.dirname(filepath));
  var app = path.basename(filepath, path.extname(filepath));
  var namespace = (app == 'common_locale' ? 'locale' : app);
  return {
    locale: locale.split('_')[0],
    namespace: app,
    prepend: "window.blockly = window.blockly || {};\n",
    append: "\nwindow.blockly." + namespace + " = " + app + "['" + app + "'];\n"
  };
};

function getTransform() {
  var stream = require('stream');
  var t = new stream.Transform({objectMode: true});
  t._transform = function (file, encoding, callback) {
    var output = transform({string: file.contents.toString(), options: messageFunc(file)});
    file.contents = output ? new Buffer(output) : null;
    return callback(null, file);
  };
  return t;
}

module.exports = getTransform;