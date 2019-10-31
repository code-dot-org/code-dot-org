var appCache = {};

module.exports = function(app) {
  if (appCache[app]) {
    return appCache[app];
  }
  if (app === 'maze') {
    appCache[app] = function() {
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
  } else if (app === 'calc') {
    appCache[app] = function() {
      return {
        levels: {
          levels: require('@cdo/apps/calc/levels')
        },
        blocks: require('@cdo/apps/calc/blocks')
      };
    };
  } else if (app === 'flappy') {
    appCache[app] = function() {
      return {
        skins: require('@cdo/apps/flappy/skins'),
        levels: {
          levels: require('@cdo/apps/flappy/levels')
        },
        blocks: require('@cdo/apps/flappy/blocks')
      };
    };
  } else if (app === 'turtle') {
    appCache[app] = function() {
      return {
        skins: require('@cdo/apps/turtle/skins'),
        levels: {
          levels: require('@cdo/apps/turtle/levels')
        },
        blocks: require('@cdo/apps/turtle/blocks')
      };
    };
  } else if (app === 'eval') {
    appCache[app] = function() {
      return {
        levels: {
          levels: require('@cdo/apps/eval/levels')
        },
        blocks: require('@cdo/apps/eval/blocks')
      };
    };
  } else if (app === 'bounce') {
    appCache[app] = function() {
      return {
        skins: require('@cdo/apps/bounce/skins'),
        levels: {
          levels: require('@cdo/apps/bounce/levels')
        },
        blocks: require('@cdo/apps/bounce/blocks')
      };
    };
  } else if (app === 'studio') {
    appCache[app] = function() {
      return {
        skins: require('@cdo/apps/studio/skins'),
        levels: {
          levels: require('@cdo/apps/studio/levels')
        },
        blocks: require('@cdo/apps/studio/blocks')
      };
    };
  } else if (app === 'craft') {
    appCache[app] = function() {
      return {
        skins: require('@cdo/apps/craft/simple/skins'),
        levels: {
          levels: require('@cdo/apps/craft/simple/levels')
        },
        blocks: require('@cdo/apps/craft/simple/blocks')
      };
    };
  } else if (app === 'applab') {
    appCache[app] = function() {
      return {
        skins: require('@cdo/apps/applab/skins'),
        levels: {
          levels: require('@cdo/apps/applab/levels')
        }
      };
    };
  } else if (app === 'gamelab') {
    appCache[app] = function() {
      return {
        skins: require('@cdo/apps/p5lab/skins'),
        levels: {
          levels: require('@cdo/apps/p5lab/levels')
        }
      };
    };
  } else if (app === 'scratch') {
    appCache[app] = function() {
      return {};
    };
  }
  if (appCache[app]) {
    return appCache[app];
  }
};
