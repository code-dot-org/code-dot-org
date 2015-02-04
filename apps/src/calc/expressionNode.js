var utils = require('../utils');
var _ = utils.getLodash();

/**
 * A node consisting of an value, and potentially a set of operands.
 * The value will be either an operator, a string representing a variable, a
 * string representing a functional call, or a number.
 * If args are not ExpressionNode, we convert them to be so, assuming any string
 * represents a variable
 */
var ValueType = {
  ARITHMETIC: 1,
  FUNCTION_CALL: 2,
  VARIABLE: 3,
  NUMBER: 4
};

var ExpressionNode = function (val, args, blockId) {
  this.value_ = val;
  this.blockId_ = blockId;
  if (args === undefined) {
    args = [];
  }

  if (!Array.isArray(args)) {
    throw new Error("Expected array");
  }

  this.children_ = args.map(function (item) {
    if (!(item instanceof ExpressionNode)) {
      item = new ExpressionNode(item);
    }
    return item;
  });

  if (this.getType() === ValueType.NUMBER && args.length > 0) {
    throw new Error("Can't have args for number ExpressionNode");
  }

  if (this.getType() === ValueType.ARITHMETIC && args.length !== 2) {
    throw new Error("Arithmetic ExpressionNode needs 2 args");
  }
};
module.exports = ExpressionNode;

ExpressionNode.ValueType = ValueType;

/**
 * What type of expression node is this?
 */
ExpressionNode.prototype.getType = function () {
  if (["+", "-", "*", "/"].indexOf(this.value_) !== -1) {
    return ValueType.ARITHMETIC;
  }

  if (typeof(this.value_) === 'string') {
    if (this.children_.length === 0) {
      return ValueType.VARIABLE;
    }
    return ValueType.FUNCTION_CALL;
  }

  if (typeof(this.value_) === 'number') {
    return ValueType.NUMBER;
  }
};

/**
 * Create a deep clone of this node
 */
ExpressionNode.prototype.clone = function () {
  var children = this.children_.map(function (item) {
    return item.clone();
  });
  return new ExpressionNode(this.value_, children, this.blockId_);
};

/**
 * See if we can evaluate this node by trying to do so and catching exceptions.
 * @returns Whether we can evaluate.
 */
ExpressionNode.prototype.canEvaluate = function (mapping) {
  try {
    this.evaluate(mapping);
  } catch (err) {
    return false;
  }
  return true;
};

/**
 * Evaluate the expression, returning the result.
 */
ExpressionNode.prototype.evaluate = function (mapping) {
  mapping = mapping || {};
  var type = this.getType();

  if (type === ValueType.VARIABLE && mapping[this.value_] !== undefined) {
    var clone = this.clone();
    clone.setValue(mapping[this.value_]);
    return clone.evaluate(mapping);
  }

  if (type === ValueType.FUNCTION_CALL && mapping[this.value_] !== undefined) {
    var functionDef = mapping[this.value_];
    if (!functionDef.variables || !functionDef.expression) {
      throw new Error('Bad mapping for: ' + this.value_);
    }
    if (functionDef.variables.length !== this.children_.length) {
      throw new Error('Bad mapping for: ' + this.value_);
    }
    // Generate a new mapping so that if we have collisions between global
    // variables and function variables, the function vars take precedence
    var newMapping = {};
    _.keys(mapping).forEach(function (key) {
      newMapping[key] = mapping[key];
    });
    functionDef.variables.forEach(function (variable, index) {
      newMapping[variable] = this.getChildValue(index);
    }, this);
    return functionDef.expression.evaluate(newMapping);
  }

  if (type === ValueType.VARIABLE || type === ValueType.FUNCTION_CALL) {
    throw new Error('Must resolve variables/functions before evaluation');
  }
  if (type === ValueType.NUMBER) {
    return this.value_;
  }

  if (type !== ValueType.ARITHMETIC) {
    throw new Error('Unexpected error');
  }

  var left = this.children_[0].evaluate(mapping);
  var right = this.children_[1].evaluate(mapping);

  switch (this.value_) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      return left / right;
    default:
      throw new Error('Unknown operator: ' + this.value_);
    }
};

/**
 * Depth of this node's tree. A lone value is considered to have a depth of 0.
 */
ExpressionNode.prototype.depth = function () {
  var max = 0;
  for (var i = 0; i < this.children_.length; i++) {
    max = Math.max(max, 1 + this.children_[i].depth());
  }

  return max;
};

/**
 * Gets the deepest descendant operation ExpressionNode in the tree (i.e. the
 * next node to collapse
 */
ExpressionNode.prototype.getDeepestOperation = function () {
  if (this.children_.length === 0) {
    return null;
  }

  var deepestChild = null;
  var deepestDepth = 0;
  for (var i = 0; i < this.children_.length; i++) {
    var depth = this.children_[i].depth();
    if (depth > deepestDepth) {
      deepestDepth = depth;
      deepestChild = this.children_[i];
    }
  }

  if (deepestDepth === 0) {
    return this;
  }

  return deepestChild.getDeepestOperation();
};

/**
 * Collapses the next descendant in place. Next is defined as deepest, then
 * furthest left. Returns whether collapse was successful.
 */
ExpressionNode.prototype.collapse = function () {
  var deepest = this.getDeepestOperation();
  if (deepest === null) {
    return false;
  }

  // We're the depest operation, implying both sides are numbers
  if (this === deepest) {
    this.value_ = this.evaluate();
    this.children_ = [];
    return true;
  } else {
    return deepest.collapse();
  }
};

/**
 * Get a tokenList for this expression, where differences from other expression
 * are marked
 * @param {ExpressionNode} other The ExpressionNode to compare to.
 */
