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
  let firstInstance = null;
  let wrappedMethod = null;

  return {
    // Method that will stub console[methodName] during each test and throw after
    // the test completes if it was called.
    throwEverywhere() {
      beforeEach(function() {
        // Stash test title so that we can include it in any errors
        let testTitle;
        if (this.currentTest) {
          testTitle = this.currentTest.title;
        }

        wrappedMethod = console[methodName];
        console[methodName] = msg => {
          const prefix = throwing ? '' : '[ignoring]';
          wrappedMethod.call(console, prefix, msg);

          // Store error so we can throw in after. This will ensure we hit a failure
          // even if message was originally thrown in async code
          if (throwing && !firstInstance) {
            console[methodName] = wrappedMethod;
            wrappedMethod = null;

            firstInstance = new Error(
              `Call to console.${methodName} from "${testTitle}": ${msg}\n${getStack()}`
            );
          }
        };
      });

      // After the test, throw an error if we called the console method.
      afterEach(function() {
        if (wrappedMethod) {
          console[methodName] = wrappedMethod;
        }
        wrappedMethod = null;
        if (firstInstance) {
          throw new Error(firstInstance);
        }
        firstInstance = null;
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
