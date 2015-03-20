module.exports = function () {
  return {
    skins: require('@cdo/apps/flappy/skins'),
    levels: {levels: require('@cdo/apps/flappy/levels')},
    blocks: require('@cdo/apps/flappy/blocks')
  };
};
