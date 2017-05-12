const Interpreter = require('@code-dot-org/js-interpreter');
const codegen = require('../../../codegen');

module.exports = class CustomMarshalingInterpreter extends Interpreter {

  constructor(code, customMarshaler, opt_initFunc) {
    super(code);
    if (!customMarshaler) {
      throw new Error("You must provide a CustomMarshaler to CustomMarshalingInterpreter");
    }
    this.customMarshaler = customMarshaler;

    // TODO: because of the way the interpreter is written, we have to re-do
    // this work from the parent class's constructor because it needs
    // customMarshaler to have been set before-hand. Unfortunately, javascript
    // does not allow us to set customMarshaler until after the parent constructor
    // has finished.
    this.initFunc_ = opt_initFunc;
    const scope = this.createScope(this.ast, null);
    this.stateStack = [{
      node: this.ast,
      scope: scope,
      thisExpression: scope,
      done: false
    }];
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
    if (-1 !== this.customMarshaler.customMarshalBlockedProperties.indexOf(name)) {
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
    var nativeParent;
    var customMarshalValue;
    if (obj.isCustomMarshal) {
      if (this.shouldBlockCustomMarshalling_(name, obj)) {
        return this.UNDEFINED;
      } else {
        customMarshalValue = obj.data[name];
      }
    } else {
      var hasProperty = false;
      if (!obj.isPrimitive) {
        hasProperty = super.hasProperty(obj, name);
      }
      if (!hasProperty &&
          obj === this.globalScope &&
          !!(nativeParent = this.customMarshaler.customMarshalGlobalProperties[name]) &&
          !this.shouldBlockCustomMarshalling_(name, obj, nativeParent)) {
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
    var nativeParent;
    if (obj.isCustomMarshal) {
      if (this.shouldBlockCustomMarshalling_(name, obj)) {
        return false;
      } else {
        return name in obj.data;
      }
    } else {
      var hasProperty = super.hasProperty(obj, name);
      if (!hasProperty &&
          obj === this.globalScope &&
          !!(nativeParent = this.customMarshaler.customMarshalGlobalProperties[name]) &&
          !this.shouldBlockCustomMarshalling_(name, obj, nativeParent)) {
        return true;
      } else {
        return hasProperty;
      }
    }
  }

  /**
   * Wrapper to Interpreter's setProperty (extended for custom marshaling)
   *
   * Set a property value on a data object.
   * @param {!Object} interpeter Interpreter instance.
   * @param {!Object} obj Data object.
   * @param {*} name Name of property.
   * @param {*} value New property value.
   * @param {boolean} opt_fixed Unchangeable property if true.
   * @param {boolean} opt_nonenum Non-enumerable property if true.
   * @override
   */
  setProperty(
    obj,
    name,
    value,
    opt_fixed,
    opt_nonenum
  ) {
    name = name.toString();
    var nativeParent;
    if (obj.isCustomMarshal) {
      if (!this.shouldBlockCustomMarshalling_(name, obj)) {
        obj.data[name] = codegen.marshalInterpreterToNative(this, value);
      }
    } else {
      var hasProperty = false;
      if (!obj.isPrimitive) {
        hasProperty = super.hasProperty(obj, name);
      }
      if (!hasProperty &&
          obj === this.globalScope &&
          !!(nativeParent = this.customMarshaler.customMarshalGlobalProperties[name]) &&
          !this.shouldBlockCustomMarshalling_(name, obj, nativeParent)) {
        nativeParent[name] = codegen.marshalInterpreterToNative(this, value);
      } else {
        return super.setProperty(obj, name, value, opt_fixed, opt_nonenum);
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
    if (left.length) {
      var obj = left[0];
      var prop = left[1];
      this.setProperty(obj, prop, value);
    } else {
      this.setValueToScope(left, value, declarator);
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
    } else {
      if (node.init) {
        this.setValue(this.createPrimitive(node.id.name), state.value, true);
      } else {
        if (!super.hasProperty(this.getScope(), node.id.name)) {
          this.setValue(this.createPrimitive(node.id.name), this.UNDEFINED, true);
        }
      }
      this.stateStack.shift();
    }
  }

  get customMarshalObjectList() {
    return this._customMarshalObjectList || [];
  }
  set customMarshalObjectList(customMarshalObjectList) {
    // TODO: perform validation on this
    this._customMarshalObjectList = customMarshalObjectList;
  }
};
