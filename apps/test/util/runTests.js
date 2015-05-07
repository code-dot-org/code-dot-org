var which = require('npm-which')(__dirname).sync;
var mochify = require('mochify');

// TODO (brent) get rid of this
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
    // Allow "npm test --grep=someTestHere" command
    // TODO (brent)
    // grep: process.env.npm_config_grep || '',
    // debug: process.env.npm_config_debug,
    grep: process.env.GREP,
    debug: process.env.DEBUG,
    reporter : 'spec',
    timeout: 10000,
    phantomjs: which('phantomjs'),
    transform: 'ejsify'
  }).bundle();

});
