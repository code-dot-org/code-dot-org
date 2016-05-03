var utils = require('../utils');
var _ = require('../lodash');
var Token = require('./token');
var jsnums = require('./js-numbers/js-numbers');

var ValueType = {
  ARITHMETIC: 1,
  FUNCTION_CALL: 2,
  VARIABLE: 3,
  NUMBER: 4,
  EXPONENTIAL: 5
};

function DivideByZeroError(message) {
  this.message = message || '';
}

/**
 * Converts numbers to jsnumber representations. This is needed because some
 * jsnumber methods will return a number or jsnumber depending on their values,
 * for example:
 * jsnums.sqrt(jsnums.makeFloat(4).toExact()) = 4
 * jsnums.sqrt(jsnums.makeFloat(5).toExact()) = jsnumber
 * @param {number|jsnumber} val
 * @returns {jsnumber}
 */
function ensureJsnum(val) {
  if (typeof(val) === 'number') {
    return jsnums.makeFloat(val);
  }
  return val;
}

/**
 * A node consisting of an value, and potentially a set of operands.
 * The value will be either an operator, a string representing a variable, a
 * string representing a functional call, or a number.
 * If args are not ExpressionNode, we convert them to be so, assuming any string
 * represents a variable
 */
var ExpressionNode = function (val, args, blockId) {
  this.value_ = ensureJsnum(val);

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

  if (this.isNumber() && args.length > 0) {
    throw new Error("Can't have args for number ExpressionNode");
  }

  if (this.isArithmetic() && args.length !== 2) {
    throw new Error("Arithmetic ExpressionNode needs 2 args");
  }
};
module.exports = ExpressionNode;
ExpressionNode.DivideByZeroError = DivideByZeroError;

/**
 * What type of expression node is this?
 */
ExpressionNode.prototype.getType_ = function () {
  if (["+", "-", "*", "/"].indexOf(this.value_) !== -1) {
    return ValueType.ARITHMETIC;
  }

  if (["pow", "sqrt", "sqr"].indexOf(this.value_) !== -1) {
    return ValueType.EXPONENTIAL;
  }

  if (typeof(this.value_) === 'string') {
    if (this.children_.length === 0) {
      return ValueType.VARIABLE;
    }
    return ValueType.FUNCTION_CALL;
  }

  if (jsnums.isSchemeNumber(this.value_)) {
    return ValueType.NUMBER;
  }
};

ExpressionNode.prototype.isArithmetic = function () {
  return this.getType_() === ValueType.ARITHMETIC;
};

ExpressionNode.prototype.isFunctionCall = function () {
  return this.getType_() === ValueType.FUNCTION_CALL;
};

ExpressionNode.prototype.isVariable = function () {
  return this.getType_() === ValueType.VARIABLE;
};

ExpressionNode.prototype.isNumber = function () {
  return this.getType_() === ValueType.NUMBER;
};

ExpressionNode.prototype.isExponential = function () {
  return this.getType_() === ValueType.EXPONENTIAL;
};

/**
 * @returns {boolean} true if the root expression node is a divide by zero. Does
 *   not account for div zeros in descendants
 */
