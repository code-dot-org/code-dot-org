import Interpreter from '@code-dot-org/js-interpreter';
import type {
  StateStack,
  InterpreterScope,
  InterpreterObject,
  MakeNativeOptions,
} from '@code-dot-org/js-interpreter';

import CustomMarshaler from './CustomMarshaler';

/**
 * Property access wrapped in try/catch. This is in an indepedendent function
 * so the JIT compiler can optimize the calling function.
 */
function safeReadProperty(
  object: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  },
  property: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  try {
    return object[property];
  } catch (_) {
    // Allow errors to silently be ignored
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isCanvasImageData(nativeVar: any): boolean {
  return nativeVar instanceof Uint8ClampedArray;
}

class CustomMarshalingInterpreter extends Interpreter {
  customMarshaler?: CustomMarshaler;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  asyncFunctionList?: any[];

  constructor(
    code: string,
    customMarshaler: CustomMarshaler,
    opt_initFunc: (
      thisInterpreter: CustomMarshalingInterpreter,
      scope: InterpreterScope,
    ) => void,
  ) {
    super(code, (thisInterpreter, scope) => {
      const thisCustomInterpreter: CustomMarshalingInterpreter =
        thisInterpreter as unknown as CustomMarshalingInterpreter;
      thisInterpreter.functionMap_.VariableDeclaration =
        thisInterpreter.stepVariableDeclaration.bind(thisInterpreter);
      thisInterpreter.functionMap_.VariableDeclarator =
        thisInterpreter.stepVariableDeclarator.bind(thisInterpreter);
      thisCustomInterpreter.asyncFunctionList = [];
      thisCustomInterpreter.customMarshaler = customMarshaler;
      if (opt_initFunc) {
        opt_initFunc(thisCustomInterpreter, scope);
      }
    });

    // Program nodes always have end=0 for some reason (acorn related).
    // The Interpreter.step method assumes that a falsey state.node.end value means
    // the interpreter is inside polyfill code, because it strips all location information from ast nodes for polyfill code.
    // This means the interpreter will sometimes step more often than necessary. This is a problem for us when breakpoints
    // are turned on because the interpreter can step over nodes that we need to check before they get stepped, resulting
    // in an infinite loop.
    // Also, our code likes them to have end=1 for historical reasons, the result
    // being that unhandled exceptions will highlight the first character
    // of the program. The logic below preserves that behavior:
    if (this.ast && this.ast.type === 'Program') {
      this.ast.end = 1;
    }
  }

  /**
   * Look at a single frame on the stack.
   * @param {number} [i] - optional index to look down to on the stack
   */
  peekStackFrame(i = 0): StateStack {
    return this.stateStack[this.stateStack.length - 1 - i];
  }

  /**
   * Pop the top frame off the stack and return it.
   */
  popStackFrame(): StateStack | undefined {
    return this.stateStack.pop();
  }

  /**
   * Push a new frame onto the stack
   * @returns the size of the stack after pushing the new frame
   */
  pushStackFrame(state: StateStack): number {
    return this.stateStack.push(state);
  }

  /**
   * Get the current size/depth of the stack
   */
  getStackDepth(): number {
    return this.stateStack.length;
  }

  /**
   * Set the entire stack to the provided value
   * @param {Array} stack - an array of stack frames
   */
  setStack(stack: StateStack[]) {
    this.stateStack = stack;
  }

  /**
   * Helper to determine if we should prevent custom marshalling from occurring
   * in a situation where we normally would use it. Allows us to block from a
   * specific list of properties and a hardcoded list of instance types that are
   * not safe to return into the interpreter sandbox.
   *
   * @param {string} name Name of property.
   * @param {!Object} obj Data object.
   * @param {Object} nativeParent Native parent object (if parented).
   * @return {boolean} true if property access should be blocked.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shouldBlockCustomMarshalling_(name: string, obj: any, nativeParent?: any) {
    if (!this.customMarshaler) {
      return true;
    }

    if (-1 !== this.customMarshaler.blockedProperties.indexOf(name)) {
      return true;
    }

    const value = obj.isCustomMarshal ? obj.data[name] : nativeParent?.[name];
    if (value instanceof Node || value instanceof Window) {
      return true;
    }

    return false;
  }

  /**
   * Wrapper to Interpreter's getProperty (extended for custom marshaling)
   *
   * Fetch a property value from a data object.
   * @param {!Object} obj Data object.
   * @param {*} name Name of property.
   * @return {!Object} Property value (may be UNDEFINED).
   * @override
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getProperty(obj: any, name: string): InterpreterObject | null {
    name = name.toString();
    let customMarshalValue;
    if (obj.isCustomMarshal) {
      if (this.shouldBlockCustomMarshalling_(name, obj)) {
        return this.UNDEFINED;
      } else {
        customMarshalValue = obj.data[name];
        if (typeof customMarshalValue === 'undefined') {
          return super.getProperty(obj, name);
        }
      }
    } else {
      const nativeParent = this.getNativeParent_(obj, name);
      if (nativeParent) {
        customMarshalValue = nativeParent[name];
      } else {
        return super.getProperty(obj, name);
      }
    }
    const type = typeof customMarshalValue;
    if (
      type === 'number' ||
      type === 'boolean' ||
      type === 'string' ||
      type === 'undefined' ||
      customMarshalValue === null
    ) {
      return this.createPrimitive(customMarshalValue);
    } else {
      return (
        this.marshalNativeToInterpreter(customMarshalValue, obj.data) || null
      );
    }
  }

  /**
   * Returns the native parent of a custom marshaled object, if one exists.
   * Specific cases that are accounted for are detailed in the conditional below.
   *
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getNativeParent_(obj: any, name: string): any {
    let hasProperty = false;
    if (obj && !obj.isPrimitive) {
      hasProperty = super.hasProperty(obj, name);
    }
    let nativeParent;
    if (
      /**
       * 1. the values of custom marshaled globals can be overridden into interpreter values
       *    on the global scope. If a variable with the same name has been declared on the
       *    global scope, then don't try to look up the native parent.
       */
      !hasProperty &&
      /**
       * 2. custom marshaled objects can only be mounted on the global scope. Therefore
       *    only look up a native parent if we are asking for a property on the global scope.
       */
      obj === this.global &&
      /**
       * 3. Assuming the above conditions pass, lookup the native parent among the list
       * of global properties specified in the custom marshaler's configuration.
       */
      !!(nativeParent = this.customMarshaler?.globalProperties?.[name]) &&
      /**
       * 4. If the property being looked up has been explicitly blocked from custom
       * marshalling, then don't return the native parent.
       */
      !this.shouldBlockCustomMarshalling_(name, obj, nativeParent)
    ) {
      return nativeParent;
    }
  }

  /**
   * Wrapper to Interpreter's hasProperty (extended for custom marshaling)
   *
   * Does the named property exist on a data object.
   * @param {!Object} obj Data object.
   * @param {*} name Name of property.
   * @return {boolean} True if property exists.
   * @override
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hasProperty(obj: any, name: string): boolean {
    name = name.toString();
    if (obj.isCustomMarshal) {
      if (this.shouldBlockCustomMarshalling_(name, obj)) {
        return false;
      } else {
        return name in obj.data || super.hasProperty(obj, name);
      }
    } else {
      if (this.getNativeParent_(obj, name)) {
        return true;
      }
      return super.hasProperty(obj, name);
    }
  }

  /**
   * Wrapper to Interpreter's setProperty (extended for custom marshaling)
   *
   * Set a property value on a data object.
   * @param {!Object} obj Data object.
   * @param {*} name Name of property.
   * @param {*} value New property value.
   * @param {Object=} opt_descriptor Optional descriptor object.
   * @return {!Interpreter.Object|undefined} Returns a setter function if one
   *     needs to be called, otherwise undefined.
   * @override
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setProperty(obj: any, name: string, value: any, opt_descriptor?: object) {
    name = name.toString();
    if (obj.isCustomMarshal) {
      if (!this.shouldBlockCustomMarshalling_(name, obj)) {
        if (
          !Object.prototype.hasOwnProperty.call(obj.data, name) &&
          value instanceof Interpreter.Object
        ) {
          // When assigning an interpreter object as a property on a
          // CustomMarshal object that doesn't already have a native property
          // with the same name, assume that we expect the object to be
          // used purely within the interpreter by student code.

          // This allows interpreter arrays, objects, and functions to be tacked
          // on to CustomMarshal objects
          return super.setProperty(obj, name, value, opt_descriptor);
        }
        obj.data[name] = this.marshalInterpreterToNative(value);
      }
    } else {
      const nativeParent = this.getNativeParent_(obj, name);
      if (nativeParent) {
        nativeParent[name] = this.marshalInterpreterToNative(value);
      } else {
        return super.setProperty(obj, name, value, opt_descriptor);
      }
    }
  }

  /**
   * provides access to the original setProperty method to avoid
   * custom marshaling in certain very specific cases.
   */

  setPropertyWithoutCustomMarshaling(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj: any,
    name: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    opt_descriptor?: object,
  ) {
    return super.setProperty(obj, name, value, opt_descriptor);
  }

  // The following overridden methods need to be patched in order to support custom marshaling.

  // These changes revert a 10% speedup commit that bypassed hasProperty,
  // getProperty, and setProperty:
  // https://github.com/NeilFraser/JS-Interpreter/commit/c6f25b4a30046a858e5e90a92a8c0d24a93c0231

  /**
   * Retrieves a value from the scope chain.
   * @param {!Object} name Name of variable.
   * @return {!Object} The value.
   * @override
   */
  getValueFromScope(name: string): object | null {
    let scope: InterpreterScope | undefined = this.getScope();
    const nameStr = name.toString();
    while (scope) {
      if (this.hasProperty(scope, nameStr)) {
        return this.getProperty(scope, nameStr);
      }
      scope = scope.parentScope;
    }
    // The root scope is also an object which has inherited properties and
    // could also have getters.
    if (scope === this.global && this.hasProperty(scope, nameStr)) {
      return this.getProperty(scope, nameStr);
    }
    // Typeof operator is unique: it can safely look at non-defined variables.
    const prevNode = this.stateStack[this.stateStack.length - 1].node;
    if (prevNode.type === 'UnaryExpression' && prevNode.operator === 'typeof') {
      return this.UNDEFINED;
    }
    this.throwException(this.REFERENCE_ERROR, nameStr + ' is not defined');
    return null;
  }

  /**
   * Sets a value to the current scope.
   * @param {!Object} name Name of variable.
   * @param {!Object} value Value.
   * @param {boolean} declarator true if called from variable declarator.
   * @override
   */
  setValueToScope(name: string | object, value: string, declarator?: boolean) {
    let scope: InterpreterScope | undefined = this.getScope();
    const strict = scope?.strict || false;
    const nameStr = name.toString();
    while (scope) {
      if (this.hasProperty(scope, nameStr) || (!strict && !scope.parentScope)) {
        if (declarator) {
          // from a declarator, always call baseSetProperty
          super.setProperty(scope, nameStr, value);
        } else {
          this.setProperty(scope, nameStr, value);
        }
        return;
      }
      scope = scope.parentScope;
    }
    this.throwException('Unknown identifier: ' + nameStr);
  }

  /**
   * Sets a value to the scope chain or to an object property.
   * @param {!Object|!Array} left Name of variable or object/propname tuple.
   * @param {!Object} value Value.
   * @param {boolean} declarator true if called from variable declarator.
   * @override
   */

  setValue(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    left: [any, string] | string | object,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    declarator?: boolean,
  ) {
    if (left instanceof Array) {
      return super.setValue(left, value);
    } else {
      this.setValueToScope(left, value, declarator);
      return;
    }
  }

  /**
   * Patches stepVariableDeclaration to not include performance improvement from
   * https://github.com/NeilFraser/JS-Interpreter/commit/5139e93ae5a918206642d05d40bbea208d379b01
   * which causes various other patches we've made to break.
   * TODO (pcardune): revisit this and see if you can get the new version to work
   *      with all of our other stuff.
   * @override
   */
  stepVariableDeclaration() {
    const state = this.peekStackFrame();
    const node = state.node;
    const n = state.n_ || 0;
    if (node?.declarations?.[n]) {
      state.n_ = n + 1;
      this.stateStack.push({node: node.declarations[n]});
    } else {
      this.stateStack.pop();
    }
  }

  /**
   * Patched to add the 3rd "declarator" parameter on the setValue() call(s).
   * Changed to call setValue with this.UNDEFINED when there is no node.init
   * and JSInterpreter.baseHasProperty returns false for current scope.
   * @override
   */
  stepVariableDeclarator() {
    const state = this.peekStackFrame();
    const node = state.node;
    if (node.init && !state.done_) {
      state.done_ = true;
      this.pushStackFrame({node: node.init});
      return;
    }
    if (node.init) {
      this.setValue(this.createPrimitive(node.id?.name), state.value, true);
    }
    this.popStackFrame();
  }

  /**
   * Marshal a single native object from native to interpreter. This is in an
   * indepedendent function so the JIT compiler can optimize the calling function.
   * (Chrome V8 says ForInStatement is not fast case)
   *
   * @param {Interpreter} interpreter Interpreter instance
   * @param {Object} nativeObject Object to marshal
   * @param {Number} maxDepth Optional maximum depth to traverse in properties
   * @param {Object} interpreterObject Optional existing interpreter object
   * @return {!Object} The interpreter object, which was created if needed.
   */

  marshalNativeToInterpreterObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nativeObject: any,
    maxDepth: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interpreterObject?: any,
  ): object {
    const retVal = interpreterObject || this.createObject(this.OBJECT);
    const isFunc = this.isa(retVal, this.FUNCTION);
    const JQueryFunction = Function.prototype as unknown as {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      trigger: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      inherits: any;
    };
    for (const prop in nativeObject) {
      const value = safeReadProperty(nativeObject, prop);
      if (
        isFunc &&
        (value === JQueryFunction.trigger || value === JQueryFunction.inherits)
      ) {
        // Don't marshal these that were added by jquery or else we will recurse
        continue;
      }
      this.setProperty(
        retVal,
        prop,
        this.marshalNativeToInterpreter(value, nativeObject, maxDepth),
      );
    }
    return retVal;
  }

  /**
   * Generate a function wrapper for an interpreter callback that will be
   * invoked by a special native function that can execute these callbacks inline
   * on the interpreter stack.
   *
   * @param {!Object} opts Options block
   * @param {!Interpreter} opts.interpreter Interpreter instance
   * @param {number} [opts.maxDepth] Maximum depth to marshal objects
   * @param {Object} [opts.callbackState] callback state object, which will
   *        hold the unmarshaled return value as a 'value' property later.
   * @param {Function} intFunc The interpreter supplied callback function
   */

  marshalNativeToInterpreter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nativeVar: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nativeParentObj: any,
    maxDepth?: number,
  ): InterpreterObject {
    if (maxDepth === 0 || typeof nativeVar === 'undefined') {
      return this.UNDEFINED;
    }
    let i;
    let retVal: InterpreterObject | undefined;
    if (typeof maxDepth === 'undefined') {
      maxDepth = Infinity; // default to infinite levels of depth
    }
    if (
      this.customMarshaler?.shouldCustomMarshalObject(
        nativeVar,
        nativeParentObj,
      )
    ) {
      return this.customMarshaler.createCustomMarshalObject(
        this,
        nativeVar,
        nativeParentObj,
      );
    }

    if (nativeVar instanceof Array) {
      retVal = this.createObject(this.ARRAY);
      for (i = 0; i < nativeVar.length; i++) {
        retVal.properties ||= [];
        retVal.properties[i] = this.marshalNativeToInterpreter(
          nativeVar[i],
          null,
          maxDepth - 1,
        );
      }
      retVal.length = nativeVar.length;
    } else if (isCanvasImageData(nativeVar)) {
      // Special case for canvas image data - could expand to support TypedArray
      retVal = this.createObject(this.ARRAY);
      for (i = 0; i < nativeVar.length; i++) {
        retVal.properties ||= [];
        retVal.properties[i] = this.createPrimitive(nativeVar[i]);
      }
      retVal.length = nativeVar.length;
    } else if (nativeVar instanceof Function) {
      const makeNativeOpts: MakeNativeOptions = {
        nativeFunc: nativeVar,
        nativeParentObj: nativeParentObj,
      };
      if (this.asyncFunctionList?.indexOf(nativeVar) !== -1) {
        // Mark if this should be nativeIsAsync:
        makeNativeOpts.nativeIsAsync = true;
      }
      const extraOpts =
        this.customMarshaler?.getCustomMarshalMethodOptions(
          nativeParentObj,
          nativeVar,
        ) || {};
      // Add extra options if the parent of this function is in our custom marshal
      // modified object list:
      for (const prop in extraOpts) {
        makeNativeOpts[prop] = extraOpts[prop];
      }
      const wrapper = this.makeNativeMemberFunction(makeNativeOpts);
      if (makeNativeOpts.nativeIsAsync) {
        retVal = this.createAsyncFunction(wrapper);
      } else {
        retVal = this.createNativeFunction(wrapper);
      }
      // Also marshal properties on the native function object:
      this.marshalNativeToInterpreterObject(nativeVar, maxDepth - 1, retVal);
    } else if (nativeVar instanceof Object) {
      // note Object must be checked after Function and Array (since they are also Objects)
      if (this.isa(nativeVar, this.FUNCTION)) {
        // Special case to see if we are trying to marshal an interpreter object
        // (this currently happens when we store interpreter function objects in native
        //  and return them back in nativeGetCallback)

        // NOTE: this check could be expanded to check for other interpreter object types
        // if we have reason to believe that we may be passing those back

        retVal = nativeVar;
      } else {
        retVal = this.marshalNativeToInterpreterObject(nativeVar, maxDepth - 1);
      }
    }

    return retVal || this.createPrimitive(nativeVar);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  marshalInterpreterToNative(interpreterVar: any): any {
    if (interpreterVar.isPrimitive || interpreterVar.isCustomMarshal) {
      return interpreterVar.data;
    } else if (this.isa(interpreterVar, this.ARRAY)) {
      const nativeArray = [];
      nativeArray.length = interpreterVar.length;
      for (let i = 0; i < nativeArray.length; i++) {
        nativeArray[i] = this.marshalInterpreterToNative(
          interpreterVar.properties[i],
        );
      }
      return nativeArray;
    } else if (
      this.isa(interpreterVar, this.OBJECT) ||
      interpreterVar.type === 'object'
    ) {
      const nativeObject: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
      } = {};
      for (const prop in interpreterVar.properties) {
        if (interpreterVar.notEnumerable[prop]) {
          // skip properties which are not enumerable.
          continue;
        }
        nativeObject[prop] = this.marshalInterpreterToNative(
          interpreterVar.properties[prop],
        );
      }
      return nativeObject;
    } else if (this.isa(interpreterVar, this.FUNCTION)) {
      /*
      if (
        CustomMarshalingInterpreter.createNativeFunctionFromInterpreterFunction
      ) {
        return CustomMarshalingInterpreter.createNativeFunctionFromInterpreterFunction(
          interpreterVar,
        );
      } else {*/
      // Just return the interpreter object if we can't convert it. This is needed
      // for passing interpreter callback functions into native.

      return interpreterVar;
      /*}*/
    } else {
      throw new Error("Can't marshal type " + typeof interpreterVar);
    }
  }

  /**
   * Generate a function wrapper for an interpreter async function callback.
   * The interpreter async function callback takes a single parameter, which
   * becomes the return value of the synchronous function in the interpreter
   * world. Here, we wrap the supplied callback to marshal the single parameter
   * from native to interpreter before calling the supplied callback.
   *
   * @param {Object} opts - Options block with interpreter and maxDepth provided
   * @param {number} opts.maxDepth - the maximum depth to recurse when marshaling
   * @param {function} callback - The interpreter supplied callback function
   * @private
   */
  createNativeCallbackForAsyncFunction_(
    opts: MakeNativeOptions,
    callback: (obj: object) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): (nativeValue: any) => void {
    return nativeValue => {
      callback(
        this.marshalNativeToInterpreter(nativeValue, null, opts.maxDepth),
      );
    };
  }

  /**
   * Generate a function wrapper for an interpreter callback that will be
   * invoked by a special native function that can execute these callbacks inline
   * on the interpreter stack.
   *
   * @param {!Object} opts Options block
   * @param {number} [opts.maxDepth] Maximum depth to marshal objects
   * @param {Object} [opts.callbackState] callback state object, which will
   *        hold the unmarshaled return value as a 'value' property later.
   * @param {Function} intFunc The interpreter supplied callback function
   * @private
   */
  createNativeInterpreterCallback_(
    opts: MakeNativeOptions,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    intFunc: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (...args: any[]) => {
      const intArgs = args.map(arg =>
        this.marshalNativeToInterpreter(arg, null, opts.maxDepth),
      );
      // Shift a CallExpression node on the stack that already has its func_,
      // arguments, and other state populated:
      const state: StateStack = {
        ...(opts.callbackState || {}),
        node: {
          type: 'CallExpression',
          arguments:
            intArgs /* this just needs to be an array of the same size */,
          // give this node an end so that the interpreter doesn't treat it
          // like polyfill code and do weird weird scray terrible things.
          end: 1,
        },
      };
      state.doneCallee_ = true;
      state.func_ = intFunc;
      state.arguments_ = intArgs;
      state.n_ = intArgs.length;

      // remove the last argument because stepCallExpression always wants to push it back on.
      if (state.arguments_.length > 0) {
        state.value = state.arguments_.pop();
      }

      const depth = this.pushStackFrame(state);

      if (opts.run) {
        this.paused_ = false;
        while (this.getStackDepth() >= depth) {
          this.step();
        }
        this.paused_ = true;
      }
    };
  }

  /**
   * Generate a native function wrapper for use with the JS interpreter.
   * @param {Object} opts - configuration options. See below.
   * @param {boolean} opts.dontMarshal - Whether or not to marshal the arguments passed to
   *     the native function from interpreter objects to native objects.
   * @param {Function} opts.nativeFunc - The native function that you want to make available
   *     to the interpreter via a wrapped interpreter function.
   * @param {Object} opts.nativeParentObj - The parent object that the native function
   *     should be bound to when it is called.
   * @param {number} opts.maxDepth - The maximum depth of objects that should be custom
   *     marshaled.
   * @param {boolean} opts.nativeIsAsync - When true, the return value of the native function
   *     is not marshaled back to the interpreter. Rather, a callback is given allowing
   *     the native function to perform asynchronous tasks before returning control back
   *     to the interpreter by calling the callback with the return value.
   * @param {boolean} opts.nativeCallsBackInterpreter - When true, the native function
   *     can receive wrapped interpreter functions as arguments, which it can then call
   *     to return control back to the interpreter.
   * @returns a wrapped version of native func that performs appropriate custom marshaling
   *     on all the arguments that it is called with. This is expected to be used with
   *     Interpreter.createAsyncFunction and Interpreter.createNativeFunction to give
   *     interpreted code safe access to native functions.
   */
  makeNativeMemberFunction(opts: MakeNativeOptions) {
    const {
      dontMarshal,
      nativeFunc,
      nativeParentObj,
      maxDepth,
      nativeIsAsync,
      nativeCallsBackInterpreter,
    } = opts;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (...args: any[]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let nativeArgs: any[] = [];
      if (dontMarshal) {
        nativeArgs = args;
      } else {
        // Call the native function after marshalling parameters:
        for (let i = 0; i < args.length; i++) {
          if (nativeIsAsync && i === args.length - 1) {
            // Async functions receive a native callback method as their last
            // parameter, and we want to wrap that callback to ease marshalling:
            nativeArgs[i] = this.createNativeCallbackForAsyncFunction_(
              opts,
              args[i],
            );
          } else if (
            nativeCallsBackInterpreter &&
            typeof args[i] === 'object' &&
            this.isa(args[i], this.FUNCTION)
          ) {
            // A select class of native functions is aware of the interpreter and
            // capable of calling the interpreter on the stack immediately. We
            // marshal these differently:
            nativeArgs[i] = this.createNativeInterpreterCallback_(
              opts,
              args[i],
            );
          } else {
            nativeArgs[i] = this.marshalInterpreterToNative(args[i]);
          }
        }
      }

      let nativeRetVal;
      try {
        nativeRetVal = nativeFunc.apply(nativeParentObj, nativeArgs);
      } catch (e) {
        if (!(e instanceof Error)) {
          const newError = new Error(e as string);
          newError.stack =
            'Error does not have stack information. Throw `new Error()` ' +
            'instead of a string to get a full stack trace. Exception thrown ' +
            `when calling ${nativeFunc} on ${nativeParentObj}`;
          Object.defineProperty(newError, 'native', {
            value: true,
            writable: false,
          });
          throw newError;
        } else {
          throw e;
        }
      }
      return this.marshalNativeToInterpreter(nativeRetVal, null, maxDepth);
    };
  }
}

export default CustomMarshalingInterpreter;
