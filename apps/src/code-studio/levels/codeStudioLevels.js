let registeredGetResult = null;

/**
 * A number of our levels provide a function that can be used to get results.
 * Previously this was just injected into the global namespace, making it
 * difficult to track. This makes both the registration and the usage more explicit.
 */
export function registerGetResult(getResultFunction=basicGetResult) {
  if (registeredGetResult) {
    console.error('already have a getResult function');
  }
  registeredGetResult = getResultFunction;
}

export function getResult() {
  if (!registeredGetResult) {
    console.error('No getResult function');
    return;
  }
  return registeredGetResult();
}

/**
 * At a minimum, our get result function should return an object with a response
 * and a result. This function is used by level types that don't need to return
 * more.
 */
function basicGetResult() {
  return {
    response: 'ok',
    result: true
  };
}
