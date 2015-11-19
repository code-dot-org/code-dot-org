'use strict';

var studioApp = require('../StudioApp').singleton;
var utils = require('../utils');
var _ = utils.getLodash();
var skin, level;

function quote(str) {
  return '"' + str + '"';
}

exports.initWithSkinAndLevel = function (skinData, levelData) {
  skin = skinData;
  level = levelData;
};

exports.getPlaySoundValues = function (withRandom) {
  var names;
  if (withRandom) {
    names = ['random'];
  } else {
    names = [];
  }
  names = names.concat(skin.sounds);
  var restrictions = level.paramRestrictions && level.paramRestrictions.playSound;
  if (restrictions) {
    names = names.filter(function(name) {
      return restrictions[name];
    });
  }
  return names;
};

/**
 * Returns a list of sounds for our droplet playSound block.
 */

exports.playSoundDropdown = function () {
  var skinSoundMetadata = utils.valueOr(skin.soundMetadata, []);

  return exports.getPlaySoundValues(true).map(function (sound) {
    var lowercaseSound = sound.toLowerCase().trim();
    var handleChooseClick = function (callback) {
      var playbackOptions = $.extend({
        volume: 1.0
      }, _.find(skinSoundMetadata, function (metadata) {
        return metadata.name.toLowerCase().trim() === lowercaseSound;
      }));

      studioApp.playAudio(lowercaseSound, playbackOptions);
      callback(quote(sound));
    };
    return {
      text: quote(sound),
      display: quote(sound),
      click: handleChooseClick
    };
  });
};
