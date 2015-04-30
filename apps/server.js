// Basic Express server with LiveReload watcher
var PORT = process.env.npm_package_config_port || 8000;
var tinylr = require('tiny-lr')();
var express = require('express');
var gaze = require('gaze');
var app = require('./src/dev/server.js');
app.use(express.static('./build/package'));
app.listen(PORT);
tinylr.listen(35729);

// There's some weirdness where making a single change results in two change
// events. If we did nothing, that would result in us double loading the page.
// I think this has to do with watchify and factor-bundle not playing super well
// together.
// I've introduced a hack where we wait 1000ms after a change event to see if we
// get another one, and then do the reload with whichever change came through last.
var changeInfo = null;
gaze(['./build/**/*'], function(err, watcher) {
  this.on('all', function(event, path) {
    if (!changeInfo) {
      setTimeout(function () {
        tinylr.changed(changeInfo);
        changeInfo = null;
      }, 1000);
    }

    changeInfo = {
      body: {
        files: [path]
      }
    };
  });
});
console.log('Started dev server on port ' + PORT);
