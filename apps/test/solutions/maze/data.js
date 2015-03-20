module.exports = function () {
  return {
    skins: require('@cdo/apps/maze/skins'),
    levels: {
      levels: require('@cdo/apps/maze/levels'),
      karelLevels: require('@cdo/apps/maze/karelLevels'),
      wordsearchLevels: require('@cdo/apps/maze/wordsearchLevels')
    },
    blocks: require('@cdo/apps/maze/blocks')
  };
};
