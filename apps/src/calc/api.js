var ExpressionNode = require('./expressionNode');

exports.compute = function (expr, blockId) {
  Calc.computedExpression = expr instanceof ExpressionNode ? expr :
    new ExpressionNode(parseFloat(expr));
};

exports.expression = function (operator, arg1, arg2, blockId) {
  return new ExpressionNode(operator, [arg1, arg2], blockId);
};
