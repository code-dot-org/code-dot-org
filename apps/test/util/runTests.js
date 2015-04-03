var which = require('npm-which')(__dirname).sync;
var mochify = require('mochify');
mochify("./test/*.js ./test/calc/*.js ./test/netsim/*.js", {
  grep: process.env.npm_config_grep || '',
  reporter : 'spec',
  timeout: 10000,
  phantomjs: which('phantomjs')
}).bundle();
