/**
 * An tree representing an expression. Supports only two arguments, although
 * that could potentially be expanded if necessary.
 * Example: "2 * (1 + 3)" represented by:
 * ew Expression('*', 2, new Expression('+', 1, 3)
 */
var Expression = function (operator, a, b) {
  this.operator = operator;
  this.args = [a, b];
}
module.exports = Expression;

// todo (brent) - figure out how/where these are exposed
Expression.getDiff = getDiff;
Expression.getTokenList = getTokenList;

/**
 * String representation of expression tree
 */
Expression.prototype.toString = function () {
  return "(" + this.args[0].toString() + " " + this.operator + " " +
    this.args[1].toString() + ")";
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
  if (isNumber(expressionOrVal)) {
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

function isNumber(val) {
  // todo - do we also need to care about stringified numbers? i.e. "1"
  return typeof(val) === "number";
}

function getDiff(src, target) {
  if (src instanceof Expression && target instanceof Expression) {
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

function getExpressionDiff(src, target) {
  var diff = {};
  diff.numDiffs = 0;
  var argDiffs = [];

  if (src.operator !== target.operator) {
    diff.numDiffs++;
    diff.operator = target.operator;
  }

  var diff00 = getDiff(src.args[0], target.args[0]);
  var diff01 = getDiff(src.args[0], target.args[1]);
  var diff10 = getDiff(src.args[1], target.args[0]);
  var diff11 = getDiff(src.args[1], target.args[1]);

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
