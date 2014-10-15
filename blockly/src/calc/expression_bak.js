/**
 * A tree representing an expression. Supports only two arguments, although
 * that could potentially be expanded if necessary.
 * Example: "2 * (1 + 3)" represented by:
 * new Expression('*', 2, new Expression('+', 1, 3)
 */
var Expression = function (operator, a, b) {
  this.operator = operator;
  this.left = a;
  this.right = b;
  this.val = undefined; // todo
};
module.exports = Expression;

/**
 * String representation of expression tree
 */
Expression.prototype.toString = function () {
  if (this.val) {
    return this.val;
  }
  return "(" + this.left.toString() + " " + this.operator + " " +
    this.right.toString() + ")";
};

Expression.prototype.getTokenList = function (expectedExpression) {
  if (this.val && expectedExpression.val) {
    return [token(this.val, this.val === expectedExpression.val)];
  }
  var delta = getDifference(this, expectedExpression);

  return getTokenList(this, delta);
};

/**
 * Create a deep clone of this expression
 */
Expression.prototype.clone = function () {
  return new Expression(this.operator,
    isNumber(this.left) ? this.left : this.left.clone(),
    isNumber(this.right) ? this.right : this.right.clone()
  );
};

/**
 * todo
 */
Expression.prototype.evaluate = function () {
  var left = isNumber(this.left) ? this.left : this.left.evaluate();
  var right = isNumber(this.right) ? this.right : this.right.evaluate();

  switch (this.operator) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      return left / right;
    default:
      throw new Error('Unknown operator: ' + this.operator);
    }
};

/**
 * todo
 */
Expression.prototype.collapse = function () {
  var leftDepth = depth(this.left);
  var rightDepth = depth(this.right);

  if (rightDepth > leftDepth) {
    if (rightDepth === 1) {
      this.right = this.right.evaluate();
    } else {
      this.right.collapse();
    }
  } else {
    if (leftDepth === 1) {
      this.left = this.left.evaluate();
    } else if (leftDepth === 0) {
      this.val = this.evaluate();
      this.operator = null;
      this.left = null;
      this.right = null
    } else {
      this.left.collapse();
    }
  }
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
  list = list.concat(getTokenList(expr.left, diff.left || { numDiffs: 0}));
  list = list.concat(token(expr.operator, diff.operator === undefined));
  list = list.concat(getTokenList(expr.right, diff.right || { numDiffs: 0}));
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

  var diffLeftLeft = getDifference(src.left, target.left);
  var diffLeftRight = getDifference(src.left, target.right);
  var diffRightLeft = getDifference(src.right, target.left);
  var diffRightRight = getDifference(src.right, target.right);

  if (diffLeftLeft.numDiffs === 0) {
    // first args match, second args may/may not
    diff.left = diffLeftLeft;
    diff.right = diffRightRight;
  } else if (diffLeftRight.numDiffs === 0) {
    // first src arg matches second target arg. other pair may/may not match
    diff.left = diffLeftRight;
    diff.right = diffRightLeft;
  } else if (diffRightLeft.numDiffs === 0) {
    // second src arg matches first target arg. other pair doesn't match
    diff.left = diffLeftRight;
    diff.right = diffRightLeft;
  } else if (diffRightRight.numDiffs === 0) {
    // second src arg matches second target arg. other pair doesn't match
    diff.left = diffLeftLeft;
    diff.right = diffRightRight;
  } else {
    // neither arg has a match, choose the mismatch that minimizes our diffs
    var a = diffLeftLeft.numDiffs + diffRightRight.numDiffs;
    var b = diffLeftRight.numDiffs + diffRightLeft.numDiffs;
    if (a <= b) {
      diff.left = diffLeftLeft;
      diff.right = diffRightRight;
    } else {
      diff.left = diffLeftRight;
      diff.right = diffRightLeft;
    }
  }

  diff.numDiffs += diff.left.numDiffs + diff.right.numDiffs;
  // todo - kind of hacky adding then removing
  if (diff.left.numDiffs === 0) {
    delete diff.left;
  }
  if (diff.right.numDiffs === 0) {
    delete diff.right;
  }

  return diff;
}

function depth(numOrExpression) {
  if (isNumber(numOrExpression)) {
    return 0;
  }
  var expr = numOrExpression;
  return 1 + Math.max(depth(expr.left), depth(expr.right));
}

function isNumber(val) {
  // todo - do we also need to care about stringified numbers? i.e. "1"
  return typeof(val) === "number";
}
function isExpression(val) {
  return (val instanceof Expression);
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