ExpressionNode.prototype.isDivZero = function () {
  var rightChild = this.getChildValue(1);
  return this.getValue() === '/' && jsnums.isSchemeNumber(rightChild) &&
    jsnums.equals(rightChild, 0);
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
 * Evaluate the expression, returning the result.
 * @param {Object<string, number|object>} globalMapping Global mapping of
 *   variables and functions
 * @param {Object<string, number|object>} localMapping Mapping of
 *   variables/functions local to scope of this function.
 * @returns {Object} evaluation An object with either an err or result field
 * @returns {Error?} evalatuion.err
 * @returns {jsnumber?} evaluation.result
 */
ExpressionNode.prototype.evaluate = function (globalMapping, localMapping) {
  var error;
  try {
    globalMapping = globalMapping || {};
    localMapping = localMapping || {};

    var type = this.getType_();
    // @type {number|jsnumber}
    var val;

    if (type === ValueType.VARIABLE) {
      var mappedVal = utils.valueOr(localMapping[this.value_],
        globalMapping[this.value_]);
      if (mappedVal === undefined) {
        throw new Error('No mapping for variable during evaluation');
      }

      var clone = this.clone();
      clone.setValue(mappedVal);
      return clone.evaluate(globalMapping);
    }

    if (type === ValueType.FUNCTION_CALL) {
      var functionDef = utils.valueOr(localMapping[this.value_],
        globalMapping[this.value_]);
      if (functionDef === undefined) {
        throw new Error('No mapping for function during evaluation');
      }

      if (!functionDef.variables || !functionDef.expression) {
        throw new Error('Bad mapping for: ' + this.value_);
      }
      if (functionDef.variables.length !== this.children_.length) {
        throw new Error('Bad mapping for: ' + this.value_);
      }

      // We're calling a new function, so it gets a new local scope.
      var newLocalMapping = {};
      functionDef.variables.forEach(function (variable, index) {
        var evaluation = this.children_[index].evaluate(globalMapping, localMapping);
        if (evaluation.err) {
          throw evaluation.err;
        }
        var childVal = evaluation.result;
        newLocalMapping[variable] = utils.valueOr(localMapping[childVal], childVal);
      }, this);
      return functionDef.expression.evaluate(globalMapping, newLocalMapping);
    }

    if (type === ValueType.NUMBER) {
      return { result: this.value_ };
    }

    if (type !== ValueType.ARITHMETIC && type !== ValueType.EXPONENTIAL) {
      throw new Error('Unexpected');
    }

    var left = this.children_[0].evaluate(globalMapping, localMapping);
    if (left.err) {
      throw left.err;
    }
    left = left.result.toExact();

    if (this.children_.length === 1) {
      switch (this.value_) {
        case 'sqrt':
          val = jsnums.sqrt(left);
          break;
        case 'sqr':
          val = jsnums.sqr(left);
          break;
        default:
          throw new Error('Unknown operator: ' + this.value_);
      }
      return { result: ensureJsnum(val) };
    }

    var right = this.children_[1].evaluate(globalMapping, localMapping);
    if (right.err) {
      throw right.err;
    }
    right = right.result.toExact();

    switch (this.value_) {
      case '+':
        val = jsnums.add(left, right);
        break;
      case '-':
        val = jsnums.subtract(left, right);
        break;
      case '*':
        val = jsnums.multiply(left, right);
        break;
      case '/':
        if (jsnums.equals(right, 0)) {
          throw new DivideByZeroError();
        }
        val = jsnums.divide(left, right);
        break;
      case 'pow':
        val = jsnums.expt(left, right);
        break;
      default:
        throw new Error('Unknown operator: ' + this.value_);
    }
    // When calling jsnums methods, they will sometimes return a jsnumber and
    // sometimes a native JavaScript number. We want to make sure to convert
    // to a jsnumber before we return.
    return { result: ensureJsnum(val) };
  } catch (err) {
    error = err;
  }
  return { err: error };
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
 * furthest left.
 * @returns {boolea} true if collapse was successful.
 */
ExpressionNode.prototype.collapse = function () {
  var deepest = this.getDeepestOperation();
  if (deepest === null) {
    return false;
  }

  // We're the depest operation, implying both sides are numbers
  if (this === deepest) {
    var evaluation = this.evaluate();
    if (evaluation.err) {
      return false;
    }
    this.value_ = evaluation.result;
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
  var nodesMatch = other && this.hasSameValue_(other) &&
    (this.children_.length === other.children_.length);
  var type = this.getType_();

  if (this.children_.length === 0) {
    return [new Token(this.value_, !nodesMatch)];
  }

  var tokensForChild = function (childIndex) {
    return this.children_[childIndex].getTokenListDiff(nodesMatch &&
      other.children_[childIndex]);
  }.bind(this);

  if (type === ValueType.ARITHMETIC) {
    // Deal with arithmetic, which is always in the form (child0 operator child1)
    tokens = [new Token('(', !nodesMatch)];
    tokens.push([
      tokensForChild(0),
      new Token(" " + this.value_ + " ", !nodesMatch),
      tokensForChild(1)
    ]);
    tokens.push(new Token(')', !nodesMatch));

    return _.flatten(tokens);
  }

  if (this.value_ === 'sqr') {
    return _.flatten([
      new Token('(', !nodesMatch),
      tokensForChild(0),
      new Token(' ^ 2', !nodesMatch),
      new Token(')', !nodesMatch)
    ]);
  } else if (this.value_ === 'pow') {
    return _.flatten([
      new Token('(', !nodesMatch),
      tokensForChild(0),
      new Token(' ^ ', !nodesMatch),
      tokensForChild(1),
      new Token(')', !nodesMatch)
    ]);
  }

  // We either have a function call, or an arithmetic node that we want to
  // treat like a function (i.e. sqrt(4))
  // A function call will generate something like: foo(1, 2, 3)
  tokens = [
    new Token(this.value_, other && this.value_ !== other.value_),
    new Token('(', !nodesMatch)
  ];

  var numChildren = this.children_.length;
  for (var i = 0; i < numChildren; i++) {
    if (i > 0) {
      tokens.push(new Token(',', !nodesMatch));
    }
    var childTokens = tokensForChild(i);
    if (numChildren === 1) {
      ExpressionNode.stripOuterParensFromTokenList(childTokens);
    }
    tokens.push(childTokens);
  }

  tokens.push(new Token(")", !nodesMatch));
  return _.flatten(tokens);
};

/**
 * Get a tokenList for this expression, potentially marking those tokens
 * that are in the deepest descendant expression.
 * @param {boolean} markDeepest Mark tokens in the deepest descendant
 */
ExpressionNode.prototype.getTokenList = function (markDeepest) {
  if (!markDeepest) {
    // diff against this so that nothing is marked
    return this.getTokenListDiff(this);
  } else if (this.depth() <= 1) {
    // markDeepest is true. diff against null so that everything is marked
    return this.getTokenListDiff(null);
  }

  if (this.getType_() !== ValueType.ARITHMETIC &&
      this.getType_() !== ValueType.EXPONENTIAL) {
    // Don't support getTokenList for functions
    throw new Error("Unsupported");
  }

  var rightDeeper = false;
  if (this.children_.length === 2) {
    rightDeeper = this.children_[1].depth() > this.children_[0].depth();
  }

  var prefix = new Token('(', false);
  var suffix = new Token(')', false);

  if (this.value_ === 'sqrt') {
    prefix = new Token('sqrt', false);
    suffix = null;
  }

  var tokens = [
    prefix,
    this.children_[0].getTokenList(markDeepest && !rightDeeper),
  ];
  if (this.children_.length > 1) {
    tokens.push([
      new Token(" " + this.value_ + " ", false),
      this.children_[1].getTokenList(markDeepest && rightDeeper)
    ]);
  }
  if (suffix) {
    tokens.push(suffix);
  }
  return _.flatten(tokens);
};

/**
 * Looks to see if two nodes have the same value, using jsnum.equals in the
 * case of numbers
 * @param {ExpressionNode} other ExpresisonNode to compare to
 * @returns {boolean} True if both nodes have the same value.
 */
ExpressionNode.prototype.hasSameValue_ = function (other) {
  if (!other) {
    return false;
  }

  if (this.isNumber()) {
    return jsnums.equals(this.value_, other.value_);
  }

  return this.value_ === other.value_;
};

/**
 * Is other exactly the same as this ExpressionNode tree.
 */
ExpressionNode.prototype.isIdenticalTo = function (other) {
  if (!other || !this.hasSameValue_(other) || this.children_.length !== other.children_.length) {
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

  if (this.getType_() !== ValueType.FUNCTION_CALL ||
      other.getType_() !== ValueType.FUNCTION_CALL) {
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
  if (this.getType_() !== ValueType.ARITHMETIC) {
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
 * Get the value
 * @returns {string} String representation of this node's value.
 */
ExpressionNode.prototype.getValue = function () {
  return this.value_.toString();
};


/**
 * Modify this ExpressionNode's value
 */
ExpressionNode.prototype.setValue = function (value) {
  var type = this.getType_();
  if (type !== ValueType.VARIABLE && type !== ValueType.NUMBER) {
    throw new Error("Can't modify value");
  }
  if (type === ValueType.NUMBER) {
    this.value_ = ensureJsnum(value);
  } else {
    this.value_ = value;
  }
};

/**
 * Get the value of the child at index
 */
ExpressionNode.prototype.getChildValue = function (index) {
  if (this.children_[index] === undefined) {
    return undefined;
  }
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
 * @returns {string}
 */
ExpressionNode.prototype.debug = function () {
  if (this.children_.length === 0) {
    if (this.isNumber()) {
      return this.value_.toFixnum().toString();
    } else {
      return this.value_.toString();
    }
  }
  return "(" + this.value_ + " " +
    this.children_.map(function (c) {
      return c.debug();
    }).join(' ') + ")";
};

/**
 * Given a token list, if the first and last items are parens, removes them
 * from the list
 */
ExpressionNode.stripOuterParensFromTokenList = function (tokenList) {
  if (tokenList.length >= 2 && tokenList[0].isParenthesis() &&
      tokenList[tokenList.length - 1].isParenthesis()) {
    tokenList.splice(-1);
    tokenList.splice(0, 1);
  }
  return tokenList;
};
