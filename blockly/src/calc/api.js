var ExpressionNode = require('./expressionNode');

exports.compute = function (expr, blockId) {
  Calc.computedExpression = expr;
};

exports.expression = function (operator, arg1, arg2, blockId) {
  return new ExpressionNode(operator, arg1, arg2, blockId);
};
