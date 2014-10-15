/**
 * A node consisting of a value, and if that value is an operator, two operands.
 * Operands will always be stored internally as ExpressionNodes.
 */
var ExpressionNode = function (val, left, right) {
  this.val = val;
  this.left = null;
  this.right = null;
  if (this.isOperation()) {
    this.left = left instanceof ExpressionNode ? left : new ExpressionNode(left);
    this.right = right instanceof ExpressionNode ? right : new ExpressionNode(right);
  }

  // null indicates not set. otherwise will be true/false
  this.valMetExpectation_ = null;
};
module.exports = ExpressionNode;

/**
 * Does the node represent a math operation vs. a single number.
 */
ExpressionNode.prototype.isOperation = function () {
  return !isNumber(this.val);
};

/**
 * Convert o a string
 */
ExpressionNode.prototype.toString = function  () {
  if (!this.isOperation()) {
    return this.val;
  }
  // todo - do i need/want the outside parens? i think no
  return "(" + this.left.toString() + " " + this.val + " " +
    this.right.toString() + ")";
};

/**
 * Create a deep clone of this node
 */
ExpressionNode.prototype.clone = function () {
  return new ExpressionNode(this.val, this.left ? this.left.clone() : null,
    this.right ? this.right.clone() : null);
};

/**
 * todo
 */
ExpressionNode.prototype.failedExpectation = function (includeDescendants) {
  // Don't fail if we don't have an expectation set
  if (this.valMetExpectation_ === null) {
    return false;
  }

  var fails = (this.valMetExpectation_ === false);
  if (includeDescendants && this.left && this.left.failedExpectation(true)) {
    fails = true;
  }
  if (includeDescendants && this.right && this.right.failedExpectation(true)) {
    fails = true;
  }

  return fails;
};

/**
 * todo
 */
ExpressionNode.prototype.evaluate = function () {
  if (!this.isOperation()) {
    return this.val;
  }

  var left = this.left.evaluate();
  var right = this.right.evaluate();

  switch (this.val) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      return left / right;
    default:
      throw new Error('Unknown operator: ' + this.val);
    }
};

/**
 * todo
 */
ExpressionNode.prototype.depth = function () {
  if (!this.isOperation()) {
    return 0;
  }

  return 1 + Math.max(this.left.depth(), this.right.depth());
}

/**
 * todo
 */
ExpressionNode.prototype.collapse = function () {
  if (!this.isOperation()) {
    return false;
  }

  var leftDepth = this.left.depth();
  var rightDepth = this.right.depth();

  if (leftDepth === 0 && rightDepth === 0) {
    if (this.failedExpectation(true)) {
      // dont allow collapsing if we're a leaf operation with a mistake
      return false;
    }
    this.val = this.evaluate();
    this.left = null;
    this.right = null;
    return true;
  } else {
    if (rightDepth > leftDepth) {
      return this.right.collapse();
    }
    return this.left.collapse();
  }

  return true;
};

/**
 * todo
 */
ExpressionNode.prototype.applyExpectation = function (expectationNode) {
  if (this.valMetExpectation_ !== null) {
    throw new Error('Node already has an expectedVal');
  }

  this.valMetExpectation_ = expectationNode ? expectationNode.val === this.val : null;

  if (this.isOperation() || expectationNode.isOperation()) {
    // todo - can i share this with getNumDiffs_ ?
    var diffLeftLeft = getNumDiffs(this.left, expectationNode.left);
    var diffLeftRight = getNumDiffs(this.left, expectationNode.right);
    var diffRightLeft = getNumDiffs(this.right, expectationNode.left);
    var diffRightRight = getNumDiffs(this.right, expectationNode.right);

    var matchSame = diffLeftLeft + diffRightRight;
    var matchOpposite = diffLeftRight + diffRightLeft;
    if (matchSame <= matchOpposite) {
      this.left.applyExpectation(expectationNode.left);
      this.right.applyExpectation(expectationNode.right);
    } else {
      this.left.applyExpectation(expectationNode.right);
      this.right.applyExpectation(expectationNode.left);
    }
  }
};

/**
 * todo
 */
ExpressionNode.prototype.getTokenList = function () {
  if (this.valMetExpectation_ === null) {
    throw new Error("Can't get token list without expectation set");
  }

  if (!this.isOperation()) {
    return [token(this.val.toString(), this.valMetExpectation_)];
  }

  var list = [token("(", true)];
  list = list.concat(this.left.getTokenList());
  list = list.concat(token(this.val, this.valMetExpectation_));
  list = list.concat(this.right.getTokenList());
  list = list.concat(token(")", true));
  return list;
};

/**
 * todo
 */
ExpressionNode.prototype.getNumDiffs_ = function (expected) {
  var numDiffs = 0;

  if (this.val !== expected.val) {
    numDiffs++;
  }

  if (this.isOperation() || expected.isOperation()) {

    // For purposes of diffing, we don't want to care about whether children are
    // left or right. Figure out how we can minimize our numDiffs.
    var diffLeftLeft = getNumDiffs(this.left, expected.left);
    var diffLeftRight = getNumDiffs(this.left, expected.right);
    var diffRightLeft = getNumDiffs(this.right, expected.left);
    var diffRightRight = getNumDiffs(this.right, expected.right);

    var matchSame = diffLeftLeft + diffRightRight;
    var matchOpposite = diffLeftRight + diffRightLeft;
    numDiffs += Math.min(matchSame, matchOpposite);
  }

  return numDiffs;
};

// todo - comment me
function getNumDiffs(src, target) {
  if (src === null || target === null) {
    return Infinity;
  }
  return src.getNumDiffs_(target);
};

/**
 * Creates a token with the given char/correctness
 */
function token(char, correct) {
  return { char: char, correct: correct };
}

// todo - may want to use lodash's isNumber
function isNumber(val) {
  return typeof(val) === "number";
}
