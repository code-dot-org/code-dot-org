/**
 * A node consisting of a value, and if that value is an operator, two operands.
 * Operands will always be stored internally as ExpressionNodes.
 */
var ExpressionNode = function (val, left, right, blockId) {
  this.val = val;
  this.left = null;
  this.right = null;
  this.blockId = blockId;

  if (this.isOperation()) {
    this.left = left instanceof ExpressionNode ? left : new ExpressionNode(left);
    this.right = right instanceof ExpressionNode ? right : new ExpressionNode(right);
  }

  this.valMetExpectation_ = true;
};
module.exports = ExpressionNode;

/**
 * Does the node represent a math operation vs. a single number.
 */
ExpressionNode.prototype.isOperation = function () {
  return !isNumber(this.val);
};

/**
 * Convert to a string
 */
ExpressionNode.prototype.toString = function  () {
  if (!this.isOperation()) {
    return this.val;
  }
  // todo (brent) - do i need/want the outside parens? i think no
  return "(" + this.left.toString() + " " + this.val + " " +
    this.right.toString() + ")";
};

/**
 * Create a deep clone of this node
 */
ExpressionNode.prototype.clone = function () {
  return new ExpressionNode(this.val,
    this.left ? this.left.clone() : null,
    this.right ? this.right.clone() : null,
    this.blockId);
};

/**
 * Did we set an expectation for this node, which we did not meet.
 * @param {boolean} includeDescendants If true, we also check whether any
 *  descendants failed expectations, otherwise we only check this node's val.
 */
ExpressionNode.prototype.failedExpectation = function (includeDescendants) {
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
 * Evaluate the expression, returning the result.
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
 * Depth of this node's tree. A lone value is considered to have a depth of 0.
 */
ExpressionNode.prototype.depth = function () {
  if (!this.isOperation()) {
    return 0;
  }

  return 1 + Math.max(this.left.depth(), this.right.depth());
};

/**
 * Collapse the next node in the tree, where next is considered to be whichever
 * node is deepest, processing left to right.
 * @param {boolean} ignoreFailures If true, we will collapse whether or not the
 *   node met expectations. If false, we don't collpase when expectations are
 *   not met.
 */
ExpressionNode.prototype.collapse = function (ignoreFailures) {
  var deepest = this.getDeepestOperation();
  if (deepest === null) {
    return false;
  }

  // We're the depest operation, implying both sides are numbers
  if (this === deepest) {
    if (this.failedExpectation(true) && !ignoreFailures) {
      // dont allow collapsing if we're a leaf operation with a mistake
      return false;
    }
    this.val = this.evaluate();
    this.left = null;
    this.right = null;
  } else {
    return deepest.collapse(ignoreFailures);
  }

  return true;
};

/**
 * Specify what we expected an ExpressionNode to look like. This sets whether
 * vals are the same as what we expected on the entire tree.
 */
ExpressionNode.prototype.applyExpectation = function (expected) {
  this.valMetExpectation_ = expected ? expected.val === this.val : false;

  if (this.isOperation()) {
    this.left.applyExpectation(expected.left);
    this.right.applyExpectation(expected.right);
  }
};

/**
 * Do the two nodes differ only in argument order.
 */
ExpressionNode.prototype.isEquivalent = function (target) {
  if (this.val !== target.val) {
    return false;
  }

  if (this.isOperation() !== target.isOperation()) {
    return false;
  }

  if (!this.isOperation()) {
    return true;
  }

  if (this.left.isEquivalent(target.left)) {
    return this.right.isEquivalent(target.right);
  } else if (this.left.isEquivalent(target.right)) {
    return this.right.isEquivalent(target.left);
  }

  return false;
};

/**
 * Break down the expression into tokens, where each token consists of the
 * string representation of that portion of the expression, and whether or not
 * it is correct.
 */
ExpressionNode.prototype.getTokenList = function (markNextParens) {
  if (!this.isOperation()) {
    return [token(this.val.toString(), this.valMetExpectation_ === false)];
  }

  var leafOperation = !this.left.isOperation() && !this.right.isOperation();
  var rightDeeper = this.right.depth() > this.left.depth();

  var list = [token("(", markNextParens === true && leafOperation)];
  list = list.concat(this.left.getTokenList(markNextParens && !rightDeeper));
  list = list.concat(token(" " + this.val + " ", this.valMetExpectation_ === false));
  list = list.concat(this.right.getTokenList(markNextParens && rightDeeper));
  list = list.concat(token(")", markNextParens === true && leafOperation));
  return list;
};

/**
 * Gets the deepest descendant operation ExpressionNode in the tree (i.e. the
 * next node to collapse
 */
ExpressionNode.prototype.getDeepestOperation = function () {
  if (!this.isOperation()) {
    return null;
  }
  if (!this.left.isOperation() && !this.right.isOperation()) {
    return this;
  }

  var rightDeeper = this.right.depth() > this.left.depth();
  return rightDeeper ? this.right.getDeepestOperation() :
    this.left.getDeepestOperation();
};

/**
 * Creates a token with the given char (which can really be a string), that
 * may or may not be "marked". Marking indicates different things depending on
 * the char.
 */
function token(char, marked) {
  return { char: char, marked: marked };
}

// todo (brent)- may want to use lodash's isNumber
function isNumber(val) {
  return typeof(val) === "number";
}
