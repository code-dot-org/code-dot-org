let GameLab;

// API definitions for functions exposed for JavaScript (droplet/ace) levels.
// The p5/p5play API is injected separately.

export const injectGameLab = function(gamelab) {
  GameLab = gamelab;
};

export const getUserId = function() {
  return GameLab.executeCmd(null, 'getUserId');
};

export const getKeyValue = function(key, onSuccess, onError) {
  return GameLab.executeCmd(null, 'getKeyValue', {
    key,
    onSuccess,
    onError
  });
};

export const setKeyValue = function(key, value, onSuccess, onError) {
  return GameLab.executeCmd(null, 'setKeyValue', {
    key,
    value,
    onSuccess,
    onError
  });
};
