let registeredGetResult = null;
let answerChangedFn = null;

/**
 * At a minimum, our get result function should return an object with a response
 * and a result. This function is used by level types that don't need to return
 * more.
 * Eventually we may want to just always use this if the page didn't explicitly
 * register a getResult function, but I'd like to start out requiring explicit
 * registration to better catch any places where we unintentionally fail to register.
 */
function basicGetResult() {
  return {
    response: 'ok',
    result: true
  };
}

/**
 * A number of our levels provide a function that can be used to get results.
 * Previously this was just injected into the global namespace, making it
 * difficult to track. This makes both the registration and the usage more explicit.
 */
export function registerGetResult(getResultFunction=basicGetResult) {
  if (registeredGetResult) {
    console.error('already have a getResult function');
    return;
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
 * Register a handler that will be told when one of our answers changes.
 * Provided function will be told the levelId, and whether or not this is a
 * change that should result in a save
 */
export function registerAnswerChangedFn(fn) {
  answerChangedFn = fn;
}

/**
 * @param {string} levelId
 * @param {boolean?} saveThisAnswer
 */
export function onAnswerChanged(levelId, saveThisAnswer) {
  if (answerChangedFn) {
    return answerChangedFn(levelId, saveThisAnswer);
  }
}
