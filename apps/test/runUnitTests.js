// Based on the documentation, it seems like npm-which SHOULD look through
// node_modules directories in parents in addition to the current directory.
// In practice, that doesn't seem to happen, so instead I'm hardcoding it's
// current directory to be our root
var which = require('npm-which')(__dirname + '/..').sync;
var mochify = require('mochify');
var exec = require('child_process').exec;
var command = which('linklocal');

exec(command, function (err, stdout, stderr) {
  if (err) {
    console.log(err);
    return;
  }

  var globs = ['./test/unit/**/*.js'];

  if (process.env.mocha_entry) {
    if (!/^\./.test(process.env.mocha_entry)) {
      process.env.mocha_entry = './' + process.env.mocha_entry;
    }
    globs = [process.env.mocha_entry];
    console.log('restricting to entries: ' + globs);
  }

  var grep = process.env.mocha_grep;

  if (process.env.mocha_entry) {
    console.log('Want to run these tests directly? Type:');
    console.log('./node_modules/.bin/mochify --extension .jsx --transform ejsify',
                globs.join(' '));
  }

  mochify(globs.join(' '), {
    grep: grep,
    debug: process.env.mocha_debug,
    extension: ['.jsx'],
    invert: process.env.mocha_invert,
    reporter : 'spec',
    timeout: 14000,
    phantomjs: which('phantomjs'),
    transform: 'ejsify',
    'web-security': false
  })
 .on('error', function () {
   console.trace();
   process.exit(1);
  })
  .bundle();
});
