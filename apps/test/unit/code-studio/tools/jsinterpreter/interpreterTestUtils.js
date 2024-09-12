import CustomMarshalingInterpreter from '@cdo/apps/code-studio/jsinterpreter/CustomMarshalingInterpreter';

export function attachAssertToInterpreter(interpreter, scope, assertion) {
  interpreter.setProperty(
    scope,
    'assert',
    interpreter.createNativeFunction((truthy, message) => {
      if (truthy !== interpreter.TRUE) {
        throw new Error('failed assertion: ' + assertion);
      }
    })
  );
}

/**
 * Given the params for the codegen.marshalNativeToInterpreter function, execute some code
 * inside the interpreter that can make assertions about the marshaled object.
 *
 * @param {CustomMarshalingInterpreter} interpreter - interpreter to use for making the assertion.
 *     the assertion fails.
 * @param {string} assertion - some code to run in the interpreter. This code will have
 *     access to a global assert() function which will throw an error in native land if
 *     the assertion fails.
 * @param nativeVar - same as nativeVar param of marshalNativeToInterpreter
 * @param nativeParentObj - same as nativeParentObj param of marshalNativeToInterpreter
 * @param maxDepth - same as maxDepth param of marshalNativeToInterpreter
 * @returns void
 */
export function makeAssertion(
  interpreter,
  assertion,
  nativeVar,
  nativeParentObj,
  maxDepth
) {
  const assertingInterpreter = new CustomMarshalingInterpreter(
    assertion,
    interpreter.customMarshaler,
    (assertingInterpreter, scope) => {
      attachAssertToInterpreter(assertingInterpreter, scope, assertion);
      const interpreterValue = assertingInterpreter.marshalNativeToInterpreter(
        nativeVar,
        nativeParentObj,
        maxDepth
      );
      assertingInterpreter.setProperty(scope, 'value', interpreterValue);
    }
  );
  assertingInterpreter.run();
}

export function makeAssertableObj(
  interpreter,
  nativeVar,
  nativeParentObj,
  maxDepth
) {
  const interpreterValue = interpreter.marshalNativeToInterpreter(
    nativeVar,
    nativeParentObj,
    maxDepth
  );
  return {
    assert: assertion =>
      makeAssertion(
        interpreter,
        assertion,
        nativeVar,
        nativeParentObj,
        maxDepth
      ),
    interpreterValue,
    nativeValue: nativeVar,
    nativeParentObj,
    maxDepth,
  };
}
