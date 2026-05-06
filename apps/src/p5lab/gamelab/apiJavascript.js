let GameLab;

// API definitions for functions exposed for JavaScript (droplet/ace) levels.
// The p5/p5play API is injected separately.

export const injectGameLab = function (gamelab) {
  GameLab = gamelab;
};

export const getUserId = function () {
  return GameLab.executeCmd(null, 'getUserId');
};

export const getKeyValue = function (key, onSuccess, onError) {
  return GameLab.executeCmd(null, 'getKeyValue', {
    key,
    onSuccess,
    onError,
  });
};

export const setKeyValue = function (key, value, onSuccess, onError) {
  return GameLab.executeCmd(null, 'setKeyValue', {
    key,
    value,
    onSuccess,
    onError,
  });
};

// Run a prediction against a trained AI Lab model. Two call shapes:
//   getPrediction(modelName, modelId, testValues, callback)
//   getPrediction(testValues, callback)              -- uses imported model
export const getPrediction = function (
  modelName,
  modelId,
  testValues,
  callback
) {
  if (typeof modelName === 'object' && typeof modelId === 'function') {
    callback = modelId;
    testValues = modelName;
    modelName = undefined;
    modelId = undefined;
  }
  return GameLab.executeCmd(null, 'getPrediction', {
    modelName,
    modelId,
    testValues,
    callback,
  });
};
