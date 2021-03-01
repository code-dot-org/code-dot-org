/**
 * @file
 * We include these helpers at the top-level of our test suite, in the entry points, so that
 * we can detect unexpected uses of console.warn and console.error in all of our tests.
 * For that reason it's useful to keep these in a separate file and as dependency-free as
 * possible - please don't add other dependencies to this file unless absolutely necessary.
 * Thank you!
 */

/**
 * We want to be able to have test throw by default on console error/warning, but
 * also be able to allow these calls in specific tests. This method creates two
 * functions associated with the given console method (i.e. console.warn and
 * console.error). The first method - throwEverywhere - causes us to throw any
 * time the console method in question is called in this test scope. The second
 * method - allow - overrides that behavior, allowing calls to the console method.
 * Note: Intentionally not using sinon for this, to keep test bundle sizes down.
 */
function throwOnConsoleEverywhere(methodName) {
  let throwing = true;
  let wrappedMethod = null;

  return {
    // Method that will stub console[methodName] during each test and throw if
    // that method is called
    throwEverywhere() {
      beforeEach(function() {
        // Stash test title so that we can include it in the error
        let testTitle;
        if (this.currentTest) {
          testTitle = this.currentTest.title;
        }

        wrappedMethod = console[methodName];
        console[methodName] = msg => {
          const prefix = throwing ? '' : '[ignoring]';
          wrappedMethod.call(console, prefix, msg);

          // Throw error with stack trace of call
          if (throwing) {
            console[methodName] = wrappedMethod;
            wrappedMethod = null;
            throw new Error(
              `Call to console.${methodName} from "${testTitle}": ${msg}\n${getStack()}`
            );
          }
        };
      });

      afterEach(function() {
        if (wrappedMethod) {
          console[methodName] = wrappedMethod;
        }
        wrappedMethod = null;
      });
    },

    // Method to be called in tests that want console[methodName] to be called without
    // failure
    allow() {
      beforeEach(function() {
        throwing = false;
      });
      afterEach(function() {
        throwing = true;
      });
    }
  };
}

/**
 * Gets a stack trace for the current location. Phantomjs doesn't add the stack
 * property unless the exception is thrown, thus we need to throw/catch a generic error.
 */
function getStack() {
  let stack;
  try {
    throw new Error();
  } catch (e) {
    stack = e.stack;
  }
  return stack;
}

// Create/export methods for both console.error and console.warn
const consoleErrorFunctions = throwOnConsoleEverywhere('error');
export const throwOnConsoleErrorsEverywhere =
  consoleErrorFunctions.throwEverywhere;
export const allowConsoleErrors = consoleErrorFunctions.allow;

const consoleWarningFunctions = throwOnConsoleEverywhere('warn');
export const throwOnConsoleWarningsEverywhere =
  consoleWarningFunctions.throwEverywhere;
export const allowConsoleWarnings = consoleWarningFunctions.allow;
