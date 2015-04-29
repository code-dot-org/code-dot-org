var which = require('npm-which')(__dirname).sync;
var mochify = require('mochify');

mochify("./test/*.js ./test/calc/*.js ./test/netsim/*.js", {
  // Allow "npm test --grep=someTestHere" command
  grep: process.env.npm_config_grep || '',
  debug: process.env.npm_config_debug,
  reporter : 'spec',
  timeout: 10000,
  phantomjs: which('phantomjs')
}).bundle();
