import {singleton as studioApp} from '../StudioApp';
import {quote, valueOr} from '../utils';
import _ from 'lodash';
var skin, level;

const initWithSkinAndLevel = function (skinData, levelData) {
  skin = skinData;
  level = levelData;
};

const getPlaySoundValues = function (withRandom) {
  var names;
  if (withRandom) {
    names = ['random'];
  } else {
    names = [];
  }

  if (skin && skin.sounds) {
    names = names.concat(skin.sounds);
    if (withRandom) {
      // Insert a random value for each sound group before the first sound in the group:
      for (var group in skin.soundGroups) {
        var insertIndex = names.indexOf(
          group + skin.soundGroups[group].minSuffix
        );
        if (insertIndex !== -1) {
          names.splice(insertIndex, 0, skin.soundGroups[group].randomValue);
        }
      }
    }
  }

  if (level && level.paramRestrictions && level.paramRestrictions.playSound) {
    var restrictions = level.paramRestrictions.playSound;
    names = names.filter(function (name) {
      return restrictions[name];
    });
  }

  return names;
};

/**
 * Returns a list of sounds for our droplet playSound block.
 */

const playSoundDropdown = function () {
  var skinSoundMetadata = valueOr(skin.soundMetadata, []);

  return getPlaySoundValues(true).map(function (sound) {
    var lowercaseSound = sound.toLowerCase().trim();
    var handleChooseClick = function (callback) {
      var playbackOptions = Object.assign(
        {
          volume: 1.0,
        },
        _.find(skinSoundMetadata, function (metadata) {
          return metadata.name.toLowerCase().trim() === lowercaseSound;
        })
      );

      studioApp().playAudio(lowercaseSound, playbackOptions);
      callback(quote(sound));
    };
    return {
      text: quote(sound),
      display: quote(sound),
      click: handleChooseClick,
    };
  });
};

export default {
  initWithSkinAndLevel,
  getPlaySoundValues,
  playSoundDropdown,
};
