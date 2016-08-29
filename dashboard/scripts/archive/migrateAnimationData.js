#!/usr/bin/node

var fs = require('fs');
var xml2js = require('xml2js');

// Script for updating .level files to support newly-required Game Lab animation
// properties.  Makes the following changes:
//
// 1. Introduces `frameDelay`.  If frameRate was set, frameDelay is calculated.
//    Otherwise a default frameDelay of 2 is provided.
// 2. Removes `frameRate`.
// 3. Introduces `looping`, default true.
//
// Deploy plan:
// 1. Lock levelbuilder (ask everyone to save work, like a deploy)
// 2. Scoop + commit existing content changes.
// 3. `npm install xml2js` to install this script's one dependency.
// 4. Run this script, to manually update .level files
// 5. Commit script changes, to ensure they are isolated and can be reverted.
// 6. bin/start-build to ensure script changes are picked up.
// 7. Push to origin/levelbuilder.
// 8. `rm -rf node_modules` to uninstall xml2js
// 9. Unlock levelbuilder

var LEVELS_DIR = './dashboard/config/scripts/levels';

// For each .level file
fs.readdir(LEVELS_DIR, function (err, files) {
  files
    .filter(function (filename) { return /\.level$/.test(filename); })
    .forEach(function (filename) {
      fs.readFile(LEVELS_DIR + '/' + filename, 'utf8', function (err, data) {
        if (err) {
          throw err;
        }
        xml2js.parseString(data, function (err, parsedXML) {
          if (!parsedXML.hasOwnProperty('Gamelab')) {
            return;
          }

          var parsedConfig = JSON.parse(parsedXML.Gamelab.config);
          if (!parsedConfig.hasOwnProperty('properties')) {
            return;
          }

          if (!parsedConfig.properties.start_animations) {
            return;
          }

          var parsedStartAnimations = JSON.parse(parsedConfig.properties.start_animations);

          for (var key in parsedStartAnimations.propsByKey) {
            var value = parsedStartAnimations.propsByKey[key];
            if (value.frameRate) {
              value.frameDelay = Math.round(30 / value.frameRate);
              delete value.frameRate;
            } else {
              value.frameDelay = 2;
            }

            if (value.looping === undefined) {
              value.looping = true;
            }
          }

          var correctedJSON = JSON.stringify(JSON.stringify(parsedStartAnimations, null, 4));
          var correctedFile = data.replace(/"start_animations":[^\n]*\n/, '"start_animations": ' + correctedJSON + ',\n');
          fs.writeFile(
              LEVELS_DIR + '/' + filename,
              correctedFile,
              'utf8',
              function () {
                console.log(filename);
              });
        });
      });
    });
});
