var which = require('npm-which')(__dirname).sync;
var mochify = require('mochify');

// TODO (brent) When we move to npm/gulp, we will want to take care of this
// logic in our gulpfile instead
// Right now we manually create a symbolic link to @cdo/apps
var fs = require('fs');
var exec = require('child_process').exec;
var target = __dirname + '/../../src/';
var nodePath = __dirname + '/../../node_modules/@cdo/apps';
var command = '';
if (!fs.existsSync(target)) {
  command = 'ln -s ' + target + ' ' + nodePath;
}

exec(command, function (err, stdout, stderr) {
  if (err) {
    console.log(err);
    return;
  }

  var globs = [
    './test/*.js',
    './test/calc/*.js',
    './test/netsim/*.js'
  ];
  mochify(globs.join(' '), {
    grep: process.env.mocha_grep,
    debug: process.env.mocha_debug,
    reporter : 'spec',
    timeout: 10000,
    phantomjs: which('phantomjs'),
    transform: 'ejsify',
    colors: true,
    color: true
  }).bundle();

});
