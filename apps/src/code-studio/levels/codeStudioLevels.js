window.dashboard = window.dashboard || {};

window.dashboard.codeStudioLevels = {
  // Store this on window.dashboard so that we don't need to worry about this
  // module being included in two different bundles (and having two different caches)
  __registeredGetResult: null,
  registerGetResult: registerGetResult
};

/**
 * A number of our levels provide a function that can be used to get results.
 * Previously this was just injected into the global namespace, making it
 * difficult to track. This makes both the registration and the usage more explicit.
 */
export function registerGetResult(getResultFunction) {
  if (window.dashboard.codeStudioLevels.__registeredGetResult) {
    console.error('already have a getResult function');
  }
  window.dashboard.codeStudioLevels.__registeredGetResult = getResultFunction;
}

export function getResult() {
  if (!window.dashboard.codeStudioLevels.__registeredGetResult) {
    console.error('No getResult function');
    return;
  }
  return window.dashboard.codeStudioLevels.__registeredGetResult();
}
