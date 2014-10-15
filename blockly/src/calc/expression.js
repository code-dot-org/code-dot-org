/**
 * A tree representing an expression. Supports only two arguments, although
 * that could potentially be expanded if necessary.
 * Example: "2 * (1 + 3)" represented by:
 * new Expression('*', 2, new Expression('+', 1, 3)
 */
var Expression = function (operator, a, b) {
  this.operator = operator;
  this.args = [a, b];
};
module.exports = Expression;

/**
 * String representation of expression tree
 */
Expression.prototype.toString = function () {
  return "(" + this.args[0].toString() + " " + this.operator + " " +
    this.args[1].toString() + ")";
};

Expression.prototype.getTokenList = function (expectedExpression) {
  var delta = getDifference(this, expectedExpression);

  return getTokenList(this, delta);
};

/**
 * Creates a token with the given char/correctness
 */
function token(char, correct) {
  return { char: char, correct: correct };
}

/**
 * Given an expression or a number, and a diff
 */
function getTokenList(expressionOrVal, diff) {
  if (typeof(expressionOrVal) === "number") {
    return token(expressionOrVal.toString(), diff.numDiffs === 0);
  }

  var expr = expressionOrVal;
  var list = [token("(", true)];
  var argsDiff = diff.args || [{ numDiffs: 0 }, { numDiffs: 0 }];
  list = list.concat(getTokenList(expr.args[0], argsDiff[0]));
  list = list.concat(token(expr.operator, diff.operator === undefined));
  list = list.concat(getTokenList(expr.args[1], argsDiff[1]));
  list = list.concat(token(")", true));
  return list;
}

/**
 * Get the delta when going from src to target. Src and target can both be
 * either numbers or Expressions.
 */
function getDifference(src, target) {
  if (!isNumber(src) && !isExpression(src) ||
    !isNumber(target) && !isExpression(target)) {
    throw new Error('getDifference requires number or expression');
  }

  if (isExpression(src) && isExpression(target)) {
    return getExpressionDiff(src, target);
  }

  var diff = {};
  diff.numDiffs = 0;
  if (!isNumber(src) || !isNumber(target)) {
    diff.numDiffs = Infinity;
  } else if (src !== target) {
    diff.numDiffs = 1;
    diff.val = target;
  }
  return diff;
}

/**
 * Get the delta when going from src to target. Src and target are both assumed
 * to be expressions.
 */
function getExpressionDiff(src, target) {
  var diff = {};
  diff.numDiffs = 0;
  var argDiffs = [];

  if (src.operator !== target.operator) {
    diff.numDiffs++;
    diff.operator = target.operator;
  }

  var diff00 = getDifference(src.args[0], target.args[0]);
  var diff01 = getDifference(src.args[0], target.args[1]);
  var diff10 = getDifference(src.args[1], target.args[0]);
  var diff11 = getDifference(src.args[1], target.args[1]);

  if (diff00.numDiffs === 0) {
    // first args match, second args may/may not
    argDiffs = [diff00, diff11];
  } else if (diff01.numDiffs === 0) {
    // first src arg matches second target arg. other pair may/may not match
    argDiffs = [diff01, diff10];
  } else if (diff10.numDiffs === 0) {
    // second src arg matches first target arg. other pair doesn't match
    argDiffs = [diff01, diff10];
  } else if (diff11.numDiffs === 0) {
    // second src arg matches second target arg. other pair doesn't match
    argDiffs = [diff00, diff11];
  } else {
    // neither arg has a match, choose the mismatch that minimizes our diffs
    var a = diff00.numDiffs + diff11.numDiffs;
    var b = diff01.numDiffs + diff10.numDiffs;
    argDiffs = (a <= b) ? [diff00, diff11] : [diff01, diff10];
  }

  var numArgDiffs = argDiffs[0].numDiffs + argDiffs[1].numDiffs;
  if (numArgDiffs > 0) {
    diff.numDiffs += numArgDiffs;
    diff.args = argDiffs;
  }

  return diff;
}

function isNumber(val) {
  // todo - do we also need to care about stringified numbers? i.e. "1"
  return typeof(val) === "number";
}

function isExpression(val) {
  return (val instanceof Expression);
}

/* start-test-block */
// export private function(s) to expose to unit testing
module.exports.__testonly__ = {
  getDifference: getDifference
};
/* end-test-block */