ExpressionNode.prototype.getTokenListDiff = function (other) {
  var tokens;
  var nodesMatch = other && (this.value_ === other.value_) &&
    (this.children_.length === other.children_.length);
  var type = this.getType();

  // Empty function calls look slightly different, i.e. foo() instead of foo
  if (this.children_.length === 0) {
    return [new Token(this.value_.toString(), !nodesMatch)];
  }

  if (type === ValueType.ARITHMETIC) {
    // Deal with arithmetic, which is always in the form (child0 operator child1)
    tokens = [new Token('(', !nodesMatch)];
    if (this.children_.length > 0) {
      tokens.push([
        this.children_[0].getTokenListDiff(nodesMatch && other.children_[0]),
        new Token(" " + this.value_ + " ", !nodesMatch),
        this.children_[1].getTokenListDiff(nodesMatch && other.children_[1])
      ]);
    }
    tokens.push(new Token(')', !nodesMatch));

  } else if (type === ValueType.FUNCTION_CALL) {
    // Deal with a function call which will generate something like: foo(1, 2, 3)
    tokens = [
      new Token(this.value_, this.value_ !== other.value_),
      new Token('(', !nodesMatch)
    ];

    for (var i = 0; i < this.children_.length; i++) {
      if (i > 0) {
        tokens.push(new Token(',', !nodesMatch));
      }
      tokens.push(this.children_[i].getTokenListDiff(nodesMatch && other.children_[i]));
    }

    tokens.push(new Token(")", !nodesMatch));
  } else if (this.getType() === ValueType.VARIABLE) {

  }
  return _.flatten(tokens);
};


/**
 * Get a tokenList for this expression, potentially marking those tokens
 * that are in the deepest descendant expression.
 * @param {boolean} markDeepest Mark tokens in the deepest descendant
 */
ExpressionNode.prototype.getTokenList = function (markDeepest) {
  var depth = this.depth();
  if (depth <= 1) {
    return this.getTokenListDiff(markDeepest ? null : this);
  }

  if (this.getType() !== ValueType.ARITHMETIC) {
    // Don't support getTokenList for functions
    throw new Error("Unsupported");
  }

  var rightDeeper = this.children_[1].depth() > this.children_[0].depth();

  return _.flatten([
    new Token('(', false),
    this.children_[0].getTokenList(markDeepest && !rightDeeper),
    new Token(" " + this.value_ + " ", false),
    this.children_[1].getTokenList(markDeepest && rightDeeper),
    new Token(')', false)
  ]);
};

/**
 * Is other exactly the same as this ExpressionNode tree.
 */
ExpressionNode.prototype.isIdenticalTo = function (other) {
  if (!other || this.value_ !== other.value_ ||
      this.children_.length !== other.children_.length) {
    return false;
  }

  for (var i = 0; i < this.children_.length; i++) {
    if (!this.children_[i].isIdenticalTo(other.children_[i])) {
      return false;
    }
  }
  return true;
};

/**
 * Returns true if both this and other are calls of the same function, with
 * the same number of arguments
 */
ExpressionNode.prototype.hasSameSignature = function (other) {
  if (!other) {
    return false;
  }

  if (this.getType() !== ValueType.FUNCTION_CALL ||
      other.getType() !== ValueType.FUNCTION_CALL) {
    return false;
  }

  if (this.value_ !== other.value_) {
    return false;
  }

  if (this.children_.length !== other.children_.length) {
    return false;
  }

  return true;
};

/**
 * Do the two nodes differ only in argument order.
 */
ExpressionNode.prototype.isEquivalentTo = function (other) {
  // only ignore argument order for ARITHMETIC
  if (this.getType() !== ValueType.ARITHMETIC) {
    return this.isIdenticalTo(other);
  }

  if (!other || this.value_ !== other.value_) {
    return false;
  }

  var myLeft = this.children_[0];
  var myRight = this.children_[1];

  var theirLeft = other.children_[0];
  var theirRight = other.children_[1];

  if (myLeft.isEquivalentTo(theirLeft)) {
    return myRight.isEquivalentTo(theirRight);
  }
  if (myLeft.isEquivalentTo(theirRight)) {
    return myRight.isEquivalentTo(theirLeft);
  }
  return false;
};

/**
 * @returns {number} How many children this node has
 */
ExpressionNode.prototype.numChildren = function () {
  return this.children_.length;
};

/**
 * Modify this ExpressionNode's value
 */
ExpressionNode.prototype.setValue = function (value) {
  var type = this.getType();
  if (type !== ValueType.VARIABLE && type !== ValueType.NUMBER) {
    throw new Error("Can't modify value");
  }
  this.value_ = value;
};

/**
 * Get the value of the child at index
 */
ExpressionNode.prototype.getChildValue = function (index) {
  return this.children_[index].value_;
};

/**
 * Set the value of the child at index
 */
ExpressionNode.prototype.setChildValue = function (index, value) {
  return this.children_[index].setValue(value);
};

/**
 * Get a string representation of the tree
 * Note: This is only used by test code, but is also generally useful to debug
 */
ExpressionNode.prototype.debug = function () {
  if (this.children_.length === 0) {
    return this.value_;
  }
  return "(" + this.value_ + " " +
    this.children_.map(function (c) {
      return c.debug();
    }).join(' ') + ")";
};

/**
 * A token is essentially just a string that may or may not be "marked". Marking
 * is done for two different reasons.
 * (1) We're comparing two expressions and want to mark where they differ.
 * (2) We're looking at a single expression and want to mark the deepest
 *     subexpression.
 */
var Token = function (str, marked) {
  this.str = str;
  this.marked = marked;
};
ExpressionNode.Token = Token;
