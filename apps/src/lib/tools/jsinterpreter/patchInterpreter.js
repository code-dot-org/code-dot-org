const Interpreter = require('@code-dot-org/js-interpreter');

module.exports = function patchInterpreter() {

  const base = {
    hasProperty: Interpreter.prototype.hasProperty,
    getProperty: Interpreter.prototype.getProperty,
    setProperty: Interpreter.prototype.setProperty,
  };

  // These methods need to be patched in order to support custom marshaling.

  // These changes revert a 10% speedup commit that bypassed hasProperty,
  // getProperty, and setProperty:
  // https://github.com/NeilFraser/JS-Interpreter/commit/c6f25b4a30046a858e5e90a92a8c0d24a93c0231

  /**
   * Retrieves a value from the scope chain.
   * @param {!Object} name Name of variable.
   * @return {!Object} The value.
   */
  Interpreter.prototype.getValueFromScope = function (name) {
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
  };

  /**
   * Sets a value to the current scope.
   * @param {!Object} name Name of variable.
   * @param {!Object} value Value.
   * @param {boolean} declarator true if called from variable declarator.
   */
  Interpreter.prototype.setValueToScope = function (name, value, declarator) {
    var scope = this.getScope();
    var strict = scope.strict;
    var nameStr = name.toString();
    while (scope) {
      if (this.hasProperty(scope, nameStr) || (!strict && !scope.parentScope)) {
        if (declarator) {
          // from a declarator, always call baseSetProperty
          base.setProperty.call(this, scope, nameStr, value);
        } else {
          this.setProperty(scope, nameStr, value);
        }
        return;
      }
      scope = scope.parentScope;
    }
    this.throwException('Unknown identifier: ' + nameStr);
  };

  /**
   * Sets a value to the scope chain or to an object property.
   * @param {!Object|!Array} left Name of variable or object/propname tuple.
   * @param {!Object} value Value.
   * @param {boolean} declarator true if called from variable declarator.
   */
  Interpreter.prototype.setValue = function (left, value, declarator) {
    if (left.length) {
      var obj = left[0];
      var prop = left[1];
      this.setProperty(obj, prop, value);
    } else {
      this.setValueToScope(left, value, declarator);
    }
  };

  // Patched to add the 3rd "declarator" parameter on the setValue() call(s).
  // Also removed erroneous? call to hasProperty when there is node.init
  // Changed to call setValue with this.UNDEFINED when there is no node.init
  // and JSInterpreter.baseHasProperty returns false for current scope.
  Interpreter.prototype['stepVariableDeclarator'] = function () {
    var state = this.stateStack[0];
    var node = state.node;
    if (node.init && !state.done) {
      state.done = true;
      this.stateStack.unshift({node: node.init});
    } else {
      if (node.init) {
        this.setValue(this.createPrimitive(node.id.name), state.value, true);
      } else {
        if (!base.hasProperty.call(this, this.getScope(), node.id.name)) {
          this.setValue(this.createPrimitive(node.id.name), this.UNDEFINED, true);
        }
      }
      this.stateStack.shift();
    }
  };

  return base;
};
