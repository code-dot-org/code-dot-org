const Interpreter = require('@code-dot-org/js-interpreter');
const codegen = require('../../../codegen');
const CustomMarshaler = require('./CustomMarshaler');

module.exports = class CustomMarshalingInterpreter extends Interpreter {
  constructor(code, customMarshaler, opt_initFunc) {
    super(code, (thisInterpreter, scope) => {
      if (!(customMarshaler instanceof CustomMarshaler)) {
        throw new Error("You must provide a CustomMarshaler to CustomMarshalingInterpreter");
      }
      thisInterpreter.customMarshaler = customMarshaler;
      thisInterpreter.globalScope = scope;
      if (opt_initFunc) {
        opt_initFunc(thisInterpreter, scope);
      }
    });
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
  shouldBlockCustomMarshalling_(name, obj, nativeParent) {
    if (-1 !== this.customMarshaler.blockedProperties.indexOf(name)) {
      return true;
    }
    var value = obj.isCustomMarshal ? obj.data[name] : nativeParent[name];
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
  getProperty(obj, name) {
    name = name.toString();
    var customMarshalValue;
    if (obj.isCustomMarshal) {
      if (this.shouldBlockCustomMarshalling_(name, obj)) {
        return this.UNDEFINED;
      } else {
        customMarshalValue = obj.data[name];
      }
    } else {
      const nativeParent = this.getNativeParent_(obj, name);
      if (nativeParent) {
        customMarshalValue = nativeParent[name];
      } else {
        return super.getProperty(obj, name);
      }
    }
    var type = typeof customMarshalValue;
    if (type === 'number' || type === 'boolean' || type === 'string' ||
        type === 'undefined' || customMarshalValue === null) {
      return this.createPrimitive(customMarshalValue);
    } else {
      return codegen.marshalNativeToInterpreter(this, customMarshalValue, obj.data);
    }
  }

  /**
   * Returns the native parent of a custom marshaled object, if one exists.
   * Specific cases that are accounted for are detailed in the conditional below.
   *
   */
  getNativeParent_(obj, name) {
    var hasProperty = false;
    if (obj && !obj.isPrimitive) {
      hasProperty = super.hasProperty(obj, name);
    }
    var nativeParent;
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
      obj === this.globalScope &&
      /**
       * 3. Assuming the above conditions pass, lookup the native parent among the list
       * of global properties specified in the custom marshaler's configuration.
       */
      !!(nativeParent = this.customMarshaler.globalProperties[name]) &&
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
  hasProperty(obj, name) {
    name = name.toString();
    if (obj.isCustomMarshal) {
      if (this.shouldBlockCustomMarshalling_(name, obj)) {
        return false;
      } else {
        return name in obj.data;
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
  setProperty(
    obj,
    name,
    value,
    opt_descriptor
  ) {
    name = name.toString();
    if (obj.isCustomMarshal) {
      if (!this.shouldBlockCustomMarshalling_(name, obj)) {
        obj.data[name] = codegen.marshalInterpreterToNative(this, value);
      }
    } else {
      const nativeParent = this.getNativeParent_(obj, name);
      if (nativeParent) {
        nativeParent[name] = codegen.marshalInterpreterToNative(this, value);
      } else {
        return super.setProperty(obj, name, value, opt_descriptor);
      }
    }
  }

  /**
   * provides access to the original setProperty method to avoid
   * custom marshaling in certain very specific cases.
   */
  setPropertyWithoutCustomMarshaling(...args) {
    return super.setProperty(...args);
  }

  step() {
    const state = this.stateStack[0];
    // Program nodes always have end=0 for some reason (acorn related).
    // The Interpreter.step method assumes that a falsey state.node.end value means
    // the interpreter is inside polyfill code, because it strips all location information from ast nodes for polyfill code.
    // This means the interpreter will sometimes step more often than necessary. This is a problem for us when breakpoints
    // are turned on because the interpreter can step over nodes that we need to check before they get stepped, resulting
    // in an infinite loop.
    // See this line in the interpreter code which introduced this behavior:
    //   https://github.com/NeilFraser/JS-Interpreter/commit/a4ded3ed1de7960cda9177d1bacb6a2526440d14#diff-966ad2ec9f775b3820dd37b4d36b650aR116
    // TODO: push a fix upstream that checks state.node.end === undefined so the interpreter
    // doesn't step unnecessarily for Program nodes.
    if (state && state.node.type === 'Program') {
      state.node.end = 1;
    }
    return super.step();
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
  getValueFromScope(name) {
    var scope = this.getScope();
    var nameStr = name.toString();
    while (scope) {
      if (this.hasProperty(scope, nameStr)) {
        return this.getProperty(scope, nameStr);
      }
      scope = scope.parentScope;
    }
    this.throwException('Unknown identifier: ' + nameStr);
    return this.UNDEFINED;
  }

  /**
   * Sets a value to the current scope.
   * @param {!Object} name Name of variable.
   * @param {!Object} value Value.
   * @param {boolean} declarator true if called from variable declarator.
   * @override
   */
  setValueToScope(name, value, declarator) {
    var scope = this.getScope();
    var strict = scope.strict;
    var nameStr = name.toString();
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
  setValue(left, value, declarator) {
    if (left instanceof Array) {
      return super.setValue(left, value);
    } else {
      this.setValueToScope(left, value, declarator);
      return undefined;
    }
  }

  /**
   * Patched to add the 3rd "declarator" parameter on the setValue() call(s).
   * Also removed erroneous? call to hasProperty when there is node.init
   * Changed to call setValue with this.UNDEFINED when there is no node.init
   * and JSInterpreter.baseHasProperty returns false for current scope.
   * @override
   */
  stepVariableDeclarator() {
    var state = this.stateStack[0];
    var node = state.node;
    if (node.init && !state.done) {
      state.done = true;
      this.stateStack.unshift({node: node.init});
      return;
    }
    if (!this.hasProperty(this, node.id.name) || node.init) {
      if (node.init) {
        var value = state.value;
        this.setValue(this.createPrimitive(node.id.name), value, true);
      }
    }
    this.stateStack.shift();
  }

};
