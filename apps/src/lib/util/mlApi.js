import $ from 'jquery';

import project from '@cdo/apps/code-studio/initApp/project';
import {predict} from '@cdo/apps/MLTrainers';

// In-memory cache of fetched model JSON, keyed by modelId. Lives for the
// lifetime of the page. Predictions against a cached model run synchronously.
const modelCache = new Map();

// In-flight fetches, keyed by modelId, so concurrent preload/getPrediction
// calls share a single network request.
const inFlight = new Map();

function fetchModel(modelId) {
  const pending = inFlight.get(modelId);
  if (pending) {
    return pending;
  }
  // jQuery's jqXHR is Promise-like but lacks .catch — wrap as a real Promise.
  const promise = new Promise((resolve, reject) => {
    $.ajax({
      url: '/api/v1/ml_models/' + modelId,
      method: 'GET',
    })
      .then(modelData => {
        modelCache.set(modelId, modelData);
        inFlight.delete(modelId);
        resolve(modelData);
      })
      .fail((jqXhr, status, err) => {
        inFlight.delete(modelId);
        reject(err || new Error('ml_models fetch failed: ' + status));
      });
  });
  inFlight.set(modelId, promise);
  return promise;
}

// Eagerly load and cache a model. Resolves on success, rejects on network
// or 404 failure. Callers can ignore the rejection — getPrediction will
// fall back to its own fetch and surface the error to the student.
export function preloadModel(modelId) {
  if (!modelId) {
    return Promise.reject(new Error('preloadModel requires a modelId'));
  }
  if (modelCache.has(modelId)) {
    return Promise.resolve(modelCache.get(modelId));
  }
  return fetchModel(modelId);
}

export function isModelCached(modelId) {
  return modelCache.has(modelId);
}

export function clearModelCache() {
  modelCache.clear();
  inFlight.clear();
}

function runPrediction(modelData, opts) {
  const result = predict({
    ...modelData,
    testData: opts.testValues,
  });
  opts.callback(result);
}

// Synchronous prediction. Returns the prediction value or a string error
// like 'Error: model not loaded'. Used by Sprite Lab's value-returning
// predict block, where the JS-Interpreter cannot invoke a callback inline
// during a single statement. Caller is responsible for warming the cache
// via preloadModel — the lab's preload phase does this on Run.
export function predictSync(opts) {
  const ref = resolveModelRef(opts);
  if (!ref) {
    return 'Error: no model loaded';
  }
  if (!modelCache.has(ref.modelId)) {
    return 'Error: model not loaded';
  }
  try {
    return predict({
      ...modelCache.get(ref.modelId),
      testData: opts.testValues,
    });
  } catch (e) {
    return 'Error: prediction failed';
  }
}

// Resolve which model a getPrediction call should use. Explicit modelId from
// the caller wins; otherwise fall back to the project's imported model. Returns
// {modelId, modelName} or null if neither source has one.
function resolveModelRef(opts) {
  if (opts.modelId) {
    return {modelId: opts.modelId, modelName: opts.modelName};
  }
  const imported = project.getAiModel?.();
  if (imported?.id) {
    return {modelId: imported.id, modelName: imported.name};
  }
  return null;
}

// Callback can be undefined if the block-generated code is malformed.
// Coerce so we never throw a "callback is not a function" TypeError back at
// the student.
function safeCallback(fn) {
  return typeof fn === 'function' ? fn : () => {};
}

export const commands = {
  getPrediction(opts) {
    // Sprite Lab uses a value-returning block (no callback). Run sync and
    // return the result directly so it lands in the same interpreter tick
    // as the caller's `var = getPrediction(...)` assignment.
    if (typeof opts.callback !== 'function') {
      return predictSync(opts);
    }
    opts = {...opts, callback: safeCallback(opts.callback)};
    const ref = resolveModelRef(opts);
    if (!ref) {
      opts.callback('Error: no model loaded');
      return Promise.resolve();
    }
    opts = {...opts, modelId: ref.modelId, modelName: ref.modelName};
    if (modelCache.has(opts.modelId)) {
      // Fast path — model is already loaded. Fire the callback in the
      // current tick so student code that depends on the result keeps the
      // synchronous feel of a Sprite Lab block.
      try {
        runPrediction(modelCache.get(opts.modelId), opts);
      } catch (e) {
        opts.callback('Error: prediction failed');
      }
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      fetchModel(opts.modelId)
        .then(modelData => {
          runPrediction(modelData, opts);
          resolve();
        })
        .catch(() => {
          opts.callback('Error: prediction failed');
          reject({message: 'An error occurred'});
        });
    });
  },
};
