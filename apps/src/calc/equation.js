/**
 * An equation is an expression attached to a particular name. For example:
 *   f(x) = x + 1
 *   name: f
 *   equation: x + 1
 *   params: ['x']
 * In many cases, this will just be an expression with no name.
 * @param {string} name Function or variable name. Null if compute expression
 * @param {string[]} params List of parameter names if a function.
 * @param {ExpressionNode} expression
 */
var Equation = function (name, params, expression) {
  this.name = name;
  this.params = params || [];
  this.expression = expression;

  if (arguments.length !== 3) {
    throw new Error('Equation requires name, params, and expression');
  }

  this.signature = this.name;
  if (this.params.length > 0) {
    this.signature += '(' + this.params.join(',') + ')';
  }
};

module.exports = Equation;

/**
 * @returns True if a function
 */
Equation.prototype.isFunction = function () {
  return this.params.length > 0;
};

Equation.prototype.clone = function () {
  return new Equation(this.name, this.params.slice(), this.expression.clone());
};
