// Basic Express server with LiveReload watcher
var PORT = process.env.npm_package_config_port;
var tinylr = require('tiny-lr')();
var express = require('express');
var app = require('./src/dev/server.js');
app.use(express.static('./build/package'));
app.listen(PORT);
tinylr.listen(35729);
require('gaze')(['./build/**/*', './src/dev/**/*'], function(err, watcher) {
  this.on('all', function(event, path) {
    tinylr.changed({body: {files: [path]}});
  });
});
console.log('Started dev server on port ' + PORT);
