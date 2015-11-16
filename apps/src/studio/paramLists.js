var skin, level;

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

exports.playSoundDropdown = function () {
  return exports.getPlaySoundValues(true).map(function (sound) {
    return '"' + sound + '"';
  });
};
