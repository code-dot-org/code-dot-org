// Strict linting: Absorb into global config when possible
/* jshint
 unused: true,
 eqeqeq: true,
 maxlen: 120
 */

var codegen = require('./codegen');

// Array.sort
// iterative quicksort based on:
// http://www.stoimen.com/blog/2010/06/18/friday-algorithms-iterative-quicksort/
// (modified as a stateful native function to support callbacks)
exports.generateSort = function (jsInterpreter) {
  return function (opt_compFunc) {
    if (this.length <= 1) {
      return this;
    }
    var interpreter = jsInterpreter.interpreter;
    var i;
    var state = jsInterpreter.getCurrentState();
    var useCompareFunc = (typeof opt_compFunc !== 'undefined') &&
        (opt_compFunc !== interpreter.UNDEFINED);
    if (typeof state.__i === 'undefined') {
      state.__jsList = [];
      for (i = 0; i < this.length; i++) {
        state.__jsList[i] = this.properties[i];
      }
      if (useCompareFunc) {
        state.__sortStack = [state.__jsList];
        state.__sortedList = [];
      }
    }
    if (!useCompareFunc) {
      // No compare function supplied, use the native JS sort(), but supply
      // a compare function that marshals the interpreter values back to native
      // before comparing them.
      state.__jsList.sort(function (a, b) {
        var nativeA = codegen.marshalInterpreterToNative(interpreter, a);
        var nativeB = codegen.marshalInterpreterToNative(interpreter, b);
        return (nativeA < nativeB) ? -1 : (nativeA > nativeB ? 1 : 0);
      });
    } else {
      state.doneExec = false;

      var thisArray = this;
      var invokeCompare = function () {
        state.__callbackState = {};
        var nativeCompFunc = codegen.createNativeInterpreterCallback({
            interpreter: interpreter,
            dontMarshal: true,
            callbackState: state.__callbackState
          },
          opt_compFunc);

        nativeCompFunc.call(thisArray, state.__temp[state.__i], state.__pivot);
      };

      if (typeof state.__temp !== 'undefined') {
        if (state.__callbackState.value !== interpreter.UNDEFINED &&
            state.__callbackState.value.data < 0) {
          state.__left.push(state.__temp[state.__i]);
        } else {
          state.__right.push(state.__temp[state.__i]);
        }
        state.__i++;
        if (state.__i < state.__temp.length) {
          invokeCompare();
        } else {
          state.__left.push(state.__pivot);

          if (state.__right.length) {
            state.__sortStack.push(state.__right);
          }
          if (state.__left.length) {
            state.__sortStack.push(state.__left);
          }
          delete state.__temp;
        }
      }

      if (typeof state.__temp === 'undefined') {
        if (state.__sortStack.length) {
          state.__temp = state.__sortStack.pop();
          state.__pivot = state.__temp[0];

          if (state.__temp.length === 1) {
            state.__sortedList.push(state.__pivot);
            delete state.__temp;
          } else {
            state.__i = 1;
            state.__left = [];
            state.__right = [];

            invokeCompare();
          }
        } else {
          state.doneExec = true;
        }
      }
    }
    if (state.doneExec) {
      for (i = 0; i < state.__jsList.length; i++) {
        interpreter.setProperty(
            this,
            i,
            useCompareFunc ? state.__sortedList[i] : state.__jsList[i]);
      }
    }
    return this;
  };
};

